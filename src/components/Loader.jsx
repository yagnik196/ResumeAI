import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Analyzing your resume...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl animate-pulse opacity-30"></div>
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-gray-800">{message}</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-xs text-center">
        Our AI is scanning your resume for skills, keywords, and ATS optimization potential.
      </p>
    </div>
  );
}
