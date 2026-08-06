#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceFiles = [
  ['running', 'knowledge/running/workouts.md'],
  ['strength', 'knowledge/strength/workouts.md'],
  ['mixed', 'knowledge/sports-and-recovery.md']
];
const outputPath = path.join(root, 'docs', 'workout-library.json');

function clean(value = '') {
  return value.trim().replace(/^`|`$/g, '');
}

function parseEntries(markdown, category, file) {
  const chunks = markdown.split(/^## /m).slice(1);
  return chunks.map(chunk => {
    const lines = chunk.split('\n');
    const name = clean(lines.shift());
    const fields = {};
    let current = null;
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line === '---') continue;
      const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
      if (match) {
        current = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        fields[current] = clean(match[2]);
      } else if (current) {
        fields[current] = `${fields[current]} ${clean(line)}`.trim();
      }
    }
    if (!fields.id) throw new Error(`${file}: '${name}' is missing an ID`);
    const tags = String(fields.tags || '').split(',').map(tag => clean(tag)).filter(Boolean);
    return {
      id: fields.id,
      name,
      category,
      purpose: fields.purpose || '',
      intensity: fields.intensity || '',
      typicalVolume: fields.typical_volume || fields.typical_quality_volume || fields.typical_duration || '',
      recoveryDemand: fields.recovery_demand || '',
      compatibleWith: fields.compatible_with || '',
      avoidOrModifyWhen: fields.avoid_or_modify_when || fields.avoid_pairing_with || '',
      progression: fields.progression || '',
      commonMistakes: fields.common_mistakes || '',
      loadProfile: fields.load_profile || '',
      planningGuidance: fields.planning_guidance || '',
      tags,
      source: file
    };
  });
}

const workouts = [];
for (const [category, relative] of sourceFiles) {
  const file = path.join(root, relative);
  const markdown = await fs.readFile(file, 'utf8');
  workouts.push(...parseEntries(markdown, category, relative));
}

const ids = new Set();
for (const workout of workouts) {
  if (ids.has(workout.id)) throw new Error(`Duplicate workout ID: ${workout.id}`);
  ids.add(workout.id);
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  counts: workouts.reduce((acc, workout) => {
    acc.total += 1;
    acc[workout.category] = (acc[workout.category] || 0) + 1;
    return acc;
  }, { total: 0 }),
  workouts
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outputPath)} with ${workouts.length} entries.`);
