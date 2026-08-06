#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const PLAN_PATH = path.join(ROOT, 'plans', 'current-plan.md');
const ACTIVITY_DIR = path.join(ROOT, 'activities', 'records');
const OUTPUT_PATH = path.join(ROOT, 'docs', 'generated-data.json');

function parseFrontMatter(markdown, filePath) {
  if (!markdown.startsWith('---\n')) {
    throw new Error(`${filePath}: missing YAML-style front matter`);
  }
  const end = markdown.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${filePath}: unterminated front matter`);
  const block = markdown.slice(4, end);
  const body = markdown.slice(end + 5).trim();
  const data = {};
  for (const rawLine of block.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) throw new Error(`${filePath}: invalid front matter line: ${rawLine}`);
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value === 'true' || value === 'false') {
      value = value === 'true';
    } else if (value !== '' && Number.isFinite(Number(value))) {
      value = Number(value);
    }
    data[key] = value;
  }
  return { data, body };
}

function extractSection(body, heading) {
  const lines = body.split('\n');
  const start = lines.findIndex(line => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
  if (start < 0) return '';
  const selected = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s+/.test(lines[i])) break;
    selected.push(lines[i]);
  }
  return selected.join('\n').trim();
}

function bulletItems(section) {
  return section.split('\n').map(line => line.trim()).filter(line => /^[-*]\s+/.test(line)).map(line => line.replace(/^[-*]\s+/, '').trim());
}

function parseWorkoutRows(section, filePath) {
  const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
  const rows = lines.filter(line => line.startsWith('|'));
  if (rows.length < 3) return [];
  const headers = rows[0].split('|').slice(1, -1).map(item => item.trim().toLowerCase());
  return rows.slice(2).map((line, index) => {
    const values = line.split('|').slice(1, -1).map(item => item.trim());
    if (values.length !== headers.length) throw new Error(`${filePath}: malformed workout table row ${index + 1}`);
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  });
}

async function readPlan() {
  const markdown = await fs.readFile(PLAN_PATH, 'utf8');
  const { data, body } = parseFrontMatter(markdown, PLAN_PATH);
  for (const required of ['title', 'updated', 'status']) {
    if (!data[required]) throw new Error(`${PLAN_PATH}: required field '${required}' is missing`);
  }
  const workouts = parseWorkoutRows(extractSection(body, 'Workouts'), PLAN_PATH).map(row => ({
    day: row.day,
    title: row.workout,
    distance: row.distance,
    completed: String(row.status || '').toLowerCase() === 'completed',
    summary: row.notes || ''
  }));
  return {
    updated: String(data.updated),
    status: String(data.status),
    title: String(data.title),
    dateRange: String(data.date_range || ''),
    plannedDistance: String(data.planned_distance || ''),
    progressDistance: String(data.progress_distance || ''),
    workouts,
    guidance: bulletItems(extractSection(body, 'Coach Guidance'))
  };
}

async function readActivities() {
  let entries = [];
  try {
    entries = await fs.readdir(ACTIVITY_DIR, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const records = [];
  for (const entry of entries.filter(item => item.isFile() && item.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(ACTIVITY_DIR, entry.name);
    const markdown = await fs.readFile(filePath, 'utf8');
    const { data, body } = parseFrontMatter(markdown, filePath);
    for (const required of ['date', 'activity', 'title', 'public']) {
      if (data[required] === undefined || data[required] === '') throw new Error(`${filePath}: required field '${required}' is missing`);
    }
    if (data.public !== true) continue;
    records.push({
      date: String(data.date),
      activity: String(data.activity),
      title: String(data.title),
      summary: extractSection(body, 'Public Summary') || String(data.summary || ''),
      duration: data.duration ? String(data.duration) : null,
      distanceKm: Number.isFinite(Number(data.distance_km)) ? Number(data.distance_km) : null,
      rpe: data.rpe ? String(data.rpe) : '—'
    });
  }
  return records.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

async function main() {
  const plan = await readPlan();
  const activities = await readActivities();
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    updated: plan.updated,
    status: plan.status,
    plan: {
      title: plan.title,
      dateRange: plan.dateRange,
      plannedDistance: plan.plannedDistance,
      progressDistance: plan.progressDistance,
      workouts: plan.workouts,
      coachGuidance: plan.guidance
    },
    sessions: activities
  };
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated ${path.relative(ROOT, OUTPUT_PATH)} from Markdown sources.`);
}

main().catch(error => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
