import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeFitRecords, parseFitMessages } from '../docs/activity-analysis.js';

const session = {
  sport: 'running',
  startTime: '2026-08-07T07:00:00Z',
  totalDistance: 10000,
  totalElapsedTime: 3610,
  totalTimerTime: 3600,
  totalMovingTime: 3540,
  avgSpeed: 2.7778,
  maxSpeed: 4,
  avgHeartRate: 151,
  maxHeartRate: 176,
  avgRunningCadence: 170,
  maxRunningCadence: 184,
  totalCalories: 720,
  totalAerobicTrainingEffect: 3.2,
  totalAnaerobicTrainingEffect: 1.1,
  avgTemperature: 19,
  avgStepLength: 1030,
  avgStanceTime: 245,
  avgStanceTimeBalance: 50.2,
  avgVerticalOscillation: 87,
  avgVerticalRatio: 8.4
};

const laps = [{
  startTime: '2026-08-07T07:00:00Z',
  totalDistance: 1000,
  totalElapsedTime: 360,
  totalTimerTime: 360,
  avgSpeed: 2.7778,
  maxSpeed: 3.2,
  avgHeartRate: 145,
  maxHeartRate: 157,
  avgRunningCadence: 168,
  avgStepLength: 1010,
  avgStanceTime: 250,
  avgStanceTimeBalance: 50.4,
  avgVerticalOscillation: 90,
  avgVerticalRatio: 8.7,
  avgTemperature: 18,
  totalCalories: 72
}];

const records = [
  {
    timestamp: '2026-08-07T07:00:00Z', distance: 0, enhancedSpeed: 2.5, heartRate: 140,
    cadence: 166, altitude: 20, temperature: 18, stepLength: 1000, stanceTime: 255,
    stanceTimeBalance: 50, verticalOscillation: 88, verticalRatio: 8.8,
    positionLat: 123456789, positionLong: 987654321, privateNote: 'must not persist'
  },
  {
    timestamp: '2026-08-07T07:00:01Z', distance: 2.5, enhancedSpeed: 2.8, heartRate: 142,
    cadence: 168, altitude: 20.4, temperature: 18, stepLength: 1010, stanceTime: 250,
    stanceTimeBalance: 50.2, verticalOscillation: 87, verticalRatio: 8.6,
    positionLat: 123456790, positionLong: 987654322
  }
];

test('FIT summary and lap metrics preserve supported fields with explicit units', () => {
  const activity = parseFitMessages({ sessionMesgs: [session], lapMesgs: laps, recordMesgs: records }, { fileName: 'run.fit' });

  assert.equal(activity.sourceFormat, 'FIT');
  assert.equal(activity.distanceKm, 10);
  assert.equal(activity.elapsedTimeSeconds, 3610);
  assert.equal(activity.timerTimeSeconds, 3600);
  assert.equal(activity.movingTimeSeconds, 3540);
  assert.equal(activity.averageSpeedKph, 10.00008);
  assert.equal(activity.averagePace, '6:00/km');
  assert.equal(activity.bestPace, '4:10/km');
  assert.equal(activity.averageHeartRate, 151);
  assert.equal(activity.maximumHeartRate, 176);
  assert.equal(activity.calories, 720);
  assert.equal(activity.trainingEffect, 3.2);
  assert.equal(activity.anaerobicTrainingEffect, 1.1);
  assert.equal(activity.averageCadence, 170);
  assert.equal(activity.maximumCadence, 184);
  assert.equal(activity.averageStrideLength, 1.03);
  assert.equal(activity.averageGroundContactTime, 245);
  assert.equal(activity.averageGroundContactBalance, 50.2);
  assert.equal(activity.averageVerticalOscillation, 8.7);
  assert.equal(activity.averageVerticalRatio, 8.4);
  assert.equal(activity.averageTemperatureC, 19);

  assert.equal(activity.laps[0].maximumHeartRate, 157);
  assert.equal(activity.laps[0].averageStrideLength, 1.01);
  assert.equal(activity.laps[0].averageGroundContactBalance, 50.4);
  assert.equal(activity.laps[0].temperatureC, 18);
  assert.equal(activity.laps[0].calories, 72);
});

test('FIT records preserve chart-ready fields while excluding GPS and unknown data', () => {
  const recordsWithPrivateData = normalizeFitRecords(records);
  assert.equal(recordsWithPrivateData.length, 2);
  assert.deepEqual(recordsWithPrivateData[1], {
    timestamp: '2026-08-07T07:00:01.000Z',
    distanceKm: 0.0025,
    speedKph: 10.08,
    pace: '5:57/km',
    heartRate: 142,
    cadence: 168,
    altitudeMetres: 20.4,
    temperatureC: 18,
    strideLengthMetres: 1.01,
    groundContactTimeMs: 250,
    groundContactBalancePct: 50.2,
    verticalOscillationCm: 8.7,
    verticalRatioPct: 8.6,
    intervalSeconds: 1
  });

  const serialised = JSON.stringify(recordsWithPrivateData);
  assert.doesNotMatch(serialised, /positionLat|positionLong|privateNote|123456789|987654321/);
});

test('moving time is derived from active record intervals when FIT omits it', () => {
  const activity = parseFitMessages({
    sessionMesgs: [{ ...session, totalMovingTime: undefined }],
    lapMesgs: [],
    recordMesgs: [
      { timestamp: '2026-08-07T07:00:00Z', enhancedSpeed: 2 },
      { timestamp: '2026-08-07T07:00:05Z', enhancedSpeed: 0 },
      { timestamp: '2026-08-07T07:00:10Z', enhancedSpeed: 2 }
    ]
  });
  assert.equal(activity.movingTimeSeconds, 5);
});
