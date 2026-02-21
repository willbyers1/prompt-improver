
export interface PromptStats {
  characters: number;
  words: number;
}

export interface EnhancementResult {
  text: string;
  stats: PromptStats;
}
