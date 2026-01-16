import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { predictIssue } from './services/prediction.service.js';
import { determineSeverity, estimateCost } from './services/rules.service.js';
import { generateStructuredDiagnosis, getSeverityWithVision } from './services/gemini.service.js';
import { translateResponse } from './services/translation.service.js';
import { DiagnosticResult, AppLanguage } from './types/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Multer setup for image uploads
const upload = multer({ dest: 'uploads/' });

app.post('/diagnose', upload.array('images'), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];
        const description = req.body.description as string;
        const language = (req.body.language as AppLanguage) || 'en';

        console.log(`📥 Received diagnosis request: ${files.length} images, language=${language}`);

        if (files.length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }

        // 1. Image Predictions (Sequential to avoid resource contention)
        console.log("🔍 Starting image predictions...");
        const predictions = [];
        for (const file of files) {
            console.log(`📸 Predicting for: ${file.originalname}`);
            const p = await predictIssue(file.path);
            predictions.push(p);
        }
        console.log("✅ Predictions completed.");

        // Aggregate results (Simplified: pick the most common issue)
        const issueCounts: Record<string, number> = {};
        const issueConfidence: Record<string, number[]> = {};

        predictions.forEach(p => {
            issueCounts[p.issue] = (issueCounts[p.issue] || 0) + 1;
            if (!issueConfidence[p.issue]) issueConfidence[p.issue] = [];
            issueConfidence[p.issue].push(p.confidence);
        });

        const finalIssue = Object.keys(issueCounts).reduce((a, b) =>
            issueCounts[a] > issueCounts[b] ? a : b
        );

        const finalConfidence = issueConfidence[finalIssue].reduce((a, b) => a + b, 0) / issueConfidence[finalIssue].length;

        // 2. Fusion / Keywords (Ported from main.py)
        let issue = finalIssue;
        let confidence = finalConfidence;

        const TEXT_HINTS: Record<string, string[]> = {
            "Crack": ["crack", "fracture", "split", "gap"],
            "Leakage": ["leak", "leakage", "water", "drip", "seep"],
            "Electrical": ["electric", "wire", "spark", "shock", "short"],
            "Mould": ["mould", "fungus", "black spots", "damp"],
            "Algai": ["algai", "algae", "green layer"],
            "Tiles": ["tile", "tiles", "broken tile"]
        };

        const descLower = description.toLowerCase();
        for (const [hintIssue, keywords] of Object.entries(TEXT_HINTS)) {
            if (keywords.some(word => descLower.includes(word))) {
                if (hintIssue !== issue) {
                    issue = hintIssue;
                    confidence = Math.max(confidence, 0.85);
                }
                break;
            }
        }

        // 3. Severity
        let severity = "Moderate";
        try {
            // severity = await getSeverityWithVision(files, issue, description);
            severity = determineSeverity(issue, description);
        } catch (e) {
            severity = determineSeverity(issue, description);
        }

        // 4. LLM Data
        console.log("🤖 Generating structured diagnosis with Gemini...");
        const llmData = await generateStructuredDiagnosis(issue, severity, description);
        console.log("✅ Gemini response received.");

        // 5. Human Review Logic
        const humanReview = severity === "Immediate" || confidence < 0.6 || Object.keys(issueCounts).length > 1;

        let response: DiagnosticResult = {
            issue,
            severity,
            confidence: parseFloat(confidence.toFixed(2)),
            technical_reasoning: llmData.technical_reasoning,
            repair_steps: llmData.repair_steps,
            urgency: llmData.urgency,
            preventive_measures: llmData.preventive_measures,
            human_review: humanReview,
            language: "en"
        };

        // 6. Translation
        if (language !== 'en') {
            console.log(`🌐 Translating response to ${language}...`);
            response = await translateResponse(response, language);
            console.log("✅ Translation completed.");
        }

        // Cleanup uploaded files
        files.forEach(file => fs.unlinkSync(file.path));

        res.json(response);

    } catch (error: any) {
        console.error("❌ Diagnosis Error caught in main.ts:");
        console.error(error);
        if (error.stack) console.error(error.stack);
        res.status(500).json({
            error: error.message || "Internal Server Error",
            detail: "Check backend console for more info"
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
