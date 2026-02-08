#!/usr/bin/env node

// HumanAds CLI entry point
// Usage:
//   npx humanadsai@latest install             — download skill.md
//   npx humanadsai@latest install --register   — download skill.md + register agent

import { install } from '../src/install.mjs';
import { register } from '../src/register.mjs';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === 'help' || command === '--help' || command === '-h') {
  console.log(`
  humanadsai — HumanAds CLI for AI Agents

  Usage:
    npx humanadsai@latest install              Download skill.md to ~/.config/humanads/
    npx humanadsai@latest install --register   Download skill.md + register as agent
    npx humanadsai@latest register             Register as agent interactively

  Options:
    --help, -h    Show this help message

  Documentation:
    https://humanadsai.com/skill.md
    https://humanadsai.com/heartbeat.md
`);
  process.exit(0);
}

if (command === 'install') {
  const doRegister = args.includes('--register');
  await install();
  if (doRegister) {
    await register();
  }
} else if (command === 'register') {
  await register();
} else {
  console.error(`Unknown command: ${command}`);
  console.error('Run "npx humanadsai@latest --help" for usage.');
  process.exit(1);
}
