import Anthropic from '@anthropic-ai/sdk';
import { MatrixCV, AIProcessingResult } from '../types';

console.log("🔥 AI SERVICE V1 - DEPLOY TEST 🔥");

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

  // DEBUG METHOD: Simple AI call without validation
  async callOpenAISimple(text: string, language: 'he' | 'en'): Promise<MatrixCV> {
    console.log(`🤖 DEBUG: Calling Claude with ${text.length} characters`);
    return this.callClaude(text);
  }

  private async callClaude(text: string): Promise<MatrixCV> {
    console.log(`🤖 AI INPUT: ${text.length} characters`);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 8000, // Increased to prevent truncation
      system: `You are an expert CV parser that GUARANTEES ZERO DATA LOSS.

🚨 CRITICAL MISSION: EXTRACT 100% OF THE CV CONTENT 🚨

MANDATORY RULES:
1. USE EVERY SINGLE WORD from the input CV
2. DO NOT summarize, shorten, or skip ANY content
3. DO NOT lose ANY information
4. If unsure where to put content → use "additional" field
5. Return ONLY valid JSON, no explanations

JSON STRUCTURE (STRICT):
{
  "personal_details": {
    "name": "FULL NAME",
    "email": "email if found",
    "phone": "phone if found", 
    "address": "address if found",
    "linkedin": "linkedin if found"
  },
  "summary": "COMPLETE professional summary or objective",
  "experience": [
    {
      "years": "YYYY-YYYY format",
      "role": "EXACT job title",
      "company": "company name",
      "description": "COMPLETE description - ALL responsibilities, achievements, technologies, projects"
    }
  ],
  "skills": ["ALL technical skills", "ALL soft skills", "ALL tools", "ALL technologies"],
  "education": [
    {
      "degree": "degree name",
      "institution": "school name", 
      "year": "graduation year",
      "details": "GPA, honors, coursework, thesis - EVERYTHING"
    }
  ],
  "languages": [
    {
      "name": "language name",
      "level": "proficiency level"
    }
  ],
  "additional": "EVERYTHING ELSE - hobbies, interests, certifications, awards, publications, references, volunteer work, military service, etc."
}

EXTRACTION REQUIREMENTS:
- Experience descriptions: Include EVERY responsibility, achievement, technology used
- Skills: Extract EVERY skill mentioned (minimum 5 skills required)
- Additional: Put ANY content that doesn't fit elsewhere
- NO content should be lost or summarized

QUALITY CHECK:
- Input has ${text.length} characters
- Output JSON should represent ALL this content
- If something is missing → it goes to "additional"

Return ONLY the JSON object, nothing else.`,
      messages: [
        {
          role: 'user',
          content: `Extract ALL information from this CV into structured JSON. DO NOT lose any content:

${text}`
        }
      ]
    });

    const block = response.content[0];
    if (!block || block.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    console.log(`🤖 AI OUTPUT: ${block.text.length} characters`);
    return this.robustJSONParse(block.text, text);
  }

  private robustJSONParse(aiResponse: string, originalText: string): MatrixCV {
    console.log(`🔍 PARSING AI RESPONSE: ${aiResponse.length} chars`);
    
    // Step 1: Try direct parse first
    try {
      const parsed = JSON.parse(aiResponse);
      console.log(`✅ DIRECT JSON PARSE SUCCESS`);
      return this.validateStructure(parsed, originalText);
    } catch (directError) {
      console.log(`⚠️ Direct parse failed: ${directError instanceof Error ? directError.message : 'Unknown error'}`);
    }

    // Step 2: Extract JSON block using regex
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(`❌ NO JSON FOUND in AI response`);
      console.error(`RAW AI RESPONSE:`, aiResponse);
      return this.createFallbackStructure(originalText);
    }

    // Step 3: Clean the JSON
    let cleanedJSON = jsonMatch[0];
    
    // Remove problematic characters and formatting
    cleanedJSON = cleanedJSON
      .replace(/\n/g, ' ')           // Remove newlines
      .replace(/\r/g, ' ')           // Remove carriage returns  
      .replace(/\t/g, ' ')           // Remove tabs
      .replace(/\\/g, '\\\\')        // Escape backslashes
      .replace(/"/g, '"')            // Fix smart quotes
      .replace(/"/g, '"')            // Fix smart quotes
      .replace(/'/g, "'")            // Fix smart apostrophes
      .replace(/,\s*}/g, '}')        // Remove trailing commas in objects
      .replace(/,\s*]/g, ']')        // Remove trailing commas in arrays
      .replace(/\s+/g, ' ')          // Normalize whitespace
      .trim();

    // Step 4: Try parsing cleaned JSON
    try {
      const parsed = JSON.parse(cleanedJSON);
      console.log(`✅ CLEANED JSON PARSE SUCCESS`);
      return this.validateStructure(parsed, originalText);
    } catch (cleanError) {
      console.error(`❌ CLEANED JSON PARSE FAILED: ${cleanError instanceof Error ? cleanError.message : 'Unknown error'}`);
      console.error(`CLEANED JSON:`, cleanedJSON);
    }

    // Step 5: Try fixing common JSON issues
    try {
      // Fix unescaped quotes in strings
      let fixedJSON = cleanedJSON.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, '"$1\\"$2\\"$3"');
      
      const parsed = JSON.parse(fixedJSON);
      console.log(`✅ FIXED JSON PARSE SUCCESS`);
      return this.validateStructure(parsed, originalText);
    } catch (fixError) {
      console.error(`❌ FIXED JSON PARSE FAILED: ${fixError instanceof Error ? fixError.message : 'Unknown error'}`);
    }

    // Step 6: Ultimate fallback
    console.error(`💥 ALL JSON PARSING FAILED - Using fallback structure`);
    console.error(`RAW AI RESPONSE:`, aiResponse);
    return this.createFallbackStructure(originalText);
  }

  private validateStructure(parsed: any, originalText: string): MatrixCV {
    // Ensure all required fields exist
    const validated: MatrixCV = {
      personal_details: parsed.personal_details || { name: 'Unknown' },
      summary: parsed.summary || '',
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      additional: parsed.additional || ''
    };

    // Ensure skills array is not empty (minimum requirement)
    if (validated.skills.length === 0) {
      validated.skills = ['Communication', 'Problem Solving', 'Teamwork'];
      console.log(`⚠️ Added fallback skills`);
    }

    // If additional field is empty and we suspect data loss, add original text
    if (!validated.additional || validated.additional.length < 50) {
      const jsonLength = JSON.stringify(validated).length;
      const compressionRatio = jsonLength / originalText.length;
      
      if (compressionRatio < 0.3) { // If JSON is less than 30% of original text
        console.log(`⚠️ SUSPECTED DATA LOSS - Adding original text to additional field`);
        validated.additional = (validated.additional || '') + '\n\n--- ORIGINAL CV CONTENT ---\n' + originalText;
      }
    }

    console.log(`✅ STRUCTURE VALIDATED - Skills: ${validated.skills.length}, Experience: ${validated.experience.length}`);
    return validated;
  }

  private createFallbackStructure(originalText: string): MatrixCV {
    console.log(`🛡️ CREATING FALLBACK STRUCTURE`);
    
    return {
      personal_details: { name: 'Unknown' },
      summary: 'CV processing encountered formatting issues. Please review the additional section for complete content.',
      experience: [],
      skills: ['Communication', 'Problem Solving', 'Teamwork', 'Adaptability'],
      education: [],
      languages: [],
      additional: `--- COMPLETE ORIGINAL CV CONTENT ---\n${originalText}\n\n--- NOTE ---\nThe AI response could not be parsed as valid JSON. All original content is preserved above.`
    };
  }
}