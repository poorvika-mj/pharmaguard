# PharmaGuard Quick Start Guide

## ⚡ 5-Minute Setup

### Option 1: Windows (Automated)
1. Download/clone the repository
2. Double-click `run_dev.bat` in the root directory
3. Wait for both servers to start
4. Open browser to `http://localhost:5500`

### Option 2: macOS/Linux (Automated)
1. Download/clone the repository
2. Run: `bash run_dev.sh`
3. Wait for both servers to start
4. Browser opens automatically to `http://localhost:5500`

### Option 3: Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure OpenAI API (optional but recommended)
# Copy .env.example to .env and add your OpenAI API key
cp .env.example .env
# Edit .env with your favorite editor

# Start server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be at: `http://localhost:8000`

#### Frontend (in new terminal)
```bash
cd frontend

# Option 1: Python HTTP Server
python -m http.server 5500 --directory .

# Option 2: Node.js (if installed)
npx serve .

# Option 3: VS Code Live Server
# Install "Live Server" extension and click "Go Live"
```

Frontend will be at: `http://localhost:5500`

---

## 🧬 Using PharmaGuard

### Step 1: Upload VCF File
- Click upload area or drag-and-drop your `.vcf` file
- **Sample files:** `backend/sample_vcf_1.vcf`, `backend/sample_vcf_2.vcf`
- Or click **"Load Demo VCF File"** button

### Step 2: Select Drug(s)
Click one or more drug chips:
- CODEINE (CYP2D6)
- WARFARIN (CYP2C9)
- CLOPIDOGREL (CYP2C19)
- SIMVASTATIN (SLCO1B1)
- AZATHIOPRINE (TPMT)
- FLUOROURACIL (DPYD)

### Step 3: Click "Analyze Pharmacogenomics"
- Wait for analysis (3-5 seconds)
- View results with:
  - Risk assessment & confidence score
  - Detected genetic variants
  - CPIC clinical recommendations
  - AI-generated explanations
  - Quality metrics

### Step 4: Export Results
- **Copy JSON**: One-click copy to clipboard
- **Download JSON**: Save results as JSON file

---

## 🔧 Environment Configuration

### OpenAI API (Optional)
To enable AI-generated explanations:

1. Get API key from https://platform.openai.com/api-keys
2. Copy `.env.example` to `.env` in backend directory
3. Add your key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
4. Restart backend server

**Note:** App works fine without OpenAI key (uses fallback explanations)

---

## 📝 API Testing

### Test VCF Upload
```bash
curl -X POST http://localhost:8000/api/upload-test \
  -F "vcf_file=@backend/sample_vcf_1.vcf"
```

### Test Full Analysis
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "vcf_file=@backend/sample_vcf_1.vcf" \
  -F "drugs=CODEINE,WARFARIN"
```

### Check API Status
```bash
curl http://localhost:8000/health

curl http://localhost:8000/api/genes

curl http://localhost:8000/api/drugs
```

---

## 📊 Sample VCF Files

### sample_vcf_1.vcf
Contains variants for: **CYP2D6, CYP2C9, CYP2C19, SLCO1B1**

Perfect for testing: Codeine, Warfarin, Clopidogrel, Simvastatin

### sample_vcf_2.vcf
Contains variants for: **TPMT, DPYD, CYP2D6, CYP2C19**

Perfect for testing: Azathioprine, Fluorouracil

---

## 🐛 Troubleshooting

### "Connection refused" / "Cannot reach backend"
- ✅ Check backend is running: `http://localhost:8000/health`
- ✅ Verify port 8000 is available
- ✅ Check firewall settings
- ✅ On same network? Bluetooth macOS may need firewall adjustment

### "VCF parsing error"
- ✅ Ensure file has `.vcf` extension
- ✅ File must include INFO fields: `GENE`, `STAR`, `RS`
- ✅ File must be valid VCF v4.2 format
- ✅ Use sample files to test

### "No variants detected"
- ✅ File may not contain pharmacogenomic variants
- ✅ Try sample VCF files to verify system works
- ✅ Variants must have rsIDs or GENE info in INFO field

### "OpenAI API error"
- ✅ Check API key is correct
- ✅ Check API key has sufficient credits
- ✅ Check API key is not revoked
- ✅ App works fine without key (fallback explanations)

---

## 📚 Documentation

- **Full README**: See `README.md`
- **API Docs**: `http://localhost:8000/docs` (automatic Swagger UI)
- **CPIC Guidelines**: https://cpicpgx.org
- **PharmGKB**: https://www.pharmgkb.org

---

## 🚀 Deployment

### Quick Deploy to Production

#### Deploy Backend to Render
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your GitHub repository
4. Configure:
   - **Build command:** `pip install -r build.txt` (from backend dir)
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port 8000`
   - **Environment:** Add `OPENAI_API_KEY`
5. Deploy!

#### Deploy Frontend to Vercel
1. Go to https://vercel.com → New Project
2. Import frontend folder
3. Update API endpoint in `index.html`:
   ```javascript
   const API_BASE = 'https://your-render-backend-url.onrender.com';
   ```
4. Deploy!

---

## ✨ Features

✅ **VCF File Parsing** — Standard VCF v4.2 format  
✅ **6 Pharmacogenes** — CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD  
✅ **6 Supported Drugs** — Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, Fluorouracil  
✅ **Risk Prediction** — Safe, Adjust Dosage, Toxic, Ineffective  
✅ **CPIC Guidelines** — Evidence-based recommendations  
✅ **AI Explanations** — Optional OpenAI integration (with fallback)  
✅ **Beautiful UI** — Responsive design with animations  
✅ **JSON Export** — Download or copy results  
✅ **Mobile Friendly** — Works on phones and tablets  

---

## 📞 Support

- **Issues:** GitHub Issues
- **Questions:** Check README.md
- **Bugs:** Report with error message and VCF file (if possible)

---

## 🎓 Built for RIFT 2026

**Pharmacogenomics / Explainable AI Track**

Repository: https://github.com/your-username/PharmaGuard  
Demo: https://pharmaguard-demo.vercel.app  
LinkedIn: [#RIFT2026 #PharmaGuard #Pharmacogenomics](https://linkedin.com)

---

**Happy Analyzing! 🧬**
