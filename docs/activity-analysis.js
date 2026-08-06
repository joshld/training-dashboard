function number(value) {
  if (value == null || value === '') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

function pick(object, ...keys) {
  for (const key of keys) {
    if (object?.[key] != null) return object[key];
  }
  return null;
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function paceFromSecondsAndDistance(seconds, distanceKm) {
  return number(seconds) != null && number(distanceKm) > 0 ? number(seconds) / number(distanceKm) : null;
}

function paceFromSpeed(speedMetresPerSecond) {
  const speed = number(speedMetresPerSecond);
  return speed > 0 ? 1000 / speed : null;
}

export function formatPace(secondsPerKm) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return '—';
  const roundedSeconds = Math.round(secondsPerKm);
  return `${Math.floor(roundedSeconds / 60)}:${String(roundedSeconds % 60).padStart(2, '0')}/km`;
}

function isoDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : null;
}

function metresToKilometres(value) {
  const result = number(value);
  return result == null ? null : result / 1000;
}

function fitLengthToMetres(value) {
  const result = number(value);
  return result == null ? null : result / 1000;
}

function fitOscillationToCentimetres(value) {
  const result = number(value);
  return result == null ? null : result / 10;
}

function readSpeed(object, keys = ['enhancedAvgSpeed', 'avgSpeed']) {
  return number(pick(object, ...keys));
}

function readDistanceKm(object) {
  return metresToKilometres(pick(object, 'enhancedTotalDistance', 'totalDistance', 'distance'));
}

function readPace(object, durationSeconds, distanceKm, speedKeys) {
  const directSpeed = readSpeed(object, speedKeys);
  return directSpeed != null ? paceFromSpeed(directSpeed) : paceFromSecondsAndDistance(durationSeconds, distanceKm);
}

function readDynamics(object) {
  const strideLength = fitLengthToMetres(pick(object, 'avgStrideLength', 'avgStepLength', 'strideLength', 'stepLength'));
  const verticalOscillation = fitOscillationToCentimetres(pick(object, 'avgVerticalOscillation', 'verticalOscillation'));
  return {
    averageCadence: number(pick(object, 'avgRunningCadence', 'avgCadence', 'cadence')),
    maximumCadence: number(pick(object, 'maxRunningCadence', 'maxCadence')),
    averageStrideLength: strideLength,
    averageGroundContactTime: number(pick(object, 'avgStanceTime', 'stanceTime')),
    averageGroundContactBalance: number(pick(object, 'avgStanceTimeBalance', 'avgGroundContactBalance', 'stanceTimeBalance', 'groundContactBalance')),
    averageVerticalOscillation: verticalOscillation,
    averageVerticalRatio: number(pick(object, 'avgVerticalRatio', 'verticalRatio'))
  };
}

function normalizeRecord(record, previousTimestamp) {
  const timestamp = isoDate(record.timestamp);
  const distanceKm = metresToKilometres(pick(record, 'distance', 'enhancedDistance'));
  const speedMetresPerSecond = number(pick(record, 'enhancedSpeed', 'speed'));
  const paceSecondsPerKm = paceFromSpeed(speedMetresPerSecond);
  const dynamics = readDynamics(record);
  const normalized = {
    timestamp,
    distanceKm,
    speedKph: speedMetresPerSecond != null ? speedMetresPerSecond * 3.6 : null,
    pace: formatPace(paceSecondsPerKm),
    heartRate: number(record.heartRate),
    cadence: dynamics.averageCadence,
    altitudeMetres: number(record.altitude),
    temperatureC: number(record.temperature),
    strideLengthMetres: dynamics.averageStrideLength,
    groundContactTimeMs: dynamics.averageGroundContactTime,
    groundContactBalancePct: dynamics.averageGroundContactBalance,
    verticalOscillationCm: dynamics.averageVerticalOscillation,
    verticalRatioPct: dynamics.averageVerticalRatio
  };

  if (timestamp && previousTimestamp) {
    const intervalSeconds = (Date.parse(timestamp) - Date.parse(previousTimestamp)) / 1000;
    normalized.intervalSeconds = intervalSeconds > 0 && intervalSeconds <= 60 ? intervalSeconds : null;
  } else {
    normalized.intervalSeconds = null;
  }
  return normalized;
}

export function normalizeFitRecords(records = []) {
  const normalized = [];
  let previousTimestamp = null;
  for (const record of records) {
    const item = normalizeRecord(record, previousTimestamp);
    if (item.timestamp || Object.values(item).some(value => value != null)) normalized.push(item);
    previousTimestamp = item.timestamp || previousTimestamp;
  }
  return normalized;
}

function deriveMovingTime(records) {
  const movingSeconds = records.reduce((total, record) => {
    const active = record.speedKph == null || record.speedKph > 0.5;
    return active && record.intervalSeconds != null ? total + record.intervalSeconds : total;
  }, 0);
  return movingSeconds > 0 ? movingSeconds : null;
}

function normalizeLap(lap, index) {
  const distanceKm = readDistanceKm(lap);
  const elapsedTimeSeconds = number(pick(lap, 'totalElapsedTime'));
  const timerTimeSeconds = number(pick(lap, 'totalTimerTime'));
  const movingTimeSeconds = number(pick(lap, 'totalMovingTime'));
  const durationSeconds = timerTimeSeconds ?? elapsedTimeSeconds;
  const dynamics = readDynamics(lap);
  const averageSpeedMetresPerSecond = readSpeed(lap, ['enhancedAvgSpeed', 'avgSpeed']);
  const maximumSpeedMetresPerSecond = readSpeed(lap, ['enhancedMaxSpeed', 'maxSpeed']);
  return {
    index: index + 1,
    startTime: isoDate(pick(lap, 'startTime', 'timestamp')),
    distanceKm,
    elapsedTimeSeconds,
    timerTimeSeconds,
    movingTimeSeconds,
    durationSeconds,
    averageSpeedKph: averageSpeedMetresPerSecond != null ? averageSpeedMetresPerSecond * 3.6 : null,
    maximumSpeedKph: maximumSpeedMetresPerSecond != null ? maximumSpeedMetresPerSecond * 3.6 : null,
    pace: formatPace(readPace(lap, durationSeconds, distanceKm, ['enhancedAvgSpeed', 'avgSpeed'])),
    bestPace: formatPace(maximumSpeedMetresPerSecond != null ? paceFromSpeed(maximumSpeedMetresPerSecond) : null),
    averageHeartRate: number(pick(lap, 'avgHeartRate')),
    maximumHeartRate: number(pick(lap, 'maxHeartRate')),
    calories: number(pick(lap, 'totalCalories')),
    temperatureC: number(pick(lap, 'avgTemperature')),
    ...dynamics
  };
}

export function parseFitMessages(messages, { fileName = '' } = {}) {
  const session = first(messages?.sessionMesgs) || {};
  const laps = Array.isArray(messages?.lapMesgs) ? messages.lapMesgs : [];
  const records = Array.isArray(messages?.recordMesgs) ? messages.recordMesgs : [];
  const distanceKm = readDistanceKm(session) ?? readDistanceKm(first(laps));
  const elapsedTimeSeconds = number(pick(session, 'totalElapsedTime'));
  const timerTimeSeconds = number(pick(session, 'totalTimerTime'));
  const normalizedRecords = normalizeFitRecords(records);
  const movingTimeSeconds = number(pick(session, 'totalMovingTime')) ?? deriveMovingTime(normalizedRecords);
  const durationSeconds = timerTimeSeconds ?? elapsedTimeSeconds;
  const averageSpeedMetresPerSecond = readSpeed(session, ['enhancedAvgSpeed', 'avgSpeed']);
  const maximumSpeedMetresPerSecond = readSpeed(session, ['enhancedMaxSpeed', 'maxSpeed']);
  const dynamics = readDynamics(session);

  return {
    sourceFormat: 'FIT',
    fileName,
    date: isoDate(pick(session, 'startTime', 'timestamp')) || normalizedRecords[0]?.timestamp || null,
    activityType: String(pick(session, 'sport', 'subSport') || 'activity'),
    distanceKm,
    elapsedTimeSeconds,
    timerTimeSeconds,
    movingTimeSeconds,
    durationSeconds,
    averageSpeedKph: averageSpeedMetresPerSecond != null ? averageSpeedMetresPerSecond * 3.6 : null,
    maximumSpeedKph: maximumSpeedMetresPerSecond != null ? maximumSpeedMetresPerSecond * 3.6 : null,
    averagePace: formatPace(readPace(session, durationSeconds, distanceKm, ['enhancedAvgSpeed', 'avgSpeed'])),
    bestPace: formatPace(maximumSpeedMetresPerSecond != null ? paceFromSpeed(maximumSpeedMetresPerSecond) : null),
    averageHeartRate: number(pick(session, 'avgHeartRate')),
    maximumHeartRate: number(pick(session, 'maxHeartRate')),
    calories: number(pick(session, 'totalCalories')),
    trainingEffect: number(pick(session, 'totalTrainingEffect', 'totalAerobicTrainingEffect')),
    anaerobicTrainingEffect: number(pick(session, 'totalAnaerobicTrainingEffect')),
    averageTemperatureC: number(pick(session, 'avgTemperature')),
    ascentMetres: number(pick(session, 'totalAscent')),
    descentMetres: number(pick(session, 'totalDescent')),
    ...dynamics,
    laps: laps.map((lap, index) => normalizeLap(lap, index)),
    timeSeries: normalizedRecords,
    sampleCount: normalizedRecords.length
  };
}
