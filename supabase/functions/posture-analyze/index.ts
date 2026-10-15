import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POSTURE_SYSTEM_PROMPT = `You are an expert biomechanics AI that analyzes body pose landmarks to evaluate exercise form. You receive landmark data from MediaPipe Pose (33 landmarks with x, y, z coordinates and visibility scores).

Key landmarks:
- 11/12: Left/Right shoulder
- 13/14: Left/Right elbow
- 15/16: Left/Right wrist
- 23/24: Left/Right hip
- 25/26: Left/Right knee
- 27/28: Left/Right ankle

When analyzing:
1. Calculate joint angles from the landmarks provided
2. Evaluate form based on the exercise type
3. Give a posture score from 0-100
4. Provide specific, actionable corrections

For push-ups: Check shoulder-elbow-wrist alignment, hip sag, head position, elbow angle at bottom
For squats: Check knee tracking over toes, back angle, depth, weight distribution

You MUST respond using the provided tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { landmarks, exerciseType, jointAngles } = await req.json();
    const apiKey = Deno.env.get("AI_API_KEY") || Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("AI_API_KEY is not configured");
    }

    const prompt = `Analyze this ${exerciseType || "general"} exercise form.

Joint angles: ${JSON.stringify(jointAngles)}

Key landmark positions (normalized 0-1):
- Left shoulder: (${landmarks?.[11]?.x?.toFixed(3)}, ${landmarks?.[11]?.y?.toFixed(3)})
- Right shoulder: (${landmarks?.[12]?.x?.toFixed(3)}, ${landmarks?.[12]?.y?.toFixed(3)})
- Left hip: (${landmarks?.[23]?.x?.toFixed(3)}, ${landmarks?.[23]?.y?.toFixed(3)})
- Right hip: (${landmarks?.[24]?.x?.toFixed(3)}, ${landmarks?.[24]?.y?.toFixed(3)})
- Left knee: (${landmarks?.[25]?.x?.toFixed(3)}, ${landmarks?.[25]?.y?.toFixed(3)})
- Right knee: (${landmarks?.[26]?.x?.toFixed(3)}, ${landmarks?.[26]?.y?.toFixed(3)})
- Left ankle: (${landmarks?.[27]?.x?.toFixed(3)}, ${landmarks?.[27]?.y?.toFixed(3)})
- Right ankle: (${landmarks?.[28]?.x?.toFixed(3)}, ${landmarks?.[28]?.y?.toFixed(3)})
- Left elbow: (${landmarks?.[13]?.x?.toFixed(3)}, ${landmarks?.[13]?.y?.toFixed(3)})
- Right elbow: (${landmarks?.[14]?.x?.toFixed(3)}, ${landmarks?.[14]?.y?.toFixed(3)})

Evaluate the form and provide a score with feedback.`;

    const gatewayUrl = Deno.env.get("AI_GATEWAY_URL") || "https://openrouter.ai/api/v1/chat/completions";

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("AI_MODEL") || "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: POSTURE_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "posture_analysis",
              description: "Return posture analysis results",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Posture score 0-100" },
                  status: { type: "string", enum: ["excellent", "good", "fair", "poor"], description: "Overall status" },
                  feedback: { type: "string", description: "Brief feedback sentence" },
                  corrections: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of specific corrections needed"
                  },
                },
                required: ["score", "status", "feedback", "corrections"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "posture_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      score: 50, status: "fair", feedback: "Could not fully analyze pose.", corrections: [] 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Posture analyze error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
