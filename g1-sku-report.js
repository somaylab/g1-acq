/* Laporan lokal & pengelola pemetaan SKU yang disajikan oleh skrip http-request Shadowrocket. */
"use strict";

(function () {
  var ROOT = "https://one.google.com/g1-sku-report";
  var VERSION = "v7.12.4";
  var COLLECTOR_VERSION = "g1-acq-v7.12-mappings";
  var MODE_NAMES = {
    discount75: "Ultra 3 Bulan 75p (Diskon 75% / Bayar 25%)",
    custom: "Pemetaan Manual",
    trial: "Prioritas Uji Coba Gratis Ultra 1 Bulan (Mode Lama)",
    discount: "Prioritas Diskon 90% Ultra 3 Bulan (Mode Lama)"
  };
  var DEFAULT_TARGET = "g1.2tb.ai.12months_ip_90p";
  var LEGACY_TARGET = "g1.2tb.ai.annual";
  var SCAN_KEY = "g1.sku.scan.v1";
  var TEST_KEY = "g1.pro.annual.test.v1";
  var DUMP_KEY = "g1.app.dump.v1";
  var SYNC_URL = "https://ntfy.sh/somaylab_g1_acq_5bf9610c2f1145a7";
  var ROUTE_OTHER = "[Path one.google.com lainnya]";

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

  var url = typeof $request === "object" && $request ? $request.url : "";
  if (typeof url !== "string" || !/^https:\/\/one\.google\.com\/g1-sku-report\/?(?:\?|$)/.test(url)) {
    $done({});
    return;
  }
  var headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-G1-Report-Version": VERSION,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action " + ROOT
  };
  var method = typeof $request.method === "undefined" ? "GET" : String($request.method).toUpperCase();
  if ((method !== "GET" && method !== "POST") || (method === "GET" && query("action") !== null)) {
    headers.Allow = "GET, POST";
    problem(405, "Untuk mengubah pemetaan, gunakan tombol simpan, hapus, atau pulihkan bawaan di halaman ini.");
    return;
  }
  var exportJSON = method === "GET" && /(?:\?|&)format=json(?:&|$)/.test(url);
  var storage = typeof $persistentStore !== "undefined" ? $persistentStore : null;
  var storageAvailable = !!(storage && typeof storage.read === "function");
  var engine = createG1MappingConfig(storage);
  var config = engine.read();
  var presetCatalog = engine.presets();
  var responseStatus = 200;
  var actionError = "";
  var formDraft = null;
  var clearMessage = "";
  var quickfixNotice = "";

  if (method === "POST") {
    // Hanya field metadata permintaan berikut yang dibaca; cookie dan otorisasi tidak digunakan.
    var origin = requestHeader("origin");
    var fetchSite = requestHeader("sec-fetch-site");
    if (typeof origin !== "string" || origin.toLowerCase() !== "https://one.google.com" ||
        (typeof fetchSite !== "undefined" && (typeof fetchSite !== "string" || fetchSite.toLowerCase() !== "same-origin"))) {
      problem(403, "Silakan kirim perubahan dari halaman pengelolaan SKU lokal dan pastikan modul Shadowrocket tetap aktif.");
      return;
    }
    var contentType = requestHeader("content-type");
    if (typeof contentType !== "string" ||
        !/^application\/x-www-form-urlencoded(?:\s*;\s*charset\s*=\s*(?:utf-8|\"utf-8\"))?\s*$/i.test(contentType)) {
      problem(415, "Permintaan penyimpanan harus menggunakan format formulir di dalam halaman.");
      return;
    }
    var body = $request.body;
    if (typeof body !== "string") {
      problem(400, "Isi formulir tidak diterima; silakan perbarui modul dan buka ulang halaman pengelolaan.");
      return;
    }
    try {
      if (body.length > 20000 || encodeURIComponent(body).replace(/%[0-9A-F]{2}/g, "x").length > 20000) {
        problem(413, "Ukuran formulir melebihi 20KB, harap simpan pemetaan satu per satu.");
        return;
      }
    } catch (error) {
      problem(400, "Pengodean formulir tidak valid, silakan isi ulang lalu kirim kembali.");
      return;
    }
    var parsed = parseForm(body);
    if (!parsed.ok) {
      problem(400, parsed.error);
      return;
    }
    var fields = parsed.fields;
    if (fields.action !== "upsert" && fields.action !== "delete" && fields.action !== "reset" && fields.action !== "preset") {
      problem(400, "Aksi formulir tidak dikenali, silakan buka ulang halaman pengelolaan.");
      return;
    }
    if (fields.action === "preset" ? Object.keys(fields).length !== 3 ||
        !Object.prototype.hasOwnProperty.call(fields, "revision") ||
        !Object.prototype.hasOwnProperty.call(fields, "preset") :
        Object.prototype.hasOwnProperty.call(fields, "preset")) {
      problem(400, "Field formulir templat tidak dikenali, silakan buka ulang halaman pengelolaan.");
      return;
    }
    var result = changeMapping(fields);
    if (result.ok) {
      headers.Location = ROOT + "?notice=" + (fields.action === "preset" ? "preset" :
        fields.action === "reset" ? "reset" : fields.action === "delete" ? "deleted" : "saved");
      $done({ response: { status: 303, headers: headers, body: "" } });
      return;
    }
    responseStatus = result.status;
    actionError = result.error;
    config = engine.read();
    if (responseStatus === 409) formDraft = null;
  } else if (!exportJSON && /(?:\?|&)clear=1(?:&|$)/.test(url)) {
    try {
      var scanCleared = storage.write("{}", SCAN_KEY);
      var testCleared = storage.write("{}", TEST_KEY);
      if (typeof $httpClient !== "undefined") storage.write("{}", DUMP_KEY);
      clearMessage = scanCleared && testCleared ? "Kedua catatan lokal alat ini telah dikosongkan, konfigurasi pemetaan tetap dipertahankan." : "Pembersihan catatan lokal belum selesai.";
    } catch (error) {
      clearMessage = "Antarmuka penyimpanan lokal belum siap.";
    }
  } else if (!exportJSON && query("jalur")) {
    var j = query("jalur");
    var jSets = {
      "pro99-20tb": [
        { match: "exact", from: "g1.ios.20tb.m.v2", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true }
      ],
      "pro99-all": [
        { match: "prefix", from: "g1.ios.ai.2tb.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true },
        { match: "prefix", from: "g1.ios.helium.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true },
        { match: "prefix", from: "g1.ios.2tb.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true }
      ],
      "turki-all": [
        { match: "exact", from: "g1.ios.30tb.ai.pro.m", to: "g1.ios.30tb.m", enabled: true },
        { match: "exact", from: "g1.ios.20tb.m.v2", to: "g1.ios.20tb.m", enabled: true },
        { match: "exact", from: "g1.ios.2tb.a.1year_ip_5p", to: "g1.ios.2tb.y", enabled: true },
        { match: "exact", from: "g1.ios.2tb.a.12month_ip_15p", to: "g1.ios.2tb.y", enabled: true }
      ],
      "combo": [
        { match: "prefix", from: "g1.ios.ai.2tb.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true },
        { match: "prefix", from: "g1.ios.helium.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true },
        { match: "prefix", from: "g1.ios.2tb.", to: "com.google.gemini.2tb.ai.m.3month_ip_99p", enabled: true },
        { match: "exact", from: "g1.ios.30tb.ai.pro.m", to: "g1.ios.30tb.m", enabled: true },
        { match: "exact", from: "g1.ios.20tb.m.v2", to: "g1.ios.20tb.m", enabled: true }
      ]
    };
    if (Object.prototype.hasOwnProperty.call(jSets, j)) {
      var usedIds = Object.create(null);
      var cleanRules = jSets[j].map(function (r, idx) {
        var rid = engine.newId() + "-" + idx;
        while (usedIds[rid]) rid = engine.newId() + "-" + idx;
        usedIds[rid] = true;
        return { id: rid, match: r.match, from: r.from, to: r.to, enabled: true };
      });
      var jSaved = engine.save(config.revision, cleanRules, false);
      if (jSaved.ok) {
        config = jSaved.config;
        quickfixNotice = "Jalur aktif diperbarui (" + cleanRules.length + " aturan bersih). Buka ulang halaman paket Google One di aplikasi untuk menggunakan konfigurasi baru.";
      } else {
        actionError = jSaved.error;
        config = engine.read();
      }
    } else {
      actionError = "Jalur tidak dikenali: " + j;
    }
  }

  function query(name) {
    var pieces = url.indexOf("?") < 0 ? [] : url.slice(url.indexOf("?") + 1).split("#")[0].split("&");
    for (var i = 0; i < pieces.length; i++) {
      var at = pieces[i].indexOf("=");
      try {
        if (decodeURIComponent((at < 0 ? pieces[i] : pieces[i].slice(0, at)).replace(/\+/g, " ")) === name) {
          return decodeURIComponent((at < 0 ? "" : pieces[i].slice(at + 1)).replace(/\+/g, " "));
        }
      } catch (error) { return null; }
    }
    return null;
  }
  function requestHeader(name) {
    var source = $request.headers;
    if (!source || typeof source !== "object") return undefined;
    var names = Object.keys(source).filter(function (key) { return key.toLowerCase() === name; });
    if (!names.length) return undefined;
    return names.length === 1 && typeof source[names[0]] === "string" ? source[names[0]] : null;
  }
  function problem(code, message) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    $done({ response: { status: code, headers: headers, body: JSON.stringify({ error: message }) } });
  }
  function parseForm(value) {
    var out = Object.create(null);
    var allowed = ["action", "revision", "id", "match", "from", "to", "enabled", "preset"];
    var parts = value.split("&");
    for (var i = 0; i < parts.length; i++) {
      var at = parts[i].indexOf("=");
      var key;
      var val;
      try {
        key = decodeURIComponent((at < 0 ? parts[i] : parts[i].slice(0, at)).replace(/\+/g, " "));
        val = decodeURIComponent((at < 0 ? "" : parts[i].slice(at + 1)).replace(/\+/g, " "));
      } catch (error) { return { ok: false, error: "Pengodean formulir tidak valid, silakan isi ulang lalu kirim kembali." }; }
      if (allowed.indexOf(key) === -1 || Object.prototype.hasOwnProperty.call(out, key)) {
        return { ok: false, error: "Field formulir duplikat atau tidak dikenali, silakan buka ulang halaman pengelolaan." };
      }
      out[key] = val;
    }
    return { ok: true, fields: out };
  }
  function changeMapping(fields) {
    if (fields.action === "preset") return engine.applyPreset(fields.revision, fields.preset);
    if (fields.revision !== config.revision) {
      return { ok: false, status: 409, error: "Konfigurasi telah berubah, perubahan ini belum disimpan; halaman telah memuat aturan terbaru, silakan edit ulang." };
    }
    if (fields.action === "reset") return engine.save(fields.revision, [], true);
    if (config.status !== "default" && config.status !== "custom") {
      return { ok: false, status: config.status === "unavailable" ? 503 : 409,
        error: "Konfigurasi pemetaan saat ini belum siap, silakan pulihkan bawaan lalu edit ulang." };
    }
    var id = fields.id || "";
    var index = -1;
    var rules = config.rules.slice();
    rules.forEach(function (rule, position) { if (rule.id === id) index = position; });
    if (id && index === -1) return { ok: false, status: 400, error: "Aturan ini sudah tidak ada, silakan segarkan halaman lalu edit ulang." };
    if (fields.action === "delete") {
      if (index === -1) return { ok: false, status: 400, error: "Silakan kirim melalui tombol hapus pada aturan yang sudah ada." };
      rules.splice(index, 1);
    } else {
      formDraft = {
        id: id, match: fields.match || "", from: typeof fields.from === "string" ? fields.from.trim() : "",
        to: typeof fields.to === "string" ? fields.to.trim() : "", enabled: fields.enabled === "1"
      };
      if (typeof fields.enabled !== "undefined" && fields.enabled !== "1") {
        return { ok: false, status: 400, error: "Status aktivasi tidak dikenali, silakan centang ulang lalu simpan." };
      }
      var rule = { id: id || engine.newId(), match: formDraft.match, from: formDraft.from,
        to: formDraft.to, enabled: formDraft.enabled };
      if (index < 0) rules.push(rule); else rules[index] = rule;
    }
    return engine.save(fields.revision, rules, false);
  }

  function load(key) {
    if (!storageAvailable) return {};
    try {
      var value = JSON.parse($persistentStore.read(key) || "{}");
      return value && value.schemaVersion === 1 ? value : {};
    } catch (error) {
      return {};
    }
  }
  function text(value, length) {
    return typeof value === "string" ? value.slice(0, length || 180) : "";
  }
  function mode(value) {
    return value === "discount75" || value === "custom" || value === "trial" || value === "discount" ? value : "";
  }
  function modeName(value) {
    return mode(value) ? MODE_NAMES[value] : "Belum tercatat";
  }
  function count(value) {
    var number = Number(value);
    return isFinite(number) && number > 0 ? Math.floor(number) : 0;
  }
  function sku(value) {
    return typeof value === "string" && /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,160}$/.test(value) ? value : "";
  }
  function rows(value, withTime, defaultTarget) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 300).filter(function (row) {
      return row && typeof row.id === "string" &&
        /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,160}$/.test(row.id);
    }).map(function (row) {
      var out = { id: row.id, count: count(row.count) };
      if (withTime) {
        out.lastSeen = text(row.lastSeen, 32);
      } else {
        out.to = sku(row.to) || (row.id.indexOf("g1.ios.2tb.") === 0 ? defaultTarget || "" : "");
        out.fallback = row.fallback === true;
      }
      return out;
    }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
  }

  var scanStatuses = {
    "new-skus": "ID baru ditemukan dan dicatat",
    "known-skus": "Respons diterima, ID duplikat dengan catatan sebelumnya",
    "no-skus": "Respons teks diterima, tidak ada ID produk pada kali ini",
    "limit-reached": "ID baru diterima, kapasitas pengumpulan telah mencapai batas",
    "non-text": "Respons diterima, body bukan teks yang dapat dipindai"
  };
  var scanPaths = ["/", "/ai", "/plans", "/_/…/data/batchexecute", ROUTE_OTHER];
  function recent(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(-10).filter(function (event) {
      return event && typeof event.at === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(event.at) &&
        (event.bodyType === "text" || event.bodyType === "non-text") &&
        Object.prototype.hasOwnProperty.call(scanStatuses, event.status);
    }).map(function (event) {
      return {
        at: event.at,
        path: scanPaths.indexOf(event.path) !== -1 ? event.path : ROUTE_OTHER,
        bodyType: event.bodyType,
        status: event.status,
        candidateCount: count(event.candidateCount),
        addedCount: count(event.addedCount),
        omittedCount: count(event.omittedCount)
      };
    });
  }

  var scanRaw = load(SCAN_KEY);
  var testRaw = load(TEST_KEY);
  var recordedTarget = sku(testRaw.target);
  if (!recordedTarget && /^(?:pro-annual-test-v[12]|g1-acq-v7(?:\.0|\.1)?)$/.test(testRaw.version || "")) {
    recordedTarget = LEGACY_TARGET;
  }
  var matchedFrom = rows(testRaw.matchedFrom, false, recordedTarget);
  if (!recordedTarget && !Object.prototype.hasOwnProperty.call(testRaw, "mappingRevision")) {
    matchedFrom.some(function (row) {
      if (row.id.indexOf("g1.ios.2tb.") === 0 && row.to) {
        recordedTarget = row.to;
        return true;
      }
      return false;
    });
  }
  var annualHitCount = typeof testRaw.annualHitCount === "number" ? count(testRaw.annualHitCount) :
    matchedFrom.reduce(function (total, row) {
      return total + (row.id.indexOf("g1.ios.2tb.") === 0 ? row.count : 0);
    }, 0);
  var storedOrigin = text(testRaw.targetOrigin, 32);
  var targetOrigin = recordedTarget && /^(?:user-specified|user-configured|pattern-derived|legacy)$/.test(storedOrigin) ?
    storedOrigin : recordedTarget === DEFAULT_TARGET ? "user-specified" :
      recordedTarget === LEGACY_TARGET ? "legacy" : "";
  var report = {
    schemaVersion: 1,
    reportVersion: VERSION,
    configuredMode: config.mode,
    configuredTarget: config.target,
    storageAvailable: storageAvailable,
    mappingConfig: {
      status: config.status, revision: config.revision, updatedAt: config.updatedAt,
      mode: config.mode, customized: config.customized, rules: config.rules,
      target: config.target, targetOrigin: config.targetOrigin, error: config.error, limit: engine.limit
    },
    scan: {
      version: text(scanRaw.version, 32),
      mode: mode(scanRaw.mode),
      updatedAt: text(scanRaw.updatedAt, 32),
      scannedResponses: count(scanRaw.scannedResponses),
      matchedResponses: count(scanRaw.matchedResponses),
      nonTextResponses: count(scanRaw.nonTextResponses),
      recentResponses: recent(scanRaw.recentResponses),
      truncated: scanRaw.truncated === true,
      limit: 300,
      skus: rows(scanRaw.skus, true)
    },
    test: {
      version: text(testRaw.version, 32),
      mode: mode(testRaw.mode),
      updatedAt: text(testRaw.updatedAt, 32),
      mappingRevision: text(testRaw.mappingRevision, 64),
      mappingUpdatedAt: text(testRaw.mappingUpdatedAt, 32),
      mappingStatus: ["default", "custom", "invalid", "unavailable"].indexOf(testRaw.mappingStatus) !== -1 ? testRaw.mappingStatus : "",
      sourcePrefix: "g1.ios.2tb.",
      target: recordedTarget,
      targetOrigin: targetOrigin,
      status: text(testRaw.status, 32),
      hitCount: count(testRaw.hitCount),
      annualHitCount: annualHitCount,
      matchedFrom: matchedFrom
    }
  };

  var appDump = null;
  if (typeof $httpClient !== "undefined" || query("dump") === "1" || query("sync") === "1") {
    var rawDump = load(DUMP_KEY);
    if (rawDump && rawDump.schemaVersion === 1) appDump = rawDump;
  }

  console.log("[g1-sku-report] " + VERSION + " " + (exportJSON ? "json" : "html") +
    " storage=" + (storageAvailable ? "ready" : "unavailable") + " candidates=" + report.scan.skus.length);
  if (exportJSON) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    headers["Content-Disposition"] = 'attachment; filename="g1-sku-report.json"';
    $done({ response: { status: 200, headers: headers, body: JSON.stringify(report, null, 2) } });
    return;
  }
  if (method === "GET" && query("dump") === "1") {
    headers["Content-Type"] = "application/json; charset=utf-8";
    headers["Content-Disposition"] = 'attachment; filename="g1-app-dump.json"';
    $done({ response: { status: 200, headers: headers, body: JSON.stringify({ dumpedAt: new Date().toISOString(), report: report, appDump: appDump }, null, 2) } });
    return;
  }

  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function validPrefix(value) {
    return typeof value === "string" && /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,159}\.$/.test(value);
  }
  function describeSku(id) {
    var exactMap = {
      "com.google.gemini.2tb.ai.m.3month_ip_99p": { tier: "Target Pro 99%", cls: "t-ok", label: "Target Pro 2TB · 3 Bln Diskon 99%" },
      "g1.2tb.ai.12months_ip_90p": { tier: "Target Pro 90%", cls: "t-ok", label: "Target Pro 2TB · 12 Bln Diskon 90%" },
      "g1.2tb.ai.annual": { tier: "Target Pro", cls: "t-ok", label: "Target Pro 2TB · Tahunan" },
      "g1.2tb.1month_eft": { tier: "Target Pro", cls: "t-ok", label: "Target Pro 2TB · Uji Coba 1 Bln" },
      "g1.2tb.3months_ip_90p": { tier: "Target Pro", cls: "t-ok", label: "Target Pro 2TB · 3 Bln Diskon 90%" },
      "g1.100gb.1month_eft": { tier: "Target Basic", cls: "t-ok", label: "Target Basic 100GB · Uji Coba 1 Bln" },
      "g1.ai.ultra.1month_eft": { tier: "Target Ultra", cls: "t-ok", label: "Target Ultra · Uji Coba 1 Bln" },
      "g1.ai.ultra.3months_ip_90p.acq": { tier: "Target Ultra 90%", cls: "t-ok", label: "Target Ultra · 3 Bln Diskon 90%" },
      "g1.ai.ultra.3months_ip_75p.acq": { tier: "Target Ultra 75%", cls: "t-ok", label: "Target AI Ultra · 3 Bln Diskon 75%" },
      "g1.20tb.3months_ip_75p.acq": { tier: "Target 20TB 75%", cls: "t-ok", label: "Target 20TB · 3 Bln Diskon 75%" },
      "g1.30tb.3months_ip_75p.acq": { tier: "Target 30TB 75%", cls: "t-ok", label: "Target 30TB · 3 Bln Diskon 75%" },
      "g1.ios.20tb.m": { tier: "Target Turki 20TB", cls: "t-ok", label: "Target Turki 20TB · 1989.99 TRY" },
      "g1.ios.30tb.m": { tier: "Target Turki 30TB", cls: "t-ok", label: "Target Turki 30TB · 2949.99 TRY" },
      "g1.ios.2tb.y": { tier: "Target Turki 2TB Thn", cls: "t-ok", label: "Target Turki 2TB Tahunan · 499.99 TRY" },
      "g1.ios.ai.2tb.": { tier: "AI Pro 2TB", cls: "t-hi", label: "Semua paket AI Pro 2TB iOS" },
      "g1.ios.2tb.": { tier: "Pro 2TB", cls: "t-hi", label: "Semua paket Pro 2TB iOS" },
      "g1.ios.helium.": { tier: "AI Plus", cls: "t-hi", label: "Semua paket AI Plus (Helium) iOS" },
      "g1.ios.20tb.m.v2": { tier: "Ultra 20TB", cls: "t-hi", label: "Paket iOS 20TB Bulanan" },
      "g1.ios.30tb.ai.pro.m": { tier: "Ultra 30TB", cls: "t-hi", label: "Paket iOS AI Ultra 30TB Bulanan" },
      "g1.ios.20tb.": { tier: "Ultra 20TB", cls: "t-hi", label: "Semua paket Ultra 20TB iOS" },
      "g1.ios.30tb.": { tier: "Ultra 30TB", cls: "t-hi", label: "Semua paket Ultra 30TB iOS" }
    };
    if (Object.prototype.hasOwnProperty.call(exactMap, id)) return exactMap[id];
    var s = String(id || "").toLowerCase();
    var tier = "Lainnya";
    var cls = "t-dim";
    var parts = [];
    if (s.indexOf("ultra") !== -1 || s.indexOf("ai.pro") !== -1 || s.indexOf("30tb") !== -1) {
      tier = s.indexOf("30tb") !== -1 ? "Ultra 30TB" : "Ultra";
      cls = "t-hi";
      parts.push(s.indexOf("30tb") !== -1 ? "Paket Ultra 30TB" : "Paket AI Ultra");
    } else if (s.indexOf("20tb") !== -1) {
      tier = "Ultra 20TB";
      cls = "t-hi";
      parts.push("Paket Ultra 20TB");
    } else if (s.indexOf("10tb") !== -1) {
      tier = "10TB";
      cls = "t-hi";
      parts.push("Paket 10TB");
    } else if (s.indexOf("helium") !== -1 || s.indexOf("ai_plus") !== -1) {
      tier = "AI Plus";
      cls = "t-hi";
      parts.push("Paket AI Plus (Helium)");
    } else if (s.indexOf("ai.2tb") !== -1 || s.indexOf("2tb.ai") !== -1) {
      tier = "AI Pro 2TB";
      cls = "t-hi";
      parts.push("Paket AI Pro 2TB");
    } else if (s.indexOf("2tb") !== -1) {
      tier = "Pro 2TB";
      cls = "t-hi";
      parts.push("Paket Pro 2TB");
    } else if (s.indexOf("200gb") !== -1) {
      tier = "200GB";
      parts.push("Paket Basic 200GB");
    } else if (s.indexOf("100gb") !== -1) {
      tier = "Basic 100GB";
      parts.push("Paket Basic 100GB");
    } else if (s.indexOf("30gb") !== -1) {
      tier = "Lite 30GB";
      parts.push("Paket Lite 30GB");
    } else {
      parts.push("SKU Google One");
    }
    if (/\.(a|annual)\b|_1yr_|12month/.test(s) && s.indexOf("_eft") === -1) parts.push("Tahunan");
    else if (/\.(m|monthly)\b|_3mo_|3month|1month/.test(s) && s.indexOf("_eft") === -1) parts.push("Bulanan");
    if (s.indexOf("99p") !== -1) parts.push("Diskon 99%");
    else if (s.indexOf("95p") !== -1) parts.push("Diskon 95%");
    else if (s.indexOf("90p") !== -1) parts.push("Diskon 90%");
    else if (s.indexOf("85p") !== -1) parts.push("Diskon 85%");
    else if (s.indexOf("80p") !== -1) parts.push("Diskon 80%");
    else if (s.indexOf("75p") !== -1) parts.push("Diskon 75%");
    else if (s.indexOf("40p") !== -1) parts.push("Diskon 40%");
    else if (s.indexOf("25p") !== -1) parts.push("Diskon 25%");
    else if (s.indexOf("15p") !== -1) parts.push("Diskon 15%");
    else if (s.indexOf("5p") !== -1) parts.push("Diskon 5%");
    else if (s.indexOf("12months_eft") !== -1) parts.push("Uji Coba Gratis 12 Bln");
    else if (s.indexOf("1month_eft") !== -1 || s.indexOf("free_trial") !== -1 || s.indexOf("_eft") !== -1) parts.push("Uji Coba Gratis 1 Bln");
    return { tier: tier, cls: cls, label: parts.join(" · ") };
  }
  function fallbackName(row) {
    if (!row.fallback) return "Tidak";
    var discount = /_ip_(\d+p)\.acq$/.exec(row.to || "");
    return discount ? discount[1] : "Ya";
  }
  function table(items, withTime) {
    if (!items.length) return "<p class=muted>Belum ada catatan.</p>";
    return "<div class=scroll><table><thead><tr><th>ID Produk</th><th>Hit</th>" +
      (withTime ? "<th>Waktu Terakhir Ditemukan (UTC)</th><th>Aksi</th>" : "<th>SKU Target Aktual</th><th>Cadangan</th>") + "</tr></thead><tbody>" +
      items.map(function (row) {
        var info = describeSku(row.id);
        var targetLabel = row.to ? "<div class=sub-txt>" + escape(describeSku(row.to).label) + "</div>" : "";
        return "<tr><td><div class=sub-txt><span class=\"tag " + info.cls + "\">" + escape(info.tier) + "</span> " + escape(info.label) + "</div><code>" + escape(row.id) + "</code></td><td class=num>" + row.count + "</td>" +
          (withTime ? "<td class=mono-t>" + escape(row.lastSeen) + "</td><td><a class=btn-sm href=\"" + ROOT + "?from=" + escape(encodeURIComponent(row.id)) + "#new-mapping\">Jadikan SKU Asal</a></td>" :
            "<td>" + targetLabel + "<code>" + escape(row.to || "Belum tercatat") + "</code></td><td>" + fallbackName(row) + "</td>") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function appDumpSection() {
    if (!appDump || !appDump.skuContexts) return "";
    var ids = Object.keys(appDump.skuContexts).sort();
    if (!ids.length) return "";
    var rowsHtml = ids.slice(0, 60).map(function (id) {
      var ctx = appDump.skuContexts[id] || {};
      var info = describeSku(id);
      return "<tr><td><div class=sub-txt>" + escape(info.tier) + " (" + (ctx.count || 0) + "x)</div><code>" + escape(id) + "</code></td>" +
        "<td><code>" + escape(ctx.path || "") + "</code></td>" +
        "<td class=ctx-cell><code>" + escape(ctx.sampleContext || "") + "</code></td></tr>";
    }).join("");
    var tokCount = Array.isArray(appDump.allTokens) ? appDump.allTokens.length : 0;
    return "<div class=sub-block><h3>Konteks Payload Aplikasi (" + ids.length + " SKU · " + tokCount + " token)</h3>" +
      "<p class=muted>Potongan respons asli di sekitar SKU dari aplikasi Google One (terakhir: " + escape(appDump.updatedAt || "-") + ").</p>" +
      "<div class=scroll><table><thead><tr><th>SKU</th><th>Path</th><th>Konteks Sekitar SKU</th></tr></thead><tbody>" + rowsHtml + "</tbody></table></div></div>";
  }
  function recentTable(events) {
    if (!events.length) return "<p class=muted>Belum ada catatan respons per kejadian; data pengumpulan versi lama tidak memiliki diagnostik ini.</p>";
    return "<div class=scroll><table><thead><tr><th>Waktu (UTC)</th><th>Kategori Path</th><th>Hasil Kali Ini</th><th>ID Terdeteksi</th><th>Baru Dicatat</th><th>Di Luar Kapasitas</th></tr></thead><tbody>" +
      events.slice().reverse().map(function (event) {
        return "<tr><td class=mono-t>" + escape(event.at) + "</td><td><code>" + escape(event.path) +
          "</code></td><td>" + scanStatuses[event.status] + "</td><td class=num>" + event.candidateCount +
          "</td><td class=num>" + event.addedCount + "</td><td class=num>" + event.omittedCount + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  var validConfig = config.status === "default" || config.status === "custom";
  var writable = !!(storageAvailable && typeof storage.write === "function" && config.status !== "unavailable");
  var enabledCount = config.rules.filter(function (rule) { return rule.enabled; }).length;
  var applied = validConfig && report.test.version === COLLECTOR_VERSION &&
    report.test.mappingRevision === config.revision && report.test.mappingUpdatedAt === config.updatedAt &&
    report.test.mappingStatus === config.status;
  var notices = {
    preset: "Templat telah disimpan di perangkat; aturan terkait telah diaktifkan, respons halaman paket berikutnya yang cocok akan membaca konfigurasi baru.",
    saved: "Pemetaan telah disimpan di perangkat; respons halaman paket berikutnya akan membaca aturan ini.",
    deleted: "Aturan pemetaan telah dihapus; riwayat pengumpulan dan eksekusi tetap dipertahankan.",
    reset: "Berhasil memulihkan tiga aturan pemetaan bawaan; riwayat pengumpulan dan eksekusi tetap dipertahankan."
  };
  var notice = query("notice");
  var noticeText = quickfixNotice || (method === "GET" && config.updatedAt && Object.prototype.hasOwnProperty.call(notices, notice) ? notices[notice] : "");
  var prefill = query("from");
  var prefillTo = query("to");
  var hasPrefillPrefix = validPrefix(prefill);
  var hasPrefillExact = !hasPrefillPrefix && engine.validSku(prefill);
  var hasPrefill = hasPrefillPrefix || hasPrefillExact;
  var newRule = {
    id: "",
    match: hasPrefillPrefix ? "prefix" : "exact",
    from: hasPrefill ? prefill : "",
    to: engine.validSku(prefillTo) ? prefillTo : "",
    enabled: true
  };
  var orphanDraft = formDraft && formDraft.id && !config.rules.some(function (rule) { return rule.id === formDraft.id; });
  if (orphanDraft) {
    newRule = { id: "", match: formDraft.match, from: formDraft.from, to: formDraft.to, enabled: formDraft.enabled };
  }
  var candidates = Object.create(null);
  report.scan.skus.forEach(function (row) { if (engine.validSku(row.id)) candidates[row.id] = true; });
  var candidateRules = config.rules.concat(engine.defaults());
  presetCatalog.forEach(function (preset) { candidateRules = candidateRules.concat(preset.rules); });
  candidateRules.forEach(function (rule) {
    if (engine.validSku(rule.from)) candidates[rule.from] = true;
    if (engine.validSku(rule.to)) candidates[rule.to] = true;
  });
  function revisionInput() {
    return "<input type=hidden name=revision value=\"" + escape(config.revision) + "\">";
  }
  function twoChannelsSection() {
    var activeRules = validConfig ? config.rules.filter(function (r) { return r.enabled; }) : [];
    var hasJalur1 = activeRules.some(function (r) { return r.to === "com.google.gemini.2tb.ai.m.3month_ip_99p"; });
    var hasJalur2 = activeRules.some(function (r) { return r.to === "g1.ios.30tb.m" || r.to === "g1.ios.20tb.m" || r.to === "g1.ios.2tb.y"; });
    var dis = !writable || !validConfig ? " disabled" : "";
    return "<section class=ch-grid>" +
      "<article class=\"card ch-card" + (hasJalur1 ? " ch-active" : "") + "\">" +
        "<div class=card-head><div><h2>Jalur 1 · AI Pro Diskon 99% (3 Bulan)</h2>" +
        "<div class=sub-txt>Target: <code>com.google.gemini.2tb.ai.m.3month_ip_99p</code></div></div>" +
        "<span class=\"tag " + (hasJalur1 ? "t-ok" : "t-dim") + "\">" + (hasJalur1 ? "Aktif" : "Nonaktif") + "</span></div>" +
        "<p class=ch-price><strong>Rp 3.000/bln</strong> (ID) · ₹10/bln (IN) · $0.29/bln (US) · ₺5.39/bln (TR)</p>" +
        "<p class=muted>Bekerja di hampir semua region Apple ID (tanpa perlu ganti Google region). Jika mode <b>Slot Tunggal</b> aktif, klik tombol <b>Ultra 20TB</b> di halaman Google One untuk memunculkan pop-up Pro Rp 3.000/bln.</p>" +
        "<form method=get action=\"" + ROOT + "\" class=ch-actions>" +
          "<button class=primary type=submit name=jalur value=pro99-20tb" + dis + ">Aktifkan Slot Tunggal (Via 20TB · Anti-Bentrok)</button>" +
          "<button type=submit name=jalur value=pro99-all" + dis + ">Aktifkan di Semua Slot Pro &amp; AI Plus</button>" +
        "</form>" +
      "</article>" +
      "<article class=\"card ch-card" + (hasJalur2 ? " ch-active" : "") + "\">" +
        "<div class=card-head><div><h2>Jalur 2 · AI Ultra &amp; 2TB Tahunan Turki</h2>" +
        "<div class=sub-txt>Wajib login <b>Apple ID Turki (TR)</b> di App Store Media &amp; Pembelian</div></div>" +
        "<span class=\"tag " + (hasJalur2 ? "t-ok" : "t-dim") + "\">" + (hasJalur2 ? "Aktif" : "Nonaktif") + "</span></div>" +
        "<p class=ch-price><strong>Ultra 30TB</strong> ₺2.949,99/bln · <strong>Ultra 20TB</strong> ₺1.989,99/bln · <strong>2TB Tahunan</strong> ₺499,99/thn</p>" +
        "<p class=muted>Satu-satunya jalur True Ultra (20TB / 30TB) yang masih hidup di Apple StoreKit iOS memakai SKU legacy tanpa akhiran <code>.v2</code> / <code>.ai.pro</code>.</p>" +
        "<form method=get action=\"" + ROOT + "\" class=ch-actions>" +
          "<button class=primary type=submit name=jalur value=turki-all" + dis + ">Aktifkan Jalur 2 (Khusus Ultra &amp; 2TB Turki)</button>" +
          "<button type=submit name=jalur value=combo" + dis + ">Aktifkan Gabungan (Jalur 1 Pro + Jalur 2 Ultra)</button>" +
        "</form>" +
      "</article>" +
    "</section>";
  }
  function presetTemplates() {
    return "<section id=mapping-presets class=card><div class=card-head><h2>Templat Pemetaan Siap Pakai</h2></div>" +
      "<details class=sub-drawer><summary>Catatan cara kerja &amp; kompatibilitas templat</summary><div class=sub-drawer-body>" +
      "<p>Setelah pemasangan atau upgrade, klik \"Terapkan Templat\" untuk menyimpan aturan terkait; proses upgrade tetap mempertahankan konfigurasi sebelumnya. Aturan dengan cara pencocokan dan SKU asal yang sama akan diperbarui dan diaktifkan, sedangkan aturan manual dan riwayat lain tetap dipertahankan.</p>" +
      "<p class=muted>Promo Pro 99p dan Turki 20TB dapat digunakan bersamaan. Templat Pro 99p dan Pro 12 Bulan mengalihkan awalan Pro yang sama; Turki 20TB dan Ultra 75p mengalihkan entri 20TB.</p>" +
      "<p class=muted>Menerapkan Promo Pro 99p akan menonaktifkan aturan warisan \"20TB -> Pro Gemini\", sementara target 20TB lainnya tetap dipertahankan; setelah itu masuk kembali melalui halaman paket Pro sendiri.</p>" +
      "<p class=muted>Setelah menyimpan, buka ulang halaman paket agar respons cocok berikutnya memakai konfigurasi baru. Label di kartu hanya membandingkan konfigurasi lokal; pastikan juga versi skrip, revisi konfigurasi, dan target aktual pada bagian Eksekusi Pemetaan Terakhir.</p>" +
      "</div></details>" +
      "<div class=preset-list>" + presetCatalog.map(function (preset) {
        var matches = validConfig && preset.rules.every(function (target) {
          return config.rules.some(function (rule) {
            return rule.match === target.match && rule.from === target.from && rule.to === target.to && rule.enabled;
          });
        });
        if (matches && preset.id === "pro-1yuan") {
          matches = !config.rules.some(function (rule) {
            return rule.enabled && rule.match === "exact" && rule.from === "g1.ios.20tb.m.v2" &&
              rule.to === preset.rules[0].to;
          });
        }
        var pairs = preset.rules.map(function (rule) {
          return "<div class=preset-pair><span class=sub-txt>" + (rule.match === "exact" ? "SKU Persis" : "Awalan SKU") +
            "</span> <code>" + escape(rule.from) + "</code> <span aria-label=\"Diganti menjadi\">→</span> <code>" + escape(rule.to) + "</code></div>";
        }).join("");
        return "<form class=preset method=post action=\"" + ROOT + "\"><fieldset" +
          (!writable || !validConfig ? " disabled" : "") + "><legend>" + escape(preset.title) + "</legend>" +
          revisionInput() + "<input type=hidden name=preset value=\"" + escape(preset.id) + "\">" +
          "<p class=muted>" + escape(preset.description) + "</p>" + pairs +
          (matches ? "<span class=\"tag t-ok\">Aturan saat ini cocok</span>" : "") +
          "<button type=submit name=action value=preset>Terapkan Templat</button></fieldset></form>";
      }).join("") + "</div></section>";
  }
  function ruleForm(rule, isNew) {
    var draft = formDraft && formDraft.id === rule.id ? formDraft : rule;
    var disabled = !writable || !validConfig || (isNew && config.rules.length >= engine.limit);
    var select = "<option value=exact" + (draft.match === "exact" ? " selected" : "") + ">SKU Persis (Exact)</option>" +
      "<option value=prefix" + (draft.match === "prefix" ? " selected" : "") + ">Awalan SKU (Prefix, akhiri dengan titik)</option>";
    if (draft.match !== "exact" && draft.match !== "prefix") select = "<option value=\"\" selected>Silakan pilih cara pencocokan</option>" + select;
    return "<form class=rule method=post action=\"" + ROOT + "\"" + (isNew ? " id=new-mapping" : "") + ">" +
      "<fieldset" + (disabled ? " disabled" : "") + "><legend>" + (isNew ? "Tambah Pemetaan Baru" : "Edit Aturan") + "</legend>" +
      revisionInput() + "<input type=hidden name=id value=\"" + escape(rule.id) + "\">" +
      "<div class=fields><label>Cara Pencocokan<select name=match required>" + select + "</select></label>" +
      "<label class=check><input type=checkbox name=enabled value=1" + (draft.enabled ? " checked" : "") + ">Aktifkan aturan</label>" +
      "<label>SKU Asal<input name=from type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{1,160}\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.from.slice(0, 300)) + "\" placeholder=\"g1.ios.ai.2tb.\"></label>" +
      "<label>SKU Tujuan<input name=to type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{0,159}[A-Za-z0-9_\\-]\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.to.slice(0, 300)) + "\" placeholder=\"com.google.gemini.2tb.ai.m.3month_ip_99p\"></label></div>" +
      "<div class=actions><button class=primary type=submit name=action value=upsert>" + (isNew ? "Tambah dan Simpan" : "Simpan Pemetaan Ini") + "</button>" +
      (isNew ? "" : "<button class=delete type=submit name=action value=delete formnovalidate>Hapus Pemetaan Ini</button>") + "</div></fieldset></form>";
  }
  function mappingEditor() {
    var parts = ["<section id=mapping-editor class=inner-sec><h2>Pengelolaan Pemetaan</h2>",
      "<p class=muted>Setelah mengubah SKU asal, SKU tujuan, atau status aktivasi, klik tombol simpan pada baris tersebut. Waktu simpan (UTC): " + escape(config.updatedAt || "Sedang menggunakan nilai bawaan internal, belum pernah disimpan manual") + "</p>",
      "<p><strong>Saat ini aktif " + enabledCount + " aturan / total " + config.rules.length + " aturan</strong>, maksimal " + engine.limit + " aturan.</p>"];
    if (!validConfig) parts.push("<p class=error role=alert>" + escape(config.error) + "</p>");
    else if (applied) parts.push("<p class=ok-box>Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini; menulis ulang " + report.test.hitCount + " kali pada sesi tersebut.</p>");
    else parts.push("<p class=warn-box>Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini; setelah menyimpan, buka ulang halaman paket di Google App lalu segarkan halaman ini untuk memeriksa.</p>");
    if (report.test.version && report.test.version !== COLLECTOR_VERSION) {
      parts.push("<p class=warn-box>Catatan eksekusi terakhir berasal dari <code>" + escape(report.test.version) +
        "</code>, sedangkan skrip respons versi ini adalah <code>" + escape(COLLECTOR_VERSION) +
        "</code>. Catatan lama tetap dipertahankan; jika versi eksekusi belum berubah setelah membuka ulang halaman paket, matikan modul lama lalu muat ulang skrip versi ini.</p>");
    }
    if (validConfig && enabledCount === 0) parts.push("<p class=muted>Saat ini tidak ada aturan yang aktif: pengumpulan tetap berjalan, isi respons dibiarkan asli.</p>");
    if (!writable) parts.push("<p class=error>Penyimpanan pemetaan lokal belum siap, tombol edit dinonaktifkan sementara.</p>");
    parts.push("<p class=muted>SKU persis (exact) diprioritaskan; aturan awalan (prefix) memilih awalan terpanjang dan wajib diakhiri titik. Aturan nonaktif tidak ikut dicocokkan; setiap ID asal hanya diganti satu kali, target tidak dicocokkan ulang secara berantai.</p>");
    parts.push("<datalist id=sku-candidates>" + Object.keys(candidates).sort().map(function (id) {
      return "<option value=\"" + escape(id) + "\"></option>";
    }).join("") + "</datalist>");
    config.rules.forEach(function (rule) { parts.push(ruleForm(rule, false)); });
    if (orphanDraft) parts.push("<p class=warn-box>Hasil penyimpanan isian sebelumnya belum terkonfirmasi, isi dipertahankan di kotak tambah baru; segarkan untuk memeriksa aturan saat ini sebelum menyimpan ulang.</p>");
    parts.push(ruleForm(newRule, true));
    if (config.rules.length >= engine.limit) parts.push("<p class=muted>Batas maksimal aturan telah tercapai, hapus salah satu aturan untuk menambah yang baru.</p>");
    parts.push("<form class=reset method=post action=\"" + ROOT + "\">" + revisionInput() +
      "<button type=submit name=action value=reset" + (!writable ? " disabled" : "") + ">Pulihkan Pemetaan Bawaan</button></form>",
      "<p class=muted>Pulihkan bawaan akan mengganti aturan saat ini menjadi tiga aturan internal (2TB 12 bulan 90p, 20TB / 30TB 3 bulan 75p); riwayat pengumpulan dan eksekusi tetap disimpan.</p></section>");
    return parts.join("");
  }
  var latestScan = report.scan.recentResponses.length ?
    report.scan.recentResponses[report.scan.recentResponses.length - 1] : null;
  var scanVersionStatus = report.scan.version === COLLECTOR_VERSION ?
    "Catatan berasal dari skrip pengumpul versi ini; periksa waktu respons dan jumlah untuk mengetahui apakah ada catatan baru." :
    report.scan.version ? "Catatan pengumpulan versi lama; belum ada catatan respons pengumpulan versi ini yang tersimpan." : "Belum ada catatan respons pengumpulan versi ini yang tersimpan.";
  var configuredOffers = config.mode === "discount75" ?
    "Konfigurasi bawaan 20TB / 30TB saat ini memakai Ultra 3 bulan 75p (diskon 75% / bayar 25%), tanpa opsi cadangan." :
    config.mode === "custom" ? "Saat ini memakai pemetaan manual, target mengacu pada aturan aktif di Pengelolaan Pemetaan." : "Konfigurasi pemetaan saat ini belum siap, penulisan ulang dijeda sementara.";
  var statuses = {
    "rewritten": "Penggantian string telah dijalankan",
    "no-match": "Respons kali ini tidak mengenai aturan pemetaan yang aktif",
    "non-text": "Respons kali ini tidak memiliki body teks yang dapat diproses",
    "config-error": "Gagal membaca konfigurasi pemetaan, respons kali ini dibiarkan asli"
  };
  var status = Object.prototype.hasOwnProperty.call(statuses, report.test.status) ?
    statuses[report.test.status] : "Belum ada catatan eksekusi pengujian";
  if (report.test.version === "pro-annual-test-v1" && report.test.status === "no-match") {
    status = "Catatan v1 lama: respons kali ini tidak mengenai awalan iOS 2TB";
  }
  var editorOpen = hasPrefill || orphanDraft || formDraft || !validConfig || !writable ? " open" : "";
  var execOpen = report.test.status === "config-error" ? " open" : "";
  var css = [
    "*{box-sizing:border-box}",
    "html{color-scheme:dark}",
    "body{margin:0;padding:18px 14px 44px;font:14px/1.5 -apple-system,BlinkMacSystemFont,\"SF Pro Text\",sans-serif;color:#ececf1;background:#0a0a0c}",
    ".wrap{max-width:860px;margin:0 auto}",
    "h1{font-size:20px;font-weight:700;margin:0;letter-spacing:-.01em}",
    "h2{font-size:15px;font-weight:600;margin:0}",
    "h3{font-size:13.5px;font-weight:600;margin:14px 0 6px}",
    "p{margin:6px 0}",
    "code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;color:#d4d4d8;background:#18181d;border:1px solid #27272e;padding:1px 5px;border-radius:4px;overflow-wrap:anywhere}",
    "a{color:#60a5fa;text-decoration:none}",
    "a:hover{text-decoration:underline}",
    ".head{padding-bottom:14px;border-bottom:1px solid #232329;margin-bottom:16px}",
    ".head-meta{color:#9ca3af;font-size:12.5px;margin-top:4px}",
    ".toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}",
    ".toolbar form{margin:0}",
    "button,.toolbar a,.btn-sm{font:inherit;font-size:13px;font-weight:600;padding:8px 12px;border:1px solid #2e2e36;border-radius:7px;background:#16161b;color:#ececf1;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}",
    "button:hover,.toolbar a:hover,.btn-sm:hover{background:#1f1f27;border-color:#3f3f49;text-decoration:none}",
    ".primary{background:#2563eb;border-color:#2563eb;color:#fff}",
    ".primary:hover{background:#1d4ed8;border-color:#1d4ed8}",
    ".delete{background:#2c1517;border-color:#5c2327;color:#fca5a5}",
    ".card{background:#121216;border:1px solid #232329;border-radius:10px;padding:16px;margin:14px 0}",
    ".card-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}",
    ".meta{font-size:12.5px;color:#9ca3af}",
    ".muted{color:#9ca3af;font-size:12.5px}",
    ".sub-txt{font-size:11.5px;color:#9ca3af;margin-bottom:3px}",
    ".tag{display:inline-block;font-size:11px;font-weight:600;padding:1px 7px;border-radius:4px;border:1px solid #2e2e36;background:#18181d;color:#d4d4d8}",
    ".t-ok{background:#0f2419;border-color:#1f4d35;color:#4ade80}",
    ".t-warn{background:#261d0d;border-color:#4d3812;color:#fbbf24}",
    ".t-hi{background:#152033;border-color:#233a61;color:#93c5fd}",
    ".t-dim{color:#9ca3af}",
    ".ok-box{background:#0f2419;border:1px solid #1f4d35;color:#86efac;padding:10px 12px;border-radius:7px;font-size:13px;margin:10px 0}",
    ".warn-box{background:#241c0d;border:1px solid #4a3714;color:#fde68a;padding:10px 12px;border-radius:7px;font-size:13px;margin:10px 0}",
    ".error{background:#2c1517;border:1px solid #5c2327;color:#fca5a5;padding:10px 12px;border-radius:7px;font-size:13px;overflow-wrap:anywhere;margin:10px 0}",
    ".scroll{overflow:auto;border:1px solid #232329;border-radius:7px;margin:10px 0}",
    "table{border-collapse:collapse;width:100%;font-size:12.5px}",
    "th{background:#16161b;color:#9ca3af;font-weight:600;font-size:11.5px;text-align:left;padding:8px 10px;border-bottom:1px solid #232329}",
    "td{padding:9px 10px;border-bottom:1px solid #1d1d22;vertical-align:top;text-align:left}",
    "tr:last-child td{border-bottom:0}",
    ".num{font-variant-numeric:tabular-nums;font-weight:600}",
    ".mono-t{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#9ca3af;white-space:nowrap}",
    ".ctx-cell code{display:block;max-width:340px;font-size:11px;line-height:1.4}",
    ".ch-grid{display:flex;flex-direction:column;gap:12px;margin:14px 0}",
    ".ch-card{margin:0}",
    ".ch-active{border-color:#2b6b45}",
    ".ch-price{font-size:13.5px;color:#ececf1;margin:8px 0 4px}",
    ".ch-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}",
    ".preset-list{display:flex;flex-direction:column;gap:8px;margin-top:10px}",
    ".preset{margin:0}",
    "fieldset{min-width:0;margin:0;border:1px solid #232329;border-radius:8px;padding:12px;background:#16161b}",
    "legend{font-weight:600;font-size:13.5px;padding:0 5px;color:#ececf1}",
    ".preset-pair{margin:6px 0 8px;font-size:12px}",
    ".preset fieldset>button{margin-top:6px}",
    ".acc,.sub-drawer{background:#121216;border:1px solid #232329;border-radius:10px;margin:10px 0}",
    ".sub-drawer{background:#16161b}",
    ".acc>summary,.sub-drawer>summary{cursor:pointer;list-style:none;padding:12px 16px;font-size:13.5px;font-weight:600;display:flex;justify-content:space-between;align-items:center;gap:10px}",
    ".acc>summary::-webkit-details-marker,.sub-drawer>summary::-webkit-details-marker{display:none}",
    ".acc>summary::after,.sub-drawer>summary::after{content:\"▾\";color:#9ca3af;font-size:12px}",
    ".acc[open]>summary::after,.sub-drawer[open]>summary::after{content:\"▴\"}",
    ".acc-body,.sub-drawer-body{padding:12px 16px 16px;border-top:1px solid #232329}",
    ".inner-sec{margin:0;padding:0}",
    ".rule{margin:12px 0}",
    ".fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    ".fields label{font-size:12px;font-weight:600;color:#9ca3af;display:block;min-width:0}",
    "input[type=text],select{font:13.5px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;width:100%;padding:8px 10px;margin-top:4px;border:1px solid #2e2e36;border-radius:6px;background:#0a0a0c;color:#ececf1}",
    "input[type=text]{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px}",
    ".check{display:flex!important;align-items:center;gap:8px;align-self:end;min-height:38px;color:#ececf1!important}",
    ".check input{width:16px;height:16px}",
    ".actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}",
    ".reset{margin-top:12px}",
    "button:disabled,fieldset:disabled{opacity:.45;cursor:default}",
    "@media(max-width:640px){body{padding:14px 10px 36px}.fields{grid-template-columns:1fr}.toolbar,.ch-actions{flex-direction:column}.toolbar button,.toolbar a,.ch-actions button{width:100%}}"
  ].join("");
  function renderHtml(extraNotice, extraError) {
    var finalError = extraError || actionError;
    var finalNotice = extraNotice || noticeText;
    var advOpen = editorOpen || execOpen ? " open" : "";
    return [
      "<!doctype html><html lang=id><meta charset=utf-8>",
      "<meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Pengelolaan SKU Google One</title>",
      "<style>" + css + "</style>",
      "<main class=wrap>",
      "<header class=head>",
      "<h1>Pengelolaan SKU Google One</h1>",
      "<div class=head-meta>Skrip lokal telah mengambil alih · " + VERSION + " · Entri laporan saat ini: " + modeName(report.configuredMode) + " · " + enabledCount + " aturan aktif</div>",
      "<nav class=toolbar aria-label=\"Operasi laporan\">" +
        "<a href=\"" + ROOT + "\">Segarkan Laporan</a>" +
        "<form method=get action=\"" + ROOT + "\"><button type=submit name=sync value=1>Kirim Dump &amp; Log ke Gist</button></form>" +
        "<form method=get action=\"" + ROOT + "\"><button type=submit name=format value=json>Ekspor JSON</button></form>" +
      "</nav>",
      "</header>",
      finalError ? "<p class=error role=alert>" + escape(finalError) + "</p>" : "",
      finalNotice ? "<p class=ok-box role=status>" + escape(finalNotice) + "</p>" : "",
      clearMessage ? "<p class=ok-box>" + escape(clearMessage) + "</p>" : "",
      storageAvailable ? "" : "<p class=error>Antarmuka penyimpanan lokal belum siap; halaman ini belum dapat membaca catatan pengumpulan.</p>",
      twoChannelsSection(),
      "<details class=acc" + advOpen + "><summary><span>Pengaturan Lanjutan, Editor Manual &amp; Log Diagnostik (" + enabledCount + " aturan · " + report.test.hitCount + " hit · " + report.scan.skus.length + " SKU)</span></summary><div class=acc-body>",
      presetTemplates(),
      mappingEditor(),
      "<details class=sub-drawer" + execOpen + "><summary><span>Hasil Penulisan Ulang Terakhir (" + report.test.hitCount + " penggantian)</span></summary><div class=sub-drawer-body><section class=inner-sec><h2>Eksekusi Pemetaan Terakhir</h2>",
      "<p>Target awalan 2TB yang dikonfigurasi saat ini: <code>" + escape(report.configuredTarget || "Aturan awalan 2TB terpadu tidak aktif") + "</code></p>",
      "<p class=muted>Aturan persis (exact) dapat menimpa masing-masing ID 2TB secara individual; target aktual per baris ada di tabel bawah. Nama produk, harga, dan siklus penagihan aktual silakan cek di panel pembelian App Store.</p>",
      "<p>Versi: " + escape(report.test.version || "Belum ada") + "<br>Mode pemetaan aktual: " + modeName(report.test.mode) + "<br>Status: " + escape(status) + "; Total penggantian: " + report.test.hitCount + "; Termasuk 2TB: " + report.test.annualHitCount + "</p>",
      "<p>Awalan asal 2TB: <code>g1.ios.2tb.</code><br>Target 2TB pada catatan kali ini: <code>" + escape(report.test.target || "Belum tercatat") + "</code><br>" + configuredOffers + " Tabel di bawah tetap mempertahankan target aktual dan status cadangan saat eksekusi tersebut; cadangan 75p / 90p lama ditampilkan sesuai catatan asli.<br>Waktu penyimpanan konfigurasi yang dipakai (UTC): " + escape(report.test.mappingUpdatedAt || "Bawaan internal atau belum tercatat pada versi lama") + "<br>Waktu eksekusi (UTC): " + escape(report.test.updatedAt || "Belum ada") + "</p>",
      table(report.test.matchedFrom, false),
      "</section></div></details>",
      "<details class=sub-drawer><summary><span>Dump Semua SKU &amp; Konteks Aplikasi (" + report.scan.skus.length + " SKU)</span></summary><div class=sub-drawer-body><section class=inner-sec><h2>Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman</h2>",
      "<p>Total ID kumulatif: " + report.scan.skus.length + "; ID yang sama digabung hitungannya, rincian ID baru dan duplikat per respons dapat dilihat pada Catatan Eksekusi Pengumpulan di bawah.</p>",
      "<p class=muted>ID diekstrak dari respons asli sebelum penulisan ulang dan bukan merupakan katalog lengkap toko; target pengganti yang dihasilkan skrip tidak otomatis masuk ke daftar ini.</p>",
      report.scan.truncated ? "<p class=warn-box>Catatan telah mencapai batas 300 ID; kosongkan catatan jika ingin mengumpulkan ulang dari halaman target.</p>" : "",
      table(report.scan.skus, true),
      appDumpSection(),
      "<p class=muted>Waktu pembaruan (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p></section></div></details>",
      "<details class=sub-drawer><summary><span>Log Diagnostik &amp; Reset Riwayat (" + report.scan.recentResponses.length + " log)</span></summary><div class=sub-drawer-body><section class=inner-sec><h2>Catatan Eksekusi Pengumpulan</h2>",
      "<p>Skrip pengumpul aktual: <code>" + escape(report.scan.version || "Belum ada catatan") + "</code><br>Mode pengumpulan aktual: " + modeName(report.scan.mode) + "<br>" + scanVersionStatus + "</p>",
      "<p>Respons teks dipindai: " + report.scan.scannedResponses + "; Respons non-teks dicatat: " + report.scan.nonTextResponses +
        "; Respons berisi ID produk: " + report.scan.matchedResponses + "; Total ID unik: " + report.scan.skus.length + "</p>",
      "<p>Waktu penyimpanan terakhir (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p>",
      latestScan ? "<p><strong>Terbaru: " + scanStatuses[latestScan.status] + "</strong><br>Terdeteksi " +
        latestScan.candidateCount + " ID berbeda, baru dicatat " + latestScan.addedCount + ", di luar kapasitas " + latestScan.omittedCount + ".</p>" : "",
      "<h3>10 Respons Terakhir</h3>", recentTable(report.scan.recentResponses),
      "<p class=muted>Halaman ini dibuat secara lokal oleh Shadowrocket di perangkat ini; bilah alamat tetap memakai one.google.com, sementara konfigurasi pemetaan dan catatan pengumpulan disimpan di perangkat ini. Cukup aktifkan satu modul G1 ACQ saja.</p>",
      "<p class=muted>Jika jumlah bertambah dan status menunjukkan ID duplikat, artinya respons sudah diterima; jika waktu dan jumlah tidak berubah, periksa dekripsi HTTPS dan log skrip.</p>",
      "<form method=get action=\"" + ROOT + "\" class=reset><button name=clear value=1>Kosongkan Catatan Pengumpulan dan Uji Coba Alat Ini</button></form>",
      "<p class=muted>Mengosongkan catatan tetap mempertahankan konfigurasi pemetaan; setelah melihat paket, segarkan halaman ini untuk melihat catatan baru, dan biarkan pemindai terpisah maupun salinan penulisan ulang lama tetap nonaktif.</p>",
      "</section></div></details>",
      "</div></details>",
      "</main></html>"
    ].join("");
  }

  if (method === "GET" && query("sync") === "1") {
    var syncBody = JSON.stringify({ syncedAt: new Date().toISOString(), report: report, appDump: appDump }, null, 2);
    if (typeof $httpClient !== "undefined" && $httpClient && typeof $httpClient.post === "function") {
      $httpClient.post({
        url: SYNC_URL,
        timeout: 8,
        headers: {
          "Filename": "g1-iphone-dump.json",
          "Title": "G1 ACQ iPhone Dump"
        },
        body: syncBody
      }, function (err, resp, respBody) {
        var ok = !err && resp && (resp.status >= 200 && resp.status < 300);
        var infoId = "";
        if (ok && typeof respBody === "string") {
          try { infoId = JSON.parse(respBody).id || ""; } catch (e) { infoId = ""; }
        }
        var sNotice = ok ? "Dump App & Log berhasil dikirim ke Cloud Relay (ID: " + (infoId || "OK") + ", " + syncBody.length + " byte). Beritahu AI untuk langsung tarik datanya." : "";
        var sErr = ok ? "" : "Gagal mengirim dump ke Cloud Relay" + (err ? " (" + String(err) + ")" : resp ? " (HTTP " + resp.status + ")" : "") + "; gunakan tombol Ekspor JSON / Unduh Dump App.";
        $done({ response: { status: responseStatus, headers: headers, body: renderHtml(sNotice, sErr) } });
      });
      return;
    }
    noticeText = "Antarmuka jaringan skrip tidak tersedia di lingkungan ini; gunakan tombol Unduh Dump App atau Ekspor JSON.";
  }

  $done({ response: { status: responseStatus, headers: headers, body: renderHtml("", "") } });
})();
