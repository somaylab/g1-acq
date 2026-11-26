"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const TOPIC = "somaylab_g1_acq_5bf9610c2f1145a7";
const GIST_ID = "5bf9610c2f1145a7a4008eff2676d095";
const OUT_DIR = path.resolve(__dirname, "..", "dumps");
const OUT_FILE = path.join(OUT_DIR, "latest-iphone-dump.json");

function getGitHubToken() {
  try {
    const out = execSync("git credential fill", {
      input: "protocol=https\nhost=github.com\nusername=somaylab\n\n",
      encoding: "utf8",
      timeout: 4000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" }
    });
    const m = out.match(/password=(.+)/);
    return m ? m[1].trim() : "";
  } catch (err) {
    return "";
  }
}

(async () => {
  const pollUrl = `https://ntfy.sh/${TOPIC}/json?poll=1`;
  const res = await fetch(pollUrl);
  if (!res.ok) throw new Error(`ntfy poll gagal HTTP ${res.status}`);
  const lines = (await res.text()).trim().split(/\r?\n/).filter(Boolean);
  const events = lines.map(l => {
    try { return JSON.parse(l); } catch (e) { return null; }
  }).filter(e => e && e.event === "message");

  if (!events.length) {
    console.log("BELUM_ADA_DUMP: Belum ada kiriman dump baru di Cloud Relay.");
    return;
  }

  const latest = events[events.length - 1];
  let rawPayload = "";
  if (latest.attachment && latest.attachment.url) {
    const att = await fetch(latest.attachment.url);
    if (!att.ok) throw new Error(`Gagal unduh attachment dump HTTP ${att.status}`);
    rawPayload = await att.text();
  } else {
    rawPayload = latest.message || "";
  }

  let parsed = null;
  try {
    parsed = JSON.parse(rawPayload);
  } catch (e) {
    parsed = { raw: rawPayload };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(parsed, null, 2), "utf8");
  console.log("DUMP_SAVED:", OUT_FILE, "SIZE:", rawPayload.length, "AT:", new Date(latest.time * 1000).toISOString());

  const token = getGitHubToken();
  if (token) {
    const gRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "somaylab-g1-acq",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        files: {
          "g1-iphone-dump.json": {
            content: JSON.stringify(parsed, null, 2)
          }
        }
      })
    });
    console.log("GIST_SYNCED:", gRes.status, `https://gist.github.com/somaylab/${GIST_ID}`);
  } else {
    console.log("GIST_SKIPPED: token kredensial GitHub tidak tersedia.");
  }
})();
