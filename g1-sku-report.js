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
  function validPrefix(value) {
    return typeof value === "string" && /^(?:g1\.|com\.google\.(?:one|gemini)\.)[A-Za-z0-9._-]{1,159}\.$/.test(value);
  }
  function describeSku(id) {
    var exactMap = {
      "g1.2tb.ai.12months_ip_90p": { tier: "Target Pro", cls: "tier-target", label: "Pro 2TB · 12 Bln Diskon 90%" },
      "g1.2tb.ai.annual": { tier: "Target Pro", cls: "tier-target", label: "Pro 2TB · Tahunan 99p (Warisan)" },
      "g1.2tb.1month_eft": { tier: "Target Pro", cls: "tier-target", label: "Pro 2TB · Uji Coba 1 Bln" },
      "g1.2tb.3months_ip_90p": { tier: "Target Pro", cls: "tier-target", label: "Pro 2TB · 3 Bln Diskon 90%" },
      "g1.100gb.1month_eft": { tier: "Target Basic", cls: "tier-target", label: "Basic 100GB · Uji Coba 1 Bln" },
      "g1.ai.ultra.1month_eft": { tier: "Target Ultra", cls: "tier-ultra", label: "Ultra · Uji Coba 1 Bln" },
      "g1.ai.ultra.3months_ip_90p.acq": { tier: "Target Ultra", cls: "tier-ultra", label: "Ultra · 3 Bln Diskon 90%" },
      "g1.ai.ultra.3months_ip_75p.acq": { tier: "Target Ultra", cls: "tier-ultra", label: "Ultra · 3 Bln Diskon 75%" },
      "g1.20tb.3months_ip_75p.acq": { tier: "Target Turki 20TB", cls: "tier-turki", label: "Turki 20TB · 3 Bln Diskon 75%" },
      "g1.30tb.3months_ip_75p.acq": { tier: "Target Turki 30TB", cls: "tier-turki", label: "Turki 30TB · 3 Bln Diskon 75%" },
      "g1.ios.ai.2tb.": { tier: "AI Pro 2TB", cls: "tier-ai-pro", label: "Semua paket AI Pro 2TB iOS" },
      "g1.ios.2tb.": { tier: "Pro 2TB", cls: "tier-pro", label: "Semua paket Pro 2TB iOS" },
      "g1.ios.helium.": { tier: "AI Plus", cls: "tier-plus", label: "Semua paket AI Plus (Helium) iOS" },
      "g1.ios.20tb.m.v2": { tier: "Ultra 20TB", cls: "tier-ultra", label: "Ultra / Turki 20TB Bulanan" },
      "g1.ios.30tb.m.v2": { tier: "Ultra 30TB", cls: "tier-ultra", label: "Ultra / Turki 30TB Bulanan" },
      "g1.ios.20tb.": { tier: "Ultra 20TB", cls: "tier-ultra", label: "Semua paket Ultra 20TB iOS" },
      "g1.ios.30tb.": { tier: "Ultra 30TB", cls: "tier-ultra", label: "Semua paket Ultra 30TB iOS" }
    };
    if (Object.prototype.hasOwnProperty.call(exactMap, id)) return exactMap[id];
    var s = String(id || "").toLowerCase();
    var tier = "SKU Lain";
    var cls = "tier-neutral";
    var parts = [];
    if (s.indexOf("ultra") !== -1 || s.indexOf("30tb") !== -1) {
      tier = s.indexOf("30tb") !== -1 ? "Ultra 30TB" : "Ultra";
      cls = "tier-ultra";
      parts.push(s.indexOf("30tb") !== -1 ? "Paket Ultra 30TB" : "Paket AI Ultra");
    } else if (s.indexOf("20tb") !== -1) {
      tier = "Ultra 20TB";
      cls = "tier-ultra";
      parts.push("Paket Ultra / 20TB");
    } else if (s.indexOf("helium") !== -1 || s.indexOf("ai_plus") !== -1) {
      tier = "AI Plus";
      cls = "tier-plus";
      parts.push("Paket AI Plus (Helium)");
    } else if (s.indexOf("ai.2tb") !== -1 || s.indexOf("2tb.ai") !== -1) {
      tier = "AI Pro 2TB";
      cls = "tier-ai-pro";
      parts.push("Paket AI Pro 2TB");
    } else if (s.indexOf("2tb") !== -1) {
      tier = "Pro 2TB";
      cls = "tier-pro";
      parts.push("Paket Pro 2TB");
    } else if (s.indexOf("200gb") !== -1) {
      tier = "Basic 200GB";
      cls = "tier-basic";
      parts.push("Paket Basic 200GB");
    } else if (s.indexOf("100gb") !== -1) {
      tier = "Basic 100GB";
      cls = "tier-basic";
      parts.push("Paket Basic 100GB");
    } else {
      parts.push("Produk Google One");
    }
    if (/\.(a|annual)\b|_1yr_|12months/.test(s)) parts.push("Tahunan");
    else if (/\.(m|monthly)\b|_3mo_|3months|1month/.test(s)) parts.push("Bulanan / Promo");
    if (s.indexOf("90p") !== -1) parts.push("Diskon 90%");
    else if (s.indexOf("75p") !== -1) parts.push("Diskon 75%");
    else if (s.indexOf("25p") !== -1) parts.push("Diskon 25%");
    else if (s.indexOf("free_trial") !== -1 || s.indexOf("_eft") !== -1) parts.push("Uji Coba");
    return { tier: tier, cls: cls, label: parts.join(" · ") };
  }
  function tierBadge(id) {
    var info = describeSku(id);
    return "<span class=\"tier " + info.cls + "\">" + escape(info.tier) + "</span>";
  }
  function skuMetaCell(id, showTier) {
    if (!id) return "";
    var info = describeSku(id);
    return "<div class=sku-meta>" + (showTier ? "<span class=\"tier " + info.cls + "\">" + escape(info.tier) + "</span>" : "") +
      "<span class=sku-desc>" + escape(info.label) + "</span></div>";
  }
  function fallbackName(row) {
    if (!row.fallback) return "Tidak";
    var discount = /_ip_(\d+p)\.acq$/.exec(row.to || "");
    return discount ? discount[1] : "Ya";
  }
  function table(items, withTime) {
    if (!items.length) return "<p class=empty-state>Belum ada catatan.</p>";
    return "<div class=scroll><table><thead><tr><th>ID Produk Lengkap</th><th>Jumlah</th>" +
      (withTime ? "<th>Waktu Terakhir Ditemukan (UTC)</th><th>Tambah Pemetaan</th>" : "<th>SKU Target Aktual</th><th>Cadangan</th>") + "</tr></thead><tbody>" +
      items.map(function (row) {
        var targetMeta = row.to ? skuMetaCell(row.to, true) : "";
        return "<tr><td>" + skuMetaCell(row.id, true) + "<code>" + escape(row.id) + "</code></td><td class=num>" + row.count + "</td>" +
          (withTime ? "<td class=mono-time>" + escape(row.lastSeen) + "</td><td><a class=chip-btn href=\"" + ROOT + "?from=" + escape(encodeURIComponent(row.id)) + "#new-mapping\">Jadikan SKU Asal</a></td>" :
            "<td>" + targetMeta + "<code>" + escape(row.to || "Belum tercatat") + "</code></td><td>" + fallbackName(row) + "</td>") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function recentTable(events) {
    if (!events.length) return "<p class=empty-state>Belum ada catatan respons per kejadian; data pengumpulan versi lama tidak memiliki diagnostik ini.</p>";
    return "<div class=scroll><table><thead><tr><th>Waktu (UTC)</th><th>Kategori Path</th><th>Hasil Kali Ini</th><th>ID Terdeteksi</th><th>Baru Dicatat</th><th>Di Luar Kapasitas</th></tr></thead><tbody>" +
      events.slice().reverse().map(function (event) {
        return "<tr><td class=mono-time>" + escape(event.at) + "</td><td><code>" + escape(event.path) +
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
  var noticeText = method === "GET" && config.updatedAt && Object.prototype.hasOwnProperty.call(notices, notice) ? notices[notice] : "";
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
  function presetTemplates() {
    return "<section id=mapping-presets class=panel>" +
      "<div class=section-head><div><span class=eyebrow>Langkah 1 · Konfigurasi Cepat</span><h2>Templat Pemetaan Siap Pakai</h2></div></div>" +
      "<p class=lead-note>Pilih skenario paket target yang ingin langsung diaktifkan pada perangkat ini.</p>" +
      "<details class=info-drawer><summary>Cara kerja templat &amp; aturan kompatibilitas</summary><div class=drawer-body>" +
      "<p>Setelah pemasangan atau upgrade, klik \"Terapkan Templat\" untuk menyimpan aturan terkait; proses upgrade tetap mempertahankan konfigurasi sebelumnya. Aturan dengan cara pencocokan dan SKU asal yang sama akan diperbarui dan diaktifkan, sedangkan aturan manual dan riwayat lain tetap dipertahankan.</p>" +
      "<p class=note>Promo Pro 99p dan Turki 20TB dapat digunakan bersamaan. Templat Pro 99p dan Pro 12 Bulan mengalihkan awalan Pro yang sama; Turki 20TB dan Ultra 75p mengalihkan entri 20TB.</p>" +
      "<p class=note>Menerapkan Promo Pro 99p akan menonaktifkan aturan warisan \"20TB -> Pro Gemini\", sementara target 20TB lainnya tetap dipertahankan; setelah itu masuk kembali melalui halaman paket Pro sendiri.</p>" +
      "<p class=note>Setelah menyimpan, buka ulang halaman paket agar respons cocok berikutnya memakai konfigurasi baru. Label di kartu hanya membandingkan konfigurasi lokal; pastikan juga versi skrip, revisi konfigurasi, dan target aktual pada bagian Eksekusi Pemetaan Terakhir.</p>" +
      "</div></details>" +
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
          var fromInfo = describeSku(rule.from);
          var toInfo = describeSku(rule.to);
          return "<div class=preset-pair>" +
            "<div class=pair-head><span class=match-tag>" + (rule.match === "exact" ? "SKU Persis" : "Awalan SKU") + "</span>" +
            tierBadge(rule.from) + "<span class=arrow aria-hidden=true>→</span>" + tierBadge(rule.to) + "</div>" +
            "<div class=pair-flow><div class=pair-end><span class=pair-label>" + escape(fromInfo.label) + "</span><code>" + escape(rule.from) + "</code></div>" +
            "<span class=pair-arrow aria-label=\"Diganti menjadi\">↓</span>" +
            "<div class=pair-end><span class=pair-label>" + escape(toInfo.label) + "</span><code>" + escape(rule.to) + "</code></div></div></div>";
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
    var formHtml = "<form class=rule method=post action=\"" + ROOT + "\"" + (isNew ? " id=new-mapping" : "") + ">" +
      "<fieldset" + (disabled ? " disabled" : "") + "><legend>" + (isNew ? "Tambah Pemetaan Baru" : "Edit Pemetaan") + "</legend>" +
      revisionInput() + "<input type=hidden name=id value=\"" + escape(rule.id) + "\">" +
      "<div class=fields><label>Cara Pencocokan<select name=match required>" + select + "</select></label>" +
      "<label class=check><input type=checkbox name=enabled value=1" + (draft.enabled ? " checked" : "") + ">Aktifkan aturan ini</label>" +
      "<label>SKU Asal<input name=from type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{1,160}\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.from.slice(0, 300)) + "\" placeholder=\"g1.ios.ai.2tb.\"></label>" +
      "<label>SKU Tujuan<input name=to type=text list=sku-candidates required maxlength=178 pattern=\"(?:g1\\.|com\\.google\\.(?:one|gemini)\\.)[A-Za-z0-9._\\-]{0,159}[A-Za-z0-9_\\-]\" autocomplete=off autocapitalize=none spellcheck=false value=\"" +
      escape(draft.to.slice(0, 300)) + "\" placeholder=\"g1.2tb.ai.12months_ip_90p\"></label></div>" +
      "<div class=actions><button class=primary type=submit name=action value=upsert>" + (isNew ? "Tambah dan Simpan" : "Simpan Pemetaan Ini") + "</button>" +
      (isNew ? "" : "<button class=delete type=submit name=action value=delete formnovalidate>Hapus Pemetaan Ini</button>") + "</div></fieldset></form>";
    if (isNew) {
      var openNew = hasPrefill || orphanDraft || !config.rules.length ? " open" : "";
      return "<details class=\"rule-drawer add-drawer\"" + openNew + "><summary>" +
        "<span class=\"status-dot dot-add\"></span>" +
        "<span class=summary-main><strong>+ Tambah Pemetaan Baru</strong>" +
        "<span class=summary-sub>" + (hasPrefill ? "Form sudah terisi otomatis dari pilihan Anda — buka untuk memilih target &amp; simpan" : "Buat aturan manual berdasarkan SKU Persis atau Awalan (Prefix)") + "</span></span>" +
        (hasPrefill ? "<span class=\"pill pill-accent\">Siap Simpan</span>" : "") +
        "</summary><div class=rule-body>" + formHtml + "</div></details>";
    }
    var fromInfo = describeSku(draft.from);
    var toInfo = describeSku(draft.to);
    var openRule = formDraft && formDraft.id === rule.id ? " open" : "";
    return "<details class=rule-drawer" + openRule + "><summary>" +
      "<span class=\"status-dot " + (rule.enabled ? "dot-on" : "dot-off") + "\"></span>" +
      "<span class=summary-main>" +
      "<span class=summary-badges>" +
      "<span class=\"pill " + (rule.enabled ? "pill-on" : "pill-off") + "\">" + (rule.enabled ? "Aktif" : "Nonaktif") + "</span>" +
      "<span class=match-tag>" + (rule.match === "exact" ? "Persis" : "Awalan") + "</span>" +
      tierBadge(rule.from) + "<span class=arrow aria-hidden=true>→</span>" + tierBadge(rule.to) +
      "</span>" +
      "<span class=summary-human>" + escape(fromInfo.label) + " → " + escape(toInfo.label) + "</span>" +
      "<code class=summary-codes>" + escape(rule.from) + " → " + escape(rule.to) + "</code>" +
      "</span>" +
      "</summary><div class=rule-body>" + formHtml + "</div></details>";
  }
  function quickPrefixShortcuts() {
    var shortcuts = [
      { prefix: "g1.ios.ai.2tb.", to: "g1.2tb.ai.12months_ip_90p", title: "+ Awalan AI Pro 2TB (Bundel AI)", cls: "tier-ai-pro" },
      { prefix: "g1.ios.helium.", to: "g1.2tb.ai.12months_ip_90p", title: "+ Awalan AI Plus (Helium)", cls: "tier-plus" },
      { prefix: "g1.ios.2tb.", to: "g1.2tb.ai.12months_ip_90p", title: "+ Awalan Pro 2TB Standar", cls: "tier-pro" },
      { prefix: "g1.ios.20tb.", to: "g1.ai.ultra.3months_ip_75p.acq", title: "+ Awalan Ultra 20TB", cls: "tier-ultra" }
    ];
    return "<div class=quick-bar><div class=quick-title>Isi Cepat Awalan Populer (1 Ketukan):</div><div class=quick-chips>" +
      shortcuts.map(function (item) {
        var alreadyActive = config.rules.some(function (rule) {
          return rule.enabled && rule.match === "prefix" && rule.from === item.prefix;
        });
        return "<a class=\"chip-shortcut" + (alreadyActive ? " chip-done" : "") + "\" href=\"" + ROOT + "?from=" + escape(encodeURIComponent(item.prefix)) +
          "&to=" + escape(encodeURIComponent(item.to)) + "#new-mapping\">" +
          "<span class=\"tier " + item.cls + "\">" + escape(alreadyActive ? "Terpasang" : "Tambah") + "</span>" +
          "<span>" + escape(item.title) + "</span><code>" + escape(item.prefix) + "</code></a>";
      }).join("") + "</div></div>";
  }
  function mappingEditor() {
    var parts = ["<section id=mapping-editor class=panel>",
      "<div class=section-head><div><span class=eyebrow>Langkah 2 · Daftar Aturan Aktif</span><h2>Pengelolaan Pemetaan</h2></div>" +
      "<div class=section-stat><strong>Saat ini aktif " + enabledCount + " aturan / total " + config.rules.length + " aturan</strong> · Maks " + engine.limit + "</div></div>",
      "<p class=lead-note>Ketuk baris aturan di bawah untuk membuka editor, ubah status aktif, atau hapus aturan. Waktu simpan (UTC): <code>" + escape(config.updatedAt || "Sedang menggunakan nilai bawaan internal, belum pernah disimpan manual") + "</code></p>"];
    if (!validConfig) parts.push("<p class=error role=alert>" + escape(config.error) + "</p>");
    else if (applied) parts.push("<p class=success>Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini; menulis ulang " + report.test.hitCount + " kali pada sesi tersebut.</p>");
    else parts.push("<p class=note-banner>Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini; setelah menyimpan, buka ulang halaman paket di Google App lalu segarkan halaman ini untuk memeriksa.</p>");
    if (report.test.version && report.test.version !== COLLECTOR_VERSION) {
      parts.push("<p class=note-banner>Catatan eksekusi terakhir berasal dari <code>" + escape(report.test.version) +
        "</code>, sedangkan skrip respons versi ini adalah <code>" + escape(COLLECTOR_VERSION) +
        "</code>. Catatan lama tetap dipertahankan; jika versi eksekusi belum berubah setelah membuka ulang halaman paket, matikan modul lama lalu muat ulang skrip versi ini.</p>");
    }
    if (validConfig && enabledCount === 0) parts.push("<p class=note-banner>Saat ini tidak ada aturan yang aktif: pengumpulan tetap berjalan, isi respons dibiarkan asli.</p>");
    if (!writable) parts.push("<p class=error>Penyimpanan pemetaan lokal belum siap, tombol edit dinonaktifkan sementara.</p>");
    parts.push(quickPrefixShortcuts());
    parts.push("<details class=info-drawer><summary>Petunjuk prioritas pencocokan (Exact vs Prefix)</summary><div class=drawer-body>" +
      "<p>Setelah mengubah SKU asal, SKU tujuan, atau status aktivasi, klik tombol simpan pada baris tersebut.</p>" +
      "<p class=note>SKU persis (exact) diprioritaskan; aturan awalan (prefix) memilih awalan terpanjang dan wajib diakhiri titik. Aturan nonaktif tidak ikut dicocokkan; setiap ID asal hanya diganti satu kali, target tidak dicocokkan ulang secara berantai.</p>" +
      "</div></details>");
    parts.push("<datalist id=sku-candidates>" + Object.keys(candidates).sort().map(function (id) {
      return "<option value=\"" + escape(id) + "\"></option>";
    }).join("") + "</datalist>");
    parts.push("<div class=rule-list>");
    config.rules.forEach(function (rule) { parts.push(ruleForm(rule, false)); });
    parts.push("</div>");
    if (orphanDraft) parts.push("<p class=note-banner>Hasil penyimpanan isian sebelumnya belum terkonfirmasi, isi dipertahankan di kotak tambah baru; segarkan untuk memeriksa aturan saat ini sebelum menyimpan ulang.</p>");
    parts.push(ruleForm(newRule, true));
    if (config.rules.length >= engine.limit) parts.push("<p class=note-banner>Batas maksimal aturan telah tercapai, hapus salah satu aturan untuk menambah yang baru.</p>");
    parts.push("<div class=editor-footer><form class=reset method=post action=\"" + ROOT + "\">" + revisionInput() +
      "<button type=submit name=action value=reset" + (!writable ? " disabled" : "") + ">Pulihkan Pemetaan Bawaan</button></form>" +
      "<p class=note>Pulihkan bawaan akan mengganti aturan saat ini menjadi tiga aturan internal (2TB 12 bulan 90p, 20TB / 30TB 3 bulan 75p); riwayat pengumpulan dan eksekusi tetap disimpan.</p></div></section>");
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
  var executionOpen = report.test.hitCount > 0 || report.test.status === "config-error" ? " open" : "";
  var css = [
    ":root{--bg:#0b0f17;--surface:#121926;--surface-2:#172030;--surface-3:#1e293d;--border:#243249;--border-hi:#354866;--text:#eef2f8;--muted:#94a3b8;--accent:#3b82f6;--accent-soft:rgba(59,130,246,.14);--emerald:#10b981;--emerald-soft:rgba(16,185,129,.14);--amber:#f59e0b;--amber-soft:rgba(245,158,11,.14);--rose:#ef4444;--rose-soft:rgba(239,68,68,.14);--violet:#8b5cf6;--violet-soft:rgba(139,92,246,.16);--cyan:#06b6d4;--cyan-soft:rgba(6,182,212,.14);--radius:14px;--radius-sm:9px}",
    "*{box-sizing:border-box}",
    "html{color-scheme:dark}",
    "body{margin:0;padding:24px 16px 48px;font:15px/1.55 -apple-system,BlinkMacSystemFont,\"SF Pro Text\",\"Segoe UI\",sans-serif;color:var(--text);background:var(--bg);background-image:radial-gradient(ellipse 80% 45% at 50% -10%,rgba(59,130,246,.14),transparent)}",
    ".shell{max-width:980px;margin:0 auto}",
    "h1{font-size:24px;line-height:1.25;letter-spacing:-.02em;margin:6px 0 8px}",
    "h2{font-size:18px;line-height:1.3;letter-spacing:-.01em;margin:0}",
    "h3{font-size:15px;margin:16px 0 10px;color:var(--text)}",
    "p{margin:8px 0}",
    "code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;background:rgba(15,23,42,.75);border:1px solid var(--border);padding:2px 6px;border-radius:6px;color:#cbd5e1;overflow-wrap:anywhere}",
    "a{color:#60a5fa;text-decoration:none}",
    "a:hover{text-decoration:underline}",
    ".hero{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:0 12px 32px rgba(0,0,0,.28)}",
    ".hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap}",
    ".badge{display:inline-flex;align-items:center;gap:6px;background:var(--emerald-soft);color:#6ee7b7;border:1px solid rgba(16,185,129,.28);padding:5px 11px;border-radius:999px;font-size:12.5px;font-weight:600;margin:0 0 8px}",
    ".entry-mode{color:var(--muted);font-size:13.5px;margin:4px 0 0}",
    ".actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}",
    ".actions form{margin:0}",
    "button,.actions a,.chip-btn{font:inherit;font-weight:600;font-size:13.5px;padding:9px 14px;border:1px solid var(--border-hi);border-radius:var(--radius-sm);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--surface-2);color:var(--text);transition:background .15s ease,border-color .15s ease}",
    "button:hover,.actions a:hover,.chip-btn:hover{background:var(--surface-3);border-color:#4b648a;text-decoration:none}",
    ".primary{background:var(--accent);border-color:#2563eb;color:#fff}",
    ".primary:hover{background:#2563eb;border-color:#1d4ed8}",
    ".delete{background:var(--rose-soft);border-color:rgba(239,68,68,.35);color:#fca5a5}",
    ".delete:hover{background:rgba(239,68,68,.24);border-color:rgba(239,68,68,.55)}",
    ".kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}",
    ".kpi{background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 14px}",
    ".kpi-label{font-size:11.5px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);display:block}",
    ".kpi-val{font-size:18px;font-weight:700;margin-top:4px;display:block;color:var(--text)}",
    ".kpi-ok .kpi-val{color:#6ee7b7}",
    ".kpi-warn .kpi-val{color:#fcd34d}",
    ".kpi-err .kpi-val{color:#fca5a5}",
    ".panel,.section-drawer{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:18px;margin:16px 0}",
    ".section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:8px}",
    ".eyebrow{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#60a5fa;margin-bottom:3px}",
    ".section-stat{font-size:13px;color:var(--muted);background:var(--surface-2);border:1px solid var(--border);padding:5px 10px;border-radius:999px}",
    ".lead-note{color:var(--muted);font-size:13.5px;margin:4px 0 12px}",
    ".note{color:var(--muted);font-size:13.5px}",
    ".success{background:var(--emerald-soft);color:#6ee7b7;border:1px solid rgba(16,185,129,.3);padding:11px 14px;border-radius:var(--radius-sm);font-size:14px}",
    ".error{background:var(--rose-soft);color:#fca5a5;border:1px solid rgba(239,68,68,.35);padding:11px 14px;border-radius:var(--radius-sm);font-size:14px;overflow-wrap:anywhere}",
    ".note-banner{background:var(--amber-soft);color:#fde68a;border:1px solid rgba(245,158,11,.28);padding:10px 14px;border-radius:var(--radius-sm);font-size:13.5px}",
    ".info-drawer{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);margin:10px 0 14px}",
    ".info-drawer summary{cursor:pointer;list-style:none;padding:9px 13px;font-size:13px;font-weight:600;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:8px}",
    ".info-drawer summary::-webkit-details-marker{display:none}",
    ".info-drawer summary::after{content:\"▾\";font-size:12px;opacity:.8;transition:transform .16s ease}",
    ".info-drawer[open] summary::after{transform:rotate(180deg)}",
    ".drawer-body{padding:0 13px 12px;border-top:1px solid var(--border);font-size:13px;color:var(--muted)}",
    ".preset-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px}",
    ".preset{min-width:0;margin:0}",
    "fieldset{min-width:0;margin:0;border:1px solid var(--border);border-radius:12px;padding:14px;background:var(--surface-2)}",
    ".preset fieldset{height:100%;display:flex;flex-direction:column}",
    "legend{font-weight:700;font-size:14.5px;padding:0 6px;color:var(--text);max-width:100%}",
    ".preset .note{font-size:13px;margin:4px 0 10px}",
    ".preset-pair{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;margin:0 0 10px}",
    ".pair-head{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:8px}",
    ".pair-flow{display:flex;flex-direction:column;gap:5px}",
    ".pair-end{display:flex;flex-direction:column;gap:3px}",
    ".pair-label{font-size:12px;color:var(--text);font-weight:600}",
    ".pair-arrow{font-size:12px;color:var(--muted);padding-left:4px}",
    ".preset-state{align-self:flex-start;font-size:12px;font-weight:600;padding:4px 10px;margin:0 0 10px;background:var(--emerald-soft);color:#6ee7b7;border:1px solid rgba(16,185,129,.3);border-radius:999px}",
    ".preset button{width:100%;margin-top:auto}",
    ".tier{display:inline-flex;align-items:center;font-size:11px;font-weight:700;letter-spacing:.02em;padding:2px 8px;border-radius:999px;border:1px solid transparent;white-space:nowrap}",
    ".tier-pro{background:var(--accent-soft);color:#93c5fd;border-color:rgba(59,130,246,.32)}",
    ".tier-ai-pro{background:var(--violet-soft);color:#c4b5fd;border-color:rgba(139,92,246,.35)}",
    ".tier-plus{background:var(--cyan-soft);color:#67e8f9;border-color:rgba(6,182,212,.32)}",
    ".tier-ultra{background:var(--amber-soft);color:#fcd34d;border-color:rgba(245,158,11,.35)}",
    ".tier-turki{background:var(--rose-soft);color:#fda4af;border-color:rgba(244,63,94,.32)}",
    ".tier-target{background:var(--emerald-soft);color:#6ee7b7;border-color:rgba(16,185,129,.35)}",
    ".tier-basic,.tier-neutral{background:rgba(148,163,184,.14);color:#cbd5e1;border-color:rgba(148,163,184,.28)}",
    ".match-tag{font-size:11px;font-weight:700;color:var(--muted);background:var(--surface-3);border:1px solid var(--border);padding:2px 7px;border-radius:6px}",
    ".arrow{color:var(--muted);font-size:13px}",
    ".quick-bar{background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px;margin:12px 0}",
    ".quick-title{font-size:12.5px;font-weight:700;color:var(--text);margin-bottom:8px}",
    ".quick-chips{display:flex;flex-wrap:wrap;gap:8px}",
    ".chip-shortcut{display:inline-flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 10px;border-radius:9px;background:var(--surface);border:1px solid var(--border-hi);color:var(--text);font-size:12.5px;font-weight:600;text-decoration:none}",
    ".chip-shortcut:hover{background:var(--surface-3);border-color:var(--accent);text-decoration:none}",
    ".chip-done{opacity:.78}",
    ".rule-list{display:flex;flex-direction:column;gap:10px;margin:12px 0}",
    ".rule-drawer{background:var(--surface-2);border:1px solid var(--border);border-radius:12px;overflow:hidden}",
    ".rule-drawer[open]{border-color:var(--border-hi)}",
    ".add-drawer{border-style:dashed;border-color:rgba(59,130,246,.45);margin-top:12px}",
    ".rule-drawer>summary{cursor:pointer;list-style:none;padding:12px 14px;display:flex;align-items:center;gap:12px}",
    ".rule-drawer>summary::-webkit-details-marker{display:none}",
    ".rule-drawer>summary::after{content:\"▾\";margin-left:auto;color:var(--muted);font-size:14px;flex-shrink:0;transition:transform .16s ease}",
    ".rule-drawer[open]>summary::after{transform:rotate(180deg)}",
    ".status-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}",
    ".dot-on{background:var(--emerald);box-shadow:0 0 0 4px var(--emerald-soft)}",
    ".dot-off{background:#64748b;box-shadow:0 0 0 4px rgba(100,116,139,.18)}",
    ".dot-add{background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}",
    ".summary-main{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}",
    ".summary-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap}",
    ".summary-human{font-size:13.5px;font-weight:600;color:var(--text)}",
    ".summary-sub{font-size:12.5px;color:var(--muted)}",
    ".summary-codes{font-size:12px;color:var(--muted);background:transparent;border:0;padding:0}",
    ".pill{font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px}",
    ".pill-on{background:var(--emerald-soft);color:#6ee7b7}",
    ".pill-off{background:rgba(148,163,184,.16);color:#94a3b8}",
    ".pill-accent{background:var(--accent-soft);color:#93c5fd;margin-left:6px}",
    ".rule-body{padding:14px;border-top:1px solid var(--border);background:var(--surface)}",
    ".rule{margin:0}",
    ".fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}",
    ".fields label{font-weight:600;font-size:13px;color:var(--muted);min-width:0;display:block}",
    "input[type=text],select{font:15px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;width:100%;padding:10px 12px;margin-top:6px;border:1px solid var(--border-hi);border-radius:8px;background:var(--bg);color:var(--text)}",
    "input[type=text]{font-family:ui-monospace,SFMono-Regular,monospace;font-size:13.5px}",
    ".check{display:flex!important;align-items:center;gap:10px;align-self:end;min-height:44px;color:var(--text)!important;padding:0 4px}",
    ".check input{width:18px;height:18px;accent-color:var(--accent)}",
    ".rule .actions{margin:14px 0 0}",
    ".editor-footer{margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}",
    ".reset{margin:0}",
    ".section-drawer{padding:0;overflow:hidden}",
    ".section-drawer>summary{cursor:pointer;list-style:none;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}",
    ".section-drawer>summary::-webkit-details-marker{display:none}",
    ".drawer-title{display:flex;flex-direction:column;gap:3px}",
    ".drawer-sub{font-size:12.5px;color:var(--muted);font-weight:400}",
    ".drawer-right{display:flex;align-items:center;gap:10px;margin-left:auto}",
    ".drawer-chev{font-size:13px;color:var(--muted);transition:transform .16s ease}",
    ".section-drawer[open] .drawer-chev{transform:rotate(180deg)}",
    ".section-drawer-body{padding:0 18px 18px;border-top:1px solid var(--border)}",
    ".section-drawer-body section{border:0;padding:14px 0 0;margin:0;background:transparent}",
    ".stat-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0}",
    ".stat-box{background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px}",
    ".stat-box strong{display:block;font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}",
    ".scroll{overflow:auto;border:1px solid var(--border);border-radius:10px;margin:10px 0}",
    "table{border-collapse:collapse;width:100%;font-size:13.5px}",
    "th{background:var(--surface-2);color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}",
    "td,th{padding:10px 12px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}",
    "tr:last-child td{border-bottom:0}",
    ".sku-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px}",
    ".sku-desc{font-size:12px;color:var(--muted);font-weight:500}",
    ".num{font-variant-numeric:tabular-nums;font-weight:700}",
    ".mono-time{font-family:ui-monospace,SFMono-Regular,monospace;font-size:12px;color:var(--muted);white-space:nowrap}",
    ".empty-state{color:var(--muted);font-style:italic;padding:10px 0}",
    ".maintenance-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;margin-top:18px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}",
    "button:disabled,fieldset:disabled{opacity:.5}",
    "button:disabled{cursor:default}",
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}",
    "@media(prefers-reduced-motion:reduce){*{transition:none!important}}",
    "@media(max-width:680px){body{padding:14px 10px 36px}.hero,.panel{padding:14px}.kpi-grid{grid-template-columns:repeat(2,1fr)}.fields,.preset-grid{grid-template-columns:1fr}.actions{width:100%}.actions form,.actions a{flex:1}.editor-footer,.maintenance-card{flex-direction:column;align-items:stretch}}"
  ].join("");
  var html = [
    "<!doctype html><html lang=id><meta charset=utf-8>",
    "<meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Pengelolaan SKU Google One</title>",
    "<style>" + css + "</style>",
    "<main class=shell>",
    "<header class=hero>",
    "<div class=hero-top>",
    "<div><p class=badge>Skrip lokal telah mengambil alih · " + VERSION + "</p>",
    "<h1>Pengelolaan SKU Google One</h1>",
    "<p class=entry-mode><strong>Entri laporan saat ini: " + modeName(report.configuredMode) + "</strong></p></div>",
    "<nav class=actions aria-label=\"Operasi laporan\"><form method=get action=\"" + ROOT + "\"><button type=submit name=format value=json>Ekspor JSON</button></form><a href=\"" + ROOT + "\">Segarkan Laporan</a></nav>",
    "</div>",
    "<div class=kpi-grid>",
    "<div class=\"kpi " + (!validConfig ? "kpi-err" : applied ? "kpi-ok" : "kpi-warn") + "\"><span class=kpi-label>Status Eksekusi</span><span class=kpi-val>" + (!validConfig ? "Error Konfig" : applied ? "Sinkron Aktif" : "Menunggu Paket") + "</span></div>",
    "<div class=kpi><span class=kpi-label>Aturan Aktif</span><span class=kpi-val>" + enabledCount + " / " + config.rules.length + "</span></div>",
    "<div class=kpi><span class=kpi-label>Total Penggantian</span><span class=kpi-val>" + report.test.hitCount + "x</span></div>",
    "<div class=kpi><span class=kpi-label>Kandidat SKU</span><span class=kpi-val>" + report.scan.skus.length + " ID</span></div>",
    "</div>",
    "<details class=info-drawer><summary>Informasi modul &amp; cara kerja di perangkat</summary><div class=drawer-body>",
    "<p>Halaman ini dibuat secara lokal oleh Shadowrocket di perangkat ini; bilah alamat tetap memakai one.google.com, sementara konfigurasi pemetaan dan catatan pengumpulan disimpan di perangkat ini.</p>",
    "<p>Cukup aktifkan satu modul G1 ACQ saja: kumpulkan ID dari respons asli terlebih dahulu, lalu tulis ulang sesuai aturan yang tersimpan.</p>",
    "</div></details>",
    "</header>",
    actionError ? "<p class=error role=alert>" + escape(actionError) + "</p>" : "",
    noticeText ? "<p class=success role=status>" + escape(noticeText) + "</p>" : "",
    clearMessage ? "<p class=success>" + escape(clearMessage) + "</p>" : "",
    storageAvailable ? "" : "<p class=error>Antarmuka penyimpanan lokal belum siap; halaman ini belum dapat membaca catatan pengumpulan.</p>",
    presetTemplates(), mappingEditor(),
    "<details class=section-drawer" + executionOpen + "><summary><span class=drawer-title><span class=eyebrow>Langkah 3 · Verifikasi Hasil</span><h2>Eksekusi Pemetaan Terakhir</h2><span class=drawer-sub>Lihat SKU apa yang benar-benar berhasil ditulis ulang oleh skrip</span></span><span class=drawer-right><span class=\"pill " + (report.test.hitCount > 0 ? "pill-on" : "pill-off") + "\">" + report.test.hitCount + " Penggantian</span><span class=drawer-chev>▾</span></span></summary><div class=section-drawer-body><section>",
    "<p>Target awalan 2TB yang dikonfigurasi saat ini: <code>" + escape(report.configuredTarget || "Aturan awalan 2TB terpadu tidak aktif") + "</code></p>",
    "<div class=stat-strip>",
    "<div class=stat-box><strong>Versi &amp; Mode</strong>" + escape(report.test.version || "Belum ada") + " · " + modeName(report.test.mode) + "</div>",
    "<div class=stat-box><strong>Status Eksekusi</strong>" + escape(status) + "</div>",
    "<div class=stat-box><strong>Ringkasan Hitungan</strong>Total penggantian: " + report.test.hitCount + "; Termasuk 2TB: " + report.test.annualHitCount + "</div>",
    "<div class=stat-box><strong>Waktu Eksekusi (UTC)</strong>" + escape(report.test.updatedAt || "Belum ada") + "</div>",
    "</div>",
    "<p>Versi: " + escape(report.test.version || "Belum ada") + "<br>Mode pemetaan aktual: " + modeName(report.test.mode) + "<br>Status: " + escape(status) + "; Total penggantian: " + report.test.hitCount + "; Termasuk 2TB: " + report.test.annualHitCount + "</p>",
    "<p>Awalan asal 2TB: <code>g1.ios.2tb.</code><br>Target 2TB pada catatan kali ini: <code>" + escape(report.test.target || "Belum tercatat") + "</code><br>" + configuredOffers + " Tabel di bawah tetap mempertahankan target aktual dan status cadangan saat eksekusi tersebut; cadangan 75p / 90p lama ditampilkan sesuai catatan asli.<br>Waktu penyimpanan konfigurasi yang dipakai (UTC): " + escape(report.test.mappingUpdatedAt || "Bawaan internal atau belum tercatat pada versi lama") + "<br>Waktu eksekusi (UTC): " + escape(report.test.updatedAt || "Belum ada") + "</p>",
    "<p class=note>Aturan persis (exact) dapat menimpa masing-masing ID 2TB secara individual; target aktual per baris ada di tabel bawah. Nama produk, harga, dan siklus penagihan aktual silakan cek di panel pembelian App Store.</p>",
    table(report.test.matchedFrom, false), "</section></div></details>",
    "<details class=section-drawer><summary><span class=drawer-title><span class=eyebrow>Katalog Perangkat</span><h2>Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman</h2><span class=drawer-sub>Daftar ID mentah dari Google One sebelum ditulis ulang — ketuk Jadikan SKU Asal untuk memetakan</span></span><span class=drawer-right><span class=\"pill pill-accent\">" + report.scan.skus.length + " ID Unik</span><span class=drawer-chev>▾</span></span></summary><div class=section-drawer-body><section>",
    "<p>Total ID kumulatif: " + report.scan.skus.length + "; ID yang sama digabung hitungannya, rincian ID baru dan duplikat per respons dapat dilihat pada log pengumpulan di bawah.</p>",
    "<p class=note>ID diekstrak dari respons asli sebelum penulisan ulang dan bukan merupakan katalog lengkap toko; target pengganti yang dihasilkan skrip tidak otomatis masuk ke daftar ini.</p>",
    report.scan.truncated ? "<p class=note-banner>Catatan telah mencapai batas 300 ID; kosongkan catatan jika ingin mengumpulkan ulang dari halaman target.</p>" : "",
    table(report.scan.skus, true),
    "<p class=note>Waktu pembaruan (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p></section></div></details>",
    "<details class=section-drawer><summary><span class=drawer-title><span class=eyebrow>Log &amp; Diagnostik (Disembunyikan agar Rapi)</span><h2>Catatan Eksekusi Pengumpulan &amp; 10 Respons Terakhir</h2><span class=drawer-sub>Rincian pemindaian paket mentah untuk troubleshooting modul Shadowrocket</span></span><span class=drawer-right><span class=\"pill pill-off\">" + report.scan.recentResponses.length + " Log</span><span class=drawer-chev>▾</span></span></summary><div class=section-drawer-body><section>",
    "<p>Skrip pengumpul aktual: <code>" + escape(report.scan.version || "Belum ada catatan") + "</code><br>Mode pengumpulan aktual: " + modeName(report.scan.mode) + "<br>" + scanVersionStatus + "</p>",
    "<p>Respons teks dipindai: " + report.scan.scannedResponses + "; Respons non-teks dicatat: " + report.scan.nonTextResponses +
      "; Respons berisi ID produk: " + report.scan.matchedResponses + "; Total ID unik: " + report.scan.skus.length + "</p>",
    "<p>Waktu penyimpanan terakhir (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p>",
    latestScan ? "<p><strong>Terbaru: " + scanStatuses[latestScan.status] + "</strong><br>Terdeteksi " +
      latestScan.candidateCount + " ID berbeda, baru dicatat " + latestScan.addedCount + ", di luar kapasitas " + latestScan.omittedCount + ".</p>" : "",
    "<p class=note>Daftar kumulatif dideduplikasi per ID; ID yang sama akan menambah jumlah kemunculan sementara panjang daftar tetap. Catat jumlah dan waktunya, buka ulang halaman paket Google App, lalu segarkan laporan ini untuk membandingkan.</p>",
    "<h3>10 Respons Terakhir</h3>", recentTable(report.scan.recentResponses),
    "<p class=note>Jika jumlah bertambah dan status menunjukkan ID duplikat, artinya respons sudah diterima; jika waktu dan jumlah tidak berubah, belum ada respons baru yang cocok — periksa cache halaman, sakelar modul, dekripsi HTTPS, domain permintaan, dan log skrip untuk saved=no. Hanya kategori path yang disimpan.</p></section></div></details>",
    "<footer class=maintenance-card><div><p class=note>Mengosongkan catatan tetap mempertahankan konfigurasi pemetaan; setelah melihat paket, segarkan halaman ini untuk melihat catatan baru, dan biarkan pemindai terpisah maupun salinan penulisan ulang lama tetap nonaktif.</p></div><form method=get action=\"" + ROOT + "\"><button name=clear value=1>Kosongkan Catatan Pengumpulan dan Uji Coba Alat Ini</button></form></footer>",
    "</main></html>"
  ].join("");
  $done({ response: { status: responseStatus, headers: headers, body: html } });
})();
