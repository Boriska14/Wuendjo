// Proxy Vercel vers le serveur MCP public de Travora (https://travora.guide/api/mcp).
// GET /api/travora?tool=search_destinations&args={"keyword":"kenya","departure":"cm","locale":"fr"}
const URL_MCP = 'https://travora.guide/api/mcp';
const TOOLS = ['list_departures', 'search_destinations', 'get_destination', 'get_visa_directory', 'get_reviews'];
const SYN = { keyword: ['query', 'q', 'search', 'keyword', 'term'], destination: ['destination', 'slug', 'country', 'id', 'name', 'iso2'] };
let schemas = null;

async function rpc(method, params) {
  const r = await fetch(URL_MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  });
  const t = await r.text();
  if (!r.ok) throw Object.assign(new Error('Travora a répondu ' + r.status), { status: r.status });
  let j;
  try { j = JSON.parse(t); } catch { const m = t.match(/data:\s*(\{.*\})/); j = m ? JSON.parse(m[1]) : {}; }
  if (j.error) throw new Error(j.error.message || 'Erreur MCP');
  return j.result;
}

// Aligne les noms d'arguments sur le schéma réel publié par le serveur (tools/list).
async function align(tool, args) {
  if (!schemas) schemas = (await rpc('tools/list', {})).tools || [];
  const p = (schemas.find(t => t.name === tool) || {}).inputSchema?.properties;
  if (!p) return args;
  const out = {};
  for (const [k, v] of Object.entries(args)) {
    if (k in p) out[k] = v;
    else { const alt = (SYN[k] || []).find(a => a in p); if (alt) out[alt] = v; }
  }
  return out;
}

module.exports = async (req, res) => {
  try {
    const tool = String(req.query.tool || '');
    if (!TOOLS.includes(tool)) return res.status(400).json({ error: 'Outil non autorisé' });
    let args = {};
    try { args = JSON.parse(req.query.args || '{}'); } catch { return res.status(400).json({ error: 'Arguments invalides' }); }
    for (const k of Object.keys(args)) if (typeof args[k] === 'string') args[k] = args[k].slice(0, 100);
    const result = await rpc('tools/call', { name: tool, arguments: await align(tool, args) });
    const txt = result && result.content && result.content[0] && result.content[0].text;
    let data = result;
    if (typeof txt === 'string') { try { data = JSON.parse(txt); } catch { data = txt; } }
    // Cache CDN 24 h : les 60 requêtes/minute de Travora sont partagées par l'IP de Vercel.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ data, source: 'Travora (travora.guide)' });
  } catch (e) {
    res.status(e.status === 429 ? 429 : 502).json({ error: e.message });
  }
};
