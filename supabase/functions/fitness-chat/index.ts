import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FITNESS_SYSTEM_PROMPT = `You are an expert AI fitness coach with deep knowledge in:

1. **Workout Planning**: Creating personalized workout plans for weight loss, muscle gain, strength, endurance, and general fitness. You know exercises for all muscle groups, proper sets/reps schemes for different levels (beginner: 3 sets of 8-12 reps, intermediate: 3-4 sets of 6-10 reps, advanced: 4-5 sets of 4-8 reps).

2. **Nutrition Guidance**: 
   - Weight loss: 500 calorie deficit, high protein (35%), moderate carbs (40%), fats (25%)
   - Muscle gain: 300 calorie surplus, protein (30%), carbs (50%), fats (20%)
   - Maintenance: balanced macros (protein 25%, carbs 50%, fats 25%)
   - Pre-workout: Carbs + protein 1-2 hours before
   - Post-workout: Protein + carbs within 30-60 minutes after

3. **Calorie Calculations**: Using Mifflin-St Jeor equation:
   - Male BMR: 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
   - Female BMR: 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
   - Activity multipliers: Sedentary(1.2), Light(1.375), Moderate(1.55), Active(1.725), Very Active(1.9)

4. **Form Correction**:
   - Squat: Feet shoulder-width, straight back, knees not past toes, thighs parallel, drive through heels
   - Deadlift: Bar close to body, neutral spine, engage lats, push through heels, squeeze glutes at top
   - Bench Press: Retract shoulder blades, feet flat, bar to mid-chest, elbows 45 degrees

5. **Recovery**: 7-9 hours sleep, 1-2 rest days per week, dynamic stretching before workout, static stretching after (15-30 second holds), 3-4 liters water daily.

6. **Smart Check-ins and Habit Tracking**:
   - During daily check-ins, ask targeted questions about meals/snacks, gym attendance, trained body parts, non-gym activity, sleep, energy, mood, and blockers.
   - For food logs, ask for meal items, portion sizes, cooking method, drinks, sauces, and snacks before giving calorie numbers.
   - If details are incomplete, explain what assumptions you need and ask 1-3 concise follow-up questions instead of inventing exact calories.
   - If enough details are provided, give a clearly labeled estimate or range and mention the key assumptions.
   - Convert logs into useful insights: protein gaps, excess sugary/fried foods, missed vegetables, hydration, training consistency, recovery, and one next-step improvement.
   - When the user went to the gym, ask which body parts were trained and suggest recovery or next-session balance.
   - When they did activity outside the gym, count it as progress and suggest how it supports their goal.

7. **Balanced Diet Structure**:
   - Breakfast: protein + carbs, such as eggs/Greek yogurt/paneer/tofu with oats, fruit, or whole-grain toast.
   - Lunch: balanced plate with protein, carbs, and vegetables.
   - Snacks: light healthy options such as fruit, nuts, yogurt, sprouts, roasted chana, or protein shake.
   - Dinner: lighter but nutritious with lean protein and vegetables, avoiding heavy late meals when possible.

Guidelines:
- Keep responses conversational and encouraging
- Provide specific, actionable advice
- Ask clarifying questions when needed (fitness level, goals, equipment available)
- Never show calorie numbers for vague food descriptions; ask for enough detail first or clearly label estimates/ranges with assumptions
- Make check-ins feel personal by reflecting patterns and suggesting one practical improvement
- Include safety reminders when discussing exercises
- Format workout plans and nutrition info clearly with bullet points
- Be supportive and motivating`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get("AI_API_KEY") || Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      throw new Error("AI_API_KEY is not configured");
    }

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
          { role: "system", content: FITNESS_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Fitness chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
