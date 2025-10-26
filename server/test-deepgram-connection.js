import { createClient } from '@deepgram/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

async function testDeepgramConnection() {
  console.log('\n🧪 DEEPGRAM CONNECTION TEST');
  console.log('=====================================\n');

  // Step 1: Check if API key exists
  console.log('Step 1: Checking API Key...');
  if (!DEEPGRAM_API_KEY) {
    console.error('❌ FAIL: No API key found in environment');
    console.error('   Add DEEPGRAM_API_KEY to your .env file\n');
    process.exit(1);
  }
  console.log('✅ API key exists');
  console.log('   Length:', DEEPGRAM_API_KEY.length);
  console.log('   Preview:', DEEPGRAM_API_KEY.substring(0, 15) + '...\n');

  // Step 2: Check for formatting issues
  console.log('Step 2: Checking API Key Format...');
  const issues = [];
  if (DEEPGRAM_API_KEY.includes(' ')) issues.push('Contains spaces');
  if (DEEPGRAM_API_KEY.includes('\n')) issues.push('Contains newlines');
  if (DEEPGRAM_API_KEY.includes('"')) issues.push('Contains quotes');
  if (DEEPGRAM_API_KEY.includes("'")) issues.push('Contains quotes');
  
  if (issues.length > 0) {
    console.error('❌ FAIL: API key has formatting issues:');
    issues.forEach(issue => console.error('   -', issue));
    console.error('   Clean your .env file\n');
    process.exit(1);
  }
  console.log('✅ API key format looks good\n');

  // Step 3: Test WebSocket connection
  console.log('Step 3: Testing WebSocket Connection...');
  console.log('   Connecting to: wss://api.deepgram.com/v1/listen');
  console.log('   Model: nova-2');
  console.log('   Language: en');
  console.log('   Waiting for response...\n');

  return new Promise((resolve, reject) => {
    try {
      const deepgram = createClient(DEEPGRAM_API_KEY.trim());
      const connection = deepgram.listen.live({
        model: 'nova-2',
        language: 'en',
        smart_format: true,
        interim_results: true,
      });

      let connectionOpened = false;

      connection.on('open', () => {
        connectionOpened = true;
        console.log('✅ SUCCESS! WebSocket connection opened!\n');
        console.log('=====================================');
        console.log('🎉 Deepgram is working correctly!');
        console.log('   Your API key is valid');
        console.log('   WebSocket connection successful');
        console.log('   Ready for transcription');
        console.log('=====================================\n');
        
        connection.finish();
        resolve(true);
      });

      connection.on('error', (error) => {
        console.error('❌ FAIL: WebSocket connection error\n');
        console.error('Error Details:');
        console.error('   Message:', error.message);
        console.error('   Status:', error.statusCode || 'N/A');
        console.error('   Ready State:', error.readyState);
        console.error('   URL:', error.url);
        console.error('\n=====================================');
        console.error('🔍 Troubleshooting:');
        console.error('=====================================');
        
        if (error.message?.includes('network error') || error.readyState === 0) {
          console.error('\n❌ AUTHENTICATION FAILED');
          console.error('\nYour API key is INVALID or EXPIRED.\n');
          console.error('How to fix:');
          console.error('1. Go to: https://console.deepgram.com/');
          console.error('2. Sign in to your account');
          console.error('3. Click "API Keys" in the sidebar');
          console.error('4. Delete old key (if exists)');
          console.error('5. Click "Create a New API Key"');
          console.error('6. Copy the new key');
          console.error('7. Update DEEPGRAM_API_KEY in .env file');
          console.error('8. Restart server');
          console.error('\nNote: Free accounts get $200 in credits');
          console.error('      Check your balance at: https://console.deepgram.com/billing\n');
        } else {
          console.error('\nPossible issues:');
          console.error('- API key is invalid or revoked');
          console.error('- Account has no credits');
          console.error('- Network/firewall blocking connection');
          console.error('- Deepgram service may be down\n');
        }
        
        reject(error);
      });

      connection.on('close', (code, reason) => {
        if (!connectionOpened) {
          console.error('❌ FAIL: Connection closed before opening');
          console.error('   Code:', code);
          console.error('   Reason:', reason || 'No reason provided\n');
          reject(new Error('Connection closed prematurely'));
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!connectionOpened) {
          console.error('❌ FAIL: Connection timeout (10 seconds)');
          console.error('   No response from Deepgram\n');
          console.error('Possible issues:');
          console.error('- Network connectivity problems');
          console.error('- Firewall blocking WebSocket connections');
          console.error('- Deepgram API may be down\n');
          reject(new Error('Connection timeout'));
        }
      }, 10000);

    } catch (error) {
      console.error('❌ FAIL: Unexpected error\n');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      reject(error);
    }
  });
}

// Run the test
testDeepgramConnection()
  .then(() => {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed!\n');
    process.exit(1);
  });