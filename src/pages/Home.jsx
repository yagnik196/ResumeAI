import { useState } from 'react';
import { ChevronRight, AlertCircle } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import Loader from '../components/Loader';
import { getUploadUrl, uploadToS3, getAnalysisResult } from '../services/api';
import { resume } from 'react-dom/server';

const ROLES = [
  { id: 'software_engineer', label: 'Software Engineer' },
  { id: 'data_scientist', label: 'Data Scientist' }
];

export default function Home({ onAnalyzeSuccess }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(ROLES[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a resume first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Call POST /upload to get presigned URL
      console.log('Step 1: Requesting upload URL...');
      const { resume_id, upload_url } = await getUploadUrl(file.name, file.type);
      console.log('Got upload URL:', upload_url);

      // Step 2: Upload file directly to S3
      console.log('Step 2: Uploading file to S3...');
      await uploadToS3(upload_url.url, upload_url.fields, file);
      console.log('S3 upload successful.');

      // Step 3 & 4: Wait and poll GET /analysis/{resume_id}
      console.log('Step 3: Polling for analysis results...');
      let analysisResult = null;
      let attempts = 0;
      const MAX_ATTEMPTS = 20; // 20 attempts * 3 sec = 60 seconds timeout
      
      while (!analysisResult && attempts < MAX_ATTEMPTS) {
        // Wait 3 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        try {
          const result = await getAnalysisResult(resume_id);
          
          // Step 5: Stop polling when valid result received
          if (result && (!result.status || result.status === 'COMPLETED' || result.status !== 'PROCESSING')) {
            analysisResult = result;
            break;
          }
        } catch (pollErr) {
          // If 404, it might simply not be ready yet. Continue polling.
          if (pollErr.response?.status !== 404) {
             throw pollErr; // Actual error occurred
          }
        }
        attempts++;
      }

      if (!analysisResult) {
        throw new Error('Analysis timed out. Please try again later.');
      }

      onAnalyzeSuccess(analysisResult);
    } catch (err) {
      console.error(err);
      setError(err.message || err.response?.data?.message || 'Something went wrong during analysis. Please try again or check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
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