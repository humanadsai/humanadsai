export default {
  async fetch(req: Request, env: any) {
    return new Response("ok", {
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
};
