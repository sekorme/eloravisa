import fs from 'fs';
import path from 'path';

function findLiveServerMessageConfig() {
    const filePaths = ['node_modules/@google/genai/dist/genai.d.ts'];
    for (const fp of filePaths) {
        if (fs.existsSync(fp)) {
            const content = fs.readFileSync(fp, 'utf-8');
            const lines = content.split('\n');
            let startIdx = lines.findIndex(l => l.includes('interface LiveServerMessage'));
            if (startIdx !== -1) {
                console.log(lines.slice(startIdx, startIdx + 30).join('\n'));
            }
            startIdx = lines.findIndex(l => l.includes('interface Transcription '));
            if (startIdx !== -1) {
                console.log("\n--- Transcription ---");
                console.log(lines.slice(startIdx, startIdx + 30).join('\n'));
            }
        }
    }
}
findLiveServerMessageConfig();
