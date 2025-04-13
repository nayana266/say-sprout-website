const { pipeline } = require('@xenova/transformers');
const fs = require('fs-extra');
const path = require('path');
const wav = require('wav');

let speechRecognitionPipeline = null;

async function initializeSpeechRecognition() {
    if (!speechRecognitionPipeline) {
        console.log('Initializing speech recognition model...');
        speechRecognitionPipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
        console.log('Speech recognition model initialized');
    }
    return speechRecognitionPipeline;
}

async function transcribeAudio(audioBuffer) {
    try {
        const pipeline = await initializeSpeechRecognition();
        
        // Save audio buffer to temporary WAV file
        const tempFile = path.join(__dirname, 'temp', `${Date.now()}.wav`);
        await fs.ensureDir(path.dirname(tempFile));
        
        // Convert audio buffer to WAV file
        const writer = new wav.FileWriter(tempFile, {
            channels: 1,
            sampleRate: 16000,
            bitDepth: 16
        });
        
        writer.write(audioBuffer);
        writer.end();
        
        // Wait for file to be written
        await new Promise(resolve => writer.on('done', resolve));
        
        // Transcribe the audio
        const result = await pipeline(tempFile, {
            chunk_length_s: 30,
            stride_length_s: 5,
            language: 'english',
            task: 'transcribe'
        });
        
        // Clean up temporary file
        await fs.remove(tempFile);
        
        return result.text.trim().toLowerCase();
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}

module.exports = {
    transcribeAudio
}; 