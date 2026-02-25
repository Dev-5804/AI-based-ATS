import { useState, useCallback } from 'react'
import {
  Upload,
  FileText,
  Trophy,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  Loader2,
  X,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface SkillsMatch {
  score: number
  matched_skills: string[]
  missing_skills: string[]
}

interface ExperienceMatch {
  score: number
  summary: string
}

interface EducationMatch {
  score: number
  summary: string
}

interface Certifications {
  score: number
  found: string[]
  recommended: string[]
}

interface Evaluation {
  rank: number
  candidate_name: string
  overall_score: number
  skills_match?: SkillsMatch
  experience_match?: ExperienceMatch
  education_match?: EducationMatch
  certifications?: Certifications
  strengths?: string[]
  weaknesses?: string[]
  overall_assessment: string
  recommendation: string
  error?: string
}

interface ApiResponse {
  total_candidates: number
  job_description_preview: string
  evaluations: Evaluation[]
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-amber-600'
  return 'text-red-500'
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200'
  if (score >= 60) return 'bg-blue-50 border-blue-200'
  if (score >= 40) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

function getRecommendationBadge(rec: string): { text: string; className: string } {
  switch (rec) {
    case 'STRONG_MATCH':
      return { text: 'Strong Match', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
    case 'GOOD_MATCH':
      return { text: 'Good Match', className: 'bg-blue-100 text-blue-800 border-blue-300' }
    case 'MODERATE_MATCH':
      return { text: 'Moderate Match', className: 'bg-amber-100 text-amber-800 border-amber-300' }
    case 'WEAK_MATCH':
      return { text: 'Weak Match', className: 'bg-orange-100 text-orange-800 border-orange-300' }
    default:
      return { text: 'No Match', className: 'bg-red-100 text-red-800 border-red-300' }
  }
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
  if (rank === 2) return <Trophy className="w-6 h-6 text-gray-400" />
  if (rank === 3) return <Trophy className="w-6 h-6 text-amber-700" />
  return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-semibold w-10 text-right ${getScoreColor(score)}`}>
        {score}
      </span>
    </div>
  )
}

function CandidateCard({ evaluation }: { evaluation: Evaluation }) {
  const [expanded, setExpanded] = useState(false)
  const badge = getRecommendationBadge(evaluation.recommendation)

  return (
    <div className={`border rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${evaluation.rank === 1 ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0">{getRankIcon(evaluation.rank)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {evaluation.candidate_name}
            </h3>
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${badge.className}`}>
              {badge.text}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{evaluation.overall_assessment}</p>
        </div>
        <div className={`shrink-0 flex flex-col items-center px-4 py-2 rounded-lg border ${getScoreBg(evaluation.overall_score)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
            {evaluation.overall_score}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gray-50 p-5 space-y-6">
          {/* Score Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> Score Breakdown
            </h4>
            <div className="space-y-2.5 bg-white rounded-lg p-4 border">
              {evaluation.skills_match && <ScoreBar score={evaluation.skills_match.score} label="Skills" />}
              {evaluation.experience_match && <ScoreBar score={evaluation.experience_match.score} label="Experience" />}
              {evaluation.education_match && <ScoreBar score={evaluation.education_match.score} label="Education" />}
              {evaluation.certifications && <ScoreBar score={evaluation.certifications.score} label="Certifications" />}
            </div>
          </div>

          {/* Skills Detail */}
          {evaluation.skills_match && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Skills Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.skills_match.matched_skills.length > 0 && (
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.skills_match.matched_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {evaluation.skills_match.missing_skills.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.skills_match.missing_skills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.experience_match && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Experience
                </h4>
                <p className="text-sm text-gray-600">{evaluation.experience_match.summary}</p>
              </div>
            )}
            {evaluation.education_match && (
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Education
                </h4>
                <p className="text-sm text-gray-600">{evaluation.education_match.summary}</p>
              </div>
            )}
          </div>

          {/* Certifications */}
          {evaluation.certifications && (evaluation.certifications.found.length > 0 || evaluation.certifications.recommended.length > 0) && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Certifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.certifications.found.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Found</p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.certifications.found.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{cert}</span>
                      ))}
                    </div>
                  </div>
                )}
                {evaluation.certifications.recommended.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Recommended</p>
                    <div className="flex flex-wrap gap-1.5">
                      {evaluation.certifications.recommended.map((cert, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{cert}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluation.strengths && evaluation.strengths.length > 0 && (
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </h4>
                <ul className="space-y-1.5">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-emerald-800 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement
                </h4>
                <ul className="space-y-1.5">
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-800 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Overall Assessment */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Overall Assessment</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{evaluation.overall_assessment}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [files, setFiles] = useState<File[]>([])
  const [jobDescription, setJobDescription] = useState('')
  const [results, setResults] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.txt')
    )
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (files.length === 0 || !jobDescription.trim()) return

    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    files.forEach(file => formData.append('resumes', file))
    formData.append('job_description', jobDescription)

    try {
      const response = await fetch(`${API_URL}/evaluate`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.detail || `Server error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => {
    setFiles([])
    setJobDescription('')
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ResumeRanker AI</h1>
              <p className="text-xs text-gray-500">Intelligent Resume Evaluation & Ranking</p>
            </div>
          </div>
          {results && (
            <button
              onClick={resetAll}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              New Evaluation
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!results ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">
                Find the Best Candidates Faster
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Upload resumes and paste a job description. Our AI analyzes skills alignment, experience, education, and certifications to rank candidates with detailed reasoning.
              </p>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resume Upload */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Upload Resumes
                </h3>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop resumes here, or{' '}
                    <label className="text-blue-600 font-medium cursor-pointer hover:underline">
                      browse files
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-400">Supports PDF, DOCX, TXT (max 20 files)</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">{files.length} file{files.length !== 1 ? 's' : ''} selected</p>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400 shrink-0">
                              {(file.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                          <button
                            onClick={() => removeFile(i)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Job Description
                </h3>
                <textarea
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Paste the full job description here...&#10;&#10;Include required skills, experience level, education requirements, and any preferred qualifications for the best results."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-2">
                  {jobDescription.length > 0 ? `${jobDescription.length} characters` : 'Paste the complete job description for accurate matching'}
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Evaluation Failed</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={files.length === 0 || !jobDescription.trim() || loading}
                className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Evaluating {files.length} Resume{files.length !== 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Evaluate & Rank Candidates
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {results.total_candidates} candidate{results.total_candidates !== 1 ? 's' : ''} ranked by overall fit
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Top Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(results.evaluations[0]?.overall_score || 0)}`}>
                      {results.evaluations[0]?.overall_score || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-4">
              {results.evaluations.map((evaluation, index) => (
                <CandidateCard key={index} evaluation={evaluation} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-6 text-center">
        <p className="text-xs text-gray-400">
          Powered by Gemini AI. Results are AI-generated assessments and should be used alongside human judgment.
        </p>
      </footer>
    </div>
  )
}

export default App
