import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('generated dashboard data contains the imported activity and overlay wiring is cache-safe', async () => {
  const generated = JSON.parse(await fs.readFile(path.join(root, 'docs', 'generated-data.json'), 'utf8'));
  const activity = generated.sessions.find(item => item.date === '2026-08-07' && item.title === 'Morning Easy Run');
  assert.ok(activity, 'generated-data.json should contain the 2026-08-07 Morning Easy Run');

  const overlay = await fs.readFile(path.join(root, 'docs', 'generated-overlay.js'), 'utf8');
  const app = await fs.readFile(path.join(root, 'docs', 'app.js'), 'utf8');
  const index = await fs.readFile(path.join(root, 'docs', 'index.html'), 'utf8');
  assert.match(overlay, /mergeGeneratedSessions/);
  assert.match(overlay, /renderActivities\(dashboardData\.sessions\)/);
  assert.match(overlay, /cache:'no-store'/);
  assert.match(overlay, /training-dashboard-ready/);
  assert.match(overlay, /training-dashboard-error/);
  assert.doesNotMatch(overlay, /attempts>100/);
  assert.match(app, /dispatchEvent\(new CustomEvent\('training-dashboard-ready'\)\)/);
  assert.match(app, /dispatchEvent\(new CustomEvent\('training-dashboard-error'\)\)/);
  assert.match(app, /dashboardLoadFailed/);
  assert.match(index, /generated-overlay\.js\?v=1\.1\.0/);
});
