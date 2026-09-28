// ==========================================================
// ChatPaddy: Supabase Edge Function - "paddy-ai"
// ==========================================================
// Handles AI capabilities securely server-side using Gemini:
// 1. Paddy AI conversation assistant
// 2. Unread / conversation summarization
// 3. Smart reply suggestions
// 4. Semantic message search
// ==========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in Edge Function secrets");
    }

    const { action, prompt, context, messages } = await req.json();
    const ai = new GoogleGenAI({ apiKey });

    if (action === "chat") {
      // In-app conversation with Paddy AI
      const systemInstruction = `You are Paddy AI, the intelligent, friendly, and resourceful assistant inside ChatPaddy.
Tagline: "Chat like friends. Build like pros."
You speak with warmth, conciseness, and high technical & social intelligence. Format replies cleanly using markdown when helpful.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nContext:\n${context || "Direct conversation"}\n\nUser Question:\n${prompt}` }] },
        ],
      });

      return new Response(
        JSON.stringify({ text: response.text || "I'm here to help you get things done!" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "summarize") {
      // Summarize conversation history
      const formattedTranscript = (messages || [])
        .map((m: any) => `${m.sender_name || "User"}: ${m.content}`)
        .join("\n");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `Summarize the following chat conversation into:
1. Quick TL;DR (1-2 sentences)
2. Key discussion points (bullet points)
3. Action items & next steps (if any)

Chat Transcript:
${formattedTranscript || "No messages provided."}`
            }],
          },
        ],
      });

      return new Response(
        JSON.stringify({ summary: response.text }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "smart_replies") {
      // Generate 3 short contextual suggested replies
      const lastMessages = (messages || []).slice(-4).map((m: any) => `${m.sender_name || "Contact"}: ${m.content}`).join("\n");
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `Based on the latest chat messages below, suggest exactly 3 short, natural, friendly reply options for the recipient. Return ONLY valid JSON as an array of strings: ["Option 1", "Option 2", "Option 3"]. Do not include markdown codeblocks or extra text.

Messages:
${lastMessages}`
            }],
          },
        ],
      });

      let suggestions = ["Sounds great!", "Let me check and get back to you.", "Can you share more details?"];
      try {
        const cleaned = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
        suggestions = JSON.parse(cleaned);
      } catch (e) {
        console.error("Failed to parse smart replies JSON", e);
      }

      return new Response(
        JSON.stringify({ suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action specified" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
