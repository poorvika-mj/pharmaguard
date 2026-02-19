# PharmaGuard: AI-Powered Pharmacogenomic Risk Prediction System

**RIFT 2026 Hackathon — Pharmacogenomics / Explainable AI Track**

## Overview

PharmaGuard is a cutting-edge web application that analyzes patient genetic data (VCF files) and predicts personalized pharmacogenomic risks with clinically-actionable recommendations and AI-generated explanations. The system identifies critical genetic variants across 6 essential pharmacogenes (CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD) and cross-references them with CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines to generate precise, evidence-based risk assessments.

**Problem Statement:** Over 100,000 Americans die annually from adverse drug reactions (ADRs), many of which are preventable through pharmacogenomic testing.

**Solution:** PharmaGuard combines precision genomics, AI-powered analysis, and CPIC evidence to prevent life-threatening drug interactions before they occur.

---

## Live Demo & Video

- **Live Application:** [https://pharmaguard-demo.vercel.app](https://pharmaguard-demo.vercel.app) *(coming soon)*
- **LinkedIn Demo Video:** [PharmaGuard Demo - RIFT 2026](https://www.linkedin.com/feed) *(coming soon)*
- **GitHub Repository:** [https://github.com/yourname/PharmaGuard](https://github.com)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/Vanilla JS)                 │
│   - VCF File Upload & Drag-Drop Interface                       │
│   - Drug Selection (CODEINE, WARFARIN, etc.)                    │
│   - Real-time Risk Visualization & Results Display              │
│   - JSON Export & Copy-to-Clipboard                             │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    FASTAPI REST API
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Python/FastAPI)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ VCF Parser: Parses VCF v4.2 files, extracts variants     │  │
│  │ Pharmacogenomics Analyzer: Maps variants to genes,       │  │
│  │   computes metabolizer phenotypes, predicts drug risks   │  │
│  │ LLM Generator: OpenAI GPT integration for clinical       │  │
│  │   explanations with fallback database                    │  │
│  │ CPIC Knowledge Base: 6 genes, 6 drugs, evidence-based   │  │
│  │   dosing recommendations                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                    VARIANT DATABASE
                    CPIC GUIDELINES
                    OpenAI API (LLM)
```

---

## Tech Stack

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript**
- **Responsive Design (Mobile-First)**
- **Real-time Particle Animations & DNA Helix Animation**
- **Color-Coded Risk Assessment Visualization**

### Backend (Choose One)
- **Option 1: Python/FastAPI** (Recommended)
  - FastAPI (Modern Python web framework)
  - Python 3.11+
  - OpenAI API (for AI-generated explanations)
  - pandas (data processing)
  - Uvicorn (ASGI server)
  
- **Option 2: Node.js/Express** (Alternative)
  - Express.js (Lightweight Node.js framework)
  - Node.js 14+
  - OpenAI API (optional, via axios)
  - Multer (file upload handling)

### Deployment
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway / AWS / Heroku / Any Node.js host
- **Database:** VCF files + In-memory variant database

---

## Installation & Setup

### Prerequisites
- **Python 3.11+** (with pip)
- **Node.js 18+** (optional, for deployment)
- **OpenAI API Key** (for LLM features; optional, fallback explanations available)
- **Git**

### Backend Setup

#### Option 1: Python/FastAPI (Recommended)

##### 1. Clone Repository
```bash
git clone https://github.com/yourname/PharmaGuard.git
cd PharmaGuard/backend
```

##### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

##### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

##### 4. Configure Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-...
```

##### 5. Start Backend Server
```bash
# Development mode
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Backend will be available at: `http://localhost:8000`

#### Option 2: Node.js/Express Alternative

Use this option if your deployment platform doesn't support Python.

##### 1. Navigate to Backend
```bash
cd backend
```

##### 2. Install Dependencies
```bash
npm install
```

##### 3. Configure Environment Variables
```bash
# Copy example to .env
cp .env.example .env

# Edit .env and add your OpenAI API key (optional)
# OPENAI_API_KEY=sk-...
```

##### 4. Start Backend Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will be available at: `http://localhost:8000`

##### 5. Test Node.js Backend
```bash
node test-server.js
```

For detailed Node.js setup, see [NODE_SETUP.md](NODE_SETUP.md)

### Frontend Setup

#### 1. Navigate to Frontend
```bash
cd ../frontend
```

#### 2. Update API Endpoint (if backend not at localhost:8000)
Edit `index.html` and update the API base URL in the JavaScript section:
```javascript
const API_BASE = 'http://your-backend-url:8000';
```

#### 3. Serve Locally
```bash
# Using Python
python -m http.server 5500

# Or using Node.js
npx serve .

# Or using VS Code Live Server extension
```

Frontend will be available at: `http://localhost:5500`

---

## API Documentation

### POST `/api/analyze`
**Analyze patient VCF file and predict pharmacogenomic risks**

#### Request
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@patient.vcf" \
  -F "drugs=CODEINE,WARFARIN"
```

#### Parameters
- `vcf_file` (file): VCF format genetic data (max 5MB)
- `drugs` (string): Comma-separated drug names

#### Response
```json
{
  "success": true,
  "data": {
    "patient_id": "PATIENT_123456",
    "drug": "CODEINE",
    "timestamp": "2024-02-19T10:30:45.123456",
    "risk_assessment": {
      "risk_label": "Safe|Adjust Dosage|Toxic|Ineffective|Unknown",
      "confidence_score": 0.95,
      "severity": "none|low|moderate|high|critical"
    },
    "pharmacogenomic_profile": {
      "primary_gene": "CYP2D6",
      "diplotype": "*1/*2",
      "phenotype": "NM|PM|IM|RM|URM|Unknown",
      "detected_variants": [
        {
          "rsid": "rs3892097",
          "gene": "CYP2D6",
          "star_allele": "*4",
          "effect": "Loss of function",
          "zygosity": "heterozygous",
          "clinical_significance": "Poor metabolizer marker"
        }
      ]
    },
    "clinical_recommendation": {
      "action": "Standard dosing",
      "dosing_guidance": "Use recommended doses per prescribing information.",
      "alternative_drugs": [],
      "monitoring_required": false,
      "urgency": "routine",
      "cpic_guideline_reference": "CPIC Guideline for CYP2D6 and Codeine (2014)"
    },
    "llm_generated_explanation": {
      "summary": "Patient has normal CYP2D6 metabolizer status...",
      "mechanism": "CYP2D6 enzyme functions normally...",
      "risk_rationale": "Normal metabolizer status indicates...",
      "patient_friendly_explanation": "Your genetic profile shows..."
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

### GET `/api/genes`
**Get information about all 6 critical pharmacogenes**

```bash
curl http://localhost:8000/api/genes
```

### GET `/api/drugs`
**Get list of supported drugs**

```bash
curl http://localhost:8000/api/drugs
```

### GET `/health`
**Health check endpoint**

```bash
curl http://localhost:8000/health
```

---

## Supported Genes & Drugs

### Critical Pharmacogenes

| Gene | Alias | Drugs | Key Variants |
|------|-------|-------|--------------|
| **CYP2D6** | Cytochrome P450 2D6 | CODEINE | *4 (PM), *10 (IM), *17, *2 (NM/RM) |
| **CYP2C19** | Cytochrome P450 2C19 | CLOPIDOGREL | *2, *3 (PM), *17 (RM) |
| **CYP2C9** | Cytochrome P450 2C9 | WARFARIN | *2 (IM), *3 (PM) |
| **SLCO1B1** | Hepatic Transporter | SIMVASTATIN | *5 (Myopathy risk) |
| **TPMT** | Thiopurine Methyltransferase | AZATHIOPRINE | *2, *3A, *3B, *3C (PM) |
| **DPYD** | Dihydropyrimidine Dehydrogenase | FLUOROURACIL | *2A (Lethal toxicity risk) |

### Supported Drugs & Risk Predictions

- **CODEINE** → CYP2D6 → Toxic/Safe/Adjust Dosage
- **WARFARIN** → CYP2C9 → Adjust Dosage/Safe
- **CLOPIDOGREL** → CYP2C19 → Ineffective/Adjust Dosage/Safe
- **SIMVASTATIN** → SLCO1B1 → Toxic/Adjust Dosage/Safe
- **AZATHIOPRINE** → TPMT → Toxic/Adjust Dosage/Safe
- **FLUOROURACIL** → DPYD → Toxic/Adjust Dosage/Safe

---

## VCF File Format

### Expected Structure
```
##fileformat=VCFv4.2
##INFO=<ID=GENE,Number=1,Type=String>
##INFO=<ID=STAR,Number=1,Type=String>
##INFO=<ID=RS,Number=1,Type=String>
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
chr22	42522613	rs3892097	C	T	.	PASS	GENE=CYP2D6;STAR=*4;RS=rs3892097
```

### Sample Files
- `sample_vcf_1.vcf` — Contains CYP2D6, CYP2C9, CYP2C19, SLCO1B1 variants
- `sample_vcf_2.vcf` — Contains TPMT, DPYD, CYP2D6, CYP2C19 variants

---

## Usage Examples

### Example 1: Analyze for Codeine Sensitivity
```bash
# Using sample VCF file
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_1.vcf" \
  -F "drugs=CODEINE"
```

**Expected Output:** Risk assessment for codeine based on CYP2D6 metabolizer status

### Example 2: Analyze Multiple Drugs
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_2.vcf" \
  -F "drugs=WARFARIN,CLOPIDOGREL,SIMVASTATIN"
```

**Expected Output:** Three separate risk assessments (one per drug)

---

## CPIC Guidelines Integration

PharmaGuard incorporates evidence from the following CPIC (Clinical Pharmacogenetics Implementation Consortium) guidelines:

1. **CYP2D6 and Codeine** (2014) — Dosing recommendations based on metabolizer phenotype
2. **CYP2C19 and Clopidogrel** (2022) — Guidance on prodrug activation and antiplatelet effectiveness
3. **CYP2C9, VKORC1, and Warfarin** (2017) — Dose adjustment algorithms for anticoagulation
4. **SLCO1B1 and Simvastatin** (2022) — Myopathy risk prediction and statin selection
5. **TPMT/NUDT15 and Thiopurines** (2018) — Myelosuppression risk and dose reduction
6. **DPYD and Fluoropyrimidines** (2023) — Life-threatening toxicity contraindications

---

## Deployment Instructions

### Deploy Backend to Render

1. Push code to GitHub
2. Create Render account at https://render.com
3. Create new Web Service → Connect GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port 8000`
6. Add environment variable: `OPENAI_API_KEY`
7. Deploy and note the URL

### Deploy Frontend to Vercel

1. Create Vercel account at https://vercel.com
2. Connect GitHub repository
3. Update frontend API URL to your Render backend
4. Deploy

---

## Testing

### Test VCF Parsing
```bash
curl -X POST http://localhost:8000/api/upload-test \
  -F "vcf_file=@sample_vcf_1.vcf"
```

### Test with All Sample Drugs
```bash
# Codeine risk
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_1.vcf" \
  -F "drugs=CODEINE"

# Warfarin risk
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_1.vcf" \
  -F "drugs=WARFARIN"

# All drugs
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@sample_vcf_2.vcf" \
  -F "drugs=CODEINE,WARFARIN,CLOPIDOGREL,SIMVASTATIN,AZATHIOPRINE,FLUOROURACIL"
```

---

## Quality Assurance

### Test Case Validation
- ✅ Correct VCF parsing with INFO field extraction
- ✅ Accurate variant-to-gene mapping
- ✅ Correct phenotype determination (PM/IM/NM/RM/URM)
- ✅ CPIC-aligned risk predictions (Safe/Adjust Dosage/Toxic/Ineffective)
- ✅ JSON output schema compliance
- ✅ LLM explanation generation (with fallback)
- ✅ Proper error handling and validation

---

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution:** Add `OPENAI_API_KEY` to `.env` file. App will still work with fallback explanations.

### Issue: "File too large" error
**Solution:** VCF files must be ≤5MB. Compress if necessary.

### Issue: CORS errors on frontend
**Solution:** Backend already configured with CORS. Ensure backend is running.

### Issue: "Invalid VCF format"
**Solution:** Ensure VCF file includes required INFO tags (GENE, STAR, RS) or valid rsIDs.

---

## Future Enhancements

- [ ] Support for additional drugs (Simeprevir, Citalopram, etc.)
- [ ] Additional genes (CYP3A4, CYP1A2, CYP2B6, etc.)
- [ ] Haplotype phasing and compound heterozygote detection
- [ ] Population ancestry-adjusted phenotype predictions
- [ ] Drug-drug interaction warnings
- [ ] Mobile app (iOS/Android)
- [ ] Integration with EHR systems
- [ ] Batch analysis for population health studies

---

## Team Members

- **Team Lead:** [Your Name]
- **Genomics Expert:** [Name]
- **Backend Engineer:** [Name]
- **Frontend Engineer:** [Name]

---

## Disclaimer

⚠️ **This application is for educational and research purposes only.** It is not approved for clinical use without physician oversight. Always consult with a qualified healthcare professional before making medication decisions based on pharmacogenomic testing.

---

## License

MIT License — See LICENSE file for details

---

## References

- [CPIC Clinical Pharmacogenetics Implementation Consortium](https://cpicpgx.org)
- [PharmGKB - Pharmacogenomics Knowledge Base](https://www.pharmgkb.org)
- [EMBL-EBI Pharmacogenomics Database](https://www.ebi.ac.uk/ipd/imgt/hla)
- [Variant Call Format (VCF) v4.2 Specification](https://samtools.github.io/hts-specs/VCFv4.2.pdf)
- [FDA Pharmacogenomic Biomarkers](https://www.fda.gov/drugs/science-and-research-drugs/table-pharmacogenomic-biomarkers-drug-labeling)

---

## Contact & Support

- **Email:** support@pharmaguard.ai
- **Issues:** GitHub Issues
- **LinkedIn:** [PharmaGuard RIFT 2026](https://www.linkedin.com)

**Built with ❤️ for RIFT 2026 Pharmacogenomics Track**
