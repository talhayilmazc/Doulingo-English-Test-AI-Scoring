import fetch from "node-fetch";

export async function handler(event) {
  try {
    const { text, imageUrl } = JSON.parse(event.body);

    const prompt = `
You are a Duolingo English Test writing evaluator.

Rules:
- Score from 0 to 160
- Be strict
- No guessing countries or identities
- Penalize grammar mistakes
- Penalize numbers (use words instead)
- Reward clear structure:
  "In the picture", "In the foreground", "In the background", "Overall"

Photo URL:
${imageUrl}

Student answer:
"${text}"

Return ONLY JSON in this format:
{
  "score": number,
  "feedback": "short explanation"
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return {
      statusCode: 200,
      body: content
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
