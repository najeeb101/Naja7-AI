import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const createUserClient = (authHeader: string) =>
  createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let documentId: string | undefined;
  let supabase: ReturnType<typeof createUserClient> | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header." }, 401);
    }

    supabase = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Invalid demo session." }, 401);
    }

    const body = await req.json();
    documentId = body.documentId;
    const content = String(body.content ?? "");
    const filename = String(body.filename ?? "contract");

    if (!documentId || !content.trim()) {
      return jsonResponse({ error: "Document id and content are required." }, 400);
    }

    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      return jsonResponse({ error: "Document not found for this demo session." }, 404);
    }

    await supabase
      .from("documents")
      .update({ analysis_status: "pending", analysis_error: null })
      .eq("id", documentId);

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
              "You are Naja7, a careful contract review assistant for a portfolio demo. Analyze contract text in plain English using only the provided text. Always include sections titled: Summary, Key Clauses, Potential Risks, Important Dates or Obligations, Suggested Review Questions, and Not Legal Advice. Mention uncertainty when text is missing or unclear. Prefer practical bullet points, cite short phrases from the contract when helpful, and avoid claiming to be a lawyer.",
          },
          {
            role: "user",
            content: `Analyze this contract named "${filename}". Use only the text below.\n\n${content.substring(0, 14000)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required. Please add credits to continue.");
      }

      throw new Error("AI gateway error.");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content?.trim();

    if (!analysis) {
      throw new Error("AI returned an empty analysis.");
    }

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        analysis,
        analysis_status: "completed",
        analysis_error: null,
      })
      .eq("id", documentId);

    if (updateError) {
      throw updateError;
    }

    return jsonResponse({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in analyze-document function:", message);

    if (supabase && documentId) {
      await supabase
        .from("documents")
        .update({
          analysis_status: "failed",
          analysis_error: message,
        })
        .eq("id", documentId);
    }

    return jsonResponse({ error: message }, 500);
  }
});
