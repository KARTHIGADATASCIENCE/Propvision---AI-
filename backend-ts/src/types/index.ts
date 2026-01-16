export interface DiagnosticResult {
    issue: string;
    severity: string;
    confidence: number;
    technical_reasoning: string;
    repair_steps: string[];
    urgency: string;
    preventive_measures: string[];
    human_review: boolean;
    language: string;
}

export type AppLanguage = 'en' | 'ta' | 'te' | 'hi' | 'kn' | 'ml';
