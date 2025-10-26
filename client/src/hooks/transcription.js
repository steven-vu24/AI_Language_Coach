import { useState, useRef, useCallback, useEffect } from 'react';

const WS_URL = 'ws://localhost:5002/ws/transcribe';

export function useWebSocketTranscription() {
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const transcriptRef = useRef(''); // ✅ Track transcript in ref for immediate access

  const startTranscription = useCallback(async (language = 'en') => {
    try {
      console.log('🎤 Starting WebSocket transcription...');
      setError(null);

      // ✅ Clear transcripts
      setTranscript('');
      setInterimTranscript('');
      transcriptRef.current = ''; // ✅ Clear ref

      // Connect to WebSocket
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = async () => {
        console.log('✅ WebSocket connected');
        
        // Send start command
        wsRef.current.send(JSON.stringify({
          type: 'start',
          language: language
        }));

        // Get microphone access
        console.log('🎤 Requesting microphone...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          }
        });
        console.log('✅ Microphone granted');

        // Create AudioContext for raw audio processing
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });

        console.log('🎙️ AudioContext created, sample rate:', audioContextRef.current.sampleRate);

        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        // Create ScriptProcessor for audio processing
        const bufferSize = 4096;
        processorRef.current = audioContextRef.current.createScriptProcessor(bufferSize, 1, 1);

        let chunkCount = 0;

        processorRef.current.onaudioprocess = (e) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            // Get audio data (Float32Array from -1.0 to 1.0)
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Convert to Int16 PCM (required by Deepgram)
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              // Clamp values between -1 and 1
              const s = Math.max(-1, Math.min(1, inputData[i]));
              // Convert to 16-bit integer
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            chunkCount++;
            if (chunkCount % 20 === 0) {
              console.log(`📊 Sent ${chunkCount} audio chunks, last size: ${pcmData.length * 2} bytes`);
            }

            // Convert to base64 and send
            const base64Audio = btoa(
              String.fromCharCode(...new Uint8Array(pcmData.buffer))
            );

            wsRef.current.send(JSON.stringify({
              type: 'audio',
              audio: base64Audio
            }));
          }
        };

        // Connect audio pipeline
        sourceRef.current.connect(processorRef.current);
        processorRef.current.connect(audioContextRef.current.destination);

        setIsConnected(true);
        console.log('▶️ Audio processing started');
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'transcript') {
          const alternatives = message.data.channel?.alternatives?.[0];
          if (alternatives) {
            const newTranscript = alternatives.transcript || '';
            const isFinal = message.data.is_final;

            console.log(`💬 "${newTranscript}" (final: ${isFinal})`);

            if (newTranscript) {
              if (isFinal) {
                // ✅ Update both state and ref
                const updated = (transcriptRef.current + ' ' + newTranscript).trim();
                transcriptRef.current = updated;
                setTranscript(updated);
                setInterimTranscript('');
                
                console.log('📝 Final transcript updated:', updated);
              } else {
                setInterimTranscript(newTranscript);
              }
            }
          }
        }

        if (message.type === 'error') {
          console.error('❌ Server error:', message.message);
          setError(message.message);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('❌ WebSocket error:', err);
        setError('WebSocket connection error');
      };

      wsRef.current.onclose = () => {
        console.log('🔌 WebSocket closed');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('❌ Failed to start:', err);
      setError(err.message);
    }
  }, []);

  const stopTranscription = useCallback(() => {
    console.log('⏹️ Stopping transcription...');

    // ✅ Stop audio processing FIRST to stop sending new chunks
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current.mediaStream.getTracks().forEach(track => track.stop());
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // ✅ Send stop command but KEEP WebSocket open briefly for final transcripts
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      
      // ✅ Close WebSocket after a delay to receive final transcripts
      setTimeout(() => {
        if (wsRef.current) {
          console.log('🔌 Closing WebSocket after delay');
          wsRef.current.close();
        }
      }, 1000); // Wait 1 second for final transcripts
    }

    setIsConnected(false);
  }, []);

  const clearTranscript = useCallback(() => {
    console.log('🗑️ Clearing transcripts');
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = ''; // ✅ Clear ref too
  }, []);

  // ✅ Add function to get the latest transcript immediately
  const getLatestTranscript = useCallback(() => {
    return transcriptRef.current;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (processorRef.current) processorRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return {
    startTranscription,
    stopTranscription,
    clearTranscript,
    getLatestTranscript, // ✅ Export this
    isConnected,
    transcript,
    interimTranscript,
    error,
  };
}