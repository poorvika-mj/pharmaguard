# 🚀 PharmaGuard - Quick Start (30 Seconds)

## ⚡ Fastest Way to Get Running

### 1️⃣ Terminal 1: Start Backend
```bash
cd backend
npm install  # Only needed first time
node server.js
```
**You should see:**
```
Server listening on http://0.0.0.0:3000
```

### 2️⃣ Browser: Open Frontend
Navigate to:
```
file:///C:/Users/Poorvi/OneDrive/Desktop/pharmaguard/frontend/index.html
```

### 3️⃣ Use the App
1. Click **"Choose VCF File"** button
2. Select `backend/sample_vcf_1.vcf`
3. Click **"CODEINE"** + **"WARFARIN"** + any other drug chip
4. Click **"Analyze"** button
5. View results instantly! 🎉

---

## 📋 Sample VCF Files Available
- `backend/sample_vcf_1.vcf` - Contains CYP2D6, CYP2C9, CYP2C19, SLCO1B1 variants
- `backend/sample_vcf_2.vcf` - Contains TPMT, DPYD, CYP2D6, CYP2C19 variants

---

## 🧪 Test Backend Without Frontend
```bash
cd backend
node comprehensive-test.js
```
**Expected Output:** ✅ 9/9 TESTS PASSED

---

## 📊 What You'll See

### Input
- Upload VCF file with genetic variants
- Select 6 drugs to analyze: CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL

### Output
For each drug:
- **Risk Level** with confidence score (Safe, Adjust Dosage, Toxic, Ineffective)
- **Metabolizer Phenotype** (PM, IM, NM, RM, URM)
- **CPIC Recommendations** (actions, alternatives, monitoring)
- **LLM Explanation** (clean clinical explanation)
- **Detected Variants** table
- **Quality Metrics**

---

## 🔧 Troubleshooting

### "Port 3000 already in use"
Use different port:
```bash
$env:PORT=3001; node server.js
```
Then update API URL in frontend (around line 250 in index.html)

### "Module not found"
Reinstall dependencies:
```bash
npm install
```

### Frontend not connecting to backend
Check API_BASE in frontend/index.html line ~250:
```javascript
const API_BASE = 'http://localhost:3000';
```

---

## 📚 Full Documentation
- **Complete Setup:** See `NODE_SETUP.md`
- **Deployment:** See `DEPLOYMENT.md`
- **API Docs:** See `README.md`
- **Test Report:** See `BACKEND_TEST_RESULTS.md`

---

## ✨ Key Features

✅ **6 Pharmacogenes:** CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD
✅ **6 Drugs:** CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL
✅ **AI Explanations:** OpenAI-powered (or fallback pre-written)
✅ **CPIC Guidelines:** Evidence-based clinical recommendations
✅ **Risk Assessment:** 5-level confidence-scored predictions
✅ **Metabolizer Profiles:** All 5 phenotypes (PM/IM/NM/RM/URM)
✅ **Quality Metrics:** Data integrity tracking
✅ **100% JavaScript:** No Python, pure Node.js

---

**Everything ready to go. Start the server and open the frontend!** 🎉
