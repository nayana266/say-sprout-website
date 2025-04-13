const gTTS = require('gtts');
const fs = require('fs-extra');
const path = require('path');

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, 'audio');
fs.ensureDirSync(audioDir);

/**
 * Convert text to speech and save as MP3
 * @param {string} text - Text to convert to speech
 * @param {string} lang - Language code (default: 'en')
 * @returns {Promise<string>} - Path to the generated audio file
 */
async function textToSpeech(text, lang = 'en') {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `${Date.now()}_${text.toLowerCase().replace(/\s+/g, '_')}.mp3`;
      const filePath = path.join(audioDir, fileName);
      
      const gtts = new gTTS(text, lang);
      
      gtts.save(filePath, (err) => {
        if (err) {
          console.error('Error saving TTS file:', err);
          reject(err);
          return;
        }
        resolve(filePath);
      });
    } catch (error) {
      console.error('Error in TTS:', error);
      reject(error);
    }
  });
}

/**
 * Clean up old audio files
 * @param {number} maxAgeHours - Maximum age of files in hours
 */
async function cleanupOldFiles(maxAgeHours = 24) {
  try {
    const files = await fs.readdir(audioDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(audioDir, file);
      const stats = await fs.stat(filePath);
      const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
      
      if (ageHours > maxAgeHours) {
        await fs.remove(filePath);
      }
    }
  } catch (error) {
    console.error('Error cleaning up audio files:', error);
  }
}

module.exports = {
  textToSpeech,
  cleanupOldFiles
}; 