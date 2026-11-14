// Single place for the LLM provider settings (Groq, OpenAI-compatible endpoint).
export const LLM_MODEL = "openai/gpt-oss-120b";
export const LLM_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

// Groq's free tier allows a small number of tokens per minute, so request sizes are capped.
// ~4 characters per token for English prose.
export const MAX_ANALYZE_CHARS = 12000;
export const MAX_CHAT_DOC_CHARS = 8000;
export const MAX_CHAT_ANALYSIS_CHARS = 4000;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Calls the LLM and returns the trimmed text of the first choice (may be empty).
// Throws Errors with user-facing messages for rate-limit, quota and auth problems.
export async function callLLM(messages: ChatMessage[], maxCompletionTokens = 1500): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(LLM_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      reasoning_effort: "low",
      max_completion_tokens: maxCompletionTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("LLM API error:", response.status, errorText);

    if (response.status === 429) {
      throw new Error("The AI service is rate limited or its free quota is used up. Please try again in a minute.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("The AI service rejected the API key. Check GROQ_API_KEY.");
    }
    throw new Error("The AI service returned an error. Please try again.");
  }

  const data = await response.json();
  return String(data.choices?.[0]?.message?.content ?? "").trim();
}
