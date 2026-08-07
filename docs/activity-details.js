import { buildActivityChartSeries } from './activity-analysis.js';

const IMPORTED_ACTIVITY_KEY = 'trainingLogImportedActivities';
let activityCharts = [];

function escapeActivityHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function formatActivityDuration(seconds) {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return '—';
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const remainingSeconds = Math.round(value % 60);
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function loadFullImportedActivities() {
  try {
    const activities = JSON.parse(localStorage.getItem(IMPORTED_ACTIVITY_KEY) || '[]');
    return Array.isArray(activities) ? activities : [];
  } catch (error) {
    console.warn('Could not load imported activity details.', error);
    return [];
  }
}

function activityIdentity(activity) {
  return [
    activity.date || '',
    Number(activity.distanceKm || 0).toFixed(3),
    Math.round(Number(activity.durationSeconds || 0)),
    activity.fileName || ''
  ].join('|');
}

function findImportedActivity(card) {
  const date = card.dataset.activityDate || '';
  const summary = card.dataset.activitySummary || '';
  const activities = loadFullImportedActivities();

  return activities.find(activity => {
    const sameDate = !date || String(activity.date || '').slice(0, 10) === date;
    const distanceText = activity.distanceKm != null ? Number(activity.distanceKm).toFixed(2) : '';
    const matchesDistance = !distanceText || summary.includes(distanceText);
    return sameDate && matchesDistance;
  }) || null;
}

function metric(label, value) {
  if (value == null || value === '' || value === '—') return '';
  return `<div class="activity-detail-metric"><span>${escapeActivityHtml(label)}</span><strong>${escapeActivityHtml(value)}</strong></div>`;
}

function numberMetric(value, unit = '') {
  return value == null ? null : `${Number(value).toFixed(Number.isInteger(Number(value)) ? 0 : 2)}${unit}`;
}

function renderLapRows(laps = []) {
  if (!Array.isArray(laps) || !laps.length) {
    return '<tr><td colspan="11">No lap or interval records were available in this export.</td></tr>';
  }

  return laps.map((lap, index) => `
    <tr>
      <td>${escapeActivityHtml(lap.index ?? index + 1)}</td>
      <td>${escapeActivityHtml(formatActivityDuration(lap.durationSeconds))}</td>
      <td>${lap.distanceKm != null ? `${Number(lap.distanceKm).toFixed(2)} km` : '—'}</td>
      <td>${escapeActivityHtml(lap.pace || '—')}</td>
      <td>${lap.averageHeartRate != null ? escapeActivityHtml(`${lap.averageHeartRate} bpm`) : '—'}</td>
      <td>${lap.averageCadence != null ? escapeActivityHtml(`${lap.averageCadence} spm`) : '—'}</td>
      <td>${lap.averageStrideLength != null ? escapeActivityHtml(`${Number(lap.averageStrideLength).toFixed(2)} m`) : '—'}</td>
      <td>${lap.averageGroundContactTime != null ? escapeActivityHtml(`${lap.averageGroundContactTime} ms`) : '—'}</td>
      <td>${lap.averageGroundContactBalance != null ? escapeActivityHtml(`${lap.averageGroundContactBalance}%`) : '—'}</td>
      <td>${lap.averageVerticalOscillation != null ? escapeActivityHtml(`${lap.averageVerticalOscillation} cm`) : '—'}</td>
      <td>${lap.averageVerticalRatio != null ? escapeActivityHtml(`${lap.averageVerticalRatio}%`) : '—'}</td>
    </tr>`).join('');
}

function formatChartValue(value, unit) {
  if (!Number.isFinite(value)) return '—';
  if (unit === 'min/km') {
    const rounded = Math.round(value * 60);
    return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')}/km`;
  }
  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)} ${unit}`;
}

function destroyActivityCharts() {
  activityCharts.forEach(chart => chart.destroy());
  activityCharts = [];
}

function renderActivityCharts(activity) {
  const series = buildActivityChartSeries(activity);
  if (!series.length) {
    return '<p class="activity-chart-fallback">No chartable time-series metrics were available in this export.</p>';
  }

  return series.map((item, index) => `
    <article class="activity-chart-card">
      <div class="activity-chart-heading"><div><p class="eyebrow">Time series</p><h4>${escapeActivityHtml(item.label)}</h4></div><span>${escapeActivityHtml(item.unit)}</span></div>
      <div class="activity-chart-wrap"><canvas id="activityChart${index}" aria-label="${escapeActivityHtml(item.label)} over activity time"></canvas><p class="activity-chart-fallback" id="activityChart${index}Fallback" hidden>Chart unavailable. The activity metrics remain available in Overview and Running Dynamics.</p></div>
    </article>`).join('');
}

function drawActivityCharts(activity) {
  const series = buildActivityChartSeries(activity);
  series.forEach((item, index) => {
    const canvas = document.getElementById(`activityChart${index}`);
    const fallback = document.getElementById(`activityChart${index}Fallback`);
    if (!canvas || typeof Chart === 'undefined') {
      if (canvas) canvas.hidden = true;
      if (fallback) fallback.hidden = false;
      return;
    }
    try {
      const chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: item.labels,
          datasets: [{
            label: `${item.label} (${item.unit})`,
            data: item.data,
            borderColor: item.color,
            backgroundColor: `${item.color}22`,
            fill: true,
            tension: 0.28,
            spanGaps: true,
            pointRadius: item.data.length > 80 ? 0 : 2,
            pointHoverRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: context => formatChartValue(context.parsed.y, item.unit) } }
          },
          scales: {
            x: { ticks: { color: '#8e9ab0', maxTicksLimit: 7 }, grid: { color: 'rgba(43,54,80,.35)' } },
            y: {
              reverse: item.key === 'pace',
              ticks: { color: '#8e9ab0', callback: value => formatChartValue(Number(value), item.unit) },
              grid: { color: 'rgba(43,54,80,.45)' }
            }
          }
        }
      });
      activityCharts.push(chart);
    } catch (error) {
      console.error(`Activity chart ${item.key} failed`, error);
      canvas.hidden = true;
      if (fallback) fallback.hidden = false;
    }
  });
}

function ensureActivityDialog() {
  let dialog = document.getElementById('activityDetailDialog');
  if (dialog) return dialog;

  dialog = document.createElement('dialog');
  dialog.id = 'activityDetailDialog';
  dialog.className = 'activity-detail-dialog';
  dialog.innerHTML = `
    <div class="activity-detail-shell">
      <button class="activity-detail-close" type="button" aria-label="Close activity details">×</button>
      <div id="activityDetailContent"></div>
    </div>`;
  document.body.appendChild(dialog);

  dialog.querySelector('.activity-detail-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) dialog.close();
  });
  return dialog;
}

function openActivityDetails(activity) {
  const dialog = ensureActivityDialog();
  const content = dialog.querySelector('#activityDetailContent');
  destroyActivityCharts();
  const title = activity.activityType && activity.activityType !== 'activity'
    ? activity.activityType
    : (activity.activity || 'Imported activity');

  const overviewMetrics = [
    metric('Distance', activity.distanceKm != null ? `${Number(activity.distanceKm).toFixed(2)} km` : null),
    metric('Duration', formatActivityDuration(activity.durationSeconds)),
    metric('Elapsed time', formatActivityDuration(activity.elapsedTimeSeconds)),
    metric('Moving time', formatActivityDuration(activity.movingTimeSeconds)),
    metric('Average pace', activity.averagePace),
    metric('Average speed', numberMetric(activity.averageSpeedKph, ' km/h')),
    metric('Average heart rate', activity.averageHeartRate != null ? `${activity.averageHeartRate} bpm` : null),
    metric('Maximum heart rate', activity.maximumHeartRate != null ? `${activity.maximumHeartRate} bpm` : null),
    metric('Calories', activity.calories),
    metric('Ascent', activity.ascentMetres != null ? `${activity.ascentMetres} m` : null),
    metric('Descent', activity.descentMetres != null ? `${activity.descentMetres} m` : null),
    metric('Aerobic training effect', activity.trainingEffect),
    metric('Anaerobic training effect', activity.anaerobicTrainingEffect),
    metric('Temperature', numberMetric(activity.averageTemperatureC, '°C')),
    metric('Recorded samples', activity.sampleCount)
  ].filter(Boolean).join('');

  const dynamicsMetrics = [
    metric('Average cadence', activity.averageCadence != null ? `${activity.averageCadence} spm` : null),
    metric('Maximum cadence', activity.maximumCadence != null ? `${activity.maximumCadence} spm` : null),
    metric('Average stride length', numberMetric(activity.averageStrideLength, ' m')),
    metric('Ground contact time', activity.averageGroundContactTime != null ? `${activity.averageGroundContactTime} ms` : null),
    metric('Ground contact balance', numberMetric(activity.averageGroundContactBalance, '%')),
    metric('Vertical oscillation', numberMetric(activity.averageVerticalOscillation, ' cm')),
    metric('Vertical ratio', numberMetric(activity.averageVerticalRatio, '%'))
  ].filter(Boolean).join('');

  content.innerHTML = `
    <header class="activity-detail-header">
      <div>
        <p class="eyebrow">Imported ${escapeActivityHtml(activity.sourceFormat || 'activity')}</p>
        <h2>${escapeActivityHtml(title)}</h2>
        <p>${activity.date ? escapeActivityHtml(new Date(activity.date).toLocaleString()) : 'Date unavailable'}</p>
      </div>
      <span class="pill">${escapeActivityHtml(activity.sourceFormat || 'Import')}</span>
    </header>
    <section class="activity-detail-section" aria-labelledby="activityOverviewHeading">
      <div class="panel-heading"><div><p class="eyebrow">Summary</p><h3 id="activityOverviewHeading">Overview</h3></div></div>
      <div class="activity-detail-metrics">${overviewMetrics || '<p>No summary metrics were available.</p>'}</div>
    </section>
    <section class="activity-detail-section">
      <div class="panel-heading"><div><p class="eyebrow">Workout structure</p><h3>Laps</h3></div></div>
      <div class="table-wrap">
        <table class="activity-lap-table">
          <thead><tr><th>#</th><th>Time</th><th>Distance</th><th>Pace</th><th>Avg HR</th><th>Cadence</th><th>Stride</th><th>GCT</th><th>GCT balance</th><th>Vertical osc.</th><th>Vertical ratio</th></tr></thead>
          <tbody>${renderLapRows(activity.laps)}</tbody>
        </table>
      </div>
    </section>
    <section class="activity-detail-section" aria-labelledby="activityChartsHeading">
      <div class="panel-heading"><div><p class="eyebrow">Progressive charts</p><h3 id="activityChartsHeading">Charts</h3></div></div>
      <div class="activity-chart-grid">${renderActivityCharts(activity)}</div>
    </section>
    <section class="activity-detail-section" aria-labelledby="runningDynamicsHeading">
      <div class="panel-heading"><div><p class="eyebrow">Form metrics</p><h3 id="runningDynamicsHeading">Running Dynamics</h3></div></div>
      <div class="activity-detail-metrics">${dynamicsMetrics || '<p>No running-dynamics metrics were available in this export.</p>'}</div>
      <p class="activity-detail-note">Running-dynamics fields are shown only when the FIT device records them. No route coordinates are stored in this activity summary.</p>
    </section>
    <footer class="activity-detail-footer">
      <span>Source: ${escapeActivityHtml(activity.fileName || activity.sourceFormat || 'Imported file')}</span>
      <span>Stored locally in this browser</span>
    </footer>`;

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  drawActivityCharts(activity);
}

function decorateImportedCards() {
  document.querySelectorAll('.activity-card').forEach(card => {
    const dateText = card.querySelector('.activity-date')?.textContent || '';
    if (!dateText.includes('Imported') || card.dataset.detailsReady === 'true') return;

    const cleanDate = dateText.split('·')[0].trim();
    card.dataset.activityDate = cleanDate;
    card.dataset.activitySummary = card.querySelector('p:not(.activity-date)')?.textContent || '';
    card.dataset.detailsReady = 'true';
    card.classList.add('activity-card-clickable');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View details for imported activity on ${cleanDate}`);

    const action = document.createElement('span');
    action.className = 'activity-view-action';
    action.textContent = 'View details →';
    card.querySelector('div:nth-child(2)')?.appendChild(action);
  });
}

function handleCardActivation(card) {
  const activity = findImportedActivity(card);
  if (activity) openActivityDetails(activity);
}

document.addEventListener('click', event => {
  const card = event.target.closest('.activity-card-clickable');
  if (card) handleCardActivation(card);
});

document.addEventListener('keydown', event => {
  const card = event.target.closest?.('.activity-card-clickable');
  if (card && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleCardActivation(card);
  }
});

const activityObserver = new MutationObserver(decorateImportedCards);
document.addEventListener('DOMContentLoaded', () => {
  ensureActivityDialog();
  decorateImportedCards();
  activityObserver.observe(document.body, { childList: true, subtree: true });
});
