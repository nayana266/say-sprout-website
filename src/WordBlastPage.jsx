import React, { useState, useEffect, useRef } from 'react';
import leafIcon from './plants/leaf.png';
import micIcon from './mic.png';
import background from './background.jpeg';
import io from 'socket.io-client';
import './style.css';

const BACKEND_URL = 'http://localhost:5000';

const WordBlastPage = () => {
  const [wordToPronounce, setWordToPronounce] = useState("");
  const [showStartMessage, setShowStartMessage] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Connect to WebSocket server
    try {
      socketRef.current = io(BACKEND_URL, {
        transports: ['websocket'],
        upgrade: false
      });
      
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server');
        setError(null);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setError('Could not connect to server. Please try again.');
      });
      
      socketRef.current.on('feedback', (data) => {
        console.log('Received feedback:', data);
        
        // Update the UI with the feedback data
        setTranscription(data.transcription);
        setFeedback(data.feedback);
        setConfidenceScore(data.confidenceScore);
        
        // If pronunciation is correct, get a new word after a delay
        if (data.isCorrect) {
          setTimeout(() => {
            setFeedback('🌱 Great job! Here\'s a new word...');
            setTimeout(getNewWord, 1500);
          }, 2000);
        }
      });
      
      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        setError('Error processing audio. Please try again.');
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Error setting up WebSocket:', error);
      setError('Could not connect to server. Please try again.');
    }
  }, []);

  const getNewWord = async () => {
    try {
      setIsLoading(true);
      setShowStartMessage(false);
      // Clear all previous state
      setFeedback('');
      setError(null);
      setTranscription('');
      setConfidenceScore(null);
      setAudioUrl(null);
      
      // Get a random word from the backend
      const response = await fetch(`${BACKEND_URL}/api/word`);
      if (!response.ok) {
        throw new Error('Failed to fetch word');
      }
      
      const wordData = await response.json();
      
      if (wordData && wordData.word) {
        setWordToPronounce(wordData.word);
        
        // Get TTS for the word using the word ID
        const ttsResponse = await fetch(`${BACKEND_URL}/api/tts/${wordData.id}`);
        
        if (!ttsResponse.ok) {
          throw new Error('Failed to generate speech');
        }
        
        const ttsData = await ttsResponse.json();
        if (ttsData && ttsData.audioUrl) {
          setAudioUrl(`${BACKEND_URL}${ttsData.audioUrl}`);
        }
      }
    } catch (error) {
      console.error('Error fetching word:', error);
      setError('Failed to get new word. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Clear previous feedback and transcription
      setFeedback('');
      setTranscription('');
      setConfidenceScore(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to WAV format
          const arrayBuffer = await audioBlob.arrayBuffer();
          const base64Audio = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          
          if (socketRef.current && socketRef.current.connected) {
            console.log('Sending audio data for word:', wordToPronounce);
            socketRef.current.emit('audioData', {
              audio: base64Audio,
              targetWord: wordToPronounce
            });
          } else {
            setError('Not connected to server. Please refresh the page.');
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          setError('Error processing recording. Please try again.');
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setError('Error accessing microphone. Please make sure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!wordToPronounce) {
      // First click - get a new word
      getNewWord();
    } else if (wordToPronounce && !isRecording) {
      // Second click - start recording after user has had chance to hear the word
      startRecording();
    }
  };

  // Update the mic label text
  const getMicLabelText = () => {
    if (!wordToPronounce) return 'Click mic to get a word';
    if (isRecording) return 'Recording... Click to stop';
    return 'Click mic to practice';
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="label" style={{ left: '31.75%' }}>
        <span className="text-wrapper" style={{ whiteSpace: 'nowrap' }}>
          Say Sprout
        </span>
        <img
          src={leafIcon}
          alt="Leaf"
          className="pixelated"
          style={{
            height: '40px',
            marginLeft: '10px',
            marginTop: '6px',
          }}
        />
      </div>

      {/* Main box */}
      <div className="confetti-wrapper">
        <div
          className="confetti-box"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="content-wrapper">
            <h2 className="prompt-label">word to pronounce</h2>
            <div className="word-box">{showStartMessage ? "Click the mic to start!" : wordToPronounce}</div>
            
            {audioUrl && (
              <div className="audio-playback-container">
                <audio src={audioUrl} controls className="word-audio" />
              </div>
            )}
            
            <p className="mic-label">
              {getMicLabelText()}
            </p>
            
            <div className="controls-container">
              <img
                src={micIcon}
                alt="Mic Icon"
                className={`mic-icon ${isRecording ? 'recording' : ''}`}
                onClick={handleMicClick}
                style={{ cursor: 'pointer' }}
              />
            </div>
            
            {isLoading && <div className="loading">Loading...</div>}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {transcription && (
              <div className="transcription-box">
                <h3>You said:</h3>
                <p>{transcription}</p>
              </div>
            )}

            {feedback && (
              <div className="feedback-box">
                <h3>AI Feedback</h3>
                <p>{feedback}</p>
                {confidenceScore !== null && (
                  <div className="confidence-score">
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${confidenceScore}%` }}
                      />
                    </div>
                    <p>Confidence: {confidenceScore}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordBlastPage;

