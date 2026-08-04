async function test() {
  const prompt = "Explain quantum computing simply in 2 sentences.";
  try {
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
    const text = await res.text();
    console.log('GET Pollinations AI Response:\n', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
