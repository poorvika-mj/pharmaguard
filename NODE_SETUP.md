# Node.js Backend Setup Guide

This guide covers setting up and running the **PharmaGuard Node.js/Express alternative backend**. Use this option if:
- Your deployment platform doesn't support Python
- You prefer Node.js for your infrastructure
- You want redundancy with multiple backend options

## Prerequisites

- **Node.js 14.0+** - [Download from nodejs.org](https://nodejs.org)
- **npm 6.0+** - Included with Node.js
- **PharmaGuard Frontend** - Already configured

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs all required packages:
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `multer` - File upload handling
- `dotenv` - Environment variables
- `axios` - HTTP client (for OpenAI API calls)

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key (optional)
# OPENAI_API_KEY=sk-... (optional)
```

**Environment Variables:**
```
OPENAI_API_KEY=sk-...              # Optional: OpenAI API key for LLM explanations
OPENAI_MODEL=gpt-3.5-turbo        # Optional: OpenAI model (default: gpt-3.5-turbo)
PORT=8000                           # Port to run server on
ENVIRONMENT=development             # production or development
DEBUG=true                          # Enable debug logging
```

### 3. Run the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will start at `http://localhost:8000`

### 4. Test the Backend

```bash
node test-server.js
```

Expected output:
```
============================================================
PharmaGuard Backend Verification (Node.js)
============================================================

✓ Testing VCFParser...
  ✓ Module loaded successfully
  ✓ Parsed 1 variant(s) - Success: true
  ✓ Sample: CYP2D6 *4 (rs3892097)

✓ Testing PharmacogenomicsAnalyzer...
  ✓ Supported drugs: CODEINE, WARFARIN, ...
  ✓ Genes: CYP2D6, CYP2C19, ...

✓ Testing Risk Computation...
  ✓ Drug: CODEINE
  ✓ Risk: Toxic
  ✓ Phenotype: PM
  ✓ Confidence: 0.93

✓ Testing CPIC Recommendations...
  ✓ Drug: CODEINE | Phenotype: PM
  ✓ Action: Avoid codeine — use alternative
  ✓ Urgency: immediate

✓ Testing LLMExplanationGenerator...
  ✓ Fallback explanation loaded
  ✓ Summary: Your CYP2D6 activity is severely diminished...

============================================================
✓ All backend modules are working correctly!
============================================================
```

## API Endpoints

### 1. GET `/`
Welcome endpoint

**Response:**
```json
{
  "message": "PharmaGuard API v1.0 (Node.js)",
  "description": "AI-Powered Pharmacogenomic Risk Prediction System",
  "endpoints": {
    "analyze": "POST /api/analyze",
    "genes": "GET /api/genes",
    "drugs": "GET /api/drugs",
    "health": "GET /health"
  }
}
```

### 2. GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "runtime": "Node.js"
}
```

### 3. POST `/api/analyze`
Main pharmacogenomic analysis endpoint

**Request:**
```
Content-Type: multipart/form-data
- vcf_file: (binary VCF file)
- drugs: "CODEINE,WARFARIN,CLOPIDOGREL"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patient_id": "PATIENT_123456",
    "drug": "CODEINE",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "risk_assessment": {
      "risk_label": "Toxic",
      "confidence_score": 0.93,
      "severity": "critical"
    },
    "pharmacogenomic_profile": {
      "primary_gene": "CYP2D6",
      "diplotype": "*4/*4",
      "phenotype": "PM",
      "detected_variants": [...]
    },
    "clinical_recommendation": {
      "action": "Avoid codeine — use alternative opioid",
      "dosing_guidance": "",
      "alternative_drugs": ["Morphine", "Tramadol"],
      "monitoring_required": "Monitor for reduced efficacy",
      "urgency": "immediate",
      "cpic_guideline_reference": ["CPIC Codeine Guideline 2021"]
    },
    "llm_generated_explanation": {
      "summary": "...",
      "mechanism": "...",
      "risk_rationale": "...",
      "patient_friendly_explanation": "..."
    },
    "quality_metrics": {
      "vcf_parsing_success": true,
      "variants_detected": 5,
      "genes_analyzed": ["CYP2D6", "CYP2C9"],
      "confidence_factors": ["known_variant", "validated_rsid", "cpic_evidence"]
    }
  }
}
```

### 4. POST `/api/upload-test`
Test VCF parsing without running full analysis

**Request:**
```
Content-Type: multipart/form-data
- vcf_file: (binary VCF file)
```

**Response:**
```json
{
  "filename": "sample.vcf",
  "file_size": 1024,
  "parsing_success": true,
  "variants_detected": 5,
  "errors": [],
  "sample_variants": [...]
}
```

### 5. GET `/api/genes`
List all supported genes

**Response:**
```json
{
  "genes": [
    {
      "name": "CYP2D6",
      "chromosome": "22",
      "known_variants": 4,
      "known_alleles": ["*2", "*3", "*4", "*5"]
    },
    ...
  ]
}
```

### 6. GET `/api/drugs`
List all supported drugs

**Response:**
```json
{
  "drugs": [
    "CODEINE",
    "WARFARIN",
    "CLOPIDOGREL",
    "SIMVASTATIN",
    "AZATHIOPRINE",
    "FLUOROURACIL"
  ]
}
```

## Testing with cURL

### Test Health Check
```bash
curl http://localhost:8000/health
```

### Test Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_1.vcf" \
  -F "drugs=CODEINE,WARFARIN"
```

### Test VCF Parsing
```bash
curl -X POST http://localhost:8000/api/upload-test \
  -F "vcf_file=@sample_vcf_1.vcf"
```

## Frontend Integration

Update `frontend/index.html` to use Node.js backend:

```javascript
// Line ~250 in index.html
const API_BASE = 'http://localhost:8000';  // Node.js backend
// const API_BASE = 'http://localhost:5000';  // Python FastAPI backend
```

Then test the full application:
1. Start Node.js backend: `npm start` (from `backend/`)
2. Open frontend: Open `frontend/index.html` in browser
3. Upload VCF file and select drugs
4. View results

## Troubleshooting

### Module Not Found Errors
```bash
# Ensure dependencies are installed
npm install

# Check installation
npm list
```

### Port Already in Use
```bash
# Use different port
PORT=3000 npm start
```

### VCF Parsing Errors
- Check VCF file format (v4.2 compatible)
- Ensure GENE and STAR tags in INFO column
- See `sample_vcf_1.vcf` for examples

### LLM API Errors
- LLM explanations are optional (fallback pre-written explanations provided)
- Add `OPENAI_API_KEY` to `.env` to enable OpenAI integration
- Without API key, system uses pre-written explanations automatically

## Development

### Install Development Tools
```bash
npm install --save-dev nodemon
```

### Run with Auto-Reload
```bash
npm run dev
# or
npx nodemon server.js
```

### Debug Mode
```bash
DEBUG=true npm start
```

## Production Deployment

### Using Node.js Process Manager (PM2)
```bash
npm install -g pm2

# Start in production
pm2 start server.js --name pharmaguard

# Check status
pm2 status

# Stop
pm2 stop pharmaguard
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t pharmaguard-backend .
docker run -p 8000:8000 --env-file .env pharmaguard-backend
```

## Architecture

**Module Structure:**
- `server.js` - Express application and route handlers
- `vcf-parser.js` - VCF v4.2 file parsing (196 lines)
- `pharmacogenomics-analyzer.js` - Risk calculation and CPIC integration (176 lines)
- `llm-generator.js` - OpenAI integration with fallback explanations (368 lines)
- `cpic-data.json` - CPIC recommendations database
- `fallback-explanations.json` - Pre-written clinical explanations

**Data Flow:**
1. VCF file upload → VCFParser
2. Variant extraction → Pharmacogenomics Analyzer
3. Risk computation and CPIC lookup → Clinical recommendation
4. LLM explanation generation → Final JSON response

## Performance

- **VCF Parsing**: ~100ms for typical files
- **Risk Computation**: ~50ms per drug
- **LLM Explanation**: ~2-5s (with OpenAI API), <100ms (fallback)
- **Total Analysis**: ~5-10s per drug (network dependent)

## Differences from Python Backend

| Feature | Python | Node.js |
|---------|--------|---------|
| Framework | FastAPI | Express.js |
| Async | Native (async/await) | Callback/Promise-based |
| Performance | Slightly faster | Similar |
| Deployment | Any host with Python | Any host with Node.js |
| Cold start | Medium | Fast |
| Memory | ~150MB | ~80MB |

## Support

For issues or questions:
1. Check frontend console for API errors
2. Check server logs for backend errors
3. Verify VCF file format
4. Ensure `.env` is properly configured
5. Check network connectivity between frontend and backend

## References

- [Express.js Documentation](https://expressjs.com)
- [Multer File Upload](https://github.com/expressjs/multer)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [CPIC Guidelines](https://cpicpgx.org)
