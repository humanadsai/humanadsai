type Env = {
  DB: D1Database;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // GET /health - DB connectivity check
      if (method === "GET" && pathname === "/health") {
        const { results } = await env.DB.prepare("SELECT 1 AS ok").all();
        return jsonResponse({ status: "ok", db: results });
      }

      // GET /users - list users
      if (method === "GET" && pathname === "/users") {
        const { results } = await env.DB.prepare(
          "SELECT id, email, created_at FROM users ORDER BY created_at DESC"
        ).all();
        return jsonResponse({ users: results });
      }

      // POST /users - create user
      if (method === "POST" && pathname === "/users") {
        const body = await req.json<{ email?: string }>();
        const email = body?.email?.trim();

        if (!email) {
          return jsonResponse({ error: "email is required" }, 400);
        }

        const result = await env.DB.prepare(
          "INSERT INTO users (email) VALUES (?)"
        )
          .bind(email)
          .run();

        return jsonResponse(
          { success: true, meta: result.meta },
          201
        );
      }

      // GET /test - HTML form for testing
      if (method === "GET" && pathname === "/test") {
        const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Registration Test</title>
  <style>
    body { font-family: sans-serif; max-width: 400px; margin: 40px auto; padding: 20px; }
    input, button { width: 100%; padding: 12px; margin: 8px 0; box-sizing: border-box; font-size: 16px; }
    button { background: #0070f3; color: white; border: none; cursor: pointer; }
    #result { margin-top: 20px; padding: 12px; background: #f0f0f0; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h2>User Registration</h2>
  <form id="form">
    <input type="email" id="email" placeholder="Email address" required>
    <button type="submit">Register</button>
  </form>
  <div id="result"></div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      document.getElementById('result').textContent = JSON.stringify(data, null, 2);
      if (res.ok) document.getElementById('email').value = '';
    });
  </script>
</body>
</html>`;
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
        });
      }

      // 404 - Not Found
      return jsonResponse({ error: "Not Found", path: pathname }, 404);

    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return jsonResponse({ error: message }, 500);
    }
  },
};
