export default {
  async fetch(req: Request, env: { DB: D1Database }) {
    const { results } = await env.DB.prepare("SELECT 1 AS ok").all();
    return Response.json(results);
  },
};
