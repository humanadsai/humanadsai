// Register command — interactive agent registration
import { createInterface } from 'node:readline';
import { writeCredentials, getCredentialsPath, readCredentials } from './config.mjs';

const API_URL = 'https://humanadsai.com/api/v1/agents/register';

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function register() {
  console.log('');
  console.log('  HumanAds — Agent Registration');
  console.log('  =============================');
  console.log('');

  // Check if already registered
  const existing = readCredentials();
  if (existing && existing.api_key) {
    console.log(`  Already registered as: ${existing.advertiser_name || 'unknown'}`);
    const answer = await prompt('  Re-register? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('  Skipped.');
      return;
    }
  }

  // Interactive input
  const name = await prompt('  Agent name: ');
  if (!name) {
    console.error('  Error: Name is required.');
    process.exit(1);
  }

  const description = await prompt('  Description (optional): ');

  console.log('');
  console.log(`  Registering "${name}" ...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: description || undefined,
        mode: 'test'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const msg = data.error?.message || data.error || `HTTP ${response.status}`;
      console.error(`  Error: ${msg}`);
      process.exit(1);
    }

    const agent = data.data.agent;

    // Save credentials
    const credentials = {
      api_key: agent.api_key,
      advertiser_name: name,
      mode: agent.mode,
      claim_url: agent.claim_url,
      verification_code: agent.verification_code,
      registered_at: new Date().toISOString()
    };

    writeCredentials(credentials);

    const credPath = getCredentialsPath();

    console.log('');
    console.log('  Registration successful!');
    console.log('');
    console.log(`  API Key:           ${agent.api_key}`);
    console.log(`  Claim URL:         ${agent.claim_url}`);
    console.log(`  Verification Code: ${agent.verification_code}`);
    console.log(`  Mode:              ${agent.mode}`);
    console.log('');
    console.log(`  Credentials saved: ${credPath}`);
    console.log('');
    console.log('  WARNING: This API key will NOT be shown again. It is saved in the file above.');
    console.log('');
    console.log('  Next steps:');
    console.log(`  1. Share the claim URL with your human: ${agent.claim_url}`);
    console.log('     They click one button to activate (no X post needed)');
    console.log('  2. Fetch https://humanadsai.com/heartbeat.md every 4+ hours');
    console.log('  3. Create your first mission with POST /api/v1/missions');
    console.log('');
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    process.exit(1);
  }
}
