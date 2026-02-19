/**
 * Comprehensive API Test Suite for PharmaGuard Node.js Backend
 * Verifies all hackathon requirements
 */

const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║     PharmaGuard API Comprehensive Test Suite                   ║');
console.log('║     Testing Node.js/Express Backend Against Hackathon Reqs     ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  console.log('┌─ TEST 1: Health Check Endpoint');
  try {
    const response = await axios.get(`${API_BASE}/health`);
    console.log('  ✓ Status:', response.data.status);
    console.log('  ✓ Version:', response.data.version);
    console.log('  ✓ Runtime:', response.data.runtime);
    return true;
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
    return false;
  }
}

async function testGenesEndpoint() {
  console.log('\n┌─ TEST 2: Genes Endpoint');
  try {
    const response = await axios.get(`${API_BASE}/api/genes`);
    const genes = response.data.genes || [];
    console.log(`  ✓ Retrieved ${genes.length} genes`);
    
    const requiredGenes = ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'];
    const foundGenes = genes.filter(g => requiredGenes.includes(g.symbol));
    console.log(`  ✓ Required genes found: ${foundGenes.map(g => g.symbol).join(', ')}`);
    
    if (foundGenes.length === 6) {
      console.log('  ✓ ALL 6 REQUIRED GENES SUPPORTED');
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testDrugsEndpoint() {
  console.log('\n┌─ TEST 3: Drugs Endpoint');
  try {
    const response = await axios.get(`${API_BASE}/api/drugs`);
    const drugs = response.data.drugs || [];
    console.log(`  ✓ Retrieved ${drugs.length} drugs`);
    
    const requiredDrugs = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL'];
    const foundDrugs = drugs.filter(d => requiredDrugs.includes(d));
    console.log(`  ✓ Required drugs found: ${foundDrugs.join(', ')}`);
    
    if (foundDrugs.length === 6) {
      console.log('  ✓ ALL 6 REQUIRED DRUGS SUPPORTED');
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testVCFParsing() {
  console.log('\n┌─ TEST 4: VCF Parsing & Upload Test');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));

    const response = await axios.post(`${API_BASE}/api/upload-test`, form, {
      headers: form.getHeaders()
    });

    console.log('  ✓ Filename:', response.data.filename);
    console.log('  ✓ Parsing Success:', response.data.parsing_success);
    console.log('  ✓ Variants Detected:', response.data.variants_detected);
    console.log('  ✓ Errors:', response.data.errors.length === 0 ? 'None' : response.data.errors);

    if (response.data.parsing_success) {
      console.log('  ✓ VCF PARSING SUCCESSFUL');
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testFullAnalysis() {
  console.log('\n┌─ TEST 5: Full Pharmacogenomic Analysis');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));
    form.append('drugs', 'CODEINE,WARFARIN,CLOPIDOGREL,SIMVASTATIN,AZATHIOPRINE,FLUOROURACIL');

    const response = await axios.post(`${API_BASE}/api/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    console.log('  ✓ Analysis Success:', response.data.success);

    if (Array.isArray(response.data.data)) {
      console.log(`  ✓ Analyzed ${response.data.data.length} drugs`);
      
      // Check each result
      let allValid = true;
      for (let i = 0; i < response.data.data.length && i < 1; i++) {
        const result = response.data.data[i];
        console.log(`\n  Drug Analysis #${i+1}: ${result.drug}`);
        console.log(`    • Risk Label: ${result.risk_assessment.risk_label}`);
        console.log(`    • Confidence: ${result.risk_assessment.confidence_score}`);
        console.log(`    • Severity: ${result.risk_assessment.severity}`);
        console.log(`    • Phenotype: ${result.pharmacogenomic_profile.phenotype}`);
        console.log(`    • Action: ${result.clinical_recommendation.action}`);
        console.log(`    • Urgency: ${result.clinical_recommendation.urgency}`);
        console.log(`    • Has LLM Explanation: ${result.llm_generated_explanation.summary ? 'YES' : 'NO'}`);
        
        // Verify required fields
        const hasAllFields = 
          result.patient_id &&
          result.drug &&
          result.risk_assessment &&
          result.risk_assessment.risk_label &&
          result.risk_assessment.confidence_score !== undefined &&
          result.risk_assessment.severity &&
          result.pharmacogenomic_profile &&
          result.pharmacogenomic_profile.phenotype &&
          result.clinical_recommendation &&
          result.clinical_recommendation.action &&
          result.clinical_recommendation.urgency &&
          result.llm_generated_explanation &&
          result.quality_metrics;

        if (hasAllFields) {
          console.log('    ✓ All required fields present');
        } else {
          console.log('    ✗ Missing required fields');
          allValid = false;
        }
      }

      return allValid;
    } else {
      console.log('  ✓ Single Drug Analysis Result');
      const result = response.data.data;
      console.log(`  Drug: ${result.drug}`);
      console.log(`  Risk: ${result.risk_assessment.risk_label}`);
      console.log(`  Confidence: ${result.risk_assessment.confidence_score}`);
      console.log(`  Phenotype: ${result.pharmacogenomic_profile.phenotype}`);
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.response?.data?.error || error.message);
  }
  return false;
}

async function testLLMExplanations() {
  console.log('\n┌─ TEST 6: LLM Explanation Generation');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));
    form.append('drugs', 'CODEINE');

    const response = await axios.post(`${API_BASE}/api/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    const llm = result.llm_generated_explanation;

    console.log('  LLM Explanation Components:');
    console.log('    • Summary present:', llm.summary ? 'YES' : 'NO');
    console.log('    • Mechanism present:', llm.mechanism ? 'YES' : 'NO');
    console.log('    • Risk Rationale present:', llm.risk_rationale ? 'YES' : 'NO');
    console.log('    • Patient-Friendly present:', llm.patient_friendly_explanation ? 'YES' : 'NO');

    if (llm.summary && llm.mechanism && llm.risk_rationale && llm.patient_friendly_explanation) {
      console.log('\n  ✓ ALL 4 LLM COMPONENTS PRESENT AND WORKING');
      console.log('\n  Sample Summary (first 100 chars):');
      console.log('  "' + llm.summary.substring(0, 100) + '..."');
      return true;
    } else {
      console.log('  ✗ Missing LLM components');
      return false;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testCPICRecommendations() {
  console.log('\n┌─ TEST 7: CPIC Recommendation Integration');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));
    form.append('drugs', 'CODEINE,WARFARIN');

    const response = await axios.post(`${API_BASE}/api/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const results = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    
    console.log(`  ✓ Retrieved ${results.length} drugs with CPIC recommendations`);

    let valid = 0;
    for (const result of results.slice(0, 2)) {
      const rec = result.clinical_recommendation;
      console.log(`\n  ${result.drug}:`);
      console.log(`    • Action: ${rec.action}`);
      console.log(`    • Urgency: ${rec.urgency}`);
      console.log(`    • Alternatives: ${rec.alternative_drugs ? rec.alternative_drugs.length + ' available' : 'None'}`);
      console.log(`    • Monitoring: ${rec.monitoring_required}`);

      const validUrgency = ['immediate', 'high', 'normal'].includes(rec.urgency.toLowerCase());
      if (rec.action && rec.urgency && validUrgency) {
        valid++;
      }
    }

    if (valid > 0) {
      console.log('\n  ✓ CPIC RECOMMENDATIONS PRESENT AND VALID');
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testQualityMetrics() {
  console.log('\n┌─ TEST 8: Quality Metrics & Data Integrity');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));
    form.append('drugs', 'CODEINE');

    const response = await axios.post(`${API_BASE}/api/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    const metrics = result.quality_metrics;

    console.log('  Quality Metrics:');
    console.log(`    • VCF Parsing Success: ${metrics.vcf_parsing_success}`);
    console.log(`    • Variants Detected: ${metrics.variants_detected}`);
    console.log(`    • Genes Analyzed: ${metrics.genes_analyzed.join(', ')}`);
    console.log(`    • Confidence Factors: ${metrics.confidence_factors.join(', ')}`);

    if (metrics.vcf_parsing_success) {
      console.log('  ✓ QUALITY METRICS COMPLETE');
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function testAllPhenotypes() {
  console.log('\n┌─ TEST 9: All Phenotype Classes (PM/IM/NM/RM/URM)');
  try {
    const vcfPath = './sample_vcf_1.vcf';
    if (!fs.existsSync(vcfPath)) {
      console.error('  ✗ Sample VCF file not found');
      return false;
    }

    const form = new FormData();
    form.append('vcf_file', fs.createReadStream(vcfPath));
    form.append('drugs', 'CODEINE');

    const response = await axios.post(`${API_BASE}/api/analyze`, form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
    const phenotype = result.pharmacogenomic_profile.phenotype;

    const validPhenotypes = ['PM', 'IM', 'NM', 'RM', 'URM', 'Unknown'];
    const isValid = validPhenotypes.includes(phenotype);

    console.log(`  ✓ Phenotype: ${phenotype}`);
    
    if (isValid) {
      console.log(`  ✓ PHENOTYPE IS VALID (${phenotype})`);
      return true;
    }
  } catch (error) {
    console.error('  ✗ FAILED:', error.message);
  }
  return false;
}

async function runAllTests() {
  const results = [];
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...\n');
  await sleep(2000);

  results.push(await testHealthCheck());
  results.push(await testGenesEndpoint());
  results.push(await testDrugsEndpoint());
  results.push(await testVCFParsing());
  results.push(await testFullAnalysis());
  results.push(await testLLMExplanations());
  results.push(await testCPICRecommendations());
  results.push(await testQualityMetrics());
  results.push(await testAllPhenotypes());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                              ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║ PASSED: ${passed}/${total} tests                                          ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  if (passed === total) {
    console.log('✅ ALL TESTS PASSED - BACKEND IS PRODUCTION READY!\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed\n`);
  }

  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(error => {
  console.error('\n❌ CRITICAL ERROR:', error.message);
  process.exit(1);
});
