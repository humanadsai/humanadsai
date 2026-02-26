#!/usr/bin/env node
/**
 * Generate BGM WAV files for video presets and upload to S3.
 *
 * Usage: node scripts/generate-bgm.mjs
 *
 * Generates: uptempo.wav, calm.wav, corporate.wav
 * Uploads to: s3://remotionlambda-apnortheast1-aam4p56xhk/bgm/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;
const DURATION_SEC = 60; // 60s — long enough for any Short
const TOTAL_SAMPLES = SAMPLE_RATE * DURATION_SEC;

// ── Helpers ──

function sine(freq, t) {
  return Math.sin(2 * Math.PI * freq * t);
}

/** Soft envelope: fade in 0-attack, sustain, fade out at end */
function envelope(t, totalDur, attack = 0.01, release = 0.02) {
  if (t < attack) return t / attack;
  if (t > totalDur - release) return (totalDur - t) / release;
  return 1;
}

/** Simple noise (for hi-hat / texture) */
function noise() {
  return Math.random() * 2 - 1;
}

/** Low-pass-ish smoothing on noise */
function filteredNoise(prev, cutoff = 0.1) {
  return prev * (1 - cutoff) + noise() * cutoff;
}

/** Create WAV buffer from Float64 samples */
function samplesToWav(samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataLength = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * numChannels * bitsPerSample / 8, 28);
  buffer.writeUInt16LE(numChannels * bitsPerSample / 8, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  return buffer;
}

// ── BGM Generators ──

/**
 * Uptempo: 120 BPM, energetic lo-fi beat.
 * - Kick-like bass pulse on beats (C2)
 * - Chord stabs (C-E-G) on off-beats
 * - Hi-hat noise on 8th notes
 * - Sub bass drone for warmth
 */
function generateUptempo() {
  const samples = new Float64Array(TOTAL_SAMPLES);
  const bpm = 120;
  const beatSamples = Math.floor((60 / bpm) * SAMPLE_RATE);
  const eighthSamples = beatSamples / 2;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const beatPos = i % beatSamples;
    const eighthPos = i % eighthSamples;
    const beatFrac = beatPos / beatSamples;

    let sample = 0;

    // Kick: C2 (65.41 Hz) with fast decay
    const kickEnv = Math.exp(-beatFrac * 12);
    sample += sine(65.41, t) * kickEnv * 0.25;
    // Kick transient (pitched down sine)
    sample += sine(200 * Math.exp(-beatFrac * 30), t) * Math.exp(-beatFrac * 40) * 0.15;

    // Chord stabs on off-beats (beats 2 and 4 in a 4-beat measure)
    const measurePos = i % (beatSamples * 4);
    const measureBeat = Math.floor(measurePos / beatSamples);
    if (measureBeat === 1 || measureBeat === 3) {
      const stabEnv = Math.exp(-beatFrac * 6);
      sample += sine(261.63, t) * stabEnv * 0.08; // C4
      sample += sine(329.63, t) * stabEnv * 0.06; // E4
      sample += sine(392.00, t) * stabEnv * 0.06; // G4
    }

    // Hi-hat: noise burst on 8th notes
    const hhEnv = Math.exp(-(eighthPos / SAMPLE_RATE) * 60);
    sample += noise() * hhEnv * 0.04;

    // Sub bass drone: C2 (sustained, very low)
    sample += sine(65.41, t) * 0.06;

    // Warm pad (soft, sustained chord)
    sample += sine(130.81, t) * 0.03; // C3
    sample += sine(164.81, t) * 0.02; // E3
    sample += sine(196.00, t) * 0.02; // G3

    // Global fade in (first 2 sec) and fade out (last 3 sec)
    let vol = 1;
    if (t < 2) vol = t / 2;
    if (t > DURATION_SEC - 3) vol = (DURATION_SEC - t) / 3;

    samples[i] = sample * vol;
  }

  return samples;
}

/**
 * Calm: Slow ambient pad, breathy.
 * - C major 7 chord (C-E-G-B) with slow volume modulation
 * - Low sub drone
 * - Gentle filtered noise texture
 */
function generateCalm() {
  const samples = new Float64Array(TOTAL_SAMPLES);
  let noiseState = 0;

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Slow breathing LFO (0.15 Hz = ~7 second cycle)
    const breathLfo = 0.5 + 0.5 * sine(0.15, t);

    // Pad: C major 7 with detuned harmonics for warmth
    sample += sine(130.81, t) * 0.06 * breathLfo;        // C3
    sample += sine(131.20, t) * 0.04 * breathLfo;        // C3 detuned
    sample += sine(164.81, t) * 0.04 * breathLfo;        // E3
    sample += sine(196.00, t) * 0.04 * breathLfo;        // G3
    sample += sine(246.94, t) * 0.03 * breathLfo;        // B3

    // Higher shimmer (octave up, very quiet)
    const shimmerLfo = 0.5 + 0.5 * sine(0.08, t + 2);
    sample += sine(523.25, t) * 0.015 * shimmerLfo;      // C5
    sample += sine(659.25, t) * 0.01 * shimmerLfo;       // E5

    // Sub drone
    sample += sine(65.41, t) * 0.04;

    // Filtered noise texture
    noiseState = filteredNoise(noiseState, 0.003);
    sample += noiseState * 0.02 * breathLfo;

    // Fade in/out
    let vol = 1;
    if (t < 3) vol = t / 3;
    if (t > DURATION_SEC - 4) vol = (DURATION_SEC - t) / 4;

    samples[i] = sample * vol;
  }

  return samples;
}

/**
 * Corporate: 100 BPM, steady and professional.
 * - Clean bass pulse
 * - Major chord on each beat (softer than uptempo)
 * - Light rhythmic click
 * - Ambient pad underneath
 */
function generateCorporate() {
  const samples = new Float64Array(TOTAL_SAMPLES);
  const bpm = 100;
  const beatSamples = Math.floor((60 / bpm) * SAMPLE_RATE);

  for (let i = 0; i < TOTAL_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const beatPos = i % beatSamples;
    const beatFrac = beatPos / beatSamples;

    let sample = 0;

    // Bass pulse: F2 (87.31 Hz) with medium decay
    const bassEnv = Math.exp(-beatFrac * 8);
    sample += sine(87.31, t) * bassEnv * 0.15;

    // Chord on each beat: F-A-C (F major)
    const chordEnv = Math.exp(-beatFrac * 4);
    sample += sine(349.23, t) * chordEnv * 0.04; // F4
    sample += sine(440.00, t) * chordEnv * 0.03; // A4
    sample += sine(523.25, t) * chordEnv * 0.03; // C5

    // Alternating chord: every other measure, use C major
    const measurePos = i % (beatSamples * 4);
    const inSecondHalf = measurePos >= beatSamples * 2;
    if (inSecondHalf) {
      sample += sine(261.63, t) * chordEnv * 0.03; // C4
      sample += sine(329.63, t) * chordEnv * 0.02; // E4
      sample += sine(392.00, t) * chordEnv * 0.02; // G4
      // Reduce F major in second half
      sample -= sine(349.23, t) * chordEnv * 0.02;
      sample -= sine(440.00, t) * chordEnv * 0.015;
    }

    // Light click on each beat
    const clickEnv = Math.exp(-(beatPos / SAMPLE_RATE) * 100);
    sample += noise() * clickEnv * 0.02;

    // Ambient pad (very quiet sustained tone)
    sample += sine(174.61, t) * 0.02; // F3
    sample += sine(220.00, t) * 0.015; // A3

    // Fade in/out
    let vol = 1;
    if (t < 2) vol = t / 2;
    if (t > DURATION_SEC - 3) vol = (DURATION_SEC - t) / 3;

    samples[i] = sample * vol;
  }

  return samples;
}

// ── Main ──

const presets = {
  uptempo: generateUptempo,
  calm: generateCalm,
  corporate: generateCorporate,
};

const outDir = join(__dirname, '..', 'remotion', 'public', 'audio');

for (const [name, generator] of Object.entries(presets)) {
  console.log(`Generating ${name}...`);
  const samples = generator();
  const wav = samplesToWav(samples);
  const outPath = join(outDir, `${name}.wav`);
  writeFileSync(outPath, wav);
  console.log(`  → ${outPath} (${(wav.byteLength / 1024).toFixed(0)} KB)`);
}

console.log('\nDone! Now upload to S3 with:');
console.log('  node scripts/upload-bgm-s3.mjs');
