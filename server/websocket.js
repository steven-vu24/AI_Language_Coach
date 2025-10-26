import { WebSocketServer } from 'ws';
import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export function setupWebSocket(server) {
  // ✅ Validate API key on startup
  if (!DEEPGRAM_API_KEY) {
    console.error('❌ CRITICAL: DEEPGRAM_API_KEY not found in .env file!');
    console.error('   Add DEEPGRAM_API_KEY to your .env file');
    console.error('   Get one from: https://console.deepgram.com/\n');
  } else {
    console.log('✅ Deepgram API Key loaded');
    console.log('   Key preview:', DEEPGRAM_API_KEY.substring(0, 15) + '...\n');
  }

  const wss = new WebSocketServer({ 
    server,
    path: '/ws/transcribe'
  });

  console.log('🔌 WebSocket server initialized at /ws/transcribe\n');

  wss.on('connection', async (ws, req) => {
    console.log('👤 New WebSocket client connected');

    let deepgramConnection = null;
    let deepgram = null;
    let isConnecting = false;
    let isDeepgramReady = false;

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        // Handle start command
        if (data.type === 'start') {
          console.log('▶️ Starting transcription, language:', data.language);

          // ✅ Check if API key exists
          if (!DEEPGRAM_API_KEY) {
            console.error('❌ Cannot start - no API key configured');
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Server not configured with Deepgram API key'
            }));
            return;
          }

          // ✅ Prevent duplicate connections
          if (isConnecting || isDeepgramReady) {
            console.warn('⚠️ Already connecting/connected, ignoring start request');
            return;
          }

          isConnecting = true;

          try {
            // Initialize Deepgram
            console.log('🔑 Creating Deepgram client...');
            deepgram = createClient(DEEPGRAM_API_KEY.trim());
            
            console.log('🔌 Opening live connection...');
            deepgramConnection = deepgram.listen.live({
              model: 'nova-2',
              language: data.language || 'en',
              smart_format: true,
              interim_results: true,
              punctuate: true,
              endpointing: 300,
              encoding: 'linear16',
              sample_rate: 16000,
              channels: 1
            });

            // ✅ Handle connection opened
            deepgramConnection.on('open', () => {
              console.log('✅ Deepgram connection OPENED');
              isConnecting = false;
              isDeepgramReady = true;
              ws.send(JSON.stringify({ 
                type: 'status', 
                message: 'connected',
                timestamp: new Date().toISOString()
              }));
            });

            // 🔥 FIX: Change 'Transcript' to 'Results'
            deepgramConnection.on('Results', (data) => {
              console.log('📝 Results received:', JSON.stringify(data, null, 2));
              
              // Extract transcript from the results
              const transcript = data.channel?.alternatives?.[0]?.transcript;
              const isFinal = data.is_final;
              
              console.log(`💬 Transcript: "${transcript}" (final: ${isFinal})`);
              
              ws.send(JSON.stringify({
                type: 'transcript',
                data: data
              }));
            });

            // ✅ Handle metadata
            deepgramConnection.on('Metadata', (data) => {
              console.log('ℹ️ Metadata received:', data);
            });

            // ✅ Handle errors with details
            deepgramConnection.on('error', (error) => {
              console.error('❌ Deepgram error:', {
                message: error.message,
                status: error.statusCode,
                readyState: error.readyState
              });
              
              isConnecting = false;
              isDeepgramReady = false;
              
              ws.send(JSON.stringify({
                type: 'error',
                message: error.message || 'Deepgram connection error',
                details: 'Check server logs for more information'
              }));
            });

            // ✅ Handle connection closed
            deepgramConnection.on('close', (code, reason) => {
              console.log('🔌 Deepgram connection closed');
              console.log('   Code:', code);
              console.log('   Reason:', reason || 'No reason provided');
              
              isConnecting = false;
              isDeepgramReady = false;
              
              ws.send(JSON.stringify({
                type: 'status',
                message: 'disconnected'
              }));
            });

            // ✅ Handle warnings
            deepgramConnection.on('Warning', (warning) => {
              console.warn('⚠️ Deepgram warning:', warning);
            });

          } catch (error) {
            console.error('💥 Failed to initialize Deepgram:', error);
            isConnecting = false;
            isDeepgramReady = false;
            
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Failed to initialize transcription',
              details: error.message
            }));
          }
        }

        // Handle audio data
        if (data.type === 'audio' && deepgramConnection) {
          const readyState = deepgramConnection.getReadyState();
          
          if (readyState === 1 && isDeepgramReady) {
            try {
              const audioBuffer = Buffer.from(data.audio, 'base64');
              deepgramConnection.send(audioBuffer);
            } catch (error) {
              console.error('❌ Error sending audio:', error);
            }
          } else {
            console.warn('⚠️ Cannot send audio - Deepgram not ready');
            console.warn('   Ready state:', readyState);
            console.warn('   isDeepgramReady:', isDeepgramReady);
          }
        }

        // Handle stop command
        if (data.type === 'stop') {
          console.log('⏹️ Stop command received');
          
          if (deepgramConnection) {
            try {
              console.log('🔌 Finishing Deepgram connection...');
              deepgramConnection.finish();
              deepgramConnection = null;
              console.log('✅ Deepgram connection finished');
            } catch (error) {
              console.error('❌ Error finishing connection:', error);
            }
          } else {
            console.log('ℹ️ No active Deepgram connection to stop');
          }
          
          isConnecting = false;
          isDeepgramReady = false;
        }

      } catch (err) {
        console.error('💥 WebSocket message error:', err);
        console.error('   Stack:', err.stack);
        
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Server error: ' + err.message
        }));
      }
    });

    // ✅ Cleanup on client disconnect
    ws.on('close', () => {
      console.log('👋 Client disconnected');
      
      if (deepgramConnection) {
        console.log('🧹 Cleaning up Deepgram connection...');
        try {
          deepgramConnection.finish();
        } catch (error) {
          console.error('Error cleaning up:', error);
        }
        deepgramConnection = null;
      }
      
      isConnecting = false;
      isDeepgramReady = false;
    });

    // ✅ Handle client errors
    ws.on('error', (error) => {
      console.error('❌ WebSocket client error:', error);
      isConnecting = false;
      isDeepgramReady = false;
    });
  });

  // ✅ Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('❌ WebSocket server error:', error);
  });

  return wss;
}