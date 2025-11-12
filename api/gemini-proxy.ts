import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server not configured: GEMINI_API_KEY missing' });
    return;
  }

  try {
    const payload = req.body;
    const model = typeof payload?.model === 'string' ? payload.model : 'gemini-2.0-flash';
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      res.status(response.status).json({ error: 'Gemini request failed', details: errorBody });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}
