import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post('/generate-plan', async (req, res) => {
  const { marketingNeed } = req.body;

  const prompt = `
You are a marketing strategist.
Create a 90-day marketing plan for: "${marketingNeed}".
Then break it into a week-by-week content plan.
Format like:
[90-Day Strategy]
...
[Content Plan]
...
Be concise but actionable.
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate the plan.";

  const [strategySection, contentPlanSection] = reply.split('[Content Plan]');

  res.json({
    strategy: strategySection?.replace('[90-Day Strategy]', '').trim(),
    contentPlan: contentPlanSection?.trim()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});