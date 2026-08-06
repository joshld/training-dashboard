#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDelimitedList, parseMetadataEntries, relativeSource, resolveTimestamp, validateId } from './pipeline-validation.mjs';

export const NUTRITION_METADATA_FIELDS = new Set(['id', 'purpose', 'protein', 'carbohydrates', 'fat', 'hydration', 'during_training', 'simple_examples', 'coach_focus', 'tags']);

export function parseNutritionGuidance(markdown, filePath = 'knowledge/nutrition/guidance.md') {
  const entries = parseMetadataEntries(markdown, filePath, { allowedKeys: NUTRITION_METADATA_FIELDS, requiredFields: ['id', 'purpose', 'protein', 'carbohydrates', 'fat', 'hydration', 'simple_examples', 'coach_focus'] });
  const seen = new Set();
  return entries.map((entry, index) => {
    const label = `${filePath}.${entry.name || index}`;
    const id = validateId(entry.fields.id, `${label}.id`);
    if (seen.has(id)) throw new Error(`${filePath}: duplicate nutrition guidance ID '${id}'`);
    seen.add(id);
    const simpleExamples = parseDelimitedList(entry.fields.simple_examples, `${label}.simple_examples`, ';', /.+/);
    const tags = entry.fields.tags ? parseDelimitedList(entry.fields.tags, `${label}.tags`, ',') : [];
    return {
      id, name: entry.name, purpose: entry.fields.purpose,
      macros: { protein: entry.fields.protein, carbohydrates: entry.fields.carbohydrates, fat: entry.fields.fat },
      hydration: entry.fields.hydration, duringTraining: entry.fields.during_training || '', simpleExamples,
      coachFocus: entry.fields.coach_focus, tags, source: filePath
    };
  });
}

export async function buildNutritionGuidance({ markdown, file = 'knowledge/nutrition/guidance.md', timestamp } = {}) {
  const guidance = parseNutritionGuidance(markdown, file);
  return { schemaVersion: 1, generatedAt: resolveTimestamp(timestamp), count: guidance.length, guidance };
}

export async function writeNutritionGuidance({ root = process.cwd(), timestamp } = {}) {
  const source = 'knowledge/nutrition/guidance.md';
  const outputPath = path.join(root, 'docs', 'nutrition-guidance.json');
  const output = await buildNutritionGuidance({ markdown: await fs.readFile(path.join(root, source), 'utf8'), file: source, timestamp });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Generated ${relativeSource(root, outputPath)} with ${output.count} nutrition scenarios.`);
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeNutritionGuidance().catch(error => { console.error(error.stack || error.message || error); process.exitCode = 1; });
