/* Pemetaan gabungan Google One 2TB / 20TB / 30TB untuk Shadowrocket. */
"use strict";

// BEGIN GENERATED MAPPING CONFIG
/* Konfigurasi pemetaan lokal bersama untuk skrip runtime dan pengontrol laporan. */
function createG1MappingConfig(store) {
  "use strict";

  var KEY = "g1.sku.mappings.v1";
  var LIMIT = 30;
  var DEFAULT_REVISION = "defaults-75p-v1";
  var SOURCE_PREFIX = "g1.ios.2tb.";
  var READ_ERROR = "Penyimpanan pemetaan lokal belum siap, respons kali ini dibiarkan asli.";
  var CONFIG_ERROR = "Format konfigurasi pemetaan tidak valid, penulisan ulang dijeda sementara; silakan pulihkan bawaan lalu edit ulang.";
  var WRITE_ERROR = "Hasil penyimpanan gagal melewati verifikasi baca ulang, silakan segarkan halaman untuk memeriksa konfigurasi saat ini.";
  var REVISION_ERROR = "Konfigurasi telah berubah, perubahan ini belum disimpan; halaman telah memuat aturan terbaru, silakan edit ulang.";
  var RULE_FIELDS = ["id", "match", "from", "to", "enabled"];
  var RECORD_FIELDS = ["schemaVersion", "revision", "updatedAt", "customized", "rules"];

  function defaults() {
    return [
      { id: "default-2tb", match: "prefix", from: SOURCE_PREFIX, to: "g1.2tb.ai.12months_ip_90p", enabled: true },
      { id: "default-20tb", match: "exact", from: "g1.ios.20tb.m.v2", to: "g1.20tb.3months_ip_75p.acq", enabled: true },
      { id: "default-30tb", match: "exact", from: "g1.ios.30tb.ai.pro.m", to: "g1.ai.ultra.3months_ip_75p.acq", enabled: true }
    ];
  }

  function presets() {
    return [
      {
        id: "pro-1yuan",
        title: "Promo Pro Murah (3 Bulan Pertama Diskon 99%)",
        description: "Menggunakan awalan 2TB milik Pro sendiri; setelah diterapkan, buka ulang halaman paket Pro. Nominal dan siklus tagihan aktual lihat di App Store.",
        rules: [
          { match: "prefix", from: SOURCE_PREFIX, to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true }
        ]
      },
      {
        id: "tr-ultra-20tb",
        title: "Turki 20TB · Catatan 1989.99 Lira",
        description: "ID iOS 20TB generasi lama; catatan publik menampilkan harga 1989.99 Lira. Nominal dan siklus tagihan aktual lihat di App Store.",
        rules: [
          { match: "exact", from: "g1.ios.20tb.m.v2", to: "g1.ios.20tb.m", enabled: true }
        ]
      },
      {
        id: "tr-ultra-30tb",
        title: "Turki 30TB · Catatan 2949.99 Lira",
        description: "ID iOS 30TB generasi lama; catatan publik pernah memunculkan harga 2949.99 Lira. Nominal dan siklus tagihan aktual lihat di App Store.",
        rules: [
          { match: "exact", from: "g1.ios.30tb.ai.pro.m", to: "g1.ios.30tb.m", enabled: true }
        ]
      },
      {
        id: "ultra-75p",
        title: "Ultra 20TB / 30TB · 3 Bulan 75p",
        description: "Mengalihkan 20TB dan 30TB sekaligus ke target 75p saat ini; 75p berarti diskon 75% (bayar 25%).",
        rules: [
          { match: "exact", from: "g1.ios.20tb.m.v2", to: "g1.20tb.3months_ip_75p.acq", enabled: true },
          { match: "exact", from: "g1.ios.30tb.ai.pro.m", to: "g1.ai.ultra.3months_ip_75p.acq", enabled: true }
        ]
      },
      {
        id: "pro-12months-90p",
        title: "2TB / Pro · 12 Bulan 90p",
        description: "Menggunakan awalan 2TB saat ini dan target diskon 12 bulan; siklus produk ditampilkan pada panel pembelian App Store.",
        rules: [
          { match: "prefix", from: SOURCE_PREFIX, to: "g1.2tb.ai.12months_ip_90p", enabled: true }
        ]
      }
    ];
  }

  function validSku(value) {
    return typeof value === "string" &&
      /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{0,159}[A-Za-z0-9_-]$(?![\s\S])/.test(value);
  }

  function validPrefix(value) {
    return typeof value === "string" &&
      /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,159}\.$(?![\s\S])/.test(value);
  }

  function hasFields(value, fields, allowExtra) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return (allowExtra || Object.keys(value).length === fields.length) && fields.every(function (field) {
      return Object.prototype.hasOwnProperty.call(value, field);
    });
  }

  function invalidRules(error) {
    return { ok: false, rules: [], error: error };
  }

  function validateRules(value) {
    if (!Array.isArray(value) || value.length > LIMIT) {
      return invalidRules("Pemetaan membutuhkan daftar aturan, maksimal menyimpan 30 aturan.");
    }
    var rules = [];
    var ids = Object.create(null);
    var sources = Object.create(null);
    for (var index = 0; index < value.length; index += 1) {
      var rule = value[index];
      if (!hasFields(rule, RULE_FIELDS) || typeof rule.id !== "string" ||
          !/^[a-z][a-z0-9-]{0,39}$(?![\s\S])/.test(rule.id) ||
          (rule.match !== "exact" && rule.match !== "prefix") ||
          !(rule.match === "exact" ? validSku(rule.from) : validPrefix(rule.from)) ||
          !validSku(rule.to) || typeof rule.enabled !== "boolean") {
        return invalidRules("Harap isi SKU lengkap; awalan (prefix) harus diakhiri titik, dan target harus berupa ID g1., com.google.one., atau com.google.gemini.");
      }
      if (rule.from === rule.to) return invalidRules("SKU asal dan SKU tujuan sama, harap isi target yang berbeda.");
      if (ids[rule.id]) return invalidRules("ID aturan duplikat, silakan segarkan halaman pengelolaan lalu coba lagi.");
      var source = rule.match + ":" + rule.from;
      if (sources[source]) return invalidRules("SKU asal dengan cara pencocokan yang sama sudah ada, silakan edit aturan yang ada.");
      ids[rule.id] = true;
      sources[source] = true;
      rules.push({ id: rule.id, match: rule.match, from: rule.from, to: rule.to, enabled: rule.enabled });
    }
    return { ok: true, rules: rules, error: "" };
  }

  function randomHex(length) {
    var value = "";
    for (var index = 0; index < length; index += 1) value += Math.floor(Math.random() * 16).toString(16);
    return value;
  }

  function newId() {
    return "rule-" + randomHex(16);
  }

  function configState(status, revision, updatedAt, customized, rules, error) {
    var target = "";
    rules.some(function (rule) {
      if (rule.enabled && rule.match === "prefix" && rule.from === SOURCE_PREFIX) {
        target = rule.to;
        return true;
      }
      return false;
    });
    return {
      status: status,
      revision: revision,
      updatedAt: updatedAt,
      mode: status === "default" ? "discount75" : status === "custom" ? "custom" : "",
      customized: customized,
      rules: rules,
      target: target,
      targetOrigin: target ? customized ? "user-configured" : "user-specified" : "",
      error: error
    };
  }

  function failedState(status) {
    return configState(status, status, "", false, [], status === "invalid" ? CONFIG_ERROR : READ_ERROR);
  }

  function validTime(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$(?![\s\S])/.test(value) &&
      isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
  }

  function read() {
    var raw;
    try {
      if (!store || typeof store.read !== "function") return failedState("unavailable");
      raw = store.read(KEY);
    } catch (error) {
      return failedState("unavailable");
    }
    if (raw === null || typeof raw === "undefined" || raw === "") {
      return configState("default", DEFAULT_REVISION, "", false, defaults(), "");
    }
    try {
      if (typeof raw !== "string") return failedState("invalid");
      var saved = JSON.parse(raw);
      if (!hasFields(saved, RECORD_FIELDS, true) || saved.schemaVersion !== 1 ||
          typeof saved.revision !== "string" || !/^[a-f0-9]{48}$(?![\s\S])/.test(saved.revision) ||
          !validTime(saved.updatedAt) || typeof saved.customized !== "boolean") {
        return failedState("invalid");
      }
      var checked = validateRules(saved.rules);
      if (!checked.ok || (!saved.customized && checked.rules.length !== 0)) return failedState("invalid");
      return configState(saved.customized ? "custom" : "default", saved.revision, saved.updatedAt,
        saved.customized, saved.customized ? checked.rules : defaults(), "");
    } catch (error) {
      return failedState("invalid");
    }
  }

  function saveResult(status, error, config) {
    return { ok: status === 200, status: status, error: error, config: config };
  }

  function save(expectedRevision, rules, restore) {
    var current = read();
    if (current.status === "unavailable") return saveResult(503, READ_ERROR, current);
    if (typeof expectedRevision !== "string" || expectedRevision !== current.revision) {
      return saveResult(409, REVISION_ERROR, current);
    }
    if (current.status === "invalid" && restore !== true) return saveResult(400, CONFIG_ERROR, current);
    var checked = restore === true ? { ok: true, rules: [] } : validateRules(rules);
    if (!checked.ok) return saveResult(400, checked.error, current);
    try {
      if (!store || typeof store.write !== "function") return saveResult(503, WRITE_ERROR, current);
    } catch (error) {
      return saveResult(503, WRITE_ERROR, current);
    }

    var revision = randomHex(48);
    // Jaga agar pengenal perubahan tetap baru meskipun sumber acak menghasilkan nilai yang sama.
    if (revision === current.revision) {
      revision = revision.slice(0, 47) + ((parseInt(revision.charAt(47), 16) + 1) % 16).toString(16);
    }
    var saved = {
      schemaVersion: 1,
      revision: revision,
      updatedAt: new Date().toISOString(),
      customized: restore !== true,
      rules: checked.rules
    };
    var written = false;
    try {
      written = store.write(JSON.stringify(saved), KEY);
    } catch (error) {
      written = false;
    }
    var verified = read();
    var expectedRules = saved.customized ? saved.rules : defaults();
    if (!written || verified.status !== (saved.customized ? "custom" : "default") ||
        verified.revision !== saved.revision || verified.updatedAt !== saved.updatedAt ||
        verified.customized !== saved.customized || JSON.stringify(verified.rules) !== JSON.stringify(expectedRules)) {
      return saveResult(503, WRITE_ERROR, verified);
    }
    return saveResult(200, "", verified);
  }

  function applyPreset(expectedRevision, presetId) {
    var current = read();
    if (current.status === "unavailable") return saveResult(503, READ_ERROR, current);
    if (typeof expectedRevision !== "string" || expectedRevision !== current.revision) {
      return saveResult(409, REVISION_ERROR, current);
    }
    if (current.status === "invalid") return saveResult(400, CONFIG_ERROR, current);

    var selected = null;
    presets().some(function (preset) {
      if (preset.id !== presetId) return false;
      selected = preset;
      return true;
    });
    if (!selected) return saveResult(400, "Templat pemetaan tidak ditemukan, silakan segarkan halaman pengelolaan lalu coba lagi.", current);

    var rules = current.rules.slice();
    var ids = Object.create(null);
    var positions = Object.create(null);
    rules.forEach(function (rule, index) {
      ids[rule.id] = true;
      positions[rule.match + ":" + rule.from] = index;
      // Nonaktifkan hanya rute 20TB dari templat Pro versi lama, dalam penyimpanan atomik yang sama.
      if (presetId === "pro-1yuan" && rule.match === "exact" && rule.from === "g1.ios.20tb.m.v2" &&
          rule.to === selected.rules[0].to && rule.enabled) {
        rules[index] = { id: rule.id, match: rule.match, from: rule.from, to: rule.to, enabled: false };
      }
    });
    selected.rules.forEach(function (rule) {
      var source = rule.match + ":" + rule.from;
      var position = positions[source];
      var id;
      if (typeof position === "number") {
        id = rules[position].id;
      } else {
        var base = newId();
        id = base;
        // Jumlah kandidat terisi paling banyak rules.length, meskipun nilai acak berulang.
        for (var suffix = 1; suffix <= rules.length && ids[id]; suffix += 1) id = base + "-" + suffix;
        ids[id] = true;
        position = rules.length;
        positions[source] = position;
      }
      rules[position] = { id: id, match: rule.match, from: rule.from, to: rule.to, enabled: true };
    });

    var checked = validateRules(rules);
    if (!checked.ok) return saveResult(400, checked.error, current);
    return save(expectedRevision, checked.rules, false);
  }

  function resolve(id, state) {
    if (!validSku(id) || !state || (state.status !== "default" && state.status !== "custom") ||
        !Array.isArray(state.rules)) return null;
    var selected = null;
    for (var index = 0; index < state.rules.length; index += 1) {
      var rule = state.rules[index];
      if (!rule.enabled) continue;
      if (rule.match === "exact" && rule.from === id) return rule;
      if (rule.match === "prefix" && id.length > rule.from.length && id.indexOf(rule.from) === 0 &&
          (!selected || rule.from.length > selected.from.length)) selected = rule;
    }
    return selected;
  }

  return {
    key: KEY,
    limit: LIMIT,
    defaults: defaults,
    presets: presets,
    validSku: validSku,
    validateRules: validateRules,
    newId: newId,
    read: read,
    save: save,
    applyPreset: applyPreset,
    resolve: resolve
  };
}
// END GENERATED MAPPING CONFIG

(function () {
  var VERSION = "g1-acq-v7.12-mappings";
  var SOURCE_PREFIX = "g1.ios.2tb.";
  var TEST_KEY = "g1.pro.annual.test.v1";
  var SCAN_KEY = "g1.sku.scan.v1";
  var DUMP_KEY = "g1.app.dump.v1";
  var SCAN_LIMIT = 300;
  var RECENT_LIMIT = 10;
  var MAX_EVENT_COUNT = 9007199254740991;
  var ROUTE_OTHER = "[Path one.google.com lainnya]";
  var url = typeof $request === "object" && $request ? $request.url : "";

  if (typeof url !== "string" || !/^https:\/\/one\.google\.com\//.test(url) ||
      /^https:\/\/one\.google\.com\/g1-sku-report\/?(?:\?|$)/.test(url)) {
    $done({});
    return;
  }

  var mappingEngine = createG1MappingConfig(typeof $persistentStore === "undefined" ? null : $persistentStore);
  var mappingConfig = mappingEngine.read();
  var MODE = mappingConfig.mode;
  var configError = mappingConfig.status === "invalid" || mappingConfig.status === "unavailable";
  console.log("[g1-acq] " + VERSION + " mappingStatus=" + mappingConfig.status +
    " mappingRevision=" + mappingConfig.revision + " mode=" + MODE);

  var body = typeof $response === "object" && $response ? $response.body : undefined;
  try {
    collectOriginalSkus(body);
  } catch (error) {
    console.log("[g1-acq] Pengumpulan SKU tidak tersedia");
  }

  if (!/^https:\/\/one\.google\.com\/ai\?/.test(url)) {
    $done({});
    return;
  }

  var mappings = Object.create(null);
  var hits = 0;
  var annualHits = 0;
  var out = body;

  if (typeof body === "string" && !configError) {
    // Selesaikan token lengkap satu kali; target pengganti tidak pernah dicocokkan ulang.
    out = body.replace(
      /(^|[^A-Za-z0-9._@%-])((?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]+)(?=$|[^A-Za-z0-9._-])/g,
      function (match, before, id) {
        var rule = mappingEngine.resolve(id, mappingConfig);
        if (!rule) return match;
        var isAnnual = id.indexOf(SOURCE_PREFIX) === 0 && id.length > SOURCE_PREFIX.length;
        if (!mappings[id]) mappings[id] = { id: id, to: rule.to, count: 0, fallback: false };
        mappings[id].count += 1;
        hits += 1;
        if (isAnnual) annualHits += 1;
        return before + rule.to;
      }
    );
  }

  var sources = Object.keys(mappings).sort().map(function (id) {
    return mappings[id];
  });
  var record = {
    schemaVersion: 1,
    version: VERSION,
    mode: MODE,
    updatedAt: new Date().toISOString(),
    mappingRevision: mappingConfig.revision,
    mappingUpdatedAt: mappingConfig.updatedAt,
    mappingStatus: mappingConfig.status,
    sourcePrefix: SOURCE_PREFIX,
    target: mappingConfig.target,
    targetOrigin: mappingConfig.targetOrigin,
    hitCount: hits,
    // Nama field warisan: menghitung penulisan ulang 2TB/Pro, bukan interval penagihan.
    annualHitCount: annualHits,
    matchedFrom: sources,
    status: configError ? "config-error" : typeof body !== "string" ? "non-text" : hits ? "rewritten" : "no-match"
  };

  try {
    if (typeof $persistentStore !== "undefined" &&
        typeof $persistentStore.write === "function") {
      if (!$persistentStore.write(JSON.stringify(record), TEST_KEY)) {
        console.log("[g1-acq] Gagal menulis catatan lokal");
      }
    }
  } catch (error) {
    console.log("[g1-acq] Catatan lokal tidak tersedia");
  }

  console.log("[g1-acq] " + VERSION + " hits=" + hits + " annualHits=" + annualHits + " mode=" + MODE);
  sources.forEach(function (source) {
    console.log("[g1-acq] " + source.id + " -> " + source.to + " x" + source.count);
  });
  $done(hits ? { body: out } : {});

  function collectOriginalSkus(originalBody) {
    var now = new Date().toISOString();
    var saved = {};
    try {
      if (typeof $persistentStore !== "undefined" && typeof $persistentStore.read === "function") {
        saved = JSON.parse($persistentStore.read(SCAN_KEY) || "{}");
      }
    } catch (error) {
      saved = {};
    }
    if (!saved || saved.schemaVersion !== 1) saved = {};

    var byId = Object.create(null);
    var ids = [];
    var validId = /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,160}$/;
    var oldRows = Array.isArray(saved.skus) ? saved.skus : [];
    oldRows.slice(0, SCAN_LIMIT).forEach(function (row) {
      if (!row || typeof row.id !== "string" || !validId.test(row.id) || byId[row.id]) return;
      var count = Number(row.count);
      byId[row.id] = {
        id: row.id,
        count: isFinite(count) && count > 0 ? Math.floor(count) : 0,
        lastSeen: typeof row.lastSeen === "string" ? row.lastSeen.slice(0, 32) : ""
      };
      ids.push(row.id);
    });

    var isText = typeof originalBody === "string";
    var found = Object.create(null);
    var hitCount = 0;
    var addedCount = 0;
    var omittedCount = 0;
    var truncated = saved.truncated === true;
    if (isText) {
      // Dekode titik yang di-escape pada salinan penemuan sebelum menulis ulang body asli.
      var text = originalBody.replace(/\\u002e|\\x2e|&#0*46;|&#x0*2e;|&period;/gi, ".");
      var token = /(^|[^A-Za-z0-9._@%-])((?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]+)(?=$|[^A-Za-z0-9._-])/g;
      var match;
      while ((match = token.exec(text)) !== null) {
        var id = match[2];
        if (!validId.test(id)) continue;
        found[id] = (found[id] || 0) + 1;
        hitCount += 1;
        if (!byId[id]) {
          if (ids.length >= SCAN_LIMIT) {
            truncated = true;
            if (found[id] === 1) omittedCount += 1;
            continue;
          }
          byId[id] = { id: id, count: 0, lastSeen: now };
          ids.push(id);
          addedCount += 1;
        }
        byId[id].count += 1;
        byId[id].lastSeen = now;
      }
    }

    var candidateCount = Object.keys(found).length;
    var bodyType = isText ? "text" : "non-text";
    var status = responseStatus(bodyType, candidateCount, addedCount, omittedCount);
    var recentResponses = [];
    var oldResponses = Array.isArray(saved.recentResponses) ? saved.recentResponses : [];
    oldResponses.slice(-RECENT_LIMIT).forEach(function (row) {
      var event = priorResponse(row);
      if (event) recentResponses.push(event);
    });
    // Pertahankan urutan kedatangan meskipun jam perangkat mundur.
    recentResponses.push({
      at: now,
      path: safeRoute(url),
      bodyType: bodyType,
      status: status,
      candidateCount: candidateCount,
      addedCount: addedCount,
      omittedCount: omittedCount
    });

    function priorCount(value) {
      var number = Number(value);
      return isFinite(number) && number > 0 ? Math.floor(number) : 0;
    }
    var state = {
      schemaVersion: 1,
      version: VERSION,
      mode: MODE,
      updatedAt: now,
      scannedResponses: priorCount(saved.scannedResponses) + (isText ? 1 : 0),
      matchedResponses: priorCount(saved.matchedResponses) + (hitCount > 0 ? 1 : 0),
      nonTextResponses: priorCount(saved.nonTextResponses) + (isText ? 0 : 1),
      recentResponses: recentResponses.slice(-RECENT_LIMIT),
      limit: SCAN_LIMIT,
      truncated: truncated,
      skus: ids.sort().map(function (id) { return byId[id]; })
    };
    var stored = false;
    try {
      if (typeof $persistentStore !== "undefined" && typeof $persistentStore.write === "function") {
        stored = $persistentStore.write(JSON.stringify(state), SCAN_KEY);
      }
    } catch (error) {
      stored = false;
    }

    console.log("[g1-acq] " + VERSION + " status=" + status + " addedCount=" + addedCount +
      " candidates=" + candidateCount + " omittedCount=" + omittedCount +
      " occurrences=" + hitCount + " saved=" + (stored ? "yes" : "no") + " mode=" + MODE);
    Object.keys(found).sort().slice(0, SCAN_LIMIT).forEach(function (id) {
      console.log("[g1-acq] " + id + " x" + found[id]);
    });
    if (typeof $httpClient !== "undefined" && isText) {
      captureAppDump(text, found, now, safeRoute(url));
    }
  }

  function captureAppDump(decodedText, found, now, routePath) {
    var shouldCapture = Object.keys(found).length > 0 || routePath === "/ai" || routePath === "/plans";
    if (!shouldCapture || !decodedText) return;
    try {
      if (typeof $persistentStore === "undefined" || typeof $persistentStore.read !== "function" ||
          typeof $persistentStore.write !== "function") return;
      var prev = {};
      try {
        prev = JSON.parse($persistentStore.read(DUMP_KEY) || "{}");
      } catch (e) {
        prev = {};
      }
      if (!prev || prev.schemaVersion !== 1) prev = {};
      var contexts = prev.skuContexts && typeof prev.skuContexts === "object" && !Array.isArray(prev.skuContexts) ?
        prev.skuContexts : Object.create(null);
      var allTokensMap = Object.create(null);
      if (Array.isArray(prev.allTokens)) {
        prev.allTokens.slice(0, 250).forEach(function (t) {
          if (typeof t === "string" && t.length <= 180) allTokensMap[t] = true;
        });
      }
      Object.keys(found).forEach(function (id) {
        allTokensMap[id] = true;
        var idx = decodedText.indexOf(id);
        var excerpt = "";
        if (idx !== -1) {
          excerpt = decodedText.slice(Math.max(0, idx - 80), Math.min(decodedText.length, idx + id.length + 140))
            .replace(/[\r\n\t]+/g, " ").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]");
        }
        var existing = contexts[id] && typeof contexts[id] === "object" ? contexts[id] : { count: 0 };
        contexts[id] = {
          path: routePath,
          count: (Number(existing.count) || 0) + found[id],
          lastSeen: now,
          sampleContext: excerpt || existing.sampleContext || ""
        };
      });
      var auxToken = /\b(?:g1\.[A-Za-z0-9._-]{2,120}|com\.google\.(?:one|gemini|GoogleMobile)\.[A-Za-z0-9._-]{2,120}|[a-z0-9_]{2,40}_(?:acq|eft|99p|95p|90p|85p|80p|75p|50p|40p|25p|15p|5p|trial)|(?:helium|ultra)[a-z0-9._-]{1,64}|PREMIUM_[A-Z0-9_]+)\b/gi;
      var auxMatch;
      var auxGuard = 0;
      while ((auxMatch = auxToken.exec(decodedText)) !== null && auxGuard < 300) {
        auxGuard += 1;
        allTokensMap[auxMatch[0]] = true;
      }
      var excerpts = [];
      var seenSlices = Object.create(null);
      Object.keys(found).slice(0, 12).forEach(function (id) {
        var pos = decodedText.indexOf(id);
        if (pos === -1) return;
        var start = Math.max(0, pos - 60);
        var chunk = decodedText.slice(start, Math.min(decodedText.length, pos + id.length + 120))
          .replace(/[\r\n\t]+/g, " ").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]");
        if (!seenSlices[chunk]) {
          seenSlices[chunk] = true;
          excerpts.push(chunk);
        }
      });
      var catalogBlocks = [];
      ["g1.ios.30tb.ai.pro.m", "g1.ios.20tb.m.v2", "Google AI Ultra", "PREMIUM_AI_PRO"].forEach(function (anchor) {
        var aPos = decodedText.indexOf(anchor);
        if (aPos === -1) return;
        var block = decodedText.slice(Math.max(0, aPos - 1500), Math.min(decodedText.length, aPos + 2000))
          .replace(/[\r\n\t]+/g, " ").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]");
        catalogBlocks.push({ anchor: anchor, snippet: block });
      });
      var snapshots = Array.isArray(prev.snapshots) ? prev.snapshots.slice(-5) : [];
      snapshots.push({
        at: now,
        path: routePath,
        length: decodedText.length,
        skuCount: Object.keys(found).length,
        excerpts: excerpts,
        catalogBlocks: catalogBlocks.slice(0, 4)
      });
      var contextKeys = Object.keys(contexts).sort().slice(0, 60);
      var trimmedContexts = {};
      contextKeys.forEach(function (k) { trimmedContexts[k] = contexts[k]; });
      var payload = {
        schemaVersion: 1,
        updatedAt: now,
        allTokens: Object.keys(allTokensMap).sort().slice(0, 300),
        skuContexts: trimmedContexts,
        snapshots: snapshots.slice(-6)
      };
      var encoded = JSON.stringify(payload);
      while (encoded.length > 42000 && payload.snapshots.length > 1) {
        payload.snapshots.shift();
        encoded = JSON.stringify(payload);
      }
      $persistentStore.write(encoded, DUMP_KEY);
    } catch (error) {
      // Abaikan kegagalan dump konteks opsional agar alur utama tetap bersih.
    }
  }

  function safeRoute(requestUrl) {
    var path = requestUrl.replace(/^https:\/\/one\.google\.com/, "").split(/[?#]/)[0];
    path = path.replace(/\/+$/, "") || "/";
    if (path === "/" || path === "/ai" || path === "/plans") return path;
    if (/^\/_\/[^?#]+\/data\/batchexecute$/.test(path)) return "/_/…/data/batchexecute";
    return ROUTE_OTHER;
  }

  function responseStatus(bodyType, candidateCount, addedCount, omittedCount) {
    if (bodyType === "non-text") return "non-text";
    if (addedCount > 0) return "new-skus";
    if (omittedCount > 0) return "limit-reached";
    return candidateCount > 0 ? "known-skus" : "no-skus";
  }

  function priorResponse(row) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return null;
    if (typeof row.at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.at) ||
        !isFinite(Date.parse(row.at)) || new Date(row.at).toISOString() !== row.at) return null;
    if (row.path !== "/" && row.path !== "/ai" && row.path !== "/plans" &&
        row.path !== "/_/…/data/batchexecute" && row.path !== ROUTE_OTHER) return null;
    if (row.bodyType !== "text" && row.bodyType !== "non-text") return null;

    function counter(value, maximum) {
      if (typeof value !== "number" || !isFinite(value)) return null;
      return Math.max(0, Math.min(maximum, Math.floor(value)));
    }
    var candidateCount = counter(row.candidateCount, MAX_EVENT_COUNT);
    if (candidateCount === null) return null;
    var addedCount = counter(row.addedCount, Math.min(SCAN_LIMIT, candidateCount));
    if (addedCount === null) return null;
    var omittedCount = counter(row.omittedCount, candidateCount - addedCount);
    if (omittedCount === null) return null;
    if (row.bodyType === "non-text" && (candidateCount || addedCount || omittedCount)) return null;
    if (row.status !== responseStatus(row.bodyType, candidateCount, addedCount, omittedCount)) return null;
    return {
      at: row.at,
      path: row.path,
      bodyType: row.bodyType,
      status: row.status,
      candidateCount: candidateCount,
      addedCount: addedCount,
      omittedCount: omittedCount
    };
  }
})();
