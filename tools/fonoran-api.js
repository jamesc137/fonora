/**
 * Fonoran language API: file-backed lab store.
 */

import {
  getLab,
  getHealth,
  getLabGraph,
  getLabGraphPreview,
  parseCompoundLive,
  runDda,
  patchSound,
  assignCompoundMeaning,
  addCompound,
  addSound,
  resetReviewStates,
  seedBucket,
  setReviewState,
  previewSoundImpact,
  undoLast,
  recomposeCompound,
} from './fonoran-sound-bucket.js';
import { loadEnglishLexicon } from './fonoran-english-lexicon.js';
import {
  getSessionUser,
  isWriteAuthRequired,
  unauthorizedResponse,
} from './fonoran-auth.js';

export function jsonResponse(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

export async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export async function handleFonoranApi(req, res, pathname, method) {
  const done = (status, body) => {
    jsonResponse(res, status, body);
    return true;
  };
  if (isWriteAuthRequired(pathname, method) && !getSessionUser(req)) {
    unauthorizedResponse(res);
    return true;
  }
  try {
    if (pathname === '/api/fonoran/lab' && method === 'GET') {
      return done(200, await getLab());
    }
    if (pathname === '/api/fonoran/lexicon' && method === 'GET') {
      return done(200, await loadEnglishLexicon());
    }
    if (pathname === '/api/fonoran/lab/health' && method === 'GET') {
      return done(200, await getHealth());
    }
    if (pathname === '/api/fonoran/lab/run-dda' && method === 'POST') {
      const body = await readJsonBody(req);
      return done(200, await runDda(body.scope ?? 'pending'));
    }
    if (pathname === '/api/fonoran/lab/graph/preview' && method === 'POST') {
      const body = await readJsonBody(req);
      return done(200, await getLabGraphPreview(body));
    }
    const graphMatch = pathname.match(/^\/api\/fonoran\/lab\/graph\/(root|word)\/([^/]+)$/);
    if (graphMatch && method === 'GET') {
      const kind = graphMatch[1];
      const ref = decodeURIComponent(graphMatch[2]);
      return done(200, await getLabGraph(kind, ref));
    }
    const parseMatch = pathname.match(/^\/api\/fonoran\/lab\/parse\/([^/]+)$/);
    if (parseMatch && method === 'GET') {
      return done(200, await parseCompoundLive(decodeURIComponent(parseMatch[1])));
    }
    if (pathname === '/api/fonoran/lab/undo' && method === 'POST') {
      return done(200, await undoLast());
    }
    if (pathname === '/api/fonoran/lab/seed' && method === 'POST') {
      return done(200, await seedBucket());
    }
    if (pathname === '/api/fonoran/lab/reset-review' && method === 'POST') {
      return done(200, await resetReviewStates());
    }
    const impactMatch = pathname.match(/^\/api\/fonoran\/lab\/impact\/sounds\/([^/]+)$/);
    if (impactMatch && method === 'GET') {
      return done(200, await previewSoundImpact(decodeURIComponent(impactMatch[1])));
    }
    const stateMatch = pathname.match(/^\/api\/fonoran\/lab\/state\/(sound|compound)\/([^/]+)$/);
    if (stateMatch && method === 'PATCH') {
      const kind = stateMatch[1];
      const id = decodeURIComponent(stateMatch[2]);
      const body = await readJsonBody(req);
      return done(200, await setReviewState(kind, id, body.state));
    }
    if (pathname === '/api/fonoran/lab/sounds' && method === 'POST') {
      const body = await readJsonBody(req);
      return done(201, await addSound(body));
    }
    const labSoundMatch = pathname.match(/^\/api\/fonoran\/lab\/sounds\/([^/]+)$/);
    if (labSoundMatch && method === 'PATCH') {
      const spelling = decodeURIComponent(labSoundMatch[1]);
      const body = await readJsonBody(req);
      const newSp = body.spelling?.trim().toLowerCase();
      return done(200, await patchSound(spelling, {
        new_spelling: newSp && newSp !== spelling.trim().toLowerCase() ? newSp : undefined,
        meaning: body.meaning,
        state: body.state,
        clear_affected_compounds: Boolean(body.clear_affected_compounds),
      }));
    }
    const labCompoundMatch = pathname.match(/^\/api\/fonoran\/lab\/compounds\/([^/]+)$/);
    if (labCompoundMatch && method === 'PATCH') {
      const id = decodeURIComponent(labCompoundMatch[1]);
      const body = await readJsonBody(req);
      if (Array.isArray(body.components) || Array.isArray(body.parts)) {
        return done(200, await recomposeCompound(id, body));
      }
      return done(200, await assignCompoundMeaning(id, body.meaning, { state: body.state }));
    }
    if (pathname === '/api/fonoran/lab/compounds' && method === 'POST') {
      const body = await readJsonBody(req);
      return done(201, await addCompound(body));
    }
    return false;
  } catch (err) {
    return done(400, { error: err.message ?? 'Request failed' });
  }
}
