# PRD.md — Landauer Task Dashboard

## What is this?
A compliance task management dashboard for radiation safety teams.
Users need to track overdue and upcoming tasks related to equipment,
regulation, and inventory compliance.

## Screenshot reference
See screenshot: landauer-screenshot.png


## What I want it to do
- Show a list of tasks with severity levels (Critical, High, Medium, Low)
- Each task shows: title, severity badge, due date, assignee name, category
- Tasks are color-coded by severity (red for Critical, yellow for High)
- A calendar on the right sidebar shows the current month
- Dots on calendar dates that have tasks due
- Clicking a calendar date shows tasks for that day below the calendar
- Header has: LANDAUER logo, gear icon, Action Center button, Logout button
- Action Center button opens a panel showing only Critical tasks

## Tech stack I want
React, TypeScript, Tailwind CSS

## What I do NOT want yet
No backend, no authentication — just a working UI with mock data