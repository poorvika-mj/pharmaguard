/**
 * LLM Explanation Generator Module for Node.js
 * Generates AI-powered clinical explanations using OpenAI API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LLMExplanationGenerator {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.baseURL = 'https://api.openai.com/v1';

    // Load fallback explanations database
    try {
      const fallbackPath = path.join(__dirname, 'fallback-explanations.json');
      const fileContent = fs.readFileSync(fallbackPath, 'utf8');
      this.FALLBACK_EXPLANATIONS = JSON.parse(fileContent);
    } catch (error) {
      console.warn('[WARN] Failed to load fallback-explanations.json:', error.message);
      // Fallback to empty object if file not available
      this.FALLBACK_EXPLANATIONS = {};
    }
  }

  /**
   * Generate LLM-powered clinical explanation
   */
  async generateExplanation(drug, phenotype, riskLabel, variants, gene) {
    // Try LLM if API key configured
    if (this.apiKey) {
      try {
        return await this.generateWithLLM(
          drug,
          phenotype,
          riskLabel,
          variants,
          gene
        );
      } catch (error) {
        console.warn('[WARN] LLM generation failed:', error.message, '- Using fallback');
      }
    }

    // Use fallback explanations
    return this.getFallbackExplanation(drug, phenotype);
  }

  /**
   * Generate explanation using OpenAI API
   */
  async generateWithLLM(drug, phenotype, riskLabel, variants, gene) {
    const variantContext = this.buildVariantContext(variants, gene);

    const prompt = `You are a clinical pharmacogenomics expert. Provide a comprehensive explanation for a patient's pharmacogenomic risk assessment.

PATIENT PROFILE:
- Drug: ${drug}
- Metabolizer Phenotype: ${phenotype}
- Risk Level: ${riskLabel}
- Primary Gene: ${gene}
- Detected Variants: ${variantContext}

Please provide exactly 4 sections:

1. SUMMARY: A concise 2-3 sentence clinical summary and significance.

2. MECHANISM: A 3-4 sentence explanation of the molecular/enzymatic mechanism.

3. RISK_RATIONALE: A 3-4 sentence explanation of why this phenotype creates the identified risk.

4. PATIENT_FRIENDLY: A 2-3 sentence explanation for non-scientific patients, avoiding jargon.

Format response as:
SUMMARY: [text]
MECHANISM: [text]
RISK_RATIONALE: [text]
PATIENT_FRIENDLY: [text]`;

    const response = await axios.post(
      `${this.baseURL}/chat/completions`,
      {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert clinical pharmacogenomics specialist providing evidence-based explanations for genetic drug metabolism profiles.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    return this.parseLLMResponse(content);
  }

  /**
   * Build variant context string for LLM prompt
   */
  buildVariantContext(variants, gene) {
    const geneVariants = variants.filter(v => v.gene === gene);

    if (geneVariants.length === 0) {
      return `No known variants detected in ${gene}`;
    }

    return geneVariants.slice(0, 3)
      .map(v => `${v.star_allele || '?'} (${v.rsid || '?'}): ${v.effect || 'Unknown effect'}`)
      .join('; ');
  }

  /**
   * Parse LLM response into structured format
   */
  parseLLMResponse(content) {
    const sections = {
      summary: '',
      mechanism: '',
      risk_rationale: '',
      patient_friendly: ''
    };

    const lines = content.split('\n');
    let currentSection = null;
    let currentText = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('SUMMARY:')) {
        if (currentSection && currentText.length > 0) {
          sections[currentSection] = currentText.join(' ').trim();
        }
        currentSection = 'summary';
        currentText = trimmed.split(':').slice(1).join(':').trim() ? [trimmed.split(':', 1)[1].trim()] : [];
      } else if (trimmed.includes('MECHANISM:')) {
        if (currentSection && currentText.length > 0) {
          sections[currentSection] = currentText.join(' ').trim();
        }
        currentSection = 'mechanism';
        currentText = trimmed.split(':').slice(1).join(':').trim() ? [trimmed.split(':', 1)[1].trim()] : [];
      } else if (trimmed.includes('RISK_RATIONALE:')) {
        if (currentSection && currentText.length > 0) {
          sections[currentSection] = currentText.join(' ').trim();
        }
        currentSection = 'risk_rationale';
        currentText = trimmed.split(':').slice(1).join(':').trim() ? [trimmed.split(':', 1)[1].trim()] : [];
      } else if (trimmed.includes('PATIENT_FRIENDLY:')) {
        if (currentSection && currentText.length > 0) {
          sections[currentSection] = currentText.join(' ').trim();
        }
        currentSection = 'patient_friendly';
        currentText = trimmed.split(':').slice(1).join(':').trim() ? [trimmed.split(':', 1)[1].trim()] : [];
      } else if (currentSection && trimmed) {
        currentText.push(trimmed);
      }
    }

    // Capture last section
    if (currentSection && currentText.length > 0) {
      sections[currentSection] = currentText.join(' ').trim();
    }

    return sections;
  }

  /**
   * Get fallback explanation from database
   */
  getFallbackExplanation(drug, phenotype) {
    drug = drug.toUpperCase();
    phenotype = phenotype.toUpperCase();

    if (!this.FALLBACK_EXPLANATIONS[drug]) {
      return {
        summary: 'Pharmacogenomic analysis complete. Consult with your healthcare provider for personalized recommendations.',
        mechanism: 'Genetic variants affect drug-metabolizing enzyme activity, influencing drug response.',
        risk_rationale: 'Risk assessment based on CPIC guidelines and current clinical evidence.',
        patient_friendly: 'Your genetic test provides information to help your doctor choose the safest and most effective medication for you.'
      };
    }

    const drugExplanations = this.FALLBACK_EXPLANATIONS[drug];

    if (drugExplanations[phenotype]) {
      return drugExplanations[phenotype];
    }

    // Default to NM
    return drugExplanations['NM'] || {
      summary: 'Pharmacogenomic analysis complete.',
      mechanism: 'Standard drug metabolism expected.',
      risk_rationale: 'No high-risk variants detected.',
      patient_friendly: 'Your genetic profile shows standard drug metabolism for this medication.'
    };
  }
}

module.exports = LLMExplanationGenerator;
