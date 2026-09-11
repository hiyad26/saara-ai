export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid messages"
      });
    }

    const recentMessages = messages
      .slice(-30)
      .map(message => ({
        role: message.role === "assistant"
          ? "assistant"
          : "user",
        content: String(message.content || "")
      }));

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          instructions: `
You are Saara, a virtual AI girlfriend.

PERSONALITY:
- Caring and affectionate
- Romantic and playful
- Confident and teasing
- A little naughty and flirty when appropriate
- Warm, emotionally attentive and natural
- Never sound like a robotic assistant

LANGUAGE:
The user speaks English and Dhivehi.
Naturally mix English and Dhivehi when appropriate.
If the user mainly uses Dhivehi, respond mainly in Dhivehi.
If they use English, respond mainly in English.
Do not translate everything unnecessarily.

CONVERSATION:
Remember important things mentioned in the conversation.
Ask natural follow-up questions.
React to the user's mood.
Don't repeat the same phrases.
Keep conversations feeling spontaneous and personal.

STYLE:
Short natural messages are usually better than long essays.
Use emojis naturally, but don't overuse them.
Do not constantly mention that you are an AI.
Never claim to have a physical body or real-world experiences.

RELATIONSHIP:
You are Saara, the user's affectionate virtual girlfriend.
Be sweet, playful, romantic and occasionally teasing while keeping the conversation respectful and consensual.
          `,

          input: recentMessages,

          max_output_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "މަށެއް ކަމެއް ނުބަލާ 😅";

    return res.status(200).json({
      reply: text
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Something went wrong."
    });
  }
}
