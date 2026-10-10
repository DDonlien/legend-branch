import { KnowledgeStore } from "./store";
import { discover } from "./wikidata";
import { enrichSearch } from "./search";

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ALLOWED_ORIGINS: string;
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function api(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const store = new KnowledgeStore(env.DB);
  if (url.pathname === "/api/health") return json({ ok: true });
  if (url.pathname.startsWith("/api/entries/") && request.method === "GET") {
    const id = decodeURIComponent(url.pathname.slice("/api/entries/".length));
    if (!id || id.length > 100) return json({ message: "条目标识无效。" }, 400);
    const detail = await store.detail(id);
    return detail ? json(detail) : json({ message: "条目不存在。" }, 404);
  }
  if (url.pathname !== "/api/search") return json({ message: "接口不存在。" }, 404);
  if (request.method !== "GET" && request.method !== "POST") return json({ message: "不支持此请求。" }, 405);
  let query: unknown = url.searchParams.get("q");
  if (request.method === "POST") {
    if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ message: "请使用 JSON 搜索请求。" }, 415);
    const body = await request.text();
    if (body.length > 1024) return json({ message: "搜索请求过长。" }, 413);
    try { query = (JSON.parse(body) as { query?: unknown })?.query; }
    catch { return json({ message: "搜索请求格式无效。" }, 400); }
  }
  if (typeof query !== "string" || query.trim().length < 2 || query.trim().length > 120) return json({ message: "请输入 2–120 个字的搜索词。" }, 400);
  const searchQuery = query.trim();
  if (request.method === "GET") return json({ query: searchQuery, entries: await store.search(searchQuery), enrichment: "pending", added: 0 });
  return json(await enrichSearch(store, searchQuery, discover));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    const origin = request.headers.get("origin");
    const allowed = !origin || origin === url.origin || env.ALLOWED_ORIGINS.split(",").includes(origin);
    if (!allowed) return json({ message: "此站点未连接知识库。" }, 403);
    let response: Response;
    if (request.method === "OPTIONS") {
      response = new Response(null, { status: 204, headers: { "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" } });
    } else {
      try { response = await api(request, env); }
      catch (error) {
        console.error("Knowledge API failed", error instanceof Error ? error.message : "Unknown storage failure");
        response = json({ message: "知识库暂时无法连接，请稍后重试。" }, 503);
      }
    }
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Vary", "Origin");
    }
    return response;
  },
};
