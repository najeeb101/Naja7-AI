// Single place for the LLM provider settings (Google Gemini, OpenAI-compatible endpoint).
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

// Calls Gemini and returns the trimmed text of the first choice (may be empty).
// Throws Errors with user-facing messages for rate-limit, quota and auth problems.
export async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(GEMINI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: GEMINI_MODEL, messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);

    if (response.status === 429) {
      throw new Error("The AI service is rate limited or its free quota is used up. Please try again in a minute.");
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error("The AI service rejected the API key. Check GEMINI_API_KEY.");
    }
    throw new Error("The AI service returned an error. Please try again.");
  }

  const data = await response.json();
  return String(data.choices?.[0]?.message?.content ?? "").trim();
}
