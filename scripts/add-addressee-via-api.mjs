#!/usr/bin/env node
/**
 * Create the `addressee` primitive (English "you") via the Fonoran HTTP API:
 *   POST /api/fonoran/concepts
 *   PATCH /api/fonoran/roots/candidates/addressee  { action: 'approve' }
 *
 * Requires the dev server (npm start). Uses a signed session cookie when auth
 * is enabled (SESSION_SECRET + @fonora.org email).
 */
import '../load-env.js';
import { createHmac } from 'node:crypto';
import { closeStore } from '../tools/fonoran-store.js';

const BASE = process.env.FONORAN_API_BASE ?? 'http://127.0.0.1:8000';

function sessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function signSession(email = 'dev@fonora.org', name = 'Dev') {
  const payload = {
    email,
    name,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

async function api(path, { method = 'GET', body = null } = {}) {
  const headers = { Accept: 'application/json' };
  const init = { method, headers };
  if (body != null) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (process.env.SESSION_SECRET?.trim()) {
    headers.Cookie = `fonoran_session=${encodeURIComponent(signSession())}`;
  }
  const res = await fetch(`${BASE}${path}`, init);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${data?.error ?? text}`);
  }
  return data;
}

const ADDRESSEE = {
  id: 'addressee',
  description: 'the person spoken to; you',
  plain_description: 'the person spoken to; you',
  domain: 'being',
  spelling: 'ti',
  suggested_status: 'primitive',
  priority_class: 'essential',
  primitive_test_note: 'Distinct from self (speaker locus) and person (generic someone). Mirrors self for second-person deixis.',
  aliases: ['you', 'yourself', 'ye', 'thou', 'thee'],
};

async function main() {
  // Skip if already present.
  try {
    const existing = await api(`/api/fonoran/concepts/${ADDRESSEE.id}`);
    if (existing?.id === ADDRESSEE.id) {
      console.log(`Concept "${ADDRESSEE.id}" already exists (spelling: ${existing.spelling ?? existing.candidate?.spelling ?? '?'})`);
    }
  } catch {
    const created = await api('/api/fonoran/concepts', { method: 'POST', body: ADDRESSEE });
    console.log('Created concept:', created.id, '→', created.candidate?.spelling ?? ADDRESSEE.spelling);
  }

  const candidate = await api(`/api/fonoran/roots/candidates/${ADDRESSEE.id}`);
  if (candidate.status === 'approved') {
    console.log(`Root "${ADDRESSEE.id}" already approved (${candidate.spelling})`);
  } else {
    const approved = await api(`/api/fonoran/roots/candidates/${ADDRESSEE.id}`, {
      method: 'PATCH',
      body: { action: 'approve', spelling: ADDRESSEE.spelling },
    });
    console.log('Approved root:', approved.id, '→', approved.spelling, `(${approved.status})`);
  }

  // Verify translation resolves.
  const tr = await api('/api/fonoran/translate', {
    method: 'POST',
    body: { text: 'You sleep.' },
  });
  console.log('Smoke test "You sleep." →', JSON.stringify(tr.surface?.roman), '| unresolved:', tr.unresolved);
}

main().catch(err => {
  console.error(err.message ?? err);
  process.exitCode = 1;
}).finally(async () => {
  await closeStore();
});
