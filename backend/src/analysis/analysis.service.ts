import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AnalysisService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async analyzeTicket(
    title: string,
    description: string,
    logs: string[],
    temperature: number = 0.3
  ) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
You are a senior support engineer at an automotive software company.
Analyze this support ticket and respond in English only.

Title: ${title}
Description: ${description}
Logs: ${logs.join('\n')}

Return only a raw JSON object with no markdown, no backticks, no explanation. 
Just the JSON with these fields:
- summary: one paragraph explaining the issue in plain English
- detected_language: what language was the input
- root_cause: your best technical assessment
- resolution: 3 to 5 step by step actions to fix this
- category: one of [authentication, performance, network, crash, configuration, other]
- severity: low / medium / high / critical
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  }
}
