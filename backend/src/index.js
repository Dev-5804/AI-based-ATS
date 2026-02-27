import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextAsync } from "./fileExtractor.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure Gemini
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Use Gemini AI to evaluate a single resume against a job description
 */
async function evaluateResumeWithAI(resumeText, jobDescription, candidateName) {
  const prompt = `You are an expert hiring manager and resume evaluator. Analyze the following resume against the job description provided.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME (${candidateName}):
${resumeText}

Evaluate this candidate and provide a JSON response with EXACTLY this structure (no markdown, no code blocks, just pure JSON):
{
    "overall_score": <number from 0 to 100>,
    "skills_match": {
        "score": <number from 0 to 100>,
        "matched_skills": ["list of skills that match the job requirements"],
        "missing_skills": ["list of required skills not found in the resume"]
    },
    "experience_match": {
        "score": <number from 0 to 100>,
        "summary": "Brief assessment of relevant work experience"
    },
    "education_match": {
        "score": <number from 0 to 100>,
        "summary": "Brief assessment of educational qualifications"
    },
    "certifications": {
        "score": <number from 0 to 100>,
        "found": ["list of relevant certifications found"],
        "recommended": ["list of missing but recommended certifications"]
    },
    "strengths": ["list of 3-5 key strengths of this candidate"],
    "weaknesses": ["list of 2-4 areas where the candidate falls short"],
    "overall_assessment": "A 2-3 sentence summary explaining why this candidate is or isn't a good fit for the role",
    "recommendation": "STRONG_MATCH" or "GOOD_MATCH" or "MODERATE_MATCH" or "WEAK_MATCH" or "NO_MATCH"
}

Be thorough, fair, and objective in your evaluation. Consider not just keyword matches but the depth and relevance of experience.`;

  try {
    const response = await model.generateContent(prompt);
    let responseText = response.response.text().trim();

    // Clean up the response - remove markdown code blocks if present
    if (responseText.startsWith("```")) {
      const lines = responseText.split("\n");
      responseText = lines.filter((l) => !l.trim().startsWith("```")).join("\n");
    }

    const result = JSON.parse(responseText);
    result.candidate_name = candidateName;
    return result;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        candidate_name: candidateName,
        overall_score: 0,
        skills_match: { score: 0, matched_skills: [], missing_skills: [] },
        experience_match: { score: 0, summary: "Could not evaluate" },
        education_match: { score: 0, summary: "Could not evaluate" },
        certifications: { score: 0, found: [], recommended: [] },
        strengths: [],
        weaknesses: ["Resume could not be properly evaluated"],
        overall_assessment: "The AI was unable to properly evaluate this resume.",
        recommendation: "NO_MATCH",
        error: "Failed to parse AI response",
      };
    }

    return {
      candidate_name: candidateName,
      overall_score: 0,
      skills_match: { score: 0, matched_skills: [], missing_skills: [] },
      experience_match: { score: 0, summary: "Could not evaluate" },
      education_match: { score: 0, summary: "Could not evaluate" },
      certifications: { score: 0, found: [], recommended: [] },
      strengths: [],
      weaknesses: ["Evaluation failed due to an error"],
      overall_assessment: `Error during evaluation: ${error.message}`,
      recommendation: "NO_MATCH",
      error: error.message,
    };
  }
}

/**
 * Health check endpoint
 */
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

/**
 * Evaluate multiple resumes against a job description
 * Accepts PDF, DOCX, or TXT resume files
 * Returns ranked evaluations with detailed scoring
 */
app.post("/evaluate", upload.array("resumes", 20), async (req, res) => {
  try {
    const { job_description } = req.body;

    // Validation
    if (!job_description || !job_description.trim()) {
      return res.status(400).json({ error: "Job description cannot be empty" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one resume file is required" });
    }

    if (req.files.length > 20) {
      return res.status(400).json({ error: "Maximum 20 resumes can be evaluated at once" });
    }

    // Process all resume files in parallel for faster evaluation
    const evaluationPromises = req.files.map(async (file) => {
      try {
        const resumeText = await extractTextAsync(file.originalname, file.buffer);

        if (!resumeText.trim()) {
          return {
            candidate_name: file.originalname || "Unknown",
            overall_score: 0,
            overall_assessment: "Resume file was empty or could not be read.",
            recommendation: "NO_MATCH",
            error: "Empty resume",
          };
        }

        const candidateName = file.originalname.split(".").slice(0, -1).join(".") || "Unknown";
        const evaluation = await evaluateResumeWithAI(resumeText, job_description, candidateName);
        return evaluation;
      } catch (error) {
        return {
          candidate_name: file.originalname || "Unknown",
          overall_score: 0,
          overall_assessment: error.message,
          recommendation: "NO_MATCH",
          error: error.message,
        };
      }
    });

    // Wait for all evaluations to complete in parallel
    const evaluations = await Promise.all(evaluationPromises);

    // Sort by overall_score descending
    evaluations.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));

    // Add rank
    evaluations.forEach((evaluation, index) => {
      evaluation.rank = index + 1;
    });

    res.json({
      total_candidates: evaluations.length,
      job_description_preview:
        job_description.length > 200 ? job_description.substring(0, 200) + "..." : job_description,
      evaluations: evaluations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
