import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for the Python bridge
const PYTHON_PATH = 'd:\\Property diagnosis\\venv\\Scripts\\python.exe';
const PREDICT_SCRIPT = path.join(__dirname, '../utils/predict_bridge.py');

export const predictIssue = async (imagePath: string): Promise<{ issue: string; confidence: number }> => {
    const absoluteImagePath = path.resolve(imagePath);
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(PYTHON_PATH, [PREDICT_SCRIPT, absoluteImagePath]);

        let dataString = '';
        pythonProcess.stdout.on('data', (data: Buffer) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data: Buffer) => {
            console.error(`Python Error: ${data.toString()}`);
        });

        pythonProcess.on('close', (code: number) => {
            if (code !== 0) {
                return reject(`Python process exited with code ${code}`);
            }
            try {
                // Find the JSON block in the output (it might be surrounded by TensorFlow logs)
                const jsonMatch = dataString.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const result = JSON.parse(jsonMatch[0]);
                    resolve(result);
                } else {
                    reject(`No JSON found in Python output: ${dataString}`);
                }
            } catch (e) {
                reject(`Failed to parse Python output: ${dataString}`);
            }
        });
    });
};
