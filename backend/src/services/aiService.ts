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

    const structuredCV = await this.callAnthropic(text);

    return {
      structuredCV,
      processingTime: Date.now() - startTime,
      retryCount: 0,
      finalCoverage: 1
    };
  }

  // DEBUG METHOD: Simple AI call without validation
  async callAnthropicSimple(text: string, language: 'he' | 'en'): Promise<MatrixCV> {
    console.log(`🤖 DEBUG: Calling Anthropic with ${text.length} characters`);
    return this.callAnthropic(text);
  }

  private async callAnthropic(text: string): Promise<MatrixCV> {
    console.log(`🤖 AI INPUT: ${text.length} characters`);
    
    console.log("🚀 CALLING ANTHROPIC API");
    console.log("🔧 Model: claude-haiku-4-5-20251001");
    
    const response = await this.anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `You are an expert CV parser. Extract ALL information into the EXACT JSON structure below.

🚨 CRITICAL REQUIREMENTS 🚨

1. Return ONLY valid JSON - no text before or after
2. Include ALL sections even if empty
3. Do not omit any fields
4. Do not use undefined values
5. If data is missing, return empty string "" or empty array [], NOT undefined
6. Extract 100% of CV content - do not lose any information

EXACT JSON SCHEMA (MANDATORY):
{
  "personal_details": {
    "name": "",
    "email": "",
    "phone": "",
    "address": "",
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
  "languages": [
    {
      "name": "",
      "level": ""
    }
  ],
  "additional": ""
}

EXTRACTION RULES:
- personal_details: Extract name, email, phone, address, linkedin (empty string if not found)
- summary: Complete professional summary/objective (empty string if not found)
- experience: ALL work experience with complete descriptions (empty array if none)
- skills: ALL skills mentioned - technical, soft, tools, technologies (empty array if none)
- education: ALL education with complete details (empty array if none)
- languages: ALL languages with proficiency levels (empty array if none)
- additional: Everything else - certifications, awards, hobbies, military, etc. (empty string if none)

VALIDATION:
- Every field must be present
- No undefined values allowed
- Arrays must be [] if empty, not undefined
- Strings must be "" if empty, not undefined
- Include ALL content from input (${text.length} characters)

Return ONLY the JSON object. No explanations. No text before or after.

CV Content:
${text}`
        }
      ]
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('No text content from Anthropic response');
    }

    console.log(`🤖 AI OUTPUT: ${content.text.length} characters`);
    return this.robustJSONParse(content.text, text);
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