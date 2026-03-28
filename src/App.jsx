import { useState } from 'react';
import Home from './pages/Home';
import Results from './pages/Results';
import Navbar from './components/Navbar';

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {!result ? (
          <Home onAnalyzeSuccess={setResult} />
        ) : (
          <Results result={result} onReset={() => setResult(null)} />
        )}
      </main>
    </div>
  );
}

export default App;
