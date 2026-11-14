import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callLLM, MAX_CHAT_ANALYSIS_CHARS, MAX_CHAT_DOC_CHARS } from "../_shared/llm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const createUserClient = (authHeader: string) =>
  createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    const supabase = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Invalid demo session." }, 401);
    }

    const { documentId, question } = await req.json();

    if (!documentId || !String(question ?? "").trim()) {
      return jsonResponse({ error: "Document id and question are required." }, 400);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("filename, content, analysis, analysis_status")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      return jsonResponse({ error: "Document not found for this demo session." }, 404);
    }

    if (document.analysis_status !== "completed") {
      return jsonResponse({ error: "Document analysis is not complete yet." }, 409);
    }

    const answer = await callLLM([
      {
        role: "system",
        content:
          "You answer questions about one uploaded contract for a portfolio demo. Use only the provided document text and prior analysis. If the answer is not in the document, say that clearly and suggest what clause the user should look for. Keep answers concise, quote only short phrases when useful, and do not provide legal advice.",
      },
      {
        role: "user",
        content: `Document: ${document.filename}\n\nAnalysis:\n${String(document.analysis ?? "").substring(0, MAX_CHAT_ANALYSIS_CHARS)}\n\nText:\n${String(
          document.content ?? "",
        ).substring(0, MAX_CHAT_DOC_CHARS)}\n\nQuestion: ${String(question).trim()}`,
      },
    ], 800);

    const cleaned = String(answer ?? "").replace(/【[^】]*】/g, "").trim();
    return jsonResponse({ answer: cleaned || "I could not find a clear answer in this document." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in chat-document function:", message);
    return jsonResponse({ error: message }, 500);
  }
});
