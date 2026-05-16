# AI-powered support ticket analyzer
A multilingual support ticket analysis systm built with NestJs and Gemini Ai.
Analyzes tickets in English, French, Arabic, and German and returns structured resoltuion guidance in English.

## What it does

-Accepts support tickets in any language
-Detects the input language automatically
-Returns root cause analysis and resolution steps in English
-Categorizes tickets by the type and severity


## Tech stack
-NestJS
-Google Gemini AI
-TypeScript

 ##Endpoints
 -POST /analysis/analyze - analyze a signle ticket
 -POST /tickets -create and anlyze a ticket
 - GET /tickets - get all analyzed tcikets
 -Get /tickets/:id - get one ticket by ID
 -POST /tickets/bulk-analyze -analyze all mock tickets



 ## Setup
 1. Clone the repo 
 2. cd backend && npm install
 3. Create .env with GEMINI_API_KEY = your _Key 
 4.npm run start:dev