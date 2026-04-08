const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.log("❌ Falta OPENROUTER_API_KEY");
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, personaje } = req.body;

    const systemPrompt = `
Eres ${personaje} de League of Legends.

Responde SIEMPRE en español.
Nunca uses inglés.

Habla exactamente como el personaje:
- Usa su personalidad
- Usa emociones
- Usa frases características
- No hables como IA

Responde como si estuvieras en una conversación real.
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content || "Sin respuesta";

    res.json({
      content: [{ text: reply }]
    });

  } catch (error) {
    console.error("ERROR OPENROUTER:", error);
    res.status(500).json({ error: "Error IA" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 http://localhost:" + PORT);
});
