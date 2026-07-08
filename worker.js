// Cloudflare Worker — proxy for the Anthropic API used by Hope, the
// Friends of CROSS chatbot on friendsofcross.ie.
//
// Deploy:
//   npx wrangler deploy worker.js --name hope-chatbot
// Then set the API key as a secret (NOT a plain env var — secrets are encrypted):
//   npx wrangler secret put ANTHROPIC_API_KEY --name hope-chatbot
//
// The client sends { "message": "<user text>" } and receives { "reply": "<text>" }.

const ALLOWED_ORIGINS = new Set([
  "https://friendsofcross.ie",
  "https://www.friendsofcross.ie",
  "https://luca506.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5500"
]);

const HOPE_SYSTEM_PROMPT = `You are Hope, a warm and knowledgeable assistant for Friends of CROSS, a cancer research charity based at St. James's Hospital and Trinity College Dublin, Ireland (Charity Number CHY 15364). You help visitors learn about the charity's mission, how to donate, upcoming events, the committee, research funded, and how to get involved. Keep responses concise, warm, and conversational — 2-3 sentences maximum. Always end with a gentle nudge toward donating or getting involved where relevant. Key facts: charity raises funds for cancer research equipment and researchers at TSJCI; over €1M raised to date; equipment funded includes Flow Cytometer, Tissue Microarrayer, Cryostat, PCR Thermal Cycler, Cell InnoCyte Machine; upcoming events: Vhi Women's Mini Marathon 31st May 2026, Dublin Marathon 25th October 2026; Rugby Lunch 2025 raised €50,000 funding the Cell InnoCyte Machine; Rugby Lunch 2027 coming November 2027; committee: James O'Connor (Chair), Prof John Reynolds, Sean Headon, Conor Headon, Patrick Headon, Jacqueline Rafter, Luca Mariotti, Ben English, Philip Smith, Jacintha O'Sullivan; contact: info@crosscharity.ie; if unsure about anything direct to info@crosscharity.ie.`;

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://friendsofcross.ie";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request)
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, request);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonResponse({ error: "Server not configured: missing ANTHROPIC_API_KEY" }, 500, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400, request);
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      return jsonResponse({ error: "Missing 'message' field" }, 400, request);
    }
    if (message.length > 2000) {
      return jsonResponse({ error: "Message too long (max 2000 characters)" }, 400, request);
    }

    let anthropicRes;
    try {
      anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: HOPE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: message }]
        })
      });
    } catch (err) {
      return jsonResponse({ error: "Upstream request failed", detail: String(err) }, 502, request);
    }

    if (!anthropicRes.ok) {
      const text = await anthropicRes.text();
      return jsonResponse({ error: "Upstream error", status: anthropicRes.status, detail: text }, 502, request);
    }

    const data = await anthropicRes.json();
    const reply = data && data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : "Sorry — I couldn't come up with a reply just then. Please try again, or email info@crosscharity.ie.";

    return jsonResponse({ reply }, 200, request);
  }
};
