
export type Severity = 'Low' | 'Medium' | 'Immediate' | 'Severe';

export interface DiagnosticResult {
  issue: string;
  severity: Severity;
  confidence: number;
  technical_reasoning: string;
  repair_steps: string[];
  urgency: string;
  preventive_measures: string[];
  estimated_cost: string;
  human_review: boolean;
}

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
}

// ISO Standard codes: ta (Tamil), te (Telugu)
export type AppLanguage = 'en' | 'ta' | 'ar' | 'hi' | 'ml' | 'ur' | 'te';

export interface LanguageOption {
  value: AppLanguage;
  label: string;
  flag: string;
}
