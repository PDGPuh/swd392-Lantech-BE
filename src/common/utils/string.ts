/**
 * Calculate word-level similarity between two strings.
 * Used for pronunciation scoring.
 * Returns a score from 0 to 100.
 */
export function calculateSimilarityScore(target: string, transcript: string): number {
  const targetWords = normalizeText(target).split(/\s+/).filter(Boolean);
  const transcriptWords = normalizeText(transcript).split(/\s+/).filter(Boolean);

  if (targetWords.length === 0) return 0;
  if (transcriptWords.length === 0) return 0;

  let matchCount = 0;
  const usedIndices = new Set<number>();

  for (const targetWord of targetWords) {
    for (let i = 0; i < transcriptWords.length; i++) {
      if (!usedIndices.has(i) && targetWord === transcriptWords[i]) {
        matchCount++;
        usedIndices.add(i);
        break;
      }
    }
  }

  // Score based on matched words vs total target words
  const accuracy = matchCount / targetWords.length;
  // Penalty for extra words
  const extraPenalty = Math.max(0, transcriptWords.length - targetWords.length) * 0.02;

  return Math.round(Math.max(0, Math.min(100, accuracy * 100 - extraPenalty * 100)));
}

/**
 * Get word-level feedback comparing target and transcript
 */
export function getWordLevelFeedback(
  target: string,
  transcript: string,
): Array<{ word: string; status: 'correct' | 'incorrect' | 'missing' }> {
  const targetWords = normalizeText(target).split(/\s+/).filter(Boolean);
  const transcriptWords = normalizeText(transcript).split(/\s+/).filter(Boolean);

  return targetWords.map((word, index) => {
    if (index < transcriptWords.length && word === transcriptWords[index]) {
      return { word, status: 'correct' as const };
    } else if (transcriptWords.includes(word)) {
      return { word, status: 'correct' as const }; // word exists but in different position
    } else {
      return { word, status: 'missing' as const };
    }
  });
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Simple Levenshtein distance (used as fallback)
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
