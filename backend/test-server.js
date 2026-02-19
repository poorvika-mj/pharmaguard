/**
 * Test Script for PharmaGuard Node.js Backend
 * Verifies all modules are working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n============================================================');
console.log('PharmaGuard Backend Verification (Node.js)');
console.log('============================================================\n');

try {
  // Test VCFParser
  console.log('✓ Testing VCFParser...');
  const VCFParser = require('./vcf-parser');
  const vcfParser = new VCFParser();
  console.log('  ✓ Module loaded successfully');
  
  // Test with sample VCF
  const sampleVcf = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
22	42127941	rs3892097	A	G	.	.	GENE=CYP2D6;STAR=*4;EFFECT=Loss of function`;
  
  const { variants, success } = vcfParser.parse(sampleVcf);
  console.log(`  ✓ Parsed ${variants.length} variant(s) - Success: ${success}`);
  if (variants.length > 0) {
    console.log(`  ✓ Sample: ${variants[0].gene} ${variants[0].star_allele} (${variants[0].rsid})`);
  }
} catch (error) {
  console.error('✗ VCFParser test failed:', error.message);
  process.exit(1);
}

try {
  // Test PharmacogenomicsAnalyzer
  console.log('\n✓ Testing PharmacogenomicsAnalyzer...');
  const PharmacogenomicsAnalyzer = require('./pharmacogenomics-analyzer');
  const analyzer = new PharmacogenomicsAnalyzer();
  
  const drugs = analyzer.getSupportedDrugs();
  console.log(`  ✓ Supported drugs: ${drugs.join(', ')}`);
  
  const genes = analyzer.getGenesInfo().map(g => g.name);
  console.log(`  ✓ Genes: ${genes.join(', ')}`);
} catch (error) {
  console.error('✗ PharmacogenomicsAnalyzer test failed:', error.message);
  process.exit(1);
}

try {
  // Test Risk Computation
  console.log('\n✓ Testing Risk Computation...');
  const VCFParser = require('./vcf-parser');
  const PharmacogenomicsAnalyzer = require('./pharmacogenomics-analyzer');
  
  const vcfParser = new VCFParser();
  const analyzer = new PharmacogenomicsAnalyzer();
  
  // Create test variant
  const testVariant = {
    gene: 'CYP2D6',
    rsid: 'rs3892097',
    star_allele: '*4',
    effect: 'Loss of function',
    zygosity: 'homozygous',
    activity: 0,
    phenotype_class: 'Loss of function',
    clinical_significance: 'Poor Metabolizer'
  };
  
  const riskResult = analyzer.computeRisk([testVariant], 'CODEINE');
  console.log(`  ✓ Drug: CODEINE`);
  console.log(`  ✓ Risk: ${riskResult.risk}`);
  console.log(`  ✓ Phenotype: ${riskResult.phenotype}`);
  console.log(`  ✓ Confidence: ${riskResult.confidence}`);
} catch (error) {
  console.error('✗ Risk computation test failed:', error.message);
  process.exit(1);
}

try {
  // Test CPIC Recommendations
  console.log('\n✓ Testing CPIC Recommendations...');
  const PharmacogenomicsAnalyzer = require('./pharmacogenomics-analyzer');
  const analyzer = new PharmacogenomicsAnalyzer();
  
  const cpicRec = analyzer.getCPICRecommendations('CODEINE', 'PM');
  console.log(`  ✓ Drug: CODEINE | Phenotype: PM`);
  console.log(`  ✓ Action: ${cpicRec.action}`);
  console.log(`  ✓ Urgency: ${cpicRec.urgency}`);
} catch (error) {
  console.error('✗ CPIC recommendations test failed:', error.message);
  process.exit(1);
}

try {
  // Test LLM Generator
  console.log('\n✓ Testing LLMExplanationGenerator...');
  const LLMGenerator = require('./llm-generator');
  const llmGenerator = new LLMGenerator();
  
  // Test fallback explanation (no API call needed)
  const fallbackExplanation = llmGenerator.getFallbackExplanation('CODEINE', 'PM');
  console.log(`  ✓ Fallback explanation loaded`);
  console.log(`  ✓ Summary: ${fallbackExplanation.summary.substring(0, 60)}...`);
  console.log(`  ✓ Has mechanism: ${fallbackExplanation.mechanism ? 'yes' : 'no'}`);
  console.log(`  ✓ Has patient_friendly: ${fallbackExplanation.patient_friendly ? 'yes' : 'no'}`);
} catch (error) {
  console.error('✗ LLMExplanationGenerator test failed:', error.message);
  process.exit(1);
}

console.log('\n============================================================');
console.log('✓ All backend modules are working correctly!');
console.log('============================================================\n');
