# Training Log

A personal training dashboard for planning, activity tracking, performance trends, recovery, nutrition and coaching notes.

## Live Dashboard

The GitHub Pages dashboard is published from the `docs/` folder:

**https://joshld.github.io/training-dashboard/**

## Features

- Training plan and weekly schedule
- Running and strength activity history
- Performance charts and workout reports
- Recovery and nutrition guidance
- Garmin export preview for FIT, TCX and GPX files
- Coaching notes and current training priorities

## Repository Structure

- `activities/` — training logs
- `health/` — private recovery and nutrition records
- `coach/` — private coaching context
- `plans/` — training plans
- `docs/` — public GitHub Pages dashboard

## Privacy

Only sanitised data intended for public display should be placed under `docs/`. Personal profile information, detailed health notes, bodyweight, exact food logs and other sensitive information should remain outside the published site.

## Update Workflow

Training details are recorded in the repository and selected non-sensitive information is rendered by the dashboard. Garmin exports can be previewed locally in the browser before a sanitised summary is added to the training record.
