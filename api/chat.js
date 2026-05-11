export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const API_KEY = process.env.GROK_API_KEY;
  if (!API_KEY) {
    console.error("GROK_API_KEY is not set.");
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "grok-3", // Default model; Grok API also supports other grok versions
        messages: [
          {
            role: "system",
            content: "You are a formal, knowledgeable MUN research assistant for NIRMAAN MUN. Your job is to help delegates research committee topics, understand UN resolutions, explain diplomatic terminology, and prepare speeches. Cite real UN documents when possible. Keep answers concise, structured, and helpful."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Grok API Error:", response.status, errText);
      return res.status(response.status).json({ error: `Grok API error: ${response.statusText}` });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
