#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractSection, normalizeMarkdown, parseBulletItems, parseFrontMatter, parseTable, relativeSource,
  requireFields, resolveTimestamp, validateDate, validateId, validateNumber
} from './pipeline-validation.mjs';

export const PLAN_FRONT_MATTER_FIELDS = new Set(['title', 'updated', 'status', 'date_range', 'planned_distance', 'progress_distance']);
export const SUGGESTION_FRONT_MATTER_FIELDS = new Set(['updated']);
export const ACTIVITY_FRONT_MATTER_FIELDS = new Set(['id', 'date', 'status', 'activity', 'workout_type', 'title', 'duration', 'duration_seconds', 'distance_km', 'source', 'rpe', 'public']);
export const ACTIVITY_TYPES = new Set(['Running', 'Strength', 'Soccer', 'Futsal', 'Cycling', 'Walking', 'Mobility', 'Recovery', 'Other']);
export const ACTIVITY_STATUSES = new Set(['completed', 'planned', 'skipped', 'imported']);

const PLAN_HEADERS = ['day', 'workout', 'distance', 'status', 'notes'];
const SUGGESTION_HEADERS = ['id', 'workout day', 'workout', 'priority', 'confidence', 'current', 'suggested', 'reason', 'expected impact'];

function validatePlanDistance(value, label) {
  const text = String(value);
  if (text.toLowerCase() === 'strength') return text;
  const match = text.match(/^(\d+(?:\.\d+)?)\s*km$/i);
  if (!match) throw new Error(`${label}: invalid distance '${text}'`);
  validateNumber(match[1], label, { min: 0 });
  return text;
}

export function parsePlan(markdown, filePath = 'plans/current-plan.md') {
  const { data, body } = parseFrontMatter(markdown, filePath, { allowedKeys: PLAN_FRONT_MATTER_FIELDS });
  requireFields(data, ['title', 'updated', 'status'], filePath);
  validateDate(data.updated, `${filePath}.updated`, { dateOnly: true });
  if (typeof data.status !== 'string' || !data.status.trim()) throw new Error(`${filePath}.status: invalid status`);
  if (data.date_range !== undefined && typeof data.date_range !== 'string') throw new Error(`${filePath}.date_range: invalid value`);
  if (data.planned_distance !== undefined) validatePlanDistance(data.planned_distance, `${filePath}.planned_distance`);
  if (data.progress_distance !== undefined && !/^\d+(?:\.\d+)?\s*km\s+completed$/i.test(String(data.progress_distance))) throw new Error(`${filePath}.progress_distance: invalid value`);

  const workouts = parseTable(extractSection(body, 'Workouts', filePath), filePath, 'workout', PLAN_HEADERS).map((row, index) => {
    const label = `${filePath}.workouts[${index}]`;
    if (!['Completed', 'Planned', 'Skipped'].includes(row.status)) throw new Error(`${label}.status: invalid status '${row.status}'`);
    return {
      day: row.day,
      title: row.workout,
      distance: validatePlanDistance(row.distance, `${label}.distance`),
      completed: row.status === 'Completed',
      summary: row.notes
    };
  });
  const guidance = parseBulletItems(extractSection(body, 'Coach Guidance', filePath), filePath, 'coach guidance');
  return {
    updated: String(data.updated), status: String(data.status), title: String(data.title),
    dateRange: String(data.date_range || ''), plannedDistance: String(data.planned_distance || ''),
    progressDistance: String(data.progress_distance || ''), workouts, guidance
  };
}

export function parseSuggestions(markdown, filePath = 'plans/plan-suggestions.md') {
  const { data, body } = parseFrontMatter(markdown, filePath, { allowedKeys: SUGGESTION_FRONT_MATTER_FIELDS });
  if (data.updated !== undefined) validateDate(data.updated, `${filePath}.updated`, { dateOnly: true });
  const rows = parseTable(extractSection(body, 'Suggestions', filePath), filePath, 'suggestions', SUGGESTION_HEADERS);
  const seen = new Set();
  return rows.map((row, index) => {
    const label = `${filePath}.suggestions[${index}]`;
    const id = validateId(row.id, `${label}.id`);
    if (seen.has(id)) throw new Error(`${filePath}: duplicate suggestion ID '${id}'`);
    seen.add(id);
    if (!['Low', 'Medium', 'High'].includes(row.priority)) throw new Error(`${label}.priority: invalid priority '${row.priority}'`);
    const confidence = validateNumber(row.confidence, `${label}.confidence`, { min: 0, integer: true });
    if (confidence > 100) throw new Error(`${label}.confidence: must be between 0 and 100`);
    return { id, workoutDay: row['workout day'], workout: row.workout, priority: row.priority, confidence, current: row.current, suggested: row.suggested, reason: row.reason, expectedImpact: row['expected impact'] };
  });
}

export function parseActivity(markdown, filePath = 'activities/record.md') {
  const { data, body } = parseFrontMatter(markdown, filePath, { allowedKeys: ACTIVITY_FRONT_MATTER_FIELDS });
  requireFields(data, ['date', 'activity', 'title', 'public'], filePath);
  validateDate(data.date, `${filePath}.date`, { dateOnly: true });
  if (!ACTIVITY_TYPES.has(data.activity)) throw new Error(`${filePath}.activity: invalid category '${data.activity}'`);
  if (data.status !== undefined && !ACTIVITY_STATUSES.has(String(data.status).toLowerCase())) throw new Error(`${filePath}.status: invalid status '${data.status}'`);
  if (typeof data.public !== 'boolean') throw new Error(`${filePath}.public: must be boolean`);
  if (data.distance_km !== undefined) validateNumber(data.distance_km, `${filePath}.distance_km`, { min: 0 });
  if (data.duration_seconds !== undefined) validateNumber(data.duration_seconds, `${filePath}.duration_seconds`, { min: 0 });
  if (data.rpe !== undefined && data.rpe !== 'â€”' && Number.isFinite(Number(data.rpe))) validateNumber(data.rpe, `${filePath}.rpe`, { min: 1 });
  const publicSummary = body.includes('## Public Summary') ? extractSection(body, 'Public Summary', filePath) : String(data.summary || '');
  if (data.public && !publicSummary) throw new Error(`${filePath}: public records require a Public Summary`);
  if (!data.public) return null;
  return {
    date: String(data.date), activity: String(data.activity), title: String(data.title),
    summary: publicSummary, duration: data.duration ? String(data.duration) : null,
    distanceKm: data.distance_km === undefined ? null : Number(data.distance_km),
    rpe: data.rpe ? String(data.rpe) : 'â€”'
  };
}

export async function buildDashboardData({ root = process.cwd(), timestamp } = {}) {
  const planPath = path.join(root, 'plans', 'current-plan.md');
  const suggestionsPath = path.join(root, 'plans', 'plan-suggestions.md');
  const activityDir = path.join(root, 'activities', 'records');
  const plan = parsePlan(await fs.readFile(planPath, 'utf8'), relativeSource(root, planPath));
  const suggestions = parseSuggestions(await fs.readFile(suggestionsPath, 'utf8'), relativeSource(root, suggestionsPath));
  const entries = await fs.readdir(activityDir, { withFileTypes: true });
  const sessions = [];
  for (const entry of entries.filter(item => item.isFile() && item.name.endsWith('.md')).sort((a, b) => a.name.localeCompare(b.name))) {
    const filePath = path.join(activityDir, entry.name);
    const record = parseActivity(await fs.readFile(filePath, 'utf8'), relativeSource(root, filePath));
    if (record) sessions.push(record);
  }
  sessions.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return {
    schemaVersion: 2, generatedAt: resolveTimestamp(timestamp), updated: plan.updated, status: plan.status,
    plan: { title: plan.title, dateRange: plan.dateRange, plannedDistance: plan.plannedDistance, progressDistance: plan.progressDistance, workouts: plan.workouts, coachGuidance: plan.guidance, suggestions },
    sessions
  };
}

export async function writeDashboardData(options = {}) {
  const root = options.root || process.cwd();
  const outputPath = path.join(root, 'docs', 'generated-data.json');
  const output = await buildDashboardData(options);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated ${relativeSource(root, outputPath)} from Markdown sources.`);
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeDashboardData().catch(error => { console.error(error.stack || error.message || error); process.exitCode = 1; });
}
