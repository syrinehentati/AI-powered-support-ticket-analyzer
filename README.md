# AI-Powered Support Ticket Analyzer

A multilingual support ticket analysis system built with NestJS and Google Gemini AI. Paste a support ticket in any language and get back a structured English analysis with root cause and resolution steps.

## What it does

- Accepts support tickets in English, French, Arabic, and German
- Automatically detects the input language
- Returns structured analysis in English including summary, root cause, resolution steps, category, and severity
- Stores analyzed tickets for review
- Bulk analyzes multiple tickets at once

## Tech stack

**Backend:** NestJS, TypeScript, Google Gemini AI, class-validator

**Frontend:** React, TypeScript, Axios

## Screenshots

coming soon

## Getting started

### Backend

```bash
cd backend
npm install
cp .env.example .env
# add your GEMINI_API_KEY to .env
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# add REACT_APP_API_URL=http://localhost:3000
npm run start
```

## API Endpoints

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | /analysis/analyze     | Analyze a single ticket     |
| POST   | /tickets              | Create and analyze a ticket |
| GET    | /tickets              | Get all analyzed tickets    |
| GET    | /tickets/:id          | Get one ticket by ID        |
| POST   | /tickets/bulk-analyze | Analyze all mock tickets    |

## Why I built this

I spent 5 months working second-level technical support for enterprise automotive clients. Every day I read incident reports in multiple languages — and had to identify root causes and write resolutions. I built this tool to automate that process using AI.
