import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

// Проверка сервера
app.get("/", (req, res) => {
  res.send("E-Salyq Gemini Backend Working 🚀");
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!GEMINI_KEY) {
      return res.status(500).json({ reply: "GEMINI_KEY табылмады" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Ты налоговый консультант для Казахстана. Отвечай понятно и кратко.\n\nВопрос: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("FULL GEMINI RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({
        reply: "Gemini қатесі: " + data.error.message
      });
    }

    let reply = "Жауап табылмады";

    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      reply = data.candidates[0].content.parts[0].text;
    }

    res.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ reply: "Сервер қатесі" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
