#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = parseArgs(process.argv.slice(2));
const API = (args.api ?? process.env.API_BASE ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
const CREDS_PATH = args.creds ?? 'simulation-data/device-credentials.json';
const COUNT = Number(args.count ?? 3);
const INTERVAL = Number(args.interval ?? 5000);

if (!fs.existsSync(CREDS_PATH)) {
  console.error(`Credentials file not found: ${CREDS_PATH}`);
  console.error('Run `yarn seed` first to generate it.');
  process.exit(1);
}

const allCreds = JSON.parse(fs.readFileSync(path.resolve(CREDS_PATH), 'utf8'));
const picked = sample(allCreds, Math.min(COUNT, allCreds.length));
console.log(`Using API: ${API}`);
console.log(`Simulating ${picked.length} device(s) at ${INTERVAL}ms interval`);

const sessions = [];
for (const c of picked) {
  try {
    const token = await login(c.deviceId, c.deviceSecret);
    sessions.push({
      deviceId: c.deviceId,
      token,
      lat: 6.93 + (Math.random() - 0.5) * 0.4,
      lng: 79.85 + (Math.random() - 0.5) * 0.4,
      heading: Math.random() * 360,
    });
    console.log(`  ✓ ${c.deviceId} authenticated`);
  } catch (err) {
    console.error(`  ✗ ${c.deviceId}: ${err.message}`);
  }
}

if (sessions.length === 0) {
  console.error('No devices authenticated; aborting.');
  process.exit(1);
}

let total = 0;
setInterval(async () => {
  for (const s of sessions) {
    s.heading = (s.heading + (Math.random() - 0.5) * 30 + 360) % 360;
    const stepDeg = 0.0005 + Math.random() * 0.001;
    s.lat += Math.cos((s.heading * Math.PI) / 180) * stepDeg;
    s.lng += Math.sin((s.heading * Math.PI) / 180) * stepDeg;
    try {
      await postPing(s.token, {
        lat: s.lat,
        lng: s.lng,
        recordedAt: new Date().toISOString(),
        speedKph: Math.round(15 + Math.random() * 40),
        headingDeg: Math.round(s.heading),
        accuracyMeters: 5 + Math.round(Math.random() * 10),
      });
      total++;
      process.stdout.write(`  · ${s.deviceId}: ${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}  (total ${total})\n`);
    } catch (err) {
      console.error(`  ! ${s.deviceId}: ${err.message}`);
    }
  }
}, INTERVAL);

async function login(deviceId, deviceSecret) {
  const res = await fetch(`${API}/auth/device-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceId, deviceSecret }),
  });
  if (!res.ok) throw new Error(`login ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.accessToken;
}

async function postPing(token, payload) {
  const res = await fetch(`${API}/pings`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`ping ${res.status}: ${await res.text()}`);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

function sample(arr, n) {
  const copy = [...arr];
  const picked = [];
  while (picked.length < n && copy.length > 0) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return picked;
}
