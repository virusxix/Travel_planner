import "dotenv/config";
import OpenAI from "openai";

const key = process.env.GROQ_API_KEY;
if (!key) {
  console.error("No GROQ_API_KEY");
  process.exit(1);
}

const groq = new OpenAI({
  apiKey: key,
  baseURL: "https://api.groq.com/openai/v1",
});

const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

try {
  const r = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: 'Reply with JSON only: {"ok":true}' }],
    response_format: { type: "json_object" },
  });
  console.log("OK", model, "->", r.choices[0]?.message?.content?.slice(0, 80));
} catch (e) {
  console.error("FAIL:", e.message?.slice(0, 300));
  process.exit(1);
}
