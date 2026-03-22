import Anthropic from '@anthropic-ai/sdk';
import { MatrixCV, AIProcessingResult } from '../types';

export class AIService {
  private anthropic: Anthropic;

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async structureCV(text: string, language: 'he' | 'en'): Promise<AIProcessingResult> {
    const startTime = Date.now();

    const structuredCV = await this.callClaude(text);

    return {
      structuredCV,
      processingTime: Date.now() - startTime,
      retryCount: 0,
      finalCoverage: 1
    };
  }

  private async callClaude(text: string): Promise<MatrixCV> {
    const response = await this.anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      system: `You are an expert CV parser.

Your job is to convert the CV into a COMPLETE structured JSON.

⚠️ CRITICAL RULES:
- DO NOT lose any information
- DO NOT summarize
- USE ALL content from the CV
- If something doesn't fit → put it in "additional"

Return this JSON structure:

{
  "personal_details": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": ""
  },
  "summary": "",
  "experience": [
    {
      "years": "",
      "role": "",
      "company": "",
      "description": ""
    }
  ],
  "skills": [],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "details": ""
    }
  ],
  "languages": [],
  "projects": [],
  "additional": ""
}

EXTRACTION RULES:

- Experience → include ALL responsibilities and achievements
- Skills → include tools, technologies, soft skills
- Education → include GPA if exists
- Projects → extract GitHub or personal projects
- Languages → extract spoken languages

⚠️ VERY IMPORTANT:
- DO NOT shorten descriptions
- DO NOT skip lines
- KEEP descriptions detailed

Return ONLY JSON.`,
      messages: [
        {
          role: 'user',
          content: text
        }
      ]
    });

    const block = response.content[0];
    if (!block || block.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    return this.safeParse(block.text);
  }

  private safeParse(content: string): MatrixCV {
    try {
      return JSON.parse(content);
    } catch {
      try {
        const match = content.match(/\{[\s\S]*\}/);

        if (!match) throw new Error();

        const cleaned = match[0]
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');

        return JSON.parse(cleaned);
      } catch {
        return {
          personal_details: { name: "Unknown" },
          summary: "",
          experience: [],
          skills: [],
          education: [],
          languages: [],
          additional: content
        };
      }
    }
  }
}
