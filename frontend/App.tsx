
import React, { useState } from 'react';
import { UploadedFile, DiagnosticResult, AppLanguage } from './types';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import { BACKEND_URL } from './constants';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleDiagnose = async () => {
    if (files.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    
    setIsDiagnosing(true);
    
    // Create FormData for multipart/form-data submission
    const formData = new FormData();
    
    // The backend expects 'images' as the field name for multiple files
    files.forEach(f => {
      formData.append('images', f.file);
    });
    
    formData.append('description', description);
    formData.append('language', language);

    try {
      const response = await fetch(`${BACKEND_URL}/diagnose`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server Error: ${response.status}`);
      }
      
      const data: DiagnosticResult = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error('Connection Error:', error);
      alert(`Backend Connection Failed: ${error.message}\n\n1. Ensure your backend is running at ${BACKEND_URL}\n2. Check if CORS is enabled in your backend.`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFiles([]);
    setDescription('');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="fixed inset-0 bg-estate pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto py-12 px-6">
        <header className="mb-16 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em]">Construction Defect Analysis Engine</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter">
            PROPVISION  <span className="text-emerald-500">AI</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Professional Architectural Diagnostics & Defect Classification
          </p>
        </header>

        <main>
          {!result ? (
            <InputSection
              files={files}
              setFiles={setFiles}
              description={description}
              setDescription={setDescription}
              language={language}
              setLanguage={setLanguage}
              onDiagnose={handleDiagnose}
              isLoading={isDiagnosing}
            />
          ) : (
            <OutputSection 
              result={result} 
              uploadedImages={files} 
              setUploadedImages={setFiles}
              onReset={handleReset} 
              language={language}
            />
          )}
        </main>

        <footer className="mt-20 py-8 border-t border-white/10 text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Professional Architectural Diagnostics & Defect Classification. Local Connection: {BACKEND_URL}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
