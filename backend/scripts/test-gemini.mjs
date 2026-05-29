import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.GEMINI_API_KEY;
console.log("key_prefix:", key?.slice(0, 8), "length:", key?.length);

if (!key) {
  console.error("No GEMINI_API_KEY");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(key);
const models = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
];

for (const name of models) {
  try {
    const model = genAI.getGenerativeModel({ model: name });
    const r = await model.generateContent('Say {"ok":true} only');
    console.log(name, "->", r.response.text().trim().slice(0, 100));
    process.exit(0);
  } catch (e) {
    console.log(name, "-> FAIL:", e.message?.slice(0, 200));
  }
}
process.exit(1);
