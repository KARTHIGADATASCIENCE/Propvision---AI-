import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configuration for the Python bridge
const PYTHON_PATH = 'python'; // Or path to venv: '../venv/Scripts/python.exe'
const PREDICT_SCRIPT = path.join(__dirname, '../utils/predict_bridge.py');
export const predictIssue = async (imagePath) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn(PYTHON_PATH, [PREDICT_SCRIPT, imagePath]);
        let dataString = '';
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data.toString()}`);
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(`Python process exited with code ${code}`);
            }
            try {
                const result = JSON.parse(dataString);
                resolve(result);
            }
            catch (e) {
                reject(`Failed to parse Python output: ${dataString}`);
            }
        });
    });
};
