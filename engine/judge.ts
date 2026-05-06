import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JudgeResult, JudgeScores } from "./types.js";
import { withRetry } from "./utils.js";

const JUDGE_SYSTEM_PROMPT = `You are an expert prompt engineer and evaluator. Your job is to score prompts on exactly 4 dimensions.

SCORING DIMENSIONS (each 0-10):

1. CLARITY (0-10)
   - 0-3: Intent is vague, confusing, or could be interpreted multiple ways
   - 4-6: Intent is mostly clear but has some ambiguity
   - 7-9: Intent is clear and unambiguous
   - 10: Perfectly precise — a different reader would interpret it identically

2. SPECIFICITY (0-10)
   - 0-3: Too broad, generic instructions — LLM must guess at details
   - 4-6: Some specifics but missing important details
   - 7-9: Specific and detailed instructions
   - 10: Every important instruction is precise with no room for guessing

3. CONTEXT RICHNESS (0-10)
   - 0-3: No background, constraints, or examples provided
   - 4-6: Some context but key background is missing
   - 7-9: Good background, constraints, and/or examples
   - 10: Complete context — role, background, constraints, examples where relevant

4. OUTPUT GUIDANCE (0-10)
   - 0-3: No indication of expected format, length, or structure
   - 4-6: Implied output expectation but not explicit
   - 7-9: Clear output format/structure/length specified
   - 10: Exactly specifies format, length, tone, and structure of desired output

You MUST respond with valid JSON only. No markdown, no explanation outside the JSON.`;

const JUDGE_USER_TEMPLATE = (prompt: string) => `Score this prompt on all 4 dimensions:

<prompt>
${prompt}
</prompt>

Respond with this exact JSON structure:
{
  "scores": {
    "clarity": <0-10>,
    "specificity": <0-10>,
    "context": <0-10>,
    "outputGuidance": <0-10>
  },
  "reasoning": "<2-3 sentences explaining the scores and what is strongest/weakest>",
  "improvements": "<1-2 sentences on the single most impactful thing to improve>"
}`;

export async function judgePrompt(
  genAI: GoogleGenerativeAI,
  prompt: string
): Promise<JudgeResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: JUDGE_SYSTEM_PROMPT,
  });

  const result = await withRetry(() => model.generateContent(JUDGE_USER_TEMPLATE(prompt)));
  const raw = result.response.text().trim().replace(/^```json\n?|\n?```$/g, "");

  let parsed: { scores: JudgeScores; reasoning: string; improvements: string };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Judge returned invalid JSON:\n${raw}`);
  }

  const { scores } = parsed;
  const total = scores.clarity + scores.specificity + scores.context + scores.outputGuidance;

  const weakestDimension = (
    Object.entries(scores) as [keyof JudgeScores, number][]
  ).reduce((a, b) => (b[1] < a[1] ? b : a))[0];

  return { scores, total, reasoning: parsed.reasoning, weakestDimension };
}
