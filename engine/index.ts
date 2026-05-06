import { GoogleGenerativeAI } from "@google/generative-ai";
import { judgePrompt } from "./judge.js";
import { optimizePrompt } from "./optimizer.js";
import { sleep } from "./utils.js";
import type { OptimizationResult, IterationResult } from "./types.js";

export async function runOptimization(
  prompt: string,
  maxIterations: number = 3,
  onIteration?: (result: IterationResult) => void
): Promise<OptimizationResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const iterations: IterationResult[] = [];

  const originalJudge = await judgePrompt(genAI, prompt);
  const iter0: IterationResult = { iteration: 0, prompt, judgeResult: originalJudge, improvements: [] };
  iterations.push(iter0);
  onIteration?.(iter0);

  let currentPrompt = prompt;
  let currentJudge = originalJudge;

  for (let i = 1; i <= maxIterations; i++) {
    await sleep(2000);
    const optimizerOutput = await optimizePrompt(genAI, currentPrompt, currentJudge, i);
    await sleep(2000);
    const newJudge = await judgePrompt(genAI, optimizerOutput.improvedPrompt);

    const iter: IterationResult = {
      iteration: i,
      prompt: optimizerOutput.improvedPrompt,
      judgeResult: newJudge,
      improvements: optimizerOutput.improvements,
    };
    iterations.push(iter);
    onIteration?.(iter);

    currentPrompt = optimizerOutput.improvedPrompt;
    currentJudge = newJudge;
  }

  return {
    originalPrompt: prompt,
    finalPrompt: currentPrompt,
    iterations,
    scoreImprovement: currentJudge.total - originalJudge.total,
  };
}
