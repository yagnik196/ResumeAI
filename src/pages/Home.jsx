import { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import { getUploadUrl, uploadToS3, getAnalysisResult } from '../services/api';

const ROLES = [
  { id: 'software_engineer', label: 'Software Engineer' },
  { id: 'data_scientist', label: 'Data Scientist' },
  { id: 'devops_engineer', label: 'Devops Engineer' },
  { id: 'frontend_developer', label: 'Frontend Developer' }
];

export default function Home({ onAnalyzeSuccess }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(ROLES[0].id);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing upload...');
  const [error, setError] = useState(null);

  /**
   * Helper to sleep between polls
   */
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingMessage('Initializing analysis...');

    try {
      // Step 1: Get presigned URL
      setLoadingMessage('Requesting secure upload URL...');
      const uploadData = await getUploadUrl(file.name, file.type);
      
      if (!uploadData || !uploadData.resume_id || !uploadData.upload_url) {
        throw new Error('Failed to get upload credentials from server.');
      }
      
      const { resume_id, upload_url } = uploadData;

      // Step 2: Upload to S3
      setLoadingMessage('Uploading resume to secure storage...');
      await uploadToS3(upload_url.url, upload_url.fields, file);

      // Step 3: Polling for results
      setLoadingMessage('AI is analyzing your resume...');
      
      const MAX_RETRIES = 20; // 20 retries * 3s = 60s total timeout
      const RETRY_INTERVAL = 3000; // 3 seconds
      let analysisResult = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Update message occasionally to show we're still working
        if (attempt === 5) setLoadingMessage('Extracting skills and keywords...');
        if (attempt === 10) setLoadingMessage('Calculating ATS compatibility score...');
        if (attempt === 15) setLoadingMessage('Finalizing results...');

        // Wait before each poll (including the first one to give Lambda time to trigger)
        await sleep(RETRY_INTERVAL);

        try {
          const result = await getAnalysisResult(resume_id);

          // Check if analysis is complete
          if (result && result.status === 'completed') {
            analysisResult = result;
            break;
          }

          // If backend returns an explicit error in the body
          if (result && result.error) {
            throw new Error(result.error);
          }

          // Otherwise, it's still 'processing' or 404 (handled as 'processing' in api.js)
          console.log(`Poll attempt ${attempt}: Still processing...`);
        } catch (pollErr) {
          // If it's a real network error (not a 404 handled by api.js), we stop
          console.error('Polling error:', pollErr);
          throw new Error('Lost connection to analysis server. Please try again.');
        }
      }

      if (!analysisResult) {
        throw new Error('Analysis is taking longer than expected. Please try refreshing in a moment.');
      }

      // Success! Pass data to parent with the selected role name
      const selectedRole = ROLES.find(r => r.id === role)?.label || role;
      onAnalyzeSuccess({ ...analysisResult, selectedRole });
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Something went wrong during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message={loadingMessage} />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Optimize Your Resume for <span className="text-indigo-600">ATS</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Get instant feedback on your resume. Compare your skills against the job role you want and stand out to recruiters.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8 relative overflow-hidden">
        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">1. Upload Resume</label>
          <UploadBox file={file} setFile={setFile} />
        </div>

        <div className="space-y-4">
          <label htmlFor="role" className="block text-sm font-semibold text-gray-700">
            2. Select Target Role
          </label>
          <div className="relative">
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            <span>Analyze Resume</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}