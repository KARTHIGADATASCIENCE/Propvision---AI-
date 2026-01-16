
import React, { useState, useEffect } from 'react';

interface Props {
  onText: (text: string) => void;
}

const VoiceInput: React.FC<Props> = ({ onText }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // 🔹 Language state (you can change value manually)
  const [language, setLanguage] = useState('en-IN'); 
  // en-IN, ta-IN, te-IN, hi-IN, ml-IN, ar-SA

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // 🔹 Language applied here
      rec.lang = language;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onText(transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      setRecognition(rec);
    }
  }, [onText, language]);

  const toggleListen = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  if (!recognition) return null;

  return (
    <button
      onClick={toggleListen}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
        ${isListening
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-white text-slate-400 hover:text-blue-500 shadow-md'}
      `}
      title={isListening ? 'Stop Listening' : 'Speak Description'}
    >
      <i
        className={`fas ${
          isListening ? 'fa-microphone' : 'fa-microphone-alt'
        }`}
      ></i>
    </button>
  );
};

export default VoiceInput;
