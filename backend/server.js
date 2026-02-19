/**
 * PharmaGuard: Node.js/Express Backend
 * Combined Frontend + Backend Server
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================================
// IMPORT MODULES
// ============================================

const VCFParser = require('./vcf-parser');
const PharmacogenomicsAnalyzer = require('./pharmacogenomics-analyzer');
const LLMGenerator = require('./llm-generator');

const vcfParser = new VCFParser();
const analyzer = new PharmacogenomicsAnalyzer();
const llmGenerator = new LLMGenerator();

// ============================================
// SERVE FRONTEND (IMPORTANT)
// ============================================

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Root route loads index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// API ROUTES
// ============================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    runtime: 'Node.js'
  });
});

app.post('/api/analyze', upload.single('vcf_file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please upload a valid .vcf file.' 
      });
    }

    if (!req.body.drugs) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please specify at least one drug.' 
      });
    }

    const vcfContent = req.file.buffer.toString('utf-8');
    const { variants, success, errors } = vcfParser.parse(vcfContent);

    if (!success && variants.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: errors.join(', ') 
      });
    }

    const drugList = req.body.drugs
      .split(',')
      .map(d => d.trim().toUpperCase())
      .filter(d => d.length > 0);

    const results = [];

    for (const drug of drugList) {

      const riskResult = analyzer.computeRisk(variants, drug);
      const cpicRec = analyzer.getCPICRecommendations(drug, riskResult.phenotype);

      const llmExplanation = await llmGenerator.generateExplanation(
        drug,
        riskResult.phenotype,
        riskResult.risk,
        variants,
        riskResult.gene
      );

      const patientId = `PATIENT_${Math.floor(Date.now() / 1000) % 1000000}`;

      results.push({
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
          detected_variants: riskResult.variants
        },
        clinical_recommendation: {
          action: cpicRec.action,
          dosing_guidance: cpicRec.dosing,
          alternative_drugs: cpicRec.alternatives,
          monitoring_required: cpicRec.monitoring,
          urgency: cpicRec.urgency,
          cpic_guideline_reference: cpicRec.cpic
        },
        llm_generated_explanation: llmExplanation
      });
    }

    res.json({
      success: true,
      data: results.length === 1 ? results[0] : results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/genes', (req, res) => {
  res.json({ genes: analyzer.getGenesInfo() });
});

app.get('/api/drugs', (req, res) => {
  res.json({ drugs: analyzer.getSupportedDrugs() });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n============================================================');
  console.log('PharmaGuard Server (Frontend + Backend)');
  console.log('============================================================');
  console.log(`✓ Website: http://localhost:${PORT}`);
  console.log(`✓ API: http://localhost:${PORT}/api/analyze`);
  console.log('============================================================\n');
});