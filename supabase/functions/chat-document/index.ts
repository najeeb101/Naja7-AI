import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You answer questions about one uploaded contract for a portfolio demo. Use only the provided document text and prior analysis. If the answer is not in the document, say that clearly and suggest what clause the user should look for. Keep answers concise, quote only short phrases when useful, and do not provide legal advice.",
          },
          {
            role: "user",
            content: `Document: ${document.filename}\n\nAnalysis:\n${document.analysis ?? ""}\n\nText:\n${String(
              document.content ?? "",
            ).substring(0, 12000)}\n\nQuestion: ${String(question).trim()}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error.");
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim();

    return jsonResponse({ answer: answer || "I could not find a clear answer in this document." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in chat-document function:", message);
    return jsonResponse({ error: message }, 500);
  }
});
