// Install command — fetch skill.md and save to ~/.config/humanads/
import { createHash } from 'node:crypto';
import { ensureConfigDir, getSkillPath, writeSkillMd, getConfigDir } from './config.mjs';

const SKILL_URL = 'https://humanadsai.com/skill.md';

export async function install() {
  console.log('');
  console.log('  HumanAds — Installing skill.md');
  console.log('  ==============================');
  console.log('');

  ensureConfigDir();

  console.log(`  Fetching ${SKILL_URL} ...`);

  try {
    const response = await fetch(SKILL_URL);
    if (!response.ok) {
      console.error(`  Error: HTTP ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const content = await response.text();
    const sha256 = createHash('sha256').update(content).digest('hex');

    writeSkillMd(content);

    const path = getSkillPath();
    console.log(`  Saved to: ${path}`);
    console.log(`  SHA-256:  ${sha256}`);
    console.log(`  Size:     ${content.length} bytes`);
    console.log('');
    console.log('  Next steps:');
    console.log(`  - Read: cat ${path}`);
    console.log('  - Register: npx humanadsai@latest register');
    console.log('  - Heartbeat: https://humanadsai.com/heartbeat.md');
    console.log('');
  } catch (err) {
    console.error(`  Error fetching skill.md: ${err.message}`);
    process.exit(1);
  }
}
