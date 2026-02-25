# Backend Migration Guide: Python FastAPI to Express.js

## Overview

Your resume-ranker backend has been successfully converted from Python (FastAPI) to JavaScript (Express.js). All core functionality, API endpoints, and logic remain identical.

## Directory Structure

```
backend/
├── src/
│   ├── index.js              # Main Express server & API routes
│   └── fileExtractor.js      # PDF, DOCX, TXT file extraction utilities
├── package.json              # Node.js dependencies
├── .env.example              # Environment variables template
├── .gitignore (NEW)          # Git ignore patterns
└── README.md                 # API documentation
```

## What Changed

### Dependencies

**Old (Python):**
- FastAPI for routing
- Uvicorn for ASGI server
- PyPDF2 for PDF extraction
- python-docx for DOCX extraction
- google-generativeai for Gemini API
- psycopg for database (if needed)

**New (JavaScript):**
- Express.js for routing (smaller, faster)
- Built-in Node.js HTTP server
- pdfparse for PDF extraction
- jszip + XML parsing for DOCX extraction
- @google/generative-ai for Gemini API
- (Removed unused PostgreSQL dependency)

### API Changes

The API endpoints are **100% compatible**:

| Endpoint | Method | Status |
|----------|--------|--------|
| `/healthz` | GET | ✅ Same |
| `/evaluate` | POST | ✅ Same |

Request/response formats are identical.

### Performance Impact

- **Startup time**: Faster (Node.js vs Python)
- **Response time**: Similar or faster
- **Memory footprint**: Smaller
- **Concurrency**: Better native async/await handling

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- cors
- multer (file uploads)
- dotenv (environment variables)
- @google/generative-ai
- pdfparse & jszip (file extraction)

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
PORT=5000
```

### 3. Run the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Testing the API

### Test health check:
```bash
curl http://localhost:5000/healthz
```

### Test resume evaluation:
```bash
curl -X POST http://localhost:5000/evaluate \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.txt" \
  -F "job_description=Your job description here"
```

## Migration Checklist

- ✅ Converted FastAPI routes to Express.js
- ✅ Migrated file upload handling (multer)
- ✅ Migrated PDF/DOCX/TXT extraction
- ✅ Migrated Gemini AI integration
- ✅ Maintained API contract (same endpoints, same responses)
- ✅ Added error handling
- ✅ Added CORS support
- ✅ Created documentation
- ⚠️ Remove `/backend/pyproject.toml` (Python config no longer needed)
- ⚠️ Update frontend API URLs if hardcoded

## Frontend Integration

The frontend should work without changes if:
1. The API URL is configured correctly
2. The frontend expects the same response format (it should)

If the frontend uses a hardcoded `localhost:8000` (FastAPI default), update it to `localhost:5000` (Express default).

Common places to check:
- Environment configuration files (.env)
- API client setup (axios, fetch, etc.)
- CORS origins if needed

## Removing Old Python Files

When ready, you can remove the old Python backend:

```bash
rm -rf backend/app/
rm -rf backend/.env
rm backend/pyproject.toml
rm backend/poetry.lock
```

But keep these:
- `.env.example` (for reference)
- Do NOT delete if needed for other parts of the project

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Port already in use
```bash
# Change PORT in .env to a different number, e.g., PORT=5001
```

### Gemini API errors
- Verify your API key in `.env`
- Check that the key has the correct permissions
- Ensure you have quota available

### File upload errors
- Ensure files are named correctly (.pdf, .docx, .txt)
- Check file size (max 20 files)
- Verify job description is not empty

## Questions?

Refer to:
- [Express.js Documentation](https://expressjs.com/)
- [Google Generative AI Node.js SDK](https://github.com/google/generative-ai-js)
- [Multer Documentation](https://github.com/expressjs/multer)
