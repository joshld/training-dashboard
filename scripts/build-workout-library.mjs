#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDelimitedList, parseMetadataEntries, relativeSource, resolveTimestamp, validateId } from './pipeline-validation.mjs';

export const WORKOUT_CATEGORIES = new Set(['running', 'strength', 'mixed']);
export const WORKOUT_METADATA_FIELDS = new Set([
  'id', 'purpose', 'intensity', 'typical_exercises', 'typical_volume', 'typical_quality_volume', 'typical_duration',
  'recovery_demand', 'compatible_with', 'avoid_or_modify_when', 'avoid_or_replace_with_rest_when', 'avoid_pairing_with',
  'progression', 'common_mistakes', 'load_profile', 'planning_guidance', 'examples', 'typical_structure', 'guidance', 'tags'
]);

function validateWorkoutEntry(entry, filePath, category, index) {
  if (!WORKOUT_CATEGORIES.has(category)) throw new Error(`${filePath}: invalid workout category '${category}'`);
  const fields = entry.fields;
  const label = `${filePath}.${entry.name || index}`;
  const id = validateId(fields.id, `${label}.id`);
  const tags = fields.tags ? parseDelimitedList(fields.tags, `${label}.tags`, ',') : [];
  return {
    id, name: entry.name, category, purpose: fields.purpose, intensity: fields.intensity || '',
    typicalVolume: fields.typical_volume || fields.typical_quality_volume || fields.typical_duration || '',
    recoveryDemand: fields.recovery_demand || '', compatibleWith: fields.compatible_with || '',
    avoidOrModifyWhen: fields.avoid_or_modify_when || fields.avoid_pairing_with || '',
    progression: fields.progression || '', commonMistakes: fields.common_mistakes || '', loadProfile: fields.load_profile || '',
    planningGuidance: fields.planning_guidance || '', tags, source: filePath
  };
}

export function parseWorkoutEntries(markdown, category, filePath = `knowledge/${category}/workouts.md`) {
  const entries = parseMetadataEntries(markdown, filePath, { allowedKeys: WORKOUT_METADATA_FIELDS, requiredFields: ['id', 'purpose'] });
  return entries.map((entry, index) => validateWorkoutEntry(entry, filePath, category, index));
}

export function buildWorkoutLibrary({ sources, timestamp } = {}) {
  const workouts = [];
  const idSources = new Map();
  for (const source of sources || []) {
    for (const workout of parseWorkoutEntries(source.markdown, source.category, source.file)) {
      if (idSources.has(workout.id)) throw new Error(`Workout knowledge validation failed: duplicate workout ID '${workout.id}' in ${workout.source}; first used in ${idSources.get(workout.id)}`);
      idSources.set(workout.id, workout.source);
      workouts.push(workout);
    }
  }
  return {
    schemaVersion: 2, generatedAt: resolveTimestamp(timestamp),
    counts: workouts.reduce((acc, workout) => { acc.total += 1; acc[workout.category] = (acc[workout.category] || 0) + 1; return acc; }, { total: 0 }),
    workouts
  };
}

export async function loadWorkoutSources(root = process.cwd()) {
  const definitions = [['running', 'knowledge/running/workouts.md'], ['strength', 'knowledge/strength/workouts.md'], ['mixed', 'knowledge/sports-and-recovery.md']];
  return Promise.all(definitions.map(async ([category, relative]) => ({ category, file: relative, markdown: await fs.readFile(path.join(root, relative), 'utf8') })));
}

export async function writeWorkoutLibrary({ root = process.cwd(), timestamp } = {}) {
  const outputPath = path.join(root, 'docs', 'workout-library.json');
  const output = buildWorkoutLibrary({ sources: await loadWorkoutSources(root), timestamp });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated ${relativeSource(root, outputPath)} with ${output.workouts.length} entries.`);
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeWorkoutLibrary().catch(error => { console.error(error.stack || error.message || error); process.exitCode = 1; });
