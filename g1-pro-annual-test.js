/* Uji produk tahunan Google AI Pro untuk Shadowrocket.
 * Penulis Asli: crhywun | Penerjemah Bahasa Indonesia: Somaylab (@somaylab) */
"use strict";

(function () {
  var VERSION = "pro-annual-test-v2";
  var SOURCE_PREFIX = "g1.ios.2tb.";
  var TARGET = "g1.2tb.ai.annual";
  var SKU_MAP = {
    "g1.ios.20tb.m.v2": "g1.20tb.3months_ip_90p.acq",
    "g1.ios.30tb.ai.pro.m": "g1.ai.ultra.3months_ip_90p.acq"
  };
  var FALLBACK = {
    "g1.20tb.3months_ip_90p.acq": "g1.20tb.3months_ip_75p.acq",
    "g1.ai.ultra.3months_ip_90p.acq": "g1.ai.ultra.3months_ip_75p.acq"
  };
  var STORE_KEY = "g1.pro.annual.test.v1";
  var url = typeof $request === "object" && $request ? $request.url : "";

  if (typeof url !== "string" || !/^https:\/\/one\.google\.com\/ai\?/.test(url)) {
    $done({});
    return;
  }

  var body = typeof $response === "object" && $response ? $response.body : undefined;
  var mappings = Object.create(null);
  var hits = 0;
  var annualHits = 0;
  var out = body;

  if (typeof body === "string") {
    // Pertahankan aturan fallback 20TB/30TB v6 menggunakan respons asli.
    // Ini adalah string yang teramati, bukan katalog toko yang terverifikasi.
    var observed = body.match(/g1\.[a-z0-9._]{2,60}acq/g) || [];
    // Cocokkan token utuh sebelum memilih 2TB atau dua ID sumber yang ada.
    out = body.replace(
      /(^|[^A-Za-z0-9._@%-])(g1\.[A-Za-z0-9._-]+)(?=$|[^A-Za-z0-9._-])/g,
      function (match, before, id) {
        var isAnnual = id.indexOf(SOURCE_PREFIX) === 0 && id.length > SOURCE_PREFIX.length;
        var to;
        var fallback = false;
        if (isAnnual) {
          to = TARGET;
        } else if (Object.prototype.hasOwnProperty.call(SKU_MAP, id)) {
          to = SKU_MAP[id];
          if (observed.indexOf(to) === -1 && FALLBACK[to] && observed.indexOf(FALLBACK[to]) !== -1) {
            to = FALLBACK[to];
            fallback = true;
          }
        } else {
          return match;
        }
        if (!mappings[id]) mappings[id] = { id: id, to: to, count: 0, fallback: fallback };
        mappings[id].count += 1;
        hits += 1;
        if (isAnnual) annualHits += 1;
        return before + to;
      }
    );
  }

  var sources = Object.keys(mappings).sort().map(function (id) {
    return mappings[id];
  });
  var record = {
    schemaVersion: 1,
    version: VERSION,
    updatedAt: new Date().toISOString(),
    sourcePrefix: SOURCE_PREFIX,
    target: TARGET,
    hitCount: hits,
    annualHitCount: annualHits,
    matchedFrom: sources,
    status: typeof body !== "string" ? "non-text" : hits ? "rewritten" : "no-match"
  };

  try {
    if (typeof $persistentStore !== "undefined" &&
        typeof $persistentStore.write === "function") {
      if (!$persistentStore.write(JSON.stringify(record), STORE_KEY)) {
        console.log("[g1-pro-annual-test] local record write failed");
      }
    }
  } catch (error) {
    console.log("[g1-pro-annual-test] local record unavailable");
  }

  console.log("[g1-pro-annual-test] " + VERSION + " hits=" + hits + " annualHits=" + annualHits);
  sources.forEach(function (source) {
    console.log("[g1-pro-annual-test] " + source.id + " -> " + source.to + " x" + source.count +
      (source.fallback ? " fallback=75p" : ""));
  });
  $done(hits ? { body: out } : {});
})();
