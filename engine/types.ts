export interface JudgeScores {
  clarity: number;       // 0-10: Is intent clear and unambiguous?
  specificity: number;   // 0-10: Are instructions precise and detailed?
  context: number;       // 0-10: Is sufficient background/constraints provided?
  outputGuidance: number; // 0-10: Is desired output format/structure defined?
}

export interface JudgeResult {
  scores: JudgeScores;
  total: number;         // sum of all 4 scores (max 40)
  reasoning: string;     // why these scores were given
  weakestDimension: keyof JudgeScores;
}

export interface IterationResult {
  iteration: number;
  prompt: string;
  judgeResult: JudgeResult;
  improvements: string[]; // what the optimizer changed from previous iteration
}

export interface OptimizationResult {
  originalPrompt: string;
  finalPrompt: string;
  iterations: IterationResult[];
  scoreImprovement: number; // final.total - original.total
}

export interface OptimizerOutput {
  improvedPrompt: string;
  improvements: string[];
}
