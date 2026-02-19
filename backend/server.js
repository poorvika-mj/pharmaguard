/**
 * PharmaGuard: Node.js/Express Alternative Backend
 * AI-Powered Pharmacogenomic Risk Prediction System
 * RIFT 2026 Hackathon - Pharmacogenomics Track
 * 
 * Use this if Python is not available on your deployment platform
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Import modules
const VCFParser = require('./vcf-parser');
const PharmacogenomicsAnalyzer = require('./pharmacogenomics-analyzer');
const LLMGenerator = require('./llm-generator');

// Initialize components
const vcfParser = new VCFParser();
const analyzer = new PharmacogenomicsAnalyzer();
const llmGenerator = new LLMGenerator();

// ============================================
// ROUTES
// ============================================

/**
 * GET /
 * Welcome endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'PharmaGuard API v1.0 (Node.js)',
    description: 'AI-Powered Pharmacogenomic Risk Prediction System',
    endpoints: {
      analyze: 'POST /api/analyze',
      genes: 'GET /api/genes',
      drugs: 'GET /api/drugs',
      health: 'GET /health'
    }
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    runtime: 'Node.js'
  });
});

/**
 * POST /api/analyze
 * Main analysis endpoint
 */
app.post('/api/analyze', upload.single('vcf_file'), async (req, res) => {
  try {
    // Validate inputs
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file format. Please upload a .vcf file.' 
      });
    }

    if (!req.body.drugs) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please specify at least one drug.' 
      });
    }

    // Read VCF content
    const vcfContent = req.file.buffer.toString('utf-8', 0, req.file.buffer.length);
    
    console.log(`[INFO] Parsing VCF file: ${req.file.originalname}`);

    // Parse VCF
    const { variants, success, errors } = vcfParser.parse(vcfContent);

    if (!success && variants.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Failed to parse VCF file: ${errors.join(', ')}` 
      });
    }

    console.log(`[INFO] Detected ${variants.length} variants`);

    // Parse drug list
    const drugList = req.body.drugs
      .split(',')
      .map(d => d.trim().toUpperCase())
      .filter(d => d.length > 0);

    if (drugList.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please specify at least one valid drug.' 
      });
    }

    console.log(`[INFO] Analyzing drugs: ${drugList.join(', ')}`);

    // Generate results for each drug
    const results = [];

    for (const drug of drugList) {
      try {
        console.log(`[INFO] Processing: ${drug}`);

        // Compute risk
        const riskResult = analyzer.computeRisk(variants, drug);

        // Get CPIC recommendations
        const cpicRec = analyzer.getCPICRecommendations(drug, riskResult.phenotype);

        // Generate LLM explanation
        const llmExplanation = await llmGenerator.generateExplanation(
          drug,
          riskResult.phenotype,
          riskResult.risk,
          variants,
          riskResult.gene
        );

        // Build result JSON per RIFT specification
        const patientId = `PATIENT_${Math.floor(Date.now() / 1000) % 1000000}`;
        
        const output = {
          patient_id: patientId,
          drug,
          timestamp: new Date().toISOString(),
          risk_assessment: {
            risk_label: riskResult.risk,
            confidence_score: riskResult.confidence,
            severity: riskResult.severity
          },
          pharmacogenomic_profile: {
            primary_gene: riskResult.gene,
            diplotype: riskResult.diplotype,
            phenotype: riskResult.phenotype,
            detected_variants: riskResult.variants.map(v => ({
              rsid: v.rsid || 'unknown',
              gene: v.gene || '',
              star_allele: v.star_allele || '',
              effect: v.effect || '',
              zygosity: v.zygosity || '',
              clinical_significance: v.clinical_significance || ''
            }))
          },
          clinical_recommendation: {
            action: cpicRec.action,
            dosing_guidance: cpicRec.dosing,
            alternative_drugs: cpicRec.alternatives,
            monitoring_required: cpicRec.monitoring,
            urgency: cpicRec.urgency,
            cpic_guideline_reference: cpicRec.cpic
          },
          llm_generated_explanation: {
            summary: llmExplanation.summary,
            mechanism: llmExplanation.mechanism,
            risk_rationale: llmExplanation.risk_rationale,
            patient_friendly_explanation: llmExplanation.patient_friendly
          },
          quality_metrics: {
            vcf_parsing_success: success,
            variants_detected: variants.length,
            genes_analyzed: [...new Set(variants.map(v => v.gene).filter(g => g))],
            confidence_factors: riskResult.variants.length > 0 
              ? ['known_variant', 'validated_rsid', 'cpic_evidence']
              : ['no_variants_detected', 'standard_phenotype']
          }
        };

        results.push(output);
      } catch (drugError) {
        console.error(`[ERROR] Error processing ${drug}:`, drugError);
        return res.status(500).json({ 
          success: false, 
          error: `Error processing drug ${drug}: ${drugError.message}` 
        });
      }
    }

    console.log(`[INFO] Analysis complete. Generated ${results.length} result(s)`);

    return res.json({
      success: true,
      data: results.length === 1 ? results[0] : results,
      message: `Successfully analyzed ${variants.length} variants for ${results.length} drug(s)`
    });

  } catch (error) {
    console.error('[ERROR] Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Internal server error: ${error.message}` 
    });
  }
});

/**
 * POST /api/upload-test
 * Test endpoint for VCF file upload and parsing
 */
app.post('/api/upload-test', upload.single('vcf_file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const vcfContent = req.file.buffer.toString('utf-8');
    const { variants, success, errors } = vcfParser.parse(vcfContent);

    res.json({
      filename: req.file.originalname,
      file_size: req.file.size,
      parsing_success: success,
      variants_detected: variants.length,
      errors,
      sample_variants: variants.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/genes
 * Get information about the 6 critical pharmacogenomic genes
 */
app.get('/api/genes', (req, res) => {
  const genes = analyzer.getGenesInfo();
  res.json({ genes });
});

/**
 * GET /api/drugs
 * Get list of supported drugs
 */
app.get('/api/drugs', (req, res) => {
  const drugs = analyzer.getSupportedDrugs();
  res.json({ 
    drugs,
    description: 'Supported drugs for pharmacogenomic analysis'
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

/**
 * Error Handler
 */
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('PharmaGuard API Server (Node.js)');
  console.log(`${'='.repeat(60)}`);
  console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
  console.log(`✓ API endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

module.exports = app;
