import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  buildDashboardData, deriveWeeklyRunningProgress, parseActivity, parsePlan, parsePlanDateRange,
  parseSuggestions, resolveWeeklyProgress
} from '../scripts/build-dashboard-data.mjs';
import { buildWorkoutLibrary, parseWorkoutEntries } from '../scripts/build-workout-library.mjs';
import { buildNutritionGuidance, parseNutritionGuidance } from '../scripts/build-nutrition-guidance.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = path.join(root, 'test', 'fixtures', 'pipeline');
const fixedTimestamp = '2026-08-06T00:00:00.000Z';

async function fixture(kind, name) {
  return fs.readFile(path.join(fixtureRoot, kind, name), 'utf8');
}

function privacyAssert(value) {
  const serialised = JSON.stringify(value);
  for (const secret of ['bodyweight', '92 kg', 'lower back improving', 'lower-back pain', 'Pain details', 'route coordinates', 'Exact food log', 'Private Coaching', 'private breakfast']) {
    assert.doesNotMatch(serialised, new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `public output leaked '${secret}'`);
  }
}

test('valid current plan fixture generates only allowlisted public fields', async () => {
  const plan = parsePlan(await fixture('valid', 'current-plan.md'), 'fixture/current-plan.md');
  assert.equal(plan.workouts.length, 2);
  assert.deepEqual(Object.keys(plan.workouts[0]).sort(), ['completed', 'distance', 'summary', 'title', 'day'].sort());
  privacyAssert(plan);
});

test('current plan rejects missing sections, invalid dates, distances and statuses', async () => {
  const missingSection = await fixture('invalid', 'current-plan-missing-section.md');
  const invalidValues = await fixture('invalid', 'current-plan-invalid-values.md');
  const invalidStatus = await fixture('invalid', 'current-plan-invalid-status.md');
  const invalidDistance = await fixture('invalid', 'current-plan-invalid-distance.md');
  assert.throws(() => parsePlan(missingSection, 'fixture/current-plan-missing-section.md'), /missing required section/);
  assert.throws(() => parsePlan(invalidValues, 'fixture/current-plan-invalid-values.md'), /invalid date/);
  assert.throws(() => parsePlan(invalidStatus, 'fixture/current-plan-invalid-status.md'), /invalid status/);
  assert.throws(() => parsePlan(invalidDistance, 'fixture/current-plan-invalid-distance.md'), /invalid distance/);
});

test('plan suggestions validate IDs, priority, confidence and duplicate rows', async () => {
  const suggestions = parseSuggestions(await fixture('valid', 'plan-suggestions.md'), 'fixture/plan-suggestions.md');
  assert.equal(suggestions[0].confidence, 90);
  assert.deepEqual(Object.keys(suggestions[0]).sort(), ['confidence', 'current', 'expectedImpact', 'id', 'priority', 'reason', 'suggested', 'workout', 'workoutDay'].sort());
  const duplicateSuggestions = await fixture('invalid', 'plan-suggestions-duplicate.md');
  const invalidSuggestionValues = await fixture('invalid', 'plan-suggestions-invalid-values.md');
  assert.throws(() => parseSuggestions(duplicateSuggestions, 'fixture/plan-suggestions-duplicate.md'), /duplicate suggestion ID/);
  assert.throws(() => parseSuggestions(invalidSuggestionValues, 'fixture/plan-suggestions-invalid-values.md'), /invalid ID|invalid priority|between 0 and 100/);
});

test('activity records validate dates, categories, numbers and public summaries', async () => {
  const activity = parseActivity(await fixture('valid', 'activity.md'), 'fixture/activity.md');
  assert.equal(activity.distanceKm, 8);
  assert.equal(activity.activity, 'Running');
  privacyAssert(activity);
  const invalidActivity = await fixture('invalid', 'activity-invalid.md');
  const unknownActivity = await fixture('invalid', 'activity-unknown-field.md');
  assert.throws(() => parseActivity(invalidActivity, 'fixture/activity-invalid.md'), /invalid date|invalid category|invalid numeric/);
  assert.throws(() => parseActivity(unknownActivity, 'fixture/activity-unknown-field.md'), /unknown front matter field/);
});

test('weekly progress derives eligible public running distance within the plan range', async () => {
  const plan = parsePlan(await fixture('valid', 'current-plan.md'), 'fixture/current-plan.md');
  assert.deepEqual(parsePlanDateRange(plan.dateRange), { start: '2026-08-03', end: '2026-08-09' });
  const fixtureActivity = parseActivity(await fixture('valid', 'activity.md'), 'fixture/activity.md');
  const progress = deriveWeeklyRunningProgress(plan, [
    fixtureActivity,
    { date: '2026-08-06', activity: 'Running', status: 'completed', distanceKm: 2 },
    { date: '2026-08-07', activity: 'Running', status: 'imported', distanceKm: 3 },
    { date: '2026-08-06', activity: 'Strength', status: 'completed', distanceKm: 20 },
    { date: '2026-08-10', activity: 'Running', status: 'completed', distanceKm: 30 },
    null
  ]);
  assert.equal(progress, 13);
});

test('private running records do not contribute and manual progress is the fallback', async () => {
  const plan = parsePlan(await fixture('valid', 'current-plan.md'), 'fixture/current-plan.md');
  const privateRecord = parseActivity(`---\ndate: "2026-08-05"\nactivity: "Running"\ntitle: "Private Run"\ndistance_km: 12\npublic: false\n---\n\n## Private Notes\nRoute coordinates and pain details.`, 'fixture/private-running.md');
  assert.equal(privateRecord, null);
  assert.equal(deriveWeeklyRunningProgress(plan, [privateRecord]), null);
  assert.deepEqual(resolveWeeklyProgress(plan, [privateRecord]), {
    progressDistance: '8 km completed',
    manualProgressDistance: '8 km completed',
    derivedCompletedRunningDistance: null,
    progressSource: 'manual'
  });
});

test('workout fixtures validate metadata, IDs, tags and reference-section exclusion', async () => {
  const entries = parseWorkoutEntries(await fixture('valid', 'workout.md'), 'running', 'fixture/workout.md');
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].tags, ['running', 'easy', 'aerobic']);
  assert.deepEqual(Object.keys(entries[0]).sort(), ['avoidOrModifyWhen', 'category', 'commonMistakes', 'compatibleWith', 'id', 'intensity', 'loadProfile', 'name', 'planningGuidance', 'progression', 'purpose', 'recoveryDemand', 'source', 'tags', 'typicalVolume'].sort());
  const invalidWorkout = await fixture('invalid', 'workout-metadata.md');
  const validWorkout = await fixture('valid', 'workout.md');
  const invalidTags = await fixture('invalid', 'workout-invalid-tags.md');
  const unknownMetadata = await fixture('invalid', 'workout-unknown-field.md');
  assert.throws(() => parseWorkoutEntries(invalidWorkout, 'running', 'fixture/workout-metadata.md'), /invalid ID|missing|unknown metadata|malformed list/);
  assert.throws(() => parseWorkoutEntries(invalidTags, 'running', 'fixture/workout-invalid-tags.md'), /malformed list/);
  assert.throws(() => parseWorkoutEntries(unknownMetadata, 'running', 'fixture/workout-unknown-field.md'), /unknown metadata/);
  assert.throws(() => parseWorkoutEntries(validWorkout, 'invalid-category', 'fixture/workout.md'), /invalid workout category/);
  assert.throws(() => buildWorkoutLibrary({ sources: [
    { category: 'running', file: 'fixture/a.md', markdown: validWorkout },
    { category: 'running', file: 'fixture/b.md', markdown: validWorkout }
  ], timestamp: fixedTimestamp }), /duplicate workout ID/);
});

test('nutrition fixtures validate required metadata, IDs, lists and tags', async () => {
  const entries = parseNutritionGuidance(await fixture('valid', 'nutrition.md'), 'fixture/nutrition.md');
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0].simpleExamples, ['Rice', 'yoghurt', 'fruit.']);
  assert.deepEqual(entries[0].tags, ['nutrition', 'easy-run']);
  const invalidNutrition = await fixture('invalid', 'nutrition-metadata.md');
  const invalidNutritionList = await fixture('invalid', 'nutrition-invalid-list.md');
  const unknownNutritionMetadata = await fixture('invalid', 'nutrition-unknown-field.md');
  const duplicateNutrition = await fixture('invalid', 'nutrition-duplicate.md');
  assert.throws(() => parseNutritionGuidance(invalidNutrition, 'fixture/nutrition-metadata.md'), /missing|required|malformed list|unknown metadata/);
  assert.throws(() => parseNutritionGuidance(invalidNutritionList, 'fixture/nutrition-invalid-list.md'), /malformed list/);
  assert.throws(() => parseNutritionGuidance(unknownNutritionMetadata, 'fixture/nutrition-unknown-field.md'), /unknown metadata/);
  assert.throws(() => parseNutritionGuidance(duplicateNutrition, 'fixture/nutrition-duplicate.md'), /duplicate nutrition guidance ID/);
});

test('fixture projections exclude private context from every generated output', async () => {
  const dashboard = {
    plan: parsePlan(await fixture('valid', 'current-plan.md'), 'fixture/current-plan.md'),
    suggestions: parseSuggestions(await fixture('valid', 'plan-suggestions.md'), 'fixture/plan-suggestions.md'),
    sessions: [parseActivity(await fixture('valid', 'activity.md'), 'fixture/activity.md')]
  };
  const workout = parseWorkoutEntries(await fixture('valid', 'workout.md'), 'running', 'fixture/workout.md');
  const nutrition = parseNutritionGuidance(await fixture('valid', 'nutrition.md'), 'fixture/nutrition.md');
  privacyAssert(dashboard);
  privacyAssert(workout);
  privacyAssert(nutrition);
});

test('unknown public source fields fail instead of being silently published', async () => {
  const unknownWorkout = `## Workout\n\n**ID:** \`run-unknown\`\n\n**Purpose:** Valid purpose.\n\n**Private Coaching:** secret\n`;
  const unknownNutrition = `## Scenario\n\n**ID:** \`nutrition-unknown\`\n\n**Purpose:** Purpose.\n\n**Protein:** Guidance.\n\n**Carbohydrates:** Guidance.\n\n**Fat:** Guidance.\n\n**Hydration:** Guidance.\n\n**Simple examples:** Rice\n\n**Coach focus:** Focus.\n\n**Private Food Log:** secret\n`;
  assert.throws(() => parseWorkoutEntries(unknownWorkout, 'running', 'fixture/unknown-workout.md'), /unknown metadata field/);
  assert.throws(() => parseNutritionGuidance(unknownNutrition, 'fixture/unknown-nutrition.md'), /unknown metadata field/);
});

test('all three generated outputs are valid JSON and meaningful output is deterministic', async () => {
  const firstDashboard = await buildDashboardData({ root, timestamp: fixedTimestamp });
  const secondDashboard = await buildDashboardData({ root, timestamp: fixedTimestamp });
  assert.deepEqual(firstDashboard, secondDashboard);
  assert.equal(firstDashboard.plan.progressDistance, '10.04 km completed');
  assert.equal(firstDashboard.plan.manualProgressDistance, '20.20 km completed');
  assert.equal(firstDashboard.plan.derivedCompletedRunningDistance, 10.04);
  assert.equal(firstDashboard.plan.progressSource, 'derived');
  const committedDashboard = JSON.parse(await fs.readFile(path.join(root, 'docs', 'generated-data.json'), 'utf8'));
  const committedWorkout = JSON.parse(await fs.readFile(path.join(root, 'docs', 'workout-library.json'), 'utf8'));
  const committedNutrition = JSON.parse(await fs.readFile(path.join(root, 'docs', 'nutrition-guidance.json'), 'utf8'));
  assert.equal(committedDashboard.schemaVersion, 2);
  assert.equal(committedWorkout.schemaVersion, 2);
  assert.equal(committedNutrition.schemaVersion, 1);
  assert.ok(Array.isArray(committedDashboard.sessions));
  assert.ok(Array.isArray(committedWorkout.workouts));
  assert.ok(Array.isArray(committedNutrition.guidance));
  privacyAssert(committedDashboard);
  privacyAssert(committedWorkout);
  privacyAssert(committedNutrition);
  const firstWorkout = buildWorkoutLibrary({ sources: await (await import('../scripts/build-workout-library.mjs')).loadWorkoutSources(root), timestamp: fixedTimestamp });
  const secondWorkout = buildWorkoutLibrary({ sources: await (await import('../scripts/build-workout-library.mjs')).loadWorkoutSources(root), timestamp: fixedTimestamp });
  assert.deepEqual(firstWorkout, secondWorkout);
  const nutritionMarkdown = await fs.readFile(path.join(root, 'knowledge', 'nutrition', 'guidance.md'), 'utf8');
  const firstNutrition = await buildNutritionGuidance({ markdown: nutritionMarkdown, timestamp: fixedTimestamp });
  const secondNutrition = await buildNutritionGuidance({ markdown: nutritionMarkdown, timestamp: fixedTimestamp });
  assert.deepEqual(firstNutrition, secondNutrition);
});
