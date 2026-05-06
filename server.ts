import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { runOptimization } from "./engine/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/optimize", async (req, res) => {
  const { prompt, iterations = 3 } = req.body as { prompt: string; iterations?: number };

  if (!prompt?.trim()) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let closed = false;
  req.on("close", () => { closed = true; });

  const send = (type: string, data: unknown) => {
    if (!closed) res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
  };

  try {
    const result = await runOptimization(prompt, iterations, (iter) => send("iteration", iter));
    send("done", { scoreImprovement: result.scoreImprovement, finalPrompt: result.finalPrompt });
  } catch (err: unknown) {
    send("error", { message: (err as Error).message });
  } finally {
    res.end();
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
