import dotenv from 'dotenv';
dotenv.config();

async function testREST() {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  console.log('Testing key:', apiKey.substring(0, 10));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Explain quantum computing simply.' }] }],
      }),
    });
    const data = await res.json();
    console.log('REST API Status:', res.status);
    console.log('REST API Response:', JSON.stringify(data, null, 2).substring(0, 500));
  } catch (err) {
    console.error('REST Error:', err);
  }
}

testREST();
