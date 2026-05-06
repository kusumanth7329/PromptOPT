import "dotenv/config";
import { runOptimization } from "./engine/index.js";

const TEST_PROMPT = "Write a blog post about AI.";

async function main() {
  console.log("=== Prompt Optimizer ===\n");
  console.log(`Original prompt: "${TEST_PROMPT}"\n`);

  const result = await runOptimization(TEST_PROMPT, 3);

  for (const iter of result.iterations) {
    console.log(`--- Iteration ${iter.iteration} ---`);
    console.log(`Score: ${iter.judgeResult.total}/40`);
    console.log(`  clarity=${iter.judgeResult.scores.clarity}  specificity=${iter.judgeResult.scores.specificity}  context=${iter.judgeResult.scores.context}  outputGuidance=${iter.judgeResult.scores.outputGuidance}`);
    console.log(`Reasoning: ${iter.judgeResult.reasoning}`);
    if (iter.improvements.length > 0) {
      console.log("Changes made:");
      iter.improvements.forEach((imp) => console.log(`  • ${imp}`));
    }
    console.log(`Prompt:\n  ${iter.prompt}\n`);
  }

  console.log("=== Final Result ===");
  console.log(`Score improvement: +${result.scoreImprovement} points`);
  console.log(`\nFinal prompt:\n${result.finalPrompt}`);
}

main().catch(console.error);
