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

function formatValidationError(file, name, problems) {
  return [
    'Workout knowledge validation failed',
    `File: ${file}`,
    `Entry: ${name || '(unnamed)'}`,
    ...problems.map(problem => `- ${problem}`),
    '',
    'Expected at minimum:',
    '**ID:** `unique-entry-id`',
    '**Purpose:** A concise description of why the entry exists.'
  ].join('\n');
}

function parseEntries(markdown, category, file) {
  const chunks = markdown.split(/^## /m).slice(1);
  const entries = [];
  const errors = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n');
    const name = clean(lines.shift());
    const fields = {};
    let current = null;
    let metadataLines = 0;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line === '---') continue;
      const match = line.match(/^\*\*([^*]+):\*\*\s*(.*)$/);
      if (match) {
        metadataLines += 1;
        current = match[1].trim().toLowerCase().replace(/\s+/g, '_');
        fields[current] = clean(match[2]);
      } else if (current) {
        fields[current] = `${fields[current]} ${clean(line)}`.trim();
      }
    }

    // Headings containing only prose or bullet-list guidance are reference sections,
    // not workout records. This keeps author notes such as exercise substitution
    // principles out of the generated workout collection.
    if (metadataLines === 0) continue;

    const problems = [];
    if (!fields.id) problems.push('Missing required field: ID');
    if (!fields.purpose) problems.push('Missing required field: Purpose');
    if (fields.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.id)) {
      problems.push(`ID must use lowercase kebab-case, received: ${fields.id}`);
    }
    if (problems.length) {
      errors.push(formatValidationError(file, name, problems));
      continue;
    }

    const tags = String(fields.tags || '').split(',').map(tag => clean(tag)).filter(Boolean);
    entries.push({
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
    });
  }

  if (errors.length) throw new Error(errors.join('\n\n'));
  return entries;
}

const workouts = [];
for (const [category, relative] of sourceFiles) {
  const file = path.join(root, relative);
  const markdown = await fs.readFile(file, 'utf8');
  workouts.push(...parseEntries(markdown, category, relative));
}

const idSources = new Map();
const duplicateErrors = [];
for (const workout of workouts) {
  if (idSources.has(workout.id)) {
    duplicateErrors.push(`Duplicate workout ID '${workout.id}' in ${workout.source}; first used in ${idSources.get(workout.id)}`);
  } else {
    idSources.set(workout.id, workout.source);
  }
}
if (duplicateErrors.length) throw new Error(`Workout knowledge validation failed\n${duplicateErrors.map(item => `- ${item}`).join('\n')}`);

const output = {
  schemaVersion: 2,
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
