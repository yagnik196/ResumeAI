import { BrainCircuit } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10 w-full">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Resume<span className="text-indigo-600">AI</span>
          </span>
        </div>
        <div className="text-sm font-medium text-gray-500">
          Powered by Serverless
        </div>
      </div>
    </nav>
  );
}
