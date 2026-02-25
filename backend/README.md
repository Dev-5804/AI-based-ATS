# Resume Ranker Backend (Express.js)

Express.js backend for evaluating and ranking resumes using Google's Gemini AI.

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and set your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

### 3. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
**GET** `/healthz`

Returns: `{ "status": "ok" }`

### Evaluate Resumes
**POST** `/evaluate`

**Request:**
- Form data with:
  - `resumes`: Multiple file uploads (PDF, DOCX, or TXT)
  - `job_description`: String containing the job description

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/evaluate \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.docx" \
  -F "job_description=We are looking for a software engineer..."
```

**Response:**
```json
{
  "total_candidates": 2,
  "job_description_preview": "We are looking for a software engineer...",
  "evaluations": [
    {
      "rank": 1,
      "candidate_name": "John Doe",
      "overall_score": 85,
      "skills_match": {
        "score": 90,
        "matched_skills": ["JavaScript", "React", "Node.js"],
        "missing_skills": ["Python"]
      },
      "experience_match": {
        "score": 80,
        "summary": "Strong relevant experience"
      },
      "education_match": {
        "score": 85,
        "summary": "Relevant degree"
      },
      "certifications": {
        "score": 75,
        "found": ["AWS Certified"],
        "recommended": ["Google Cloud Certified"]
      },
      "strengths": ["Strong JavaScript skills", "Leadership experience"],
      "weaknesses": ["Limited DevOps experience"],
      "overall_assessment": "Excellent fit for the role",
      "recommendation": "STRONG_MATCH"
    }
  ]
}
```

## Supported File Formats

- **PDF** - Extracted using pdfparse
- **DOCX** - Extracted by parsing the internal XML structure
- **TXT** - Plain text files

## Features

- ✅ Support for multiple resume file uploads (max 20)
- ✅ Support for PDF, DOCX, and TXT formats
- ✅ Detailed resume evaluation using Gemini AI
- ✅ Automatic ranking by overall score
- ✅ Comprehensive scoring across multiple dimensions:
  - Overall score
  - Skills match
  - Experience match
  - Education match
  - Certifications
  - Strengths and weaknesses
  - Overall assessment
  - Match recommendation

## Conversion from Python (FastAPI)

This Express.js backend is a complete port of the original Python FastAPI backend with the following equivalences:

| Python (FastAPI) | JavaScript (Express) |
|------------------|---------------------|
| `FastAPI()` | `express()` |
| `CORSMiddleware` | `cors()` |
| `@app.post()` | `app.post()` |
| `UploadFile` | `multer.memoryStorage()` |
| `google.generativeai` | `@google/generative-ai` |
| `PyPDF2.PdfReader` | `pdfparse` |
| `python-docx` | JSZip + XML parsing |
| `async def` | `async function` |

All logic, error handling, and API contracts remain identical to the original implementation.
