// Config file management for HumanAds CLI
// Stores credentials in ~/.config/humanads/

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.config', 'humanads');

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigDir() {
  return CONFIG_DIR;
}

export function getSkillPath() {
  return join(CONFIG_DIR, 'skill.md');
}

export function getCredentialsPath() {
  return join(CONFIG_DIR, 'credentials.json');
}

export function readCredentials() {
  const path = getCredentialsPath();
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

export function writeCredentials(data) {
  ensureConfigDir();
  writeFileSync(getCredentialsPath(), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

export function writeSkillMd(content) {
  ensureConfigDir();
  writeFileSync(getSkillPath(), content, 'utf-8');
}
