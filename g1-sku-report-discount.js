/* Generated from g1-sku-report.js by tools/build-variants.cjs. */
/* Laporan lokal & pengelola pemetaan SKU yang disajikan oleh skrip http-request Shadowrocket. */
"use strict";

(function () {
  var ROOT = "https://one.google.com/g1-sku-report";
  var VERSION = "v7.12.0";
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
      clearMessage = scanCleared && testCleared ? "Kedua catatan lokal alat ini telah dikosongkan, konfigurasi pemetaan tetap dipertahankan." : "Pembersihan catatan lokal belum selesai.";
    } catch (error) {
      clearMessage = "Antarmuka penyimpanan lokal belum siap.";
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

  console.log("[g1-sku-report] " + VERSION + " " + (exportJSON ? "json" : "html") +
    " storage=" + (storageAvailable ? "ready" : "unavailable") + " candidates=" + report.scan.skus.length);
  if (exportJSON) {
    headers["Content-Type"] = "application/json; charset=utf-8";
    headers["Content-Disposition"] = 'attachment; filename="g1-sku-report.json"';
    $done({ response: { status: 200, headers: headers, body: JSON.stringify(report, null, 2) } });
    return;
  }

  function escape(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }
  function fallbackName(row) {
    if (!row.fallback) return "Tidak";
    var discount = /_ip_(\d+p)\.acq$/.exec(row.to || "");
    return discount ? discount[1] : "Ya";
  }
  function table(items, withTime) {
    if (!items.length) return "<p>Belum ada catatan.</p>";
    return "<div class=scroll><table><thead><tr><th>ID Produk Lengkap</th><th>Jumlah</th>" +
      (withTime ? "<th>Waktu Terakhir Ditemukan (UTC)</th><th>Tambah Pemetaan</th>" : "<th>SKU Target Aktual</th><th>Cadangan</th>") + "</tr></thead><tbody>" +
      items.map(function (row) {
        return "<tr><td><code>" + escape(row.id) + "</code></td><td>" + row.count + "</td>" +
          (withTime ? "<td>" + escape(row.lastSeen) + "</td><td><a href=\"" + ROOT + "?from=" + escape(encodeURIComponent(row.id)) + "#new-mapping\">Jadikan SKU Asal</a></td>" :
            "<td><code>" + escape(row.to || "Belum tercatat") + "</code></td><td>" + fallbackName(row) + "</td>") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function recentTable(events) {
    if (!events.length) return "<p>Belum ada catatan respons per kejadian; data pengumpulan versi lama tidak memiliki diagnostik ini.</p>";
    return "<div class=scroll><table><thead><tr><th>Waktu (UTC)</th><th>Kategori Path</th><th>Hasil Kali Ini</th><th>ID Terdeteksi</th><th>Baru Dicatat</th><th>Di Luar Kapasitas</th></tr></thead><tbody>" +
      events.slice().reverse().map(function (event) {
        return "<tr><td>" + escape(event.at) + "</td><td>" + escape(event.path) +
          "</td><td>" + scanStatuses[event.status] + "</td><td>" + event.candidateCount +
          "</td><td>" + event.addedCount + "</td><td>" + event.omittedCount + "</td></tr>";
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
  var noticeText = method === "GET" && config.updatedAt && Object.prototype.hasOwnProperty.call(notices, notice) ? notices[notice] : "";
  var prefill = query("from");
  var newRule = { id: "", match: "exact", from: engine.validSku(prefill) ? prefill : "", to: "", enabled: true };
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
  function presetTemplates() {
    return "<section id=mapping-presets><h2>Templat Pemetaan Siap Pakai</h2>" +
      "<p>Setelah pemasangan atau upgrade, klik \"Terapkan Templat\" untuk menyimpan aturan terkait; proses upgrade tetap mempertahankan konfigurasi sebelumnya. Aturan dengan cara pencocokan dan SKU asal yang sama akan diperbarui dan diaktifkan, sedangkan aturan manual dan riwayat lain tetap dipertahankan.</p>" +
      "<p class=note>Promo Pro 99p dan Turki 20TB dapat digunakan bersamaan. Templat Pro 99p dan Pro 12 Bulan mengalihkan awalan Pro yang sama; Turki 20TB dan Ultra 75p mengalihkan entri 20TB.</p>" +
      "<p class=note>Menerapkan Promo Pro 99p akan menonaktifkan aturan warisan \"20TB -> Pro Gemini\", sementara target 20TB lainnya tetap dipertahankan; setelah itu masuk kembali melalui halaman paket Pro sendiri.</p>" +
      "<p class=note>Setelah menyimpan, buka ulang halaman paket agar respons cocok berikutnya memakai konfigurasi baru. Label \"Aturan saat ini cocok\" hanya membandingkan konfigurasi lokal; pastikan juga versi skrip, revisi konfigurasi, dan target aktual pada catatan eksekusi di bawah.</p>" +
      "<div class=preset-grid>" + presetCatalog.map(function (preset) {
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
          return "<div class=preset-pair><span class=note>" + (rule.match === "exact" ? "SKU Persis" : "Awalan SKU") +
            "</span><code>" + escape(rule.from) + "</code><span aria-label=\"Diganti menjadi\">↓</span><code>" + escape(rule.to) + "</code></div>";
        }).join("");
        return "<form class=preset method=post action=\"" + ROOT + "\"><fieldset" +
          (!writable || !validConfig ? " disabled" : "") + "><legend>" + escape(preset.title) + "</legend>" +
          revisionInput() + "<input type=hidden name=preset value=\"" + escape(preset.id) + "\">" +
          "<p class=note>" + escape(preset.description) + "</p>" + pairs +
          (matches ? "<p class=preset-state>Aturan saat ini cocok</p>" : "") +
          "<button class=primary type=submit name=action value=preset>Terapkan Templat</button></fieldset></form>";
      }).join("") + "</div></section>";
  }
  function ruleForm(rule, isNew) {
    var draft = formDraft && formDraft.id === rule.id ? formDraft : rule;
    var disabled = !writable || !validConfig || (isNew && config.rules.length >= engine.limit);
    var select = "<option value=exact" + (draft.match === "exact" ? " selected" : "") + ">SKU Persis (Exact)</option>" +
      "<option value=prefix" + (draft.match === "prefix" ? " selected" : "") + ">Awalan SKU (Prefix, akhiri dengan titik)</option>";
    if (draft.match !== "exact" && draft.match !== "prefix") select = "<option value=\"\" selected>Silakan pilih cara pencocokan</option>" + select;
    return "<form class=rule method=post action=\"" + ROOT + "\"" + (isNew ? " id=new-mapping" : "") + ">" +
      "<fieldset" + (disabled ? " disabled" : "") + "><legend>" + (isNew ? "Tambah Pemetaan Baru" : "Edit Pemetaan") + "</legend>" +
      revisionInput() + "<input type=hidden name=id value=\"" + escape(rule.id) + "\">" +
      "<div class=fields><label>Cara Pencocokan<select name=match required>" + select + "</select></label>" +
      "<label class=check><input type=checkbox name=enabled value=1" + (draft.enabled ? " checked" : "") + ">Aktifkan aturan ini</label>" +
      "<label>SKU Asal<input name=from type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{1,160}\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.from.slice(0, 300)) + "\" placeholder=\"g1.ios.20tb.m.v2\"></label>" +
      "<label>SKU Tujuan<input name=to type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{0,159}[A-Za-z0-9_\\-]\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.to.slice(0, 300)) + "\" placeholder=\"g1.20tb.3months_ip_75p.acq\"></label></div>" +
      "<div class=actions><button class=primary type=submit name=action value=upsert>" + (isNew ? "Tambah dan Simpan" : "Simpan Pemetaan Ini") + "</button>" +
      (isNew ? "" : "<button class=delete type=submit name=action value=delete formnovalidate>Hapus Pemetaan Ini</button>") + "</div></fieldset></form>";
  }
  function mappingEditor() {
    var parts = ["<section id=mapping-editor><h2>Pengelolaan Pemetaan</h2>",
      "<p>Setelah mengubah SKU asal, SKU tujuan, atau status aktivasi, klik tombol simpan pada baris tersebut.</p>",
      "<p><strong>Saat ini aktif " + enabledCount + " aturan / total " + config.rules.length + " aturan</strong>, maksimal " + engine.limit + " aturan.</p>",
      "<p>Waktu penyimpanan konfigurasi (UTC): " + escape(config.updatedAt || "Sedang menggunakan nilai bawaan internal, belum pernah disimpan manual") + "</p>"];
    if (!validConfig) parts.push("<p class=error role=alert>" + escape(config.error) + "</p>");
    else if (applied) parts.push("<p class=success>Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini; menulis ulang " + report.test.hitCount + " kali pada sesi tersebut.</p>");
    else parts.push("<p class=note>Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini; setelah menyimpan, buka ulang halaman paket di Google App lalu segarkan halaman ini untuk memeriksa.</p>");
    if (report.test.version && report.test.version !== COLLECTOR_VERSION) {
      parts.push("<p class=note>Catatan eksekusi terakhir berasal dari <code>" + escape(report.test.version) +
        "</code>, sedangkan skrip respons versi ini adalah <code>" + escape(COLLECTOR_VERSION) +
        "</code>. Catatan lama tetap dipertahankan; jika versi eksekusi belum berubah setelah membuka ulang halaman paket, matikan modul lama lalu muat ulang skrip versi ini.</p>");
    }
    if (validConfig && enabledCount === 0) parts.push("<p class=note>Saat ini tidak ada aturan yang aktif: pengumpulan tetap berjalan, isi respons dibiarkan asli.</p>");
    if (!writable) parts.push("<p class=error>Penyimpanan pemetaan lokal belum siap, tombol edit dinonaktifkan sementara.</p>");
    parts.push("<p class=note>SKU persis (exact) diprioritaskan; aturan awalan (prefix) memilih awalan terpanjang dan wajib diakhiri titik. Aturan nonaktif tidak ikut dicocokkan; setiap ID asal hanya diganti satu kali, target tidak dicocokkan ulang secara berantai.</p>");
    parts.push("<datalist id=sku-candidates>" + Object.keys(candidates).sort().map(function (id) {
      return "<option value=\"" + escape(id) + "\"></option>";
    }).join("") + "</datalist>");
    config.rules.forEach(function (rule) { parts.push(ruleForm(rule, false)); });
    if (orphanDraft) parts.push("<p class=note>Hasil penyimpanan isian sebelumnya belum terkonfirmasi, isi dipertahankan di kotak tambah baru; segarkan untuk memeriksa aturan saat ini sebelum menyimpan ulang.</p>");
    parts.push(ruleForm(newRule, true));
    if (config.rules.length >= engine.limit) parts.push("<p class=note>Batas maksimal aturan telah tercapai, hapus salah satu aturan untuk menambah yang baru.</p>");
    parts.push("<form class=reset method=post action=\"" + ROOT + "\">" + revisionInput() +
      "<button type=submit name=action value=reset" + (!writable ? " disabled" : "") + ">Pulihkan Pemetaan Bawaan</button></form>",
      "<p class=note>Pulihkan bawaan akan mengganti aturan saat ini menjadi tiga aturan internal (2TB 12 bulan 90p, 20TB / 30TB 3 bulan 75p); riwayat pengumpulan dan eksekusi tetap disimpan.</p></section>");
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
  var html = [
    "<!doctype html><html lang=id><meta charset=utf-8>",
    "<meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Pengelolaan SKU Google One</title>",
    "<style>*{box-sizing:border-box}body{font:16px/1.6 -apple-system,BlinkMacSystemFont,sans-serif;max-width:960px;margin:24px auto;padding:0 18px;color:#1c2737;background:#f5f7fa}section{background:white;border:1px solid #dde3ec;border-radius:12px;padding:18px;margin:18px 0}h1{font-size:24px;margin-bottom:10px}h2{font-size:20px}code{overflow-wrap:anywhere}a{color:#1259be}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.scroll{overflow:auto}.note{color:#46556b}.badge,.success{background:#e0f4e8;color:#176238;padding:8px 12px;border-radius:8px}.badge{display:inline-block}.error{background:#fff0ef;color:#9b2420;padding:12px;border-radius:8px;overflow-wrap:anywhere}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:18px 0}.actions form{margin:0}button,.actions a{font:inherit;padding:10px 16px;border:0;border-radius:8px;cursor:pointer;text-decoration:none}.actions a,button{background:#e4eaf3;color:#1c2737}.primary{background:#1259be;color:white}.delete{background:#fff0ef;color:#9b2420}fieldset{min-width:0;margin:0;border:1px solid #d7e0ec;border-radius:10px;padding:16px}legend{font-weight:600;padding:0 6px}.rule{margin:20px 0}.fields{display:grid;grid-template-columns:1fr 1fr;gap:16px}.fields label{font-weight:600;min-width:0}input[type=text],select{font:16px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;width:100%;padding:12px;margin-top:6px;border:1px solid #a7b5c8;border-radius:7px;background:white;color:#1c2737}input[type=text]{font-family:ui-monospace,SFMono-Regular,monospace}.check{display:flex;align-items:center;gap:10px;align-self:end;min-height:48px}.check input{width:20px;height:20px}.rule .actions{margin-bottom:0}button:disabled,fieldset:disabled{opacity:.55}button:disabled{cursor:default}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #568ae3;outline-offset:3px}.reset{margin-top:24px}.preset-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}.preset{min-width:0;margin:0}.preset fieldset{height:100%;display:flex;flex-direction:column}.preset legend{max-width:100%;font-size:16px}.preset .note{font-size:14px}.preset-pair{padding:10px;margin:12px 0;background:#f5f7fa;border-radius:6px}.preset-pair code{display:block;font-size:13px;line-height:1.6}.preset-state{align-self:flex-start;font-size:13px;padding:5px 8px;margin:0 0 12px;background:#e0f4e8;color:#176238;border-radius:6px}.preset button{width:100%;margin-top:auto}@media(max-width:600px){body{padding:0 10px;margin:16px auto}section{padding:14px}fieldset{padding:12px}.fields,.preset-grid{grid-template-columns:1fr}.actions{gap:8px}button{padding:10px 12px}}</style>",
    "<h1>Pengelolaan SKU Google One</h1>",
    "<p class=badge>Skrip lokal telah mengambil alih · " + VERSION + "</p>",
    "<p><strong>Entri laporan saat ini: " + modeName(report.configuredMode) + "</strong></p>",
    "<nav class=actions aria-label=\"Operasi laporan\"><form method=get action=\"" + ROOT + "\"><button type=submit name=format value=json>Ekspor JSON</button></form><a href=\"" + ROOT + "\">Segarkan Laporan</a></nav>",
    "<p class=note>Halaman ini dibuat secara lokal oleh Shadowrocket di perangkat ini; bilah alamat tetap memakai one.google.com, sementara konfigurasi pemetaan dan catatan pengumpulan disimpan di perangkat ini.</p>",
    "<p class=note>Cukup aktifkan satu modul G1 ACQ saja: kumpulkan ID dari respons asli terlebih dahulu, lalu tulis ulang sesuai aturan yang tersimpan.</p>",
    actionError ? "<p class=error role=alert>" + escape(actionError) + "</p>" : "",
    noticeText ? "<p class=success role=status>" + escape(noticeText) + "</p>" : "",
    clearMessage ? "<p>" + escape(clearMessage) + "</p>" : "",
    storageAvailable ? "" : "<p>Antarmuka penyimpanan lokal belum siap; halaman ini belum dapat membaca catatan pengumpulan.</p>",
    presetTemplates(), mappingEditor(),
    "<section><h2>Catatan Eksekusi Pengumpulan</h2>",
    "<p>Skrip pengumpul aktual: <code>" + escape(report.scan.version || "Belum ada catatan") + "</code><br>Mode pengumpulan aktual: " + modeName(report.scan.mode) + "<br>" + scanVersionStatus + "</p>",
    "<p>Respons teks dipindai: " + report.scan.scannedResponses + "; Respons non-teks dicatat: " + report.scan.nonTextResponses +
      "; Respons berisi ID produk: " + report.scan.matchedResponses + "; Total ID unik: " + report.scan.skus.length + "</p>",
    "<p>Waktu penyimpanan terakhir (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p>",
    latestScan ? "<p><strong>Terbaru: " + scanStatuses[latestScan.status] + "</strong><br>Terdeteksi " +
      latestScan.candidateCount + " ID berbeda, baru dicatat " + latestScan.addedCount + ", di luar kapasitas " + latestScan.omittedCount + ".</p>" : "",
    "<p class=note>Daftar kumulatif dideduplikasi per ID; ID yang sama akan menambah jumlah kemunculan sementara panjang daftar tetap. Catat jumlah dan waktunya, buka ulang halaman paket Google App, lalu segarkan laporan ini untuk membandingkan.</p>",
    "<h3>10 Respons Terakhir</h3>", recentTable(report.scan.recentResponses),
    "<p class=note>Jika jumlah bertambah dan status menunjukkan ID duplikat, artinya respons sudah diterima; jika waktu dan jumlah tidak berubah, belum ada respons baru yang cocok — periksa cache halaman, sakelar modul, dekripsi HTTPS, domain permintaan, dan log skrip untuk saved=no. Hanya kategori path yang disimpan.</p></section>",
    "<section><h2>Eksekusi Pemetaan Terakhir</h2>",
    "<p>Target awalan 2TB yang dikonfigurasi saat ini: <code>" + escape(report.configuredTarget || "Aturan awalan 2TB terpadu tidak aktif") + "</code></p>",
    "<p class=note>Aturan persis (exact) dapat menimpa masing-masing ID 2TB secara individual; target aktual per baris ada di tabel bawah. Nama produk, harga, dan siklus penagihan aktual silakan cek di panel pembelian App Store.</p>",
    "<p>Versi: " + escape(report.test.version || "Belum ada") + "<br>Mode pemetaan aktual: " + modeName(report.test.mode) + "<br>Status: " + escape(status) + "; Total penggantian: " + report.test.hitCount + "; Termasuk 2TB: " + report.test.annualHitCount + "</p>",
    "<p>Awalan asal 2TB: <code>g1.ios.2tb.</code><br>Target 2TB pada catatan kali ini: <code>" + escape(report.test.target || "Belum tercatat") + "</code><br>" + configuredOffers + " Tabel di bawah tetap mempertahankan target aktual dan status cadangan saat eksekusi tersebut; cadangan 75p / 90p lama ditampilkan sesuai catatan asli.<br>Waktu penyimpanan konfigurasi yang dipakai (UTC): " + escape(report.test.mappingUpdatedAt || "Bawaan internal atau belum tercatat pada versi lama") + "<br>Waktu eksekusi (UTC): " + escape(report.test.updatedAt || "Belum ada") + "</p>",
    "<p class=note>Bagian ini mencatat hasil eksekusi skrip; pengenalan produk oleh App Store, harga, dan siklus tagihan harus dicek pada panel pembelian.</p>",
    table(report.test.matchedFrom, false), "</section>",
    "<section><h2>Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman</h2>",
    "<p>Total ID kumulatif: " + report.scan.skus.length + "; ID yang sama digabung hitungannya, rincian ID baru dan duplikat per respons dapat dilihat pada Catatan Eksekusi Pengumpulan di atas.</p>",
    "<p class=note>ID diekstrak dari respons asli sebelum penulisan ulang dan bukan merupakan katalog lengkap toko; target pengganti yang dihasilkan skrip tidak otomatis masuk ke daftar ini.</p>",
    report.scan.truncated ? "<p>Catatan telah mencapai batas 300 ID; kosongkan catatan jika ingin mengumpulkan ulang dari halaman target.</p>" : "",
    table(report.scan.skus, true),
    "<p>Waktu pembaruan (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p></section>",
    "<form method=get action=\"" + ROOT + "\"><button name=clear value=1>Kosongkan Catatan Pengumpulan dan Uji Coba Alat Ini</button></form>",
    "<p class=note>Mengosongkan catatan tetap mempertahankan konfigurasi pemetaan; setelah melihat paket, segarkan halaman ini untuk melihat catatan baru, dan biarkan pemindai terpisah maupun salinan penulisan ulang lama tetap nonaktif.</p></html>"
  ].join("");
  $done({ response: { status: responseStatus, headers: headers, body: html } });
})();
