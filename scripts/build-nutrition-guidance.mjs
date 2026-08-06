#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = 'knowledge/nutrition/guidance.md';
const outputPath = path.join(root, 'docs', 'nutrition-guidance.json');

function clean(value = '') {
  return value.trim().replace(/^`|`$/g, '');
}

function parseGuidance(markdown) {
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

    if (metadataLines === 0) continue;

    const problems = [];
    for (const required of ['id', 'purpose', 'protein', 'carbohydrates', 'fat', 'hydration', 'simple_examples', 'coach_focus']) {
      if (!fields[required]) problems.push(`Missing required field: ${required.replace(/_/g, ' ')}`);
    }
    if (fields.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.id)) {
      problems.push(`ID must use lowercase kebab-case, received: ${fields.id}`);
    }
    if (problems.length) {
      errors.push([
        'Nutrition knowledge validation failed',
        `File: ${source}`,
        `Entry: ${name || '(unnamed)'}`,
        ...problems.map(problem => `- ${problem}`)
      ].join('\n'));
      continue;
    }

    entries.push({
      id: fields.id,
      name,
      purpose: fields.purpose,
      macros: {
        protein: fields.protein,
        carbohydrates: fields.carbohydrates,
        fat: fields.fat
      },
      hydration: fields.hydration,
      duringTraining: fields.during_training || '',
      simpleExamples: fields.simple_examples.split(';').map(item => item.trim()).filter(Boolean),
      coachFocus: fields.coach_focus,
      tags: String(fields.tags || '').split(',').map(item => clean(item)).filter(Boolean),
      source
    });
  }

  if (errors.length) throw new Error(errors.join('\n\n'));
  return entries;
}

const markdown = await fs.readFile(path.join(root, source), 'utf8');
const guidance = parseGuidance(markdown);
const seen = new Set();
for (const entry of guidance) {
  if (seen.has(entry.id)) throw new Error(`Duplicate nutrition guidance ID: ${entry.id}`);
  seen.add(entry.id);
}

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  count: guidance.length,
  guidance
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`Generated ${path.relative(root, outputPath)} with ${guidance.length} nutrition scenarios.`);
