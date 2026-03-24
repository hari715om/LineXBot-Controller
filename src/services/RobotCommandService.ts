/**
 * RobotCommandService
 *
 * High-level service that maps user actions and voice text
 * to Bluetooth commands via BluetoothService.
 */

import BluetoothService from './BluetoothService';
import {
  VOICE_COMMAND_MAP,
  VOICE_ALIASES,
  CMD_STOP,
} from '../constants/commands';

// ─── Levenshtein distance ─────────────────────────────────────────────────────
// Counts minimum single-character edits between two strings.
// Used to score how close a spoken word is to a known alias.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  // Build a (m+1) x (n+1) matrix
  const dp: number[][] = Array.from({length: m + 1}, (_, i) =>
    Array.from({length: n + 1}, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// ─── Similarity score (0–1) ───────────────────────────────────────────────────
// 1.0 = perfect match, 0.0 = completely different.
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ─── Confidence thresholds ────────────────────────────────────────────────────
// EXACT_THRESHOLD  — score required to accept a fuzzy match at all.
//                    0.65 means at least 65% similar. Below this we ignore it.
// STRONG_THRESHOLD — score where we trust the match without needing weight bonus.
//                    Prevents a high-weight but poor-scoring alias from winning.
const EXACT_THRESHOLD  = 0.65;
const STRONG_THRESHOLD = 0.80;

class RobotCommandService {
  private lastSentCommand: string | null = null;

  // ── Send a direct command character to the robot ──────────────────────────
  async sendCommand(command: string): Promise<boolean> {
    this.lastSentCommand = command;
    return BluetoothService.send(command);
  }

  // ── Convenience: stop ────────────────────────────────────────────────────
  async stop(): Promise<boolean> {
    return this.sendCommand(CMD_STOP);
  }

  // ── Reset debounce tracker when mic is toggled off ────────────────────────
  resetVoiceTracker(): void {
    this.lastSentCommand = null;
  }

  // ── Main voice processing ─────────────────────────────────────────────────
  async processVoiceCommand(spokenText: string): Promise<string | null> {
    const normalized = spokenText.toLowerCase().trim();
    if (!normalized) return null;

    // ── Step 1: Exact match (fastest path, check first) ───────────────────
    // Scan from end of string, prefer longer phrases at same position
    let exactCmd: string | null = null;
    let bestIndex  = -1;
    let bestLength = 0;

    for (const [phrase, cmd] of Object.entries(VOICE_COMMAND_MAP)) {
      const idx = normalized.lastIndexOf(phrase);
      if (idx === -1) continue;  // genuine miss — skip

      if (
        idx > bestIndex ||
        (idx === bestIndex && phrase.length > bestLength)
      ) {
        bestIndex  = idx;
        bestLength = phrase.length;
        exactCmd   = cmd;
      }
    }

    if (exactCmd) {
      return this.dispatchIfNew(exactCmd);
    }

    // ── Step 2: Fuzzy match (fallback for mispronunciations) ──────────────
    // Score every alias against every word/bigram in the spoken text.
    // We check individual words AND adjacent word pairs (bigrams) so that
    // "go forwurd" still matches "go forward" even with a typo.
    const words  = normalized.split(/\s+/);
    const tokens = [...words];

    // Add bigrams — adjacent word pairs
    for (let i = 0; i < words.length - 1; i++) {
      tokens.push(`${words[i]} ${words[i + 1]}`);
    }

    // Add trigrams — three-word combos (covers "go turn right" type phrases)
    for (let i = 0; i < words.length - 2; i++) {
      tokens.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    let fuzzyCmd:   string | null = null;
    let bestScore = 0;
    let bestWeight = 0;

    for (const alias of VOICE_ALIASES) {
      for (const token of tokens) {
        const score = similarity(token, alias.alias);

        // Below threshold — not similar enough, skip
        if (score < EXACT_THRESHOLD) continue;

        // Use a combined score that rewards both similarity and alias weight
        // Weight is normalized to 0–1 range (max weight is 10)
        const combinedScore = score * 0.75 + (alias.weight / 10) * 0.25;

        // Only replace current best if:
        // - Combined score is strictly better, OR
        // - Same combined score but this alias has higher weight
        if (
          combinedScore > bestScore ||
          (combinedScore === bestScore && alias.weight > bestWeight)
        ) {
          // Extra safety: if score is below STRONG_THRESHOLD,
          // only accept if this alias weight is higher than current best.
          // Prevents low-confidence weak matches from winning.
          if (score < STRONG_THRESHOLD && alias.weight <= bestWeight) continue;

          bestScore  = combinedScore;
          bestWeight = alias.weight;
          fuzzyCmd   = alias.cmd;
        }
      }
    }

    if (fuzzyCmd) {
      console.log(
        `[Voice] Fuzzy match: "${normalized}" → cmd "${fuzzyCmd}" (score: ${bestScore.toFixed(2)})`,
      );
      return this.dispatchIfNew(fuzzyCmd);
    }

    // Nothing matched — spoken text was too different from all known commands
    console.log(`[Voice] No match for: "${normalized}"`);
    return null;
  }

  // ── Only send if different from last command (prevents duplicate fires) ───
  private async dispatchIfNew(cmd: string): Promise<string | null> {
    if (cmd !== this.lastSentCommand) {
      await this.sendCommand(cmd);
      return cmd;
    }
    return cmd; // still return it so UI can display, just don't resend
  }
}

export default new RobotCommandService();
