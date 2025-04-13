import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs-extra';
import OpenAI from 'openai';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, 'audio');
fs.ensureDirSync(audioDir);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Word list for practice
const words = [
  { id: 1, word: 'hello', difficulty: 'easy' },
  { id: 2, word: 'beautiful', difficulty: 'medium' },
  { id: 3, word: 'pronunciation', difficulty: 'hard' },
  { id: 4, word: 'world', difficulty: 'easy' },
  { id: 5, word: 'language', difficulty: 'medium' },
  { id: 6, word: 'communication', difficulty: 'hard' },
  { id: 7, word: 'practice', difficulty: 'medium' },
  { id: 8, word: 'speaking', difficulty: 'medium' },
  { id: 9, word: 'vocabulary', difficulty: 'hard' },
  { id: 10, word: 'learning', difficulty: 'medium' }
];

// Track last word served for each socket connection
const lastWordServed = new Map();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/audio', express.static(path.join(__dirname, 'audio')));

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API endpoint to get a word
app.get('/api/word/:id', (req, res) => {
  const wordId = parseInt(req.params.id);
  const word = words.find(w => w.id === wordId);
  
  if (!word) {
    return res.status(404).json({ error: 'Word not found' });
  }
  
  res.json(word);
});

// API endpoint to get a random word
app.get('/api/word', (req, res) => {
  const { difficulty } = req.query;
  let availableWords = words;
  
  if (difficulty) {
    availableWords = words.filter(w => w.difficulty === difficulty);
  }
  
  if (availableWords.length === 0) {
    return res.status(404).json({ error: 'No words found with specified criteria' });
  }

  // Get client IP or some unique identifier
  const clientId = req.ip;
  const lastWord = lastWordServed.get(clientId);
  
  // Filter out the last word if it exists
  if (lastWord) {
    availableWords = availableWords.filter(w => w.id !== lastWord.id);
  }
  
  // If we filtered out all words, reset and use all words except last word
  if (availableWords.length === 0) {
    availableWords = words.filter(w => w.id !== lastWord.id);
  }
  
  const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
  
  // Store this word as the last word for this client
  lastWordServed.set(clientId, randomWord);
  
  // Clean up old entries periodically
  setTimeout(() => {
    lastWordServed.delete(clientId);
  }, 1000 * 60 * 5); // Clean up after 5 minutes
  
  res.json(randomWord);
});

// Text-to-speech endpoint
app.get('/api/tts/:id', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id);
    const word = words.find(w => w.id === wordId);
    
    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const audioFileName = `word_${wordId}.mp3`;
    const audioPath = path.join(audioDir, audioFileName);

    // Check if audio file already exists
    if (fs.existsSync(audioPath)) {
      return res.json({ audioUrl: `/audio/${audioFileName}` });
    }

    // Generate speech using OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: word.word,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.writeFile(audioPath, buffer);

    res.json({ audioUrl: `/audio/${audioFileName}` });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Handle incoming audio stream
  socket.on('audioData', async (data) => {
    try {
      console.log('Received audio data for word:', data.targetWord);
      
      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(data.audio, 'base64');
      
      // Create a temporary file for the audio
      const tempFilePath = path.join(audioDir, `temp_${Date.now()}.wav`);
      await fs.writeFile(tempFilePath, audioBuffer);
      
      // Create a File object that OpenAI's API can accept
      const audioFile = await fs.readFile(tempFilePath);
      
      // Transcribe the audio using OpenAI's Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioFile], 'audio.wav', { type: 'audio/wav' }),
        model: "whisper-1",
      });

      // Clean and normalize both strings for comparison
      const cleanString = (str) => str.toLowerCase().trim().replace(/[.,!?]$/, '');
      const spokenText = cleanString(transcription.text);
      const targetWord = cleanString(data.targetWord);

      console.log('Transcription (normalized):', spokenText);
      console.log('Target word (normalized):', targetWord);

      // Compare the transcription with the target word (case-insensitive)
      const isCorrect = spokenText === targetWord;
      const feedbackData = {
        transcription: transcription.text,
        targetWord: data.targetWord,
        isCorrect: isCorrect,
        feedback: isCorrect 
          ? `🌱 Wonderful growth! Your pronunciation is perfect! Keep growing!` 
          : `🌿 Almost there! You said '${transcription.text}'. Let's try '${data.targetWord}' again!`,
        confidenceScore: isCorrect ? 100 : 30
      };

      console.log('Sending feedback:', feedbackData);
      socket.emit('feedback', feedbackData);

      // Clean up temporary file
      await fs.remove(tempFilePath);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('error', { message: 'Error processing audio: ' + error.message });
    }
  });
});

// API endpoints
app.post('/api/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Process audio file with OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: req.file.buffer,
      model: "whisper-1",
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful pronunciation coach. Analyze the transcription and provide specific, constructive feedback on pronunciation."
        },
        {
          role: "user",
          content: `Please analyze this transcription: "${transcription.text}"`
        }
      ],
    });

    res.json({
      transcription: transcription.text,
      feedback: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 