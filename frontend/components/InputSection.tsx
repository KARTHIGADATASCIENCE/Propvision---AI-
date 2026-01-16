
import React, { useRef } from 'react';
import { UploadedFile, AppLanguage } from '../types';
import { LANGUAGES, UI_TRANSLATIONS } from '../constants';
import VoiceInput from './VoiceInput';

interface Props {
  files: UploadedFile[];
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  description: string;
  setDescription: (val: string) => void;
  language: AppLanguage;
  setLanguage: (val: AppLanguage) => void;
  onDiagnose: () => void;
  isLoading: boolean;
}

const InputSection: React.FC<Props> = ({
  files,
  setFiles,
  description,
  setDescription,
  language,
  setLanguage,
  onDiagnose,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasFiles = files.length > 0;
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.en;
  const isRTL = language === 'ar' || language === 'ur';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f as File,
        preview: URL.createObjectURL(f as File)
      }));
      setFiles(prev => [...prev, ...newFiles]);
      e.target.value = ''; 
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className={`flex flex-col items-center max-w-3xl mx-auto gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Central Interactive Hub */}
      <div className="w-full">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative cursor-pointer glass rounded-[3rem] p-12 md:p-16 flex flex-col items-center justify-center transition-all duration-700 border-2 border-dashed
            ${hasFiles ? 'border-emerald-400 bg-white shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 'border-slate-400/50 hover:border-blue-400 bg-white/90 hover:bg-white'}
          `}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
          
          <div className="relative">
             <div className={`
                w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500 transform
                ${hasFiles ? 'bg-emerald-600 scale-105 shadow-xl shadow-emerald-200' : 'bg-slate-800 shadow-xl shadow-slate-400'}
              `}>
                <i className={`fas ${hasFiles ? 'fa-check' : 'fa-camera-retro'} text-white text-4xl md:text-5xl transition-all`}></i>
              </div>
              
              {hasFiles && (
                 <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-sm font-black shadow-lg animate-in zoom-in">
                   {files.length}
                 </div>
              )}
          </div>
          
          <h3 className={`text-2xl md:text-3xl font-black mb-2 tracking-tight ${hasFiles ? 'text-emerald-700' : 'text-slate-800'}`}>
            {hasFiles ? t.ready : t.uploadTitle}
          </h3>
          <p className="text-slate-500 text-center font-medium max-w-sm px-4">
            {hasFiles 
              ? `${files.length} ${t.evidence.toLowerCase()} ${t.ready.toLowerCase()}` 
              : t.uploadSubtitle}
          </p>
        </div>
      </div>

      {/* Thumbnail Gallery with "Add More" Symbol */}
      {hasFiles && (
        <div className="w-full flex flex-wrap justify-center gap-4 animate-in slide-in-from-top-4 duration-500">
          {files.map((file) => (
            <div key={file.id} className="relative group w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-lg transition-all hover:scale-105">
              <img src={file.preview} alt="Defect" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
          
          {/* THE UPLOAD SYMBOL AFTER ADDING IMAGES */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 md:w-28 md:h-28 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-600 flex flex-col items-center justify-center hover:bg-emerald-100 transition-all group"
          >
            <i className="fas fa-plus-circle text-2xl mb-1 group-hover:scale-125 transition-transform"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.add}</span>
          </button>
        </div>
      )}

      {/* Inputs Form */}
      <div className="w-full glass rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">{t.descriptionLabel}</label>
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className={`w-full min-h-[120px] p-6 bg-slate-100/50 border-none rounded-3xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner ${isRTL ? 'text-right' : 'text-left'}`}
            />
            <div className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'}`}>
             {/* <VoiceInput onText={(text) => setDescription(prev => prev + ' ' + text)} />*/}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">{t.languageLabel}</label>
          <div className="relative group">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className={`w-full appearance-none bg-slate-100 border-none rounded-2xl py-5 px-8 font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none cursor-pointer transition-all hover:bg-slate-200 ${isRTL ? 'text-right pr-8 pl-14' : 'text-left pl-8 pr-14'}`}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.flag} {lang.label}</option>
              ))}
            </select>
            <i className={`fas fa-chevron-down absolute inset-y-0 ${isRTL ? 'left-8' : 'right-8'} flex items-center text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors`}></i>
          </div>
        </div>

        <button
          onClick={onDiagnose}
          disabled={!hasFiles || isLoading}
          className={`
            w-full py-6 rounded-3xl font-black text-xl tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-4 group relative overflow-hidden
            ${hasFiles 
              ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-2xl shadow-blue-500/40 hover:-translate-y-1 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
          `}
        >
          {/* Shimmer Effect */}
          {hasFiles && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>}
          
          {isLoading ? (
            <><i className="fas fa-atom fa-spin"></i><span>{t.running}</span></>
          ) : (
            <><i className="fas fa-microscope transition-transform group-hover:scale-125"></i><span>{t.diagnoseBtn}</span></>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;
