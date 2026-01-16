
import React, { useEffect, useRef } from 'react';
import { DiagnosticResult, UploadedFile, AppLanguage } from '../types';
import { SEVERITY_THEMES, UI_TRANSLATIONS } from '../constants';

interface Props {
  result: DiagnosticResult;
  uploadedImages: UploadedFile[];
  setUploadedImages: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  onReset: () => void;
  language: AppLanguage;
}

const OutputSection: React.FC<Props> = ({ result, uploadedImages, setUploadedImages, onReset, language }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const theme = SEVERITY_THEMES[result.severity] || SEVERITY_THEMES.Medium;
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const isRTL = language === 'ar' || language === 'ur';

  useEffect(() => {
    reportRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleReadAloud = () => {
    window.speechSynthesis.cancel(); // Stop any previous
    const textToRead = `
      ${t.summaryTitle}. 
      ${result.issue}. 
      ${t.primaryCause}: ${result.technical_reasoning}. 
      ${t.urgency}: ${result.urgency}.
      ${t.cost}: ${result.estimated_cost}.
    `;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Attempt language matching
    const langMap: Record<string, string> = {
      en: 'en-US', ta: 'ta-IN', ar: 'ar-SA', hi: 'hi-IN', ml: 'ml-IN', ur: 'ur-PK', te: 'te-IN'
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div ref={reportRef} className={`max-w-4xl mx-auto space-y-8 animate-in fade-in duration-1000 pb-20 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Forensic Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">{t.summaryTitle}</h2>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">{t.summarySubtitle}</p>
        </div>
     
      </div>

      <div className="glass rounded-[3.5rem] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/10">
        
        {/* Top Status Belt */}
        <div className="p-8 md:p-12 border-b border-slate-100 bg-white/60 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className={`flex items-center gap-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`px-6 py-3 rounded-2xl text-xs font-black text-white uppercase tracking-[0.2em] shadow-lg ${theme.bg}`}>
              {result.severity}
            </div>
            <div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter">{result.issue}</h3>
            </div>
          </div>
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
             <span className="text-5xl font-black text-slate-800">{Math.round(result.confidence * 100)}%</span>
             <div className="text-[10px] font-black text-slate-400 uppercase leading-tight tracking-widest">
               {t.confidence.split(' ').join('<br/>')}
             </div>
          </div>
        </div>

        {/* Diagnostic Grid */}
        <div className="p-10 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-12">
            {/* TECHNICAL REASONING */}
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.primaryCause}</h4>
              <div className="p-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 shadow-inner">
                <p className="text-slate-700 text-lg font-bold leading-relaxed italic">
                  "{result.technical_reasoning}"
                </p>
              </div>
            </section>

            {/* REPAIR STEPS */}
            <section className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.solutions}</h4>
              <div className="space-y-3">
                {result.repair_steps.map((step, i) => (
                  <div key={i} className={`flex gap-5 items-start p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-slate-700 text-base font-bold leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            

            {/* URGENCY & PREVENTIVE */}
            <div className={`flex flex-col gap-6`}>
               <div className={`flex items-center gap-4 p-6 rounded-3xl border-2 ${theme.border} ${theme.text} bg-white shadow-sm font-black text-sm uppercase tracking-widest`}>
                  <i className="fas fa-clock text-xl"></i>
                  <span>{t.urgency}: {result.urgency}</span>
               </div>
               
               <div className="space-y-4 p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2.5rem]">
                 <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">{t.preventive}</h4>
                 <ul className="space-y-4">
                   {result.preventive_measures.map((measure, i) => (
                     <li key={i} className={`flex gap-3 items-center text-slate-700 font-bold text-xs ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                       <i className="fas fa-shield-alt text-emerald-500"></i>
                       {measure}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        </div>

        {/* Uploaded Evidence Section */}
        <div className="bg-slate-50/50 p-10 md:p-14 border-t border-slate-100">
           <div className="flex justify-between items-center mb-8">
             <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">{t.evidence}</h4>
             <div className="px-4 py-2 bg-slate-200/50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
               {uploadedImages.length} Samples
             </div>
           </div>
           
           <div className={`flex flex-wrap gap-6 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              {uploadedImages.map((img) => (
                <div key={img.id} className="relative group w-32 h-32 md:w-40 md:h-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl transition-all hover:scale-105">
                  <img src={img.preview} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                     <button 
                       onClick={() => removeImage(img.id)}
                       className="px-4 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600"
                     >
                       <i className="fas fa-trash-alt mr-2"></i>{t.delete}
                     </button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Professional Notice */}
        {result.human_review && (
          <div className={`bg-amber-50 p-8 border-t border-amber-100 flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
               <i className="fas fa-user-hard-hat text-2xl"></i>
            </div>
            <div>
              <p className="text-xs text-amber-900 font-black uppercase tracking-widest mb-1">{t.reviewNote}</p>
              <p className="text-[10px] text-amber-700 font-bold">This anomaly warrants an on-site structural investigation by a certified engineer.</p>
            </div>
          </div>
        )}
      </div>

      {/* Restart Analysis Button */}
      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] border border-white/10 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
        >
          {t.newAnalysis}
        </button>
      </div>
    </div>
  );
};

export default OutputSection;
