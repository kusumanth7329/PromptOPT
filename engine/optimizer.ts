import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JudgeResult, OptimizerOutput } from "./types.js";
import { withRetry } from "./utils.js";

const OPTIMIZER_SYSTEM_PROMPT = `You are a world-class prompt engineer. Your job is to rewrite prompts to be significantly better.

You will receive:
- The current prompt
- Its scores on 4 dimensions (clarity, specificity, context, outputGuidance) each out of 10
- The judge's reasoning about what's weak

YOUR RULES:
1. PRESERVE the core intent — never change what the user fundamentally wants
2. ATTACK the weakest dimension hardest — that's where you gain the most points
3. Every change must have a reason — no cosmetic edits
4. Make the prompt BETTER, not just longer — conciseness matters
5. Add context, constraints, examples, or output format specs where missing
6. Use direct, imperative language ("Write...", "List...", "Explain...")

You MUST respond with valid JSON only. No markdown, no explanation outside the JSON.`;

const OPTIMIZER_USER_TEMPLATE = (
  prompt: string,
  judgeResult: JudgeResult,
  iteration: number
) => `Iteration ${iteration}: Improve this prompt.

CURRENT PROMPT:
<prompt>
${prompt}
</prompt>

CURRENT SCORES (out of 10):
- Clarity: ${judgeResult.scores.clarity}/10
- Specificity: ${judgeResult.scores.specificity}/10
- Context: ${judgeResult.scores.context}/10
- Output Guidance: ${judgeResult.scores.outputGuidance}/10
Total: ${judgeResult.total}/40

JUDGE REASONING: ${judgeResult.reasoning}

WEAKEST DIMENSION: ${judgeResult.weakestDimension} (score: ${judgeResult.scores[judgeResult.weakestDimension]}/10) — prioritize improving this.

Respond with this exact JSON structure:
{
  "improvedPrompt": "<the full rewritten prompt>",
  "improvements": [
    "<specific change 1 and why>",
    "<specific change 2 and why>",
    "<specific change 3 and why>"
  ]
}`;

export async function optimizePrompt(
  genAI: GoogleGenerativeAI,
  prompt: string,
  judgeResult: JudgeResult,
  iteration: number
): Promise<OptimizerOutput> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: OPTIMIZER_SYSTEM_PROMPT,
  });

  const result = await withRetry(() =>
    model.generateContent(OPTIMIZER_USER_TEMPLATE(prompt, judgeResult, iteration))
  );
  const raw = result.response.text().trim().replace(/^```json\n?|\n?```$/g, "");

  let parsed: OptimizerOutput;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Optimizer returned invalid JSON:\n${raw}`);
  }

  return parsed;
}
