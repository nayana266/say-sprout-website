import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './AudioRecorder.css';

const AudioRecorder = ({ onFeedback }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [feedback, setFeedback] = useState('');
  const mediaRecorderRef = useRef(null);
  const socketRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = io('http://localhost:5000');
    
    socketRef.current.on('feedback', (data) => {
      setFeedback(data);
      if (onFeedback) {
        onFeedback(data);
      }
    });
    
    socketRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onFeedback]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        // Send audio data to server via WebSocket
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          socketRef.current.emit('audioData', base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      socketRef.current.emit('startRecording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please make sure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="audio-recorder">
      <button 
        className={`record-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      
      {audioUrl && (
        <div className="audio-playback">
          <audio src={audioUrl} controls />
        </div>
      )}
      
      {feedback && (
        <div className="feedback-container">
          <h3>AI Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder; 