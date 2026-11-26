"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { test: nodeTest } = require("node:test");

const root = path.resolve(__dirname, "..");
const ROOT = "https://one.google.com/g1-sku-report";
const ORIGIN = "https://one.google.com";
const CONFIG_KEY = "g1.sku.mappings.v1";
const SCAN_KEY = "g1.sku.scan.v1";
const TEST_KEY = "g1.pro.annual.test.v1";
const VERSION = "g1-acq-v7.12-mappings";
const REPORT_VERSION = "v7.12.1";
const DEFAULT_REVISION = "defaults-75p-v1";
const TARGET = "g1.2tb.ai.12months_ip_90p";
const SOURCE = "g1.ios.2tb.fixture_monthly";
const OTHER_SOURCE = "g1.ios.2tb.fixture_annual";
const TWENTY = "g1.ios.20tb.m.v2";
const THIRTY = "g1.ios.30tb.ai.pro.m";
const COM_SOURCE = "com.google.one.fixture_monthly";
const CUSTOM_TARGET = "com.google.one.fixture_annual";
const NEXT_TARGET = "g1.fixture.next_offer";
const FIXED_TIME = "2026-11-23T07:40:06.325Z";
const TURKEY_TARGET = "g1.ios.30tb.m";
const TURKEY_TWENTY_TARGET = "g1.ios.20tb.m";
const TR_PRO_TARGET = "com.google.gemini.2tb.ai.m.3month_ip_99p";
const GEMINI_NAMESPACE = "com.google.gemini.";
// Fixture kontrak independen: aturan katalog sengaja tidak memiliki ID persisten.
const PRESETS = [
  {
    id: "pro-1yuan", title: "Promo Pro Murah (3 Bulan Pertama Diskon 99%)",
    description: "Menggunakan awalan 2TB milik Pro sendiri; setelah diterapkan, buka ulang halaman paket Pro. Nominal dan siklus tagihan aktual lihat di App Store.",
    rules: [{ match: "prefix", from: "g1.ios.2tb.", to: TR_PRO_TARGET, enabled: true }]
  },
  {
    id: "tr-ultra-20tb", title: "Turki 20TB · Catatan 1989.99 Lira",
    description: "ID iOS 20TB generasi lama; catatan publik menampilkan harga 1989.99 Lira. Nominal dan siklus tagihan aktual lihat di App Store.",
    rules: [{ match: "exact", from: TWENTY, to: TURKEY_TWENTY_TARGET, enabled: true }]
  },
  {
    id: "tr-ultra-30tb", title: "Turki 30TB · Catatan 2949.99 Lira",
    description: "ID iOS 30TB generasi lama; catatan publik pernah memunculkan harga 2949.99 Lira. Nominal dan siklus tagihan aktual lihat di App Store.",
    rules: [{ match: "exact", from: THIRTY, to: TURKEY_TARGET, enabled: true }]
  },
  {
    id: "ultra-75p", title: "Ultra 20TB / 30TB · 3 Bulan 75p",
    description: "Mengalihkan 20TB dan 30TB sekaligus ke target 75p saat ini; 75p berarti diskon 75% (bayar 25%).",
    rules: [
      { match: "exact", from: TWENTY, to: "g1.20tb.3months_ip_75p.acq", enabled: true },
      { match: "exact", from: THIRTY, to: "g1.ai.ultra.3months_ip_75p.acq", enabled: true }
    ]
  },
  {
    id: "pro-12months-90p", title: "2TB / Pro · 12 Bulan 90p",
    description: "Menggunakan awalan 2TB saat ini dan target diskon 12 bulan; siklus produk ditampilkan pada panel pembelian App Store.",
    rules: [{ match: "prefix", from: "g1.ios.2tb.", to: TARGET, enabled: true }]
  }
];
const DEFAULT_RULES = [
  { id: "default-2tb", match: "prefix", from: "g1.ios.2tb.", to: TARGET, enabled: true },
  { id: "default-20tb", match: "exact", from: TWENTY, to: "g1.20tb.3months_ip_75p.acq", enabled: true },
  { id: "default-30tb", match: "exact", from: THIRTY, to: "g1.ai.ultra.3months_ip_75p.acq", enabled: true }
];
const VARIANTS = [
  { script: "g1-acq.js", report: "g1-sku-report.js" },
  { script: "g1-acq-discount.js", report: "g1-sku-report-discount.js" }
];
const sources = Object.fromEntries(VARIANTS.flatMap(variant => [variant.script, variant.report]).map(name =>
  [name, fs.readFileSync(path.join(root, name), "utf8")]));
const scripts = Object.fromEntries(Object.entries(sources).map(([name, source]) =>
  [name, new vm.Script(source, { filename: name })]));
const FORM_HEADERS = { Origin: ORIGIN, "Content-Type": "application/x-www-form-urlencoded" };

// Jalankan skrip distribusi, termasuk mesin yang disematkan, terhadap satu penyimpanan persisten.
// Harness ini hanya memodelkan antarmuka request/response/store host serta formulir HTML asli.
function run(name, options = {}) {
  const storage = options.storage || new Map();
  const done = [];
  const reads = [];
  const writes = [];
  const logs = [];
  const context = {
    $request: {
      url: options.url || ORIGIN + "/ai?fixture=1",
      method: options.method || "GET",
      body: options.requestBody,
      headers: options.headers || {}
    },
    $response: { body: options.body },
    $done: value => done.push(JSON.parse(JSON.stringify(value))),
    console: { log: value => logs.push(String(value)) }
  };
  if (options.random) {
    context.Math = Object.create(Math);
    context.Math.random = options.random;
  }
  if (options.storageAvailable !== false) {
    context.$persistentStore = {};
    if (options.readAvailable !== false) {
      context.$persistentStore.read = key => {
        reads.push(key);
        if (options.read) return options.read(key, storage, { reads, writes });
        return storage.has(key) ? storage.get(key) : null;
      };
    }
    if (options.writeAvailable !== false) {
      context.$persistentStore.write = (value, key) => {
        writes.push({ key, value });
        if (options.write) return options.write(value, key, storage, { reads, writes });
        storage.set(key, value);
        return true;
      };
    }
  }
  scripts[name].runInNewContext(context, { timeout: 2000 });
  assert.equal(done.length, 1, name + " harus memanggil $done tepat satu kali");
  return { payload: done[0], storage, reads, writes, logs };
}

function record(storage, key) {
  return JSON.parse(storage.get(key));
}

function header(response, name) {
  const key = Object.keys(response.headers || {}).find(key => key.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : response.headers[key];
}

function htmlPage(variant, storage, options = {}) {
  const result = run(variant.report, { storage, url: ROOT, ...options });
  assert.equal(result.payload.response.status, 200);
  assert.match(header(result.payload.response, "Content-Type"), /text\/html/i);
  return result;
}

function exported(variant, storage, options = {}) {
  const result = run(variant.report, { storage, url: ROOT + "?format=json", ...options });
  assert.equal(result.payload.response.status, 200);
  assert.match(header(result.payload.response, "Content-Type"), /application\/json/i);
  assert.equal(result.writes.length, 0, "ekspor hanya boleh membaca state lokal");
  return { ...result, data: JSON.parse(result.payload.response.body) };
}

function decodeHTML(value) {
  return value.replace(/&(?:#(x[0-9a-f]+|[0-9]+)|amp|lt|gt|quot|apos);/gi, (entity, numeric) => {
    if (numeric) return String.fromCodePoint(numeric[0].toLowerCase() === "x" ? parseInt(numeric.slice(1), 16) : Number(numeric));
    return { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" }[entity.toLowerCase()];
  });
}

function attributes(text) {
  const result = Object.create(null);
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of text.matchAll(pattern)) result[match[1].toLowerCase()] = decodeHTML(match[2] ?? match[3] ?? match[4] ?? "");
  return result;
}

function forms(html) {
  return [...html.matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form\s*>/gi)].map(match => {
    const attrs = attributes(match[1]);
    const fields = Object.create(null);
    const controls = [];
    const buttons = [];
    for (const input of match[2].matchAll(/<input\b([^>]*)>/gi)) {
      const control = attributes(input[1]);
      controls.push(control);
      if (!control.name || "disabled" in control) continue;
      const type = (control.type || "text").toLowerCase();
      if (type === "submit") { buttons.push(control); continue; }
      if (["button", "reset", "file"].includes(type)) continue;
      if (["checkbox", "radio"].includes(type) && !("checked" in control)) continue;
      fields[control.name] = control.value ?? (["checkbox", "radio"].includes(type) ? "on" : "");
    }
    for (const select of match[2].matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select\s*>/gi)) {
      const control = attributes(select[1]);
      controls.push(control);
      if (!control.name || "disabled" in control) continue;
      const choices = [...select[2].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option\s*>/gi)].map(option => {
        const attrs = attributes(option[1]);
        return { ...attrs, value: attrs.value ?? decodeHTML(option[2]) };
      });
      const selected = choices.find(choice => "selected" in choice) || choices[0];
      if (selected) fields[control.name] = selected.value;
    }
    for (const area of match[2].matchAll(/<textarea\b([^>]*)>([\s\S]*?)<\/textarea\s*>/gi)) {
      const control = attributes(area[1]);
      controls.push(control);
      if (control.name && !("disabled" in control)) fields[control.name] = decodeHTML(area[2]);
    }
    for (const button of match[2].matchAll(/<button\b([^>]*)>/gi)) {
      const control = attributes(button[1]);
      if (!("disabled" in control) && (!control.type || control.type.toLowerCase() === "submit")) buttons.push(control);
    }
    const actions = new Set(buttons.filter(button => button.name === "action").map(button => button.value));
    if (fields.action) actions.add(fields.action);
    const disabled = [...match[2].matchAll(/<fieldset\b([^>]*)>/gi)].some(fieldset => "disabled" in attributes(fieldset[1]));
    return { attrs, fields, controls, buttons, actions, disabled, html: match[0] };
  });
}

function formFor(html, action, id) {
  const matches = forms(html).filter(form => form.actions.has(action) &&
    (id === undefined || (action === "preset" ? form.fields.preset : form.fields.id || "") === id));
  assert.equal(matches.length, 1, "diharapkan tepat satu formulir " + action + " untuk " + (id ?? "aksinya"));
  assert.equal(matches[0].attrs.method.toLowerCase(), "post");
  assert.equal(new URL(matches[0].attrs.action, ROOT).href, ROOT);
  return matches[0];
}

function nativeSkuControl(form, field) {
  const control = form.controls.find(control => control.name === field);
  assert(control, "kontrol asli " + field + " tidak ditemukan");
  assert.equal(control.type, "text");
  assert.equal(Number(control.maxlength), 178, field + " harus menerima namespace Gemini lengkap dan akhiran 160 karakter");
  assert("required" in control);
  assert(control.pattern, field + " harus menampilkan validasi SKU asli");
  // Atribut pattern HTML asli memakai UnicodeSets (v) dan mencocokkan seluruh nilai.
  return { control, pattern: new RegExp("^(?:" + control.pattern + ")$(?![\\s\\S])", "v") };
}

function assertNativeSkuValue(form, field, value) {
  const { control, pattern } = nativeSkuControl(form, field);
  assert(value.length <= Number(control.maxlength), field + " harus muat tanpa terpotong oleh browser");
  assert(pattern.test(value), field + " harus memenuhi pattern HTML yang dirender");
}

function formBody(form, action, changes = {}) {
  assert.equal(form.disabled, false, "pengiriman asli membutuhkan fieldset yang aktif");
  assert(form.actions.has(action), "kirim aksi yang tersedia oleh formulir HTML asli");
  const fields = { ...form.fields, action, ...changes };
  for (const key of Object.keys(fields)) if (fields[key] === undefined) delete fields[key];
  return new URLSearchParams(fields).toString();
}

function post(variant, storage, body, options = {}) {
  return run(variant.report, { storage, url: ROOT, method: "POST", headers: FORM_HEADERS, requestBody: body, ...options });
}

function submit(variant, storage, form, action, changes = {}, options = {}) {
  return post(variant, storage, formBody(form, action, changes), options);
}

function assertRedirect(variant, result, notice) {
  const response = result.payload.response;
  assert.equal(response.status, 303);
  assert.equal(header(response, "Location"), ROOT + "?notice=" + notice);
  assert.deepEqual(result.writes.map(write => write.key), [CONFIG_KEY]);
  const before = [...result.storage];
  // Tindak lanjut 303 asli adalah GET tanpa body POST sebelumnya.
  const follow = htmlPage(variant, result.storage, { url: header(response, "Location"), method: "GET" });
  assert.deepEqual(follow.writes, []);
  assert.deepEqual([...result.storage], before);
  return follow.payload.response.body;
}

function change(variant, storage, action, id, changes = {}) {
  const page = htmlPage(variant, storage);
  assert.deepEqual(page.writes, []);
  const form = formFor(page.payload.response.body, action, id);
  const result = submit(variant, storage, form, action, changes);
  const html = assertRedirect(variant, result, { upsert: "saved", delete: "deleted", reset: "reset", preset: "preset" }[action]);
  return { result, html, config: exported(variant, storage).data.mappingConfig };
}

function storedConfig(rules, overrides = {}) {
  return { schemaVersion: 1, revision: "a".repeat(48), updatedAt: FIXED_TIME, customized: true, rules, ...overrides };
}

function withConfig(rules, overrides = {}) {
  return new Map([[CONFIG_KEY, JSON.stringify(storedConfig(rules, overrides))]]);
}

function exactRule(overrides = {}) {
  return { id: "fixture-rule", match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: true, ...overrides };
}

function legacyProStorage(rules) {
  const storage = withConfig(rules);
  const version = "g1-acq-v7.11-mappings";
  storage.set(SCAN_KEY, JSON.stringify({
    schemaVersion: 1, version, mode: "custom", updatedAt: FIXED_TIME,
    scannedResponses: 4, matchedResponses: 4, nonTextResponses: 0, limit: 300, truncated: false,
    skus: [{ id: TWENTY, count: 4, lastSeen: FIXED_TIME }],
    recentResponses: [{ at: FIXED_TIME, path: "/ai", bodyType: "text", status: "known-skus",
      candidateCount: 1, addedCount: 0, omittedCount: 0 }]
  }));
  storage.set(TEST_KEY, JSON.stringify({
    schemaVersion: 1, version, mode: "custom", updatedAt: FIXED_TIME,
    target: TARGET, targetOrigin: "user-configured", status: "rewritten", hitCount: 1, annualHitCount: 0,
    mappingRevision: "a".repeat(48), mappingUpdatedAt: FIXED_TIME, mappingStatus: "custom",
    matchedFrom: [{ id: TWENTY, to: TR_PRO_TARGET, count: 1, fallback: false }]
  }));
  return storage;
}

function assertISO(value) {
  assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal(new Date(value).toISOString(), value);
}

function assertStored(storage, expectedRules, customized = true) {
  const value = record(storage, CONFIG_KEY);
  assert.deepEqual(Object.keys(value).sort(), ["schemaVersion", "revision", "updatedAt", "customized", "rules"].sort());
  assert.equal(value.schemaVersion, 1);
  assert.equal(value.customized, customized);
  assert.match(value.revision, /^[a-f0-9]{48}$/);
  assertISO(value.updatedAt);
  assert.deepEqual(value.rules, expectedRules);
  for (const rule of value.rules) assert.deepEqual(Object.keys(rule).sort(), ["id", "match", "from", "to", "enabled"].sort());
  return value;
}

function assertRejected(result, status, before) {
  assert.equal(result.payload.response.status, status);
  assert.equal(header(result.payload.response, "Location"), undefined);
  assert.deepEqual(result.writes, []);
  if (before) assert.deepEqual([...result.storage], before);
}

function assertNoScript(response) {
  assert(!/<(?:script|iframe|img|object|embed)\b/i.test(response.body));
  for (const tag of response.body.matchAll(/<[a-z][a-z0-9-]*\b([^>]*)>/gi)) {
    const attrs = attributes(tag[1]);
    assert(!Object.keys(attrs).some(name => /^on[a-z]+$/i.test(name)), "HTML tidak boleh memiliki inline event handler");
    for (const name of ["src", "href", "action"]) if (attrs[name]) assert(!/^javascript:/i.test(attrs[name]));
  }
  const csp = header(response, "Content-Security-Policy");
  const directives = new Map(csp.split(";").map(value => value.trim().split(/\s+/)).filter(parts => parts[0]).map(([name, ...values]) => [name, values]));
  assert.deepEqual(directives.get("default-src"), ["'none'"]);
  assert.deepEqual(directives.get("style-src"), ["'unsafe-inline'"]);
  assert.deepEqual(directives.get("base-uri"), ["'none'"]);
  assert.deepEqual(directives.get("frame-ancestors"), ["'none'"]);
  assert.deepEqual(directives.get("form-action"), [ROOT]);
}

function presetById(id) {
  const preset = PRESETS.find(entry => entry.id === id);
  assert(preset, "templat fixture tidak dikenal " + id);
  return preset;
}

function presetSection(html) {
  const section = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section\s*>/gi)]
    .find(match => attributes(match[1]).id === "mapping-presets");
  assert(section, "laporan harus merender bagian mapping-presets");
  return section[2];
}

function presetCardText(html, id) {
  const text = decodeHTML(presetSection(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");
  const preset = presetById(id);
  const start = text.indexOf(preset.title);
  assert(start >= 0, "judul templat tidak ditemukan " + id);
  const next = PRESETS.map(entry => text.indexOf(entry.title, start + preset.title.length)).filter(index => index >= 0);
  return text.slice(start, next.length ? Math.min(...next) : text.length);
}

function withoutIds(rules) {
  return rules.map(({ match, from, to, enabled }) => ({ match, from, to, enabled }));
}

function assertPresetRules(config, preset) {
  for (const rule of preset.rules) {
    const matches = config.rules.filter(saved => saved.match === rule.match && saved.from === rule.from);
    assert.equal(matches.length, 1, preset.id + " hanya boleh menggabungkan setiap asal tepat satu kali");
    assert.deepEqual(withoutIds(matches), [rule]);
    assert.match(matches[0].id, /^[a-z][a-z0-9-]{0,39}$/);
  }
}

function engineHarness(options = {}) {
  const storage = options.storage || new Map();
  const reads = [];
  const writes = [];
  const store = {};
  if (options.readAvailable !== false) store.read = key => {
    reads.push(key);
    return options.read ? options.read(key, storage, { reads, writes }) : storage.get(key) || null;
  };
  if (options.writeAvailable !== false) store.write = (value, key) => {
    writes.push({ key, value });
    if (options.write) return options.write(value, key, storage, { reads, writes });
    storage.set(key, value);
    return true;
  };
  const context = vm.createContext({ store: options.storageAvailable === false ? null : store });
  if (options.random) {
    context.Math = Object.create(Math);
    context.Math.random = options.random;
  }
  const source = fs.readFileSync(path.join(root, "lib/mapping-config.js"), "utf8");
  new vm.Script(source + "\nvar engine = createG1MappingConfig(store);", { filename: "lib/mapping-config.js" })
    .runInContext(context, { timeout: 2000 });
  return {
    storage, reads, writes,
    invoke(method, ...args) {
      context.method = method;
      context.args = args;
      return vm.runInContext("engine[method].apply(engine, args)", context, { timeout: 2000 });
    }
  };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

for (const variant of VARIANTS) {
  const test = (name, fn) => nodeTest(variant.script + " editor pemetaan: " + name, fn);

  test("pengaturan baru dan kosong menampilkan formulir bawaan asli dan JSON baca-saja", () => {
    for (const storage of [new Map(), new Map([[CONFIG_KEY, ""]])]) {
      const before = [...storage];
      const page = htmlPage(variant, storage);
      assert.deepEqual(page.writes, []);
      assert.match(page.payload.response.body, /Pengelolaan SKU Google One/);
      assert.equal(header(page.payload.response, "X-G1-Report-Version"), REPORT_VERSION);
      assert.equal(header(page.payload.response, "Cache-Control"), "no-store");
      assertNoScript(page.payload.response);
      const { data, reads } = exported(variant, storage);
      assert.deepEqual(new Set(reads), new Set([CONFIG_KEY, SCAN_KEY, TEST_KEY]));
      assert.equal(data.reportVersion, REPORT_VERSION);
      assert.equal(data.configuredMode, "discount75");
      assert.equal(data.configuredTarget, TARGET);
      assert.deepEqual(data.mappingConfig, {
        status: "default", revision: DEFAULT_REVISION, updatedAt: "", mode: "discount75", customized: false,
        rules: DEFAULT_RULES, target: TARGET, targetOrigin: "user-specified", error: "", limit: 30
      });
      for (const rule of DEFAULT_RULES) {
        const form = formFor(page.payload.response.body, "upsert", rule.id);
        assert.equal(form.fields.revision, DEFAULT_REVISION);
        assert.equal(form.fields.match, rule.match);
        assert.equal(form.fields.from, rule.from);
        assert.equal(form.fields.to, rule.to);
        assert.equal(form.fields.enabled, "1");
        assert(form.controls.some(control => control.name === "enabled" && control.type === "checkbox" && control.value === "1"));
        for (const field of ["from", "to"]) assertNativeSkuValue(form, field, rule[field]);
        const remove = formFor(page.payload.response.body, "delete", rule.id);
        const button = remove.buttons.find(button => button.name === "action" && button.value === "delete") || remove.buttons[0];
        assert(button && "formnovalidate" in button);
      }
      const add = formFor(page.payload.response.body, "upsert", "");
      assert.equal(add.fields.revision, DEFAULT_REVISION);
      assert.equal(add.fields.from, "");
      assert.equal(add.fields.to, "");
      assert.equal(formFor(page.payload.response.body, "reset").fields.revision, DEFAULT_REVISION);
      for (const form of forms(page.payload.response.body).filter(form => form.attrs.method.toLowerCase() === "post")) {
        const permitted = new Set(form.actions.has("preset") ? ["action", "revision", "preset"] :
          ["action", "revision", "id", "match", "from", "to", "enabled"]);
        for (const name of Object.keys(form.fields)) assert(permitted.has(name), "field tidak terduga " + name);
      }
      assert.deepEqual([...storage], before);
    }
  });

  test("ID hasil pemindaian mengisi datalist dan tautan pra-isi asal nyata tanpa menyimpan pengaturan", () => {
    const storage = new Map();
    run(variant.script, { storage, url: ORIGIN + "/plans", body: JSON.stringify([SOURCE, COM_SOURCE, TWENTY]) });
    const before = [...storage];
    const page = htmlPage(variant, storage);
    const html = page.payload.response.body;
    const lists = [...html.matchAll(/<datalist\b([^>]*)>([\s\S]*?)<\/datalist\s*>/gi)];
    assert(lists.length > 0);
    const values = new Set(lists.flatMap(list => [...list[2].matchAll(/<option\b([^>]*)>/gi)].map(option => attributes(option[1]).value)));
    const ids = new Set(lists.map(list => attributes(list[1]).id));
    assert(formFor(html, "upsert", "").controls.some(control => control.name === "from" && ids.has(control.list)));
    const links = [...html.matchAll(/<a\b([^>]*)>/gi)].map(link => attributes(link[1]).href).filter(Boolean).map(href => new URL(href, ROOT));
    for (const id of [SOURCE, COM_SOURCE, TWENTY]) {
      assert(values.has(id));
      const link = links.find(url => url.origin + url.pathname === ROOT && [...url.searchParams.values()].includes(id));
      assert(link, "setiap SKU terkumpul membutuhkan tautan pra-isi asal");
      const prefilled = htmlPage(variant, storage, { url: link.href });
      assert.equal(formFor(prefilled.payload.response.body, "upsert", "").fields.from, id);
      assert.deepEqual(prefilled.writes, []);
    }
    assert.deepEqual([...storage], before);
    assert.equal(storage.has(CONFIG_KEY), false);
  });

  test("alur tambah, edit, nonaktifkan, hapus, dan pulihkan hanya menyimpan konfigurasi lalu mengubah respons berikutnya", () => {
    const storage = new Map();
    run(variant.script, { storage, body: SOURCE });
    const oldScan = storage.get(SCAN_KEY);
    const oldTest = storage.get(TEST_KEY);
    const added = change(variant, storage, "upsert", "", {
      match: "exact", from: "  " + COM_SOURCE + "  ", to: "  " + CUSTOM_TARGET + "  ", enabled: "1"
    });
    assert.equal(added.config.status, "custom");
    assert.equal(added.config.mode, "custom");
    assert.equal(added.config.customized, true);
    assert.equal(added.config.target, TARGET);
    assert.equal(added.config.targetOrigin, "user-configured");
    const addedRule = added.config.rules.find(rule => !DEFAULT_RULES.some(prior => prior.id === rule.id));
    assert(addedRule);
    assert.match(addedRule.id, /^rule-[a-f0-9]{16}$/);
    assert.deepEqual(addedRule, { id: addedRule.id, match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: true });
    const firstStored = assertStored(storage, [...DEFAULT_RULES, addedRule]);
    assert.equal(added.config.revision, firstStored.revision);
    assert.equal(added.config.updatedAt, firstStored.updatedAt);
    assert.equal(storage.get(SCAN_KEY), oldScan);
    assert.equal(storage.get(TEST_KEY), oldTest);
    let data = exported(variant, storage).data;
    assert.equal(data.configuredMode, "custom");
    assert.equal(data.scan.mode, "discount75");
    assert.equal(data.test.mode, "discount75");
    assert.equal(data.test.mappingRevision, DEFAULT_REVISION);

    const rewritten = run(variant.script, { storage, body: JSON.stringify([SOURCE, COM_SOURCE, COM_SOURCE]) });
    assert.deepEqual(JSON.parse(rewritten.payload.body), [TARGET, CUSTOM_TARGET, CUSTOM_TARGET]);
    assert.equal(rewritten.reads.filter(key => key === CONFIG_KEY).length, 1);
    assert.deepEqual(rewritten.writes.map(write => write.key), [SCAN_KEY, TEST_KEY]);
    const current = record(storage, TEST_KEY);
    assert.equal(current.version, VERSION);
    assert.equal(current.mode, "custom");
    assert.equal(current.mappingStatus, "custom");
    assert.equal(current.mappingRevision, firstStored.revision);
    assert.equal(current.mappingUpdatedAt, firstStored.updatedAt);
    assert.equal(current.target, TARGET);
    assert.equal(current.targetOrigin, "user-configured");
    assert.equal(current.hitCount, 3);
    assert.equal(current.annualHitCount, 1);
    assert(current.matchedFrom.every(row => row.fallback === false));
    assert.equal(current.matchedFrom.find(row => row.id === COM_SOURCE).to, CUSTOM_TARGET);
    assert.equal(record(storage, SCAN_KEY).mode, "custom");
    assert(!record(storage, SCAN_KEY).skus.some(row => row.id === CUSTOM_TARGET));
    assert(rewritten.logs.some(line => line.includes("mappingStatus=custom") && line.includes(firstStored.revision)));
    data = exported(variant, storage).data;
    assert.equal(data.test.mappingRevision, current.mappingRevision);
    assert.equal(data.test.mappingUpdatedAt, current.mappingUpdatedAt);
    assert.equal(data.test.mappingStatus, "custom");
    assert.equal(data.test.matchedFrom.find(row => row.id === COM_SOURCE).to, CUSTOM_TARGET);
    assert.equal(data.test.targetOrigin, "user-configured");
    const currentHTML = htmlPage(variant, storage).payload.response.body;
    assert(currentHTML.includes("Pemetaan Manual"));
    assert(currentHTML.includes(CUSTOM_TARGET));

    const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
    const edited = change(variant, storage, "upsert", addedRule.id, { to: NEXT_TARGET });
    assert.equal(edited.config.rules.length, 4);
    assert.equal(edited.config.rules.find(rule => rule.id === addedRule.id).to, NEXT_TARGET);
    assert.notEqual(edited.config.revision, firstStored.revision);
    assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
    assert.equal(run(variant.script, { storage, body: COM_SOURCE }).payload.body, NEXT_TARGET);

    const disabled = change(variant, storage, "upsert", addedRule.id, { enabled: undefined });
    assert.equal(disabled.config.rules.find(rule => rule.id === addedRule.id).enabled, false);
    assert.notEqual(disabled.config.revision, edited.config.revision);
    const unchanged = run(variant.script, { storage, body: COM_SOURCE });
    assert.deepEqual(unchanged.payload, {});
    assert.equal(record(storage, TEST_KEY).status, "no-match");
    assert.equal(record(storage, TEST_KEY).mode, "custom");

    const deleted = change(variant, storage, "delete", addedRule.id, { match: "bad", from: "<invalid>", to: "<invalid>", enabled: "invalid" });
    assert.deepEqual(deleted.config.rules, DEFAULT_RULES);
    assert.equal(deleted.config.mode, "custom");
    assert.equal(deleted.config.customized, true);
    assertStored(storage, DEFAULT_RULES);
    const reset = change(variant, storage, "reset");
    const restored = assertStored(storage, [], false);
    assert.equal(reset.config.status, "default");
    assert.equal(reset.config.mode, "discount75");
    assert.equal(reset.config.revision, restored.revision);
    assert.notEqual(reset.config.revision, DEFAULT_REVISION);
    assert.deepEqual(reset.config.rules, DEFAULT_RULES);
    assert.equal(reset.config.targetOrigin, "user-specified");
    assert.equal(run(variant.script, { storage, body: SOURCE }).payload.body, TARGET);
  });

  test("menonaktifkan semua aturan tetap mempertahankan mode custom dan meneruskan respons asli", () => {
    const storage = new Map();
    for (const rule of DEFAULT_RULES) change(variant, storage, "upsert", rule.id, { enabled: undefined });
    const config = exported(variant, storage).data.mappingConfig;
    assert.equal(config.status, "custom");
    assert.equal(config.target, "");
    assert.equal(config.targetOrigin, "");
    assert(config.rules.every(rule => rule.enabled === false));
    assertStored(storage, DEFAULT_RULES.map(rule => ({ ...rule, enabled: false })));
    const result = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY]) });
    assert.deepEqual(result.payload, {});
    assert.equal(record(storage, TEST_KEY).mode, "custom");
    assert.equal(record(storage, TEST_KEY).status, "no-match");
    assert.equal(record(storage, TEST_KEY).hitCount, 0);
    assert.equal(record(storage, TEST_KEY).target, "");
  });

  test("menghapus semua bawaan menyimpan daftar kosong eksplisit hingga dipulihkan", () => {
    const storage = new Map();
    for (const rule of DEFAULT_RULES) change(variant, storage, "delete", rule.id);
    const empty = assertStored(storage, []);
    const config = exported(variant, storage).data.mappingConfig;
    assert.equal(config.mode, "custom");
    assert.equal(config.customized, true);
    assert.deepEqual(config.rules, []);
    assert.equal(config.target, "");
    assert.equal(config.targetOrigin, "");
    const result = run(variant.script, { storage, body: SOURCE + " " + TWENTY + " " + THIRTY });
    assert.deepEqual(result.payload, {});
    assert.equal(record(storage, TEST_KEY).mappingRevision, empty.revision);
    assert.equal(record(storage, TEST_KEY).status, "no-match");
    change(variant, storage, "reset");
    assertStored(storage, [], false);
    const restored = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY]) });
    assert.deepEqual(JSON.parse(restored.payload.body), DEFAULT_RULES.map(rule => rule.to));
  });

  test("aturan persis mengalahkan awalan, awalan aktif terpanjang menang, dan penggantian tetap satu kali jalan", () => {
    const rules = [
      { id: "broad", match: "prefix", from: "g1.ios.", to: "g1.fixture.broad", enabled: true },
      { id: "two-tb", match: "prefix", from: "g1.ios.2tb.", to: CUSTOM_TARGET, enabled: true },
      exactRule({ id: "exact", from: SOURCE, to: "g1.fixture.exact" }),
      exactRule({ id: "disabled-exact", from: OTHER_SOURCE, to: "g1.fixture.disabled", enabled: false }),
      { id: "disabled-prefix", match: "prefix", from: "g1.ios.2tb.deep.", to: "g1.fixture.disabled", enabled: false },
      { id: "com-prefix", match: "prefix", from: "com.google.one.family.", to: "g1.fixture.com", enabled: true },
      exactRule({ id: "next-pass", from: "g1.fixture.exact", to: "g1.fixture.chained" })
    ];
    const values = [SOURCE, OTHER_SOURCE, "g1.ios.2tb.deep.member", TWENTY, "com.google.one.family.member", "g1.fixture.exact", "com.google.one.family."];
    for (const order of [rules, [...rules].reverse()]) {
      const storage = withConfig(order);
      const result = run(variant.script, { storage, body: JSON.stringify(values) });
      assert.deepEqual(JSON.parse(result.payload.body), ["g1.fixture.exact", CUSTOM_TARGET, CUSTOM_TARGET, "g1.fixture.broad", "g1.fixture.com", "g1.fixture.chained", "com.google.one.family."]);
      const saved = record(storage, TEST_KEY);
      assert.equal(saved.hitCount, 6);
      assert.equal(saved.annualHitCount, 3);
      assert.equal(saved.target, CUSTOM_TARGET);
      assert.equal(saved.targetOrigin, "user-configured");
      assert.equal(saved.mappingRevision, "a".repeat(48));
      assert.equal(saved.matchedFrom.find(row => row.id === SOURCE).to, "g1.fixture.exact");
      assert.equal(saved.matchedFrom.find(row => row.id === OTHER_SOURCE).to, CUSTOM_TARGET);
      assert(saved.matchedFrom.every(row => row.fallback === false));
      assert(!result.logs.some(line => line.includes("fallback=")));
      assert.deepEqual(record(storage, SCAN_KEY).skus.map(row => row.id), [...values].sort());
      const data = exported(variant, storage).data;
      assert.equal(data.configuredTarget, CUSTOM_TARGET);
      assert.equal(data.test.matchedFrom.find(row => row.id === SOURCE).to, "g1.fixture.exact");
    }
  });

  test("aturan kustom menghormati token lengkap, kedua namespace, dan batas URL query ai", () => {
    const rules = [exactRule({ from: SOURCE, to: CUSTOM_TARGET }), exactRule({ id: "com-exact", from: COM_SOURCE, to: NEXT_TARGET })];
    const untouched = [SOURCE + ".extra", COM_SOURCE + "_extra", COM_SOURCE + "-extra", SOURCE + ".", COM_SOURCE + "."];
    for (const id of [SOURCE, COM_SOURCE]) for (const before of ["x.", "prefix", "person@", "%", "-", "_"]) untouched.push(before + id);
    const storage = withConfig(rules);
    const result = run(variant.script, { storage, body: JSON.stringify([SOURCE, COM_SOURCE, ...untouched]) });
    assert.deepEqual(JSON.parse(result.payload.body), [CUSTOM_TARGET, NEXT_TARGET, ...untouched]);
    assert.equal(record(storage, TEST_KEY).annualHitCount, 1);
    assert.equal(record(storage, TEST_KEY).target, "", "penimpaan persis 2TB bukan merupakan target awalan");
    const historical = storage.get(TEST_KEY);
    for (const url of [ORIGIN + "/ai", ORIGIN + "/ai/other?x=1", ORIGIN + "/plans?x=1", ORIGIN + ".evil/ai?x=1", "http://one.google.com/ai?x=1", ROOT, ROOT + "?format=json"]) {
      const next = run(variant.script, { storage, url, body: SOURCE + " " + COM_SOURCE });
      assert.deepEqual(next.payload, {});
      assert.equal(storage.get(TEST_KEY), historical);
      assert(!next.writes.some(write => write.key === CONFIG_KEY));
    }
    const prefixOnly = withConfig([{ id: "only-prefix", match: "prefix", from: "g1.fixture.only.", to: TARGET, enabled: true }]);
    assert.deepEqual(run(variant.script, { storage: prefixOnly, body: "g1.fixture.only." }).payload, {});
    assert.equal(run(variant.script, { storage: prefixOnly, body: "g1.fixture.only.member" }).payload.body, TARGET);
  });

  test("penimpaan persis 2TB mempertahankan target seragam kosong di catatan saat ini, HTML, dan JSON", () => {
    for (const rules of [
      [exactRule({ from: SOURCE })],
      [exactRule({ from: SOURCE }), { ...DEFAULT_RULES[0], enabled: false }]
    ]) {
      const storage = withConfig(rules);
      const result = run(variant.script, { storage, body: SOURCE });
      assert.equal(result.payload.body, CUSTOM_TARGET);
      const saved = record(storage, TEST_KEY);
      assert.equal(saved.mappingRevision, "a".repeat(48));
      assert.equal(saved.target, "");
      assert.equal(saved.targetOrigin, "");
      assert.equal(saved.annualHitCount, 1);
      assert.equal(saved.matchedFrom[0].to, CUSTOM_TARGET);
      const data = exported(variant, storage).data;
      assert.equal(data.configuredTarget, "");
      assert.equal(data.mappingConfig.target, "");
      assert.equal(data.test.target, "");
      assert.equal(data.test.targetOrigin, "");
      assert.equal(data.test.mappingRevision, saved.mappingRevision);
      assert.equal(data.test.matchedFrom[0].to, CUSTOM_TARGET);
      const html = htmlPage(variant, storage).payload.response.body;
      assert(html.includes(CUSTOM_TARGET + "</code></td>"));
      assert(!html.includes("Target 2TB pada catatan kali ini: <code>" + CUSTOM_TARGET + "</code>"));
      assert.equal(storage.get(TEST_KEY), JSON.stringify(saved));
    }
  });

  test("satu pembacaan konfigurasi efektif mengatur pengumpulan, penulisan ulang, dan metadata revisi", () => {
    const initial = storedConfig([exactRule({ from: SOURCE })]);
    const later = storedConfig([exactRule({ from: SOURCE, to: NEXT_TARGET })], { revision: "b".repeat(48) });
    const storage = new Map([[CONFIG_KEY, JSON.stringify(initial)]]);
    let configReads = 0;
    const result = run(variant.script, {
      storage, body: SOURCE,
      read(key, current) {
        if (key === CONFIG_KEY) return JSON.stringify(++configReads === 1 ? initial : later);
        return current.get(key) || null;
      }
    });
    assert.equal(configReads, 1);
    assert.equal(result.payload.body, CUSTOM_TARGET);
    assert.equal(record(storage, SCAN_KEY).mode, "custom");
    assert.equal(record(storage, TEST_KEY).mappingRevision, initial.revision);
    assert.equal(record(storage, TEST_KEY).mappingUpdatedAt, initial.updatedAt);
    assert.equal(storage.get(CONFIG_KEY), JSON.stringify(initial));
  });

  test("tiga puluh aturan diterima, aturan ke-31 ditolak, dan aturan yang ada tetap dapat diedit", () => {
    const rules = Array.from({ length: 29 }, (_, index) => exactRule({ id: "fixture-" + index, from: "g1.fixture.source_" + index }));
    const storage = withConfig(rules);
    const thirtieth = change(variant, storage, "upsert", "", { match: "exact", from: "g1.fixture.source_29", to: NEXT_TARGET, enabled: "1" });
    assert.equal(thirtieth.config.rules.length, 30);
    const before = [...storage];
    const form = formFor(thirtieth.html, "upsert", "");
    assert.equal(form.disabled, true);
    // Lewati kontrol asli yang dinonaktifkan untuk menguji validasi otoritatif di sisi server/pengontrol.
    const rejected = post(variant, storage, new URLSearchParams({
      action: "upsert", revision: thirtieth.config.revision, id: "", match: "exact",
      from: "g1.fixture.source_30", to: TARGET, enabled: "1"
    }).toString());
    assertRejected(rejected, 400, before);
    assert.equal(formFor(rejected.payload.response.body, "upsert", "").fields.from, "g1.fixture.source_30");
    const edited = change(variant, storage, "upsert", "fixture-0", { to: NEXT_TARGET });
    assert.equal(edited.config.rules.length, 30);
    assert.equal(edited.config.rules[0].id, "fixture-0");
    assert.equal(edited.config.rules[0].to, NEXT_TARGET);
    assert.equal(run(variant.script, { storage, body: "g1.fixture.source_0" }).payload.body, NEXT_TARGET);
  });

  test("pasangan cara-pencocokan dan asal yang duplikat ditolak bahkan ketika aturan yang ada dinonaktifkan", () => {
    for (const enabled of [true, false]) {
      const storage = withConfig([exactRule({ enabled })]);
      const before = [...storage];
      const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
      const result = submit(variant, storage, form, "upsert", { match: "exact", from: COM_SOURCE, to: NEXT_TARGET, enabled: "1" });
      assertRejected(result, 400, before);
      const retained = formFor(result.payload.response.body, "upsert", "");
      assert.equal(retained.fields.from, COM_SOURCE);
      assert.equal(retained.fields.to, NEXT_TARGET);
    }
  });

  test("validasi formulir menegakkan bentuk SKU yang dikenali, tipe pencocokan, ID, dan nilai kotak centang", () => {
    const base = { match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: "1" };
    const invalid = [
      { from: "" }, { to: "" }, { from: "g1." }, { from: "com.google.one." }, { to: "g1." },
      { from: "g1.fixture." }, { to: "com.google.one.fixture." }, { from: "G1.fixture" }, { to: "other.fixture" },
      { from: "g1.fixture space" }, { to: "g1.fixture/part" }, { from: "g1.fixture?query=1" }, { to: "g1.fixture#part" },
      { from: "g1.fixture\u0000tail" }, { to: "g1.produk_\u00e9" }, { to: COM_SOURCE },
      { from: "g1." + "a".repeat(161) }, { to: "com.google.one." + "b".repeat(161) },
      { match: "prefix", from: "g1.fixture" }, { match: "prefix", from: "g1." },
      { match: "prefix", from: "com.google.one." }, { match: "prefix", from: "g1." + "a".repeat(160) + "." },
      { match: "Prefix" }, { match: "regex" }, { match: "" },
      { id: "_bad" }, { id: "Uppercase" }, { id: "a".repeat(41) }, { id: "__proto__" },
      { id: "supplied-new-id" }, { enabled: "0" }, { enabled: "true" }, { enabled: "2" }
    ];
    for (const fields of invalid) {
      const storage = new Map();
      const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
      const result = submit(variant, storage, form, "upsert", { ...base, ...fields });
      assertRejected(result, 400, []);
    }
    for (const id of ["", "_bad", "a".repeat(41), "constructor", "../default-2tb"]) {
      const storage = new Map();
      const form = formFor(htmlPage(variant, storage).payload.response.body, "delete", "default-2tb");
      assertRejected(submit(variant, storage, form, "delete", { id }), 400, []);
    }
  });

  test("batas akhiran 160 karakter berfungsi di ketiga namespace untuk sumber exact dan prefix", () => {
    for (const namespace of ["g1.", "com.google.one.", GEMINI_NAMESPACE]) {
      for (const match of ["exact", "prefix"]) {
        const from = namespace + "a".repeat(match === "prefix" ? 159 : 160) + (match === "prefix" ? "." : "");
        const to = (namespace === "g1." ? "com.google.one." : "g1.") + "b".repeat(160);
        const storage = new Map();
        const added = change(variant, storage, "upsert", "", { match, from, to, enabled: "1" });
        assert(added.config.rules.some(rule => rule.match === match && rule.from === from && rule.to === to));
        if (match === "exact") assert.equal(run(variant.script, { storage, body: from }).payload.body, to);
      }
    }
  });

  test("sumber persis dan target Gemini 178 karakter bertahan lewat POST asli, runtime, JSON, dan HTML", () => {
    const from = GEMINI_NAMESPACE + "s".repeat(160);
    const to = GEMINI_NAMESPACE + "t".repeat(160);
    assert.equal(from.length, 178);
    assert.equal(to.length, 178);
    const storage = withConfig([]);
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    assertNativeSkuValue(form, "from", from);
    assertNativeSkuValue(form, "to", to);
    const html = assertRedirect(variant, submit(variant, storage, form, "upsert", { match: "exact", from, to, enabled: "1" }), "saved");
    const saved = record(storage, CONFIG_KEY);
    assert.equal(saved.rules.length, 1);
    assert.deepEqual(saved.rules[0], exactRule({ id: saved.rules[0].id, from, to }));
    const edit = formFor(html, "upsert", saved.rules[0].id);
    assert.equal(edit.fields.from, from);
    assert.equal(edit.fields.to, to);
    assertNativeSkuValue(edit, "from", from);
    assertNativeSkuValue(edit, "to", to);
    const body = JSON.stringify({ products: [from, from, to], price: "178.00", cycle: "fixture-cycle" });
    const runtime = run(variant.script, { storage, body });
    assert.equal(runtime.payload.body, JSON.stringify({ products: [to, to, to], price: "178.00", cycle: "fixture-cycle" }));
    const data = exported(variant, storage).data;
    assert.deepEqual(data.mappingConfig.rules, saved.rules);
    assert.equal(data.test.version, VERSION);
    assert.equal(data.test.mappingRevision, saved.revision);
    assert.equal(data.test.hitCount, 2);
    assert.deepEqual(data.test.matchedFrom, [{ id: from, to, count: 2, fallback: false }]);
    assert.deepEqual(data.scan.skus.map(row => [row.id, row.count]), [[from, 2], [to, 1]].sort());
    const rendered = htmlPage(variant, storage).payload.response.body;
    assert.equal(formFor(rendered, "upsert", saved.rules[0].id).fields.from, from);
    assert.equal(formFor(rendered, "upsert", saved.rules[0].id).fields.to, to);
    assert(rendered.includes("<code>" + from + "</code>"));
    assert(rendered.includes("<code>" + to + "</code>"));
    assert.equal(storage.get(CONFIG_KEY), JSON.stringify(saved));
  });

  test("awalan Gemini dan target 178 karakter mempertahankan nilai asli penuh dan mencocokkan token batas utuh", () => {
    const from = GEMINI_NAMESPACE + "p".repeat(158) + ".";
    const source = from + "x";
    const to = GEMINI_NAMESPACE + "t".repeat(160);
    assert.equal(source.length, 178);
    const storage = withConfig([]);
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    assertNativeSkuValue(form, "from", from);
    assertNativeSkuValue(form, "to", to);
    const html = assertRedirect(variant, submit(variant, storage, form, "upsert", { match: "prefix", from, to, enabled: "1" }), "saved");
    const saved = record(storage, CONFIG_KEY);
    const edit = formFor(html, "upsert", saved.rules[0].id);
    assert.equal(edit.fields.match, "prefix");
    assert.equal(edit.fields.from, from);
    assert.equal(edit.fields.to, to);
    assertNativeSkuValue(edit, "from", from);
    assertNativeSkuValue(edit, "to", to);
    const runtime = run(variant.script, { storage, body: JSON.stringify([source, from, source + "x"]) });
    assert.deepEqual(JSON.parse(runtime.payload.body), [to, from, source + "x"]);
    const data = exported(variant, storage).data;
    assert.deepEqual(data.mappingConfig.rules, saved.rules);
    assert.deepEqual(data.test.matchedFrom, [{ id: source, to, count: 1, fallback: false }]);
    assert.equal(data.test.mappingRevision, saved.revision);
    assert(data.scan.skus.some(row => row.id === source));
    const rendered = htmlPage(variant, storage).payload.response.body;
    assert.equal(formFor(rendered, "upsert", saved.rules[0].id).fields.from, from);
    assert.equal(formFor(rendered, "upsert", saved.rules[0].id).fields.to, to);
    assert(rendered.includes("<code>" + source + "</code>"));
    assert(rendered.includes("<code>" + to + "</code>"));
  });

  test("awalan Gemini penuh 178 karakter lolos bolak-balik sedangkan ekstensi akhiran 161 karakter tetap tidak cocok", () => {
    const from = GEMINI_NAMESPACE + "p".repeat(159) + ".";
    const to = GEMINI_NAMESPACE + "t".repeat(160);
    assert.equal(from.length, 178);
    const storage = withConfig([]);
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    assertNativeSkuValue(form, "from", from);
    assertNativeSkuValue(form, "to", to);
    const html = assertRedirect(variant, submit(variant, storage, form, "upsert", { match: "prefix", from, to, enabled: "1" }), "saved");
    const saved = record(storage, CONFIG_KEY);
    assert.equal(formFor(html, "upsert", saved.rules[0].id).fields.from, from);
    assert.equal(formFor(html, "upsert", saved.rules[0].id).fields.to, to);
    assert.deepEqual(exported(variant, storage).data.mappingConfig.rules, saved.rules);
    const runtime = run(variant.script, { storage, body: JSON.stringify([from, from + "x"]) });
    assert.deepEqual(runtime.payload, {});
    const data = exported(variant, storage).data;
    assert.equal(data.test.status, "no-match");
    assert.deepEqual(data.test.matchedFrom, []);
    assert.deepEqual(data.mappingConfig.rules, saved.rules);
    assert.equal(formFor(htmlPage(variant, storage).payload.response.body, "upsert", saved.rules[0].id).fields.from, from);
  });

  test("akhiran Gemini 161 gagal di pattern asli dan POST otoritatif tanpa mengubah konfigurasi atau riwayat", () => {
    const tooLong = GEMINI_NAMESPACE + "s".repeat(161);
    const prefixTooLong = GEMINI_NAMESPACE + "p".repeat(160) + ".";
    assert.equal(tooLong.length, 179);
    assert.equal(prefixTooLong.length, 179);
    const storage = legacyProStorage(DEFAULT_RULES);
    const before = [...storage];
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    const base = { match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: "1" };
    for (const [field, fields] of [
      ["from", { from: tooLong }], ["to", { to: tooLong }],
      ["from", { match: "prefix", from: prefixTooLong }]
    ]) {
      const { control, pattern } = nativeSkuControl(form, field);
      assert(fields[field].length > Number(control.maxlength));
      assert.equal(pattern.test(fields[field]), false, field + " harus menolak suffix161 terlepas dari maxlength");
      // Lewati validasi asli untuk menguji batas POST juga.
      const rejected = submit(variant, storage, form, "upsert", { ...base, ...fields });
      assertRejected(rejected, 400, before);
      const draft = formFor(rejected.payload.response.body, "upsert", "");
      assert.equal(draft.fields[field], fields[field], "nilai formulir yang gagal tetap lengkap agar dapat diperbaiki");
    }
    assert.deepEqual(exported(variant, storage).data.mappingConfig.rules, DEFAULT_RULES);
    assert.deepEqual([...storage], before);
  });

  test("dua formulir terbuka menolak penyimpanan usang dan menampilkan revisi serta nilai terbaru", () => {
    const storage = new Map();
    const first = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    const second = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "default-2tb");
    assert.equal(first.fields.revision, second.fields.revision);
    assertRedirect(variant, submit(variant, storage, first, "upsert", { match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: "1" }), "saved");
    const before = [...storage];
    const stale = submit(variant, storage, second, "upsert", { to: NEXT_TARGET });
    assertRejected(stale, 409, before);
    const latest = formFor(stale.payload.response.body, "upsert", "default-2tb");
    assert.equal(latest.fields.to, TARGET);
    assert.equal(latest.fields.revision, record(storage, CONFIG_KEY).revision);
    assert.notEqual(latest.fields.revision, second.fields.revision);
    assert.equal(exported(variant, storage).data.mappingConfig.rules.find(rule => rule.id === "default-2tb").to, TARGET);
    const fresh = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "default-2tb");
    for (const revision of [undefined, "", DEFAULT_REVISION, "not-a-revision"]) {
      assertRejected(submit(variant, storage, fresh, "upsert", { revision, to: NEXT_TARGET }), 409, before);
    }
  });

  test("formulir hapus dan pulihkan yang usang tidak dapat menimpa penyimpanan antara", () => {
    const storage = new Map();
    const html = htmlPage(variant, storage).payload.response.body;
    const remove = formFor(html, "delete", "default-20tb");
    const reset = formFor(html, "reset");
    change(variant, storage, "upsert", "default-2tb", { to: CUSTOM_TARGET });
    const before = [...storage];
    assertRejected(submit(variant, storage, remove, "delete"), 409, before);
    assertRejected(submit(variant, storage, reset, "reset"), 409, before);
    assert.equal(exported(variant, storage).data.mappingConfig.target, CUSTOM_TARGET);
  });

  test("penyimpanan membaca ulang konfigurasi dan mendeteksi perubahan setelah pembacaan awal pengontrol", () => {
    const storage = withConfig([exactRule()]);
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "fixture-rule");
    const concurrent = storedConfig([exactRule({ to: NEXT_TARGET })], { revision: "b".repeat(48) });
    let configReads = 0;
    const result = submit(variant, storage, form, "upsert", { to: TARGET }, {
      read(key, current) {
        if (key === CONFIG_KEY && ++configReads === 2) current.set(CONFIG_KEY, JSON.stringify(concurrent));
        return current.get(key) || null;
      }
    });
    assertRejected(result, 409, [[CONFIG_KEY, JSON.stringify(concurrent)]]);
    assert(configReads >= 2);
    const latest = formFor(result.payload.response.body, "upsert", "fixture-rule");
    assert.equal(latest.fields.revision, concurrent.revision);
    assert.equal(latest.fields.to, NEXT_TARGET);
  });

  test("POST hanya menerima Origin persis dan konteks fetch same-origin dengan nama header case-insensitive", () => {
    const invalidOrigins = [undefined, "", "null", "https://example.test", "https://one.google.com.evil", "http://one.google.com", ORIGIN + "/", ORIGIN + ":443", ORIGIN + " "];
    for (const origin of invalidOrigins) {
      const storage = new Map();
      const form = formFor(htmlPage(variant, storage).payload.response.body, "reset");
      const headers = { "Content-Type": FORM_HEADERS["Content-Type"] };
      if (origin !== undefined) headers.Origin = origin;
      assertRejected(submit(variant, storage, form, "reset", {}, { headers }), 403, []);
    }
    for (const site of ["cross-site", "same-site", "none", "", "null"]) {
      const storage = new Map();
      const form = formFor(htmlPage(variant, storage).payload.response.body, "reset");
      assertRejected(submit(variant, storage, form, "reset", {}, { headers: { ...FORM_HEADERS, "Sec-Fetch-Site": site } }), 403, []);
    }
    for (const headers of [
      { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded" },
      { oRiGiN: ORIGIN, "CoNtEnT-TyPe": "application/x-www-form-urlencoded; charset=UTF-8", "sEc-FeTcH-sItE": "same-origin" }
    ]) {
      const storage = new Map();
      const form = formFor(htmlPage(variant, storage).payload.response.body, "reset");
      assertRedirect(variant, submit(variant, storage, form, "reset", {}, { headers }), "reset");
    }
  });

  test("pengontrol hanya membaca tiga header yang diizinkan dan tidak pernah menyentuh cookie atau otorisasi", () => {
    const storage = new Map();
    const headers = { ...FORM_HEADERS, "Sec-Fetch-Site": "same-origin" };
    const touched = [];
    for (const key of ["Cookie", "Authorization", "X-Private-Fixture"]) Object.defineProperty(headers, key, {
      enumerable: true,
      get() { touched.push(key); throw new Error("private-header-fixture"); }
    });
    const form = formFor(htmlPage(variant, storage).payload.response.body, "reset");
    const result = submit(variant, storage, form, "reset", {}, { headers });
    assertRedirect(variant, result, "reset");
    assert.deepEqual(touched, []);
    assert(!JSON.stringify([...storage]).includes("private-header-fixture"));
    assert(!result.logs.some(line => line.includes("private-header-fixture")));
  });

  test("tipe konten, batas body, dan pendekodean formulir ketat menolak permintaan sebelum persistensi", () => {
    const body = new URLSearchParams({ action: "reset", revision: DEFAULT_REVISION }).toString();
    for (const contentType of [undefined, "", "application/json", "text/plain", "multipart/form-data; boundary=fixture", "application/x-www-form-urlencodedx"]) {
      const headers = { Origin: ORIGIN };
      if (contentType !== undefined) headers["Content-Type"] = contentType;
      assertRejected(post(variant, new Map(), body, { headers }), 415, []);
    }
    for (const invalidBody of [undefined, null, 42, {}, "", "action=reset&revision=%", "action=reset&revision=%GG", "action=reset&revision=%E0%A4%A", "action=reset&revision=%C0%AF", "action=reset&revision=%ED%A0%80", "act%GGion=reset&revision=" + DEFAULT_REVISION]) {
      assertRejected(post(variant, new Map(), invalidBody), 400, []);
    }
    assertRejected(post(variant, new Map(), body + "&from=" + "a".repeat(20 * 1024)), 413, []);
    assertRejected(post(variant, new Map(), body + "&from=" + "\u20ac".repeat(7000)), 413, []);
    assertRejected(post(variant, new Map(), body + "&from=\ud800"), 400, []);
  });

  test("parameter aksi duplikat, tidak dikenal, dan tidak valid tidak dapat mengubah pengaturan atau menghapus riwayat", () => {
    const base = new URLSearchParams({ action: "upsert", revision: DEFAULT_REVISION, id: "", match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: "1" }).toString();
    for (const suffix of ["&action=reset", "&revision=" + DEFAULT_REVISION, "&id=default-2tb", "&from=" + SOURCE, "&fr%6Fm=" + SOURCE, "&enabled=1", "&unknown=1", "&__proto__=fixture", "&constructor=fixture", "&token=fixture"]) {
      assertRejected(post(variant, new Map(), base + suffix), 400, []);
    }
    for (const action of [undefined, "", "clear", "constructor", "UPSERT", "remove"]) {
      const fields = { revision: DEFAULT_REVISION };
      if (action !== undefined) fields.action = action;
      assertRejected(post(variant, new Map(), new URLSearchParams(fields).toString()), 400, []);
    }
    const storage = new Map([[SCAN_KEY, "fixture-scan"], [TEST_KEY, "fixture-test"]]);
    const before = [...storage];
    assertRejected(post(variant, storage, "action=clear&revision=" + DEFAULT_REVISION, { url: ROOT + "?clear=1" }), 400, before);
  });

  test("parameter aksi GET, ekspor JSON, dan metode tidak didukung tidak pernah menyimpan konfigurasi", () => {
    const storage = withConfig([exactRule()]);
    const before = [...storage];
    for (const action of ["upsert", "delete", "reset"]) {
      const fields = new URLSearchParams({ action, revision: "a".repeat(48), id: "fixture-rule", match: "exact", from: COM_SOURCE, to: NEXT_TARGET, enabled: "1" });
      for (const suffix of ["", "&format=json"]) {
        const result = run(variant.report, { storage, url: ROOT + "?" + fields + suffix, method: "GET", headers: FORM_HEADERS, requestBody: fields.toString() });
        assert([200, 405].includes(result.payload.response.status));
        assert.deepEqual(result.writes, []);
        assert.deepEqual([...storage], before);
      }
    }
    for (const method of ["HEAD", "PUT", "PATCH", "DELETE"]) {
      const result = post(variant, storage, "action=reset&revision=" + "a".repeat(48), { method });
      assert.deepEqual(result.writes, []);
      assert.deepEqual([...storage], before);
    }
    for (const url of [ROOT + "-other", ROOT + "/other", "https://example.test/g1-sku-report"]) {
      const result = post(variant, storage, "action=reset&revision=" + "a".repeat(48), { url });
      assert.deepEqual(result.payload, {});
      assert.deepEqual(result.reads, []);
      assert.deepEqual(result.writes, []);
    }
  });

  test("nilai draf tidak valid tetap ter-escape di HTML tanpa skrip dan dengan CSP formulir yang persis", () => {
    const storage = new Map();
    const draft = {
      match: "exact", from: 'g1.fixture.<img src=x onerror="draft-marker">&\'',
      to: 'com.google.one.fixture.\"><script>draft-marker</script>&\'', enabled: undefined
    };
    const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "");
    const result = submit(variant, storage, form, "upsert", draft);
    assertRejected(result, 400, []);
    assertNoScript(result.payload.response);
    const retained = formFor(result.payload.response.body, "upsert", "");
    assert.equal(retained.fields.from, draft.from);
    assert.equal(retained.fields.to, draft.to);
    assert.equal(retained.fields.enabled, undefined);
    assert(!result.payload.response.body.includes(draft.from));
    assert(!result.payload.response.body.includes(draft.to));
    const data = exported(variant, storage).data;
    assert.equal(data.mappingConfig.status, "default");
    assert.deepEqual(data.mappingConfig.rules, DEFAULT_RULES);
  });

  test("catatan bawaan tersimpan mempertahankan revisi dan waktunya sambil menurunkan aturan bawaan", () => {
    const storage = withConfig([], { customized: false, extra: "private-config-extension" });
    const before = [...storage];
    const data = exported(variant, storage).data;
    assert.equal(data.mappingConfig.status, "default");
    assert.equal(data.mappingConfig.revision, "a".repeat(48));
    assert.equal(data.mappingConfig.updatedAt, FIXED_TIME);
    assert.equal(data.mappingConfig.mode, "discount75");
    assert.equal(data.mappingConfig.targetOrigin, "user-specified");
    assert.deepEqual(data.mappingConfig.rules, DEFAULT_RULES);
    assert(!JSON.stringify(data).includes("private-config-extension"));
    assert.deepEqual([...storage], before);
    const result = run(variant.script, { storage, body: SOURCE });
    assert.equal(result.payload.body, TARGET);
    assert.equal(record(storage, TEST_KEY).mappingRevision, "a".repeat(48));
    assert.equal(record(storage, TEST_KEY).mappingUpdatedAt, FIXED_TIME);
    assert.equal(record(storage, TEST_KEY).mappingStatus, "default");
    assert.equal(storage.get(CONFIG_KEY), before[0][1]);
  });

  test("catatan dan bentuk aturan cacat tetap invalid tanpa fallback ke bawaan atau perbaikan otomatis", () => {
    const badRecords = [
      "private-invalid-json", "null", "[]", "42", "\"private-invalid-string\"",
      JSON.stringify(storedConfig([], { schemaVersion: 2 })),
      JSON.stringify(storedConfig([], { schemaVersion: "1" })),
      JSON.stringify(storedConfig([], { revision: "private-invalid-revision" })),
      JSON.stringify(storedConfig([], { revision: "A".repeat(48) })),
      JSON.stringify(storedConfig([], { updatedAt: "2026-02-30T00:00:00.000Z" })),
      JSON.stringify(storedConfig([], { updatedAt: "2026-11-23T07:40:06Z" })),
      JSON.stringify(storedConfig([], { updatedAt: "2026-11-23T15:40:06.325+08:00" })),
      JSON.stringify(storedConfig([], { customized: "true" })),
      JSON.stringify(storedConfig([], { customized: undefined })),
      JSON.stringify(storedConfig(undefined)), JSON.stringify(storedConfig({})), JSON.stringify(storedConfig(null)),
      JSON.stringify(storedConfig(DEFAULT_RULES, { customized: false }))
    ];
    const invalidRules = [
      [null], [42], [[]], [{}],
      [exactRule({ id: "_bad" })], [exactRule({ id: "a".repeat(41) })], [exactRule({ id: 42 })],
      [exactRule({ match: "Prefix" })], [exactRule({ match: null })],
      [exactRule({ from: 42 })], [exactRule({ to: {} })], [exactRule({ enabled: "true" })], [exactRule({ enabled: undefined })],
      [exactRule({ extra: "private-rule-extension" })],
      [exactRule({ from: "g1.fixture." })], [exactRule({ to: "com.google.one.fixture." })],
      [exactRule({ from: "g1." })], [exactRule({ to: "other.fixture" })],
      [exactRule({ from: "g1." + "a".repeat(161) })],
      [exactRule({ match: "prefix", from: "g1.fixture" })],
      [exactRule({ match: "prefix", from: "g1." })],
      [exactRule({ match: "prefix", from: "com.google.one." })],
      [exactRule({ from: CUSTOM_TARGET })],
      [exactRule(), exactRule({ from: SOURCE })],
      [exactRule({ enabled: false }), exactRule({ id: "second-rule", to: NEXT_TARGET })],
      Array.from({ length: 31 }, (_, index) => exactRule({ id: "fixture-" + index, from: "g1.fixture." + index }))
    ];
    badRecords.push(...invalidRules.map(rules => JSON.stringify(storedConfig(rules))));
    for (const raw of badRecords) {
      const storage = new Map([[CONFIG_KEY, raw]]);
      const { data } = exported(variant, storage);
      const config = data.mappingConfig;
      assert.equal(config.status, "invalid", raw);
      assert.equal(config.revision, "invalid");
      assert.equal(config.mode, "");
      assert.deepEqual(config.rules, []);
      assert.equal(config.target, "");
      assert.equal(config.targetOrigin, "");
      assert.equal(typeof config.error, "string");
      assert(config.error.length > 0);
      assert(!config.error.includes("private-"));
      assert.equal(storage.get(CONFIG_KEY), raw);
      const result = run(variant.script, { storage, body: SOURCE + " " + COM_SOURCE });
      assert.deepEqual(result.payload, {});
      const saved = record(storage, TEST_KEY);
      assert.equal(saved.status, "config-error");
      assert.equal(saved.mappingStatus, "invalid");
      assert.equal(saved.mappingRevision, "invalid");
      assert.equal(saved.mode, "");
      assert.equal(saved.hitCount, 0);
      assert.deepEqual(saved.matchedFrom, []);
      assert.equal(storage.get(CONFIG_KEY), raw);
      assert(!result.writes.some(write => write.key === CONFIG_KEY));
    }
  });

  test("hanya pemulihan eksplisit yang memperbaiki konfigurasi rusak", () => {
    const storage = new Map([[CONFIG_KEY, "private-corrupt-settings"]]);
    const page = htmlPage(variant, storage);
    const reset = formFor(page.payload.response.body, "reset");
    assert.equal(reset.fields.revision, "invalid");
    for (const action of ["upsert", "delete"]) {
      const body = new URLSearchParams({ action, revision: "invalid", id: action === "delete" ? "default-2tb" : "", match: "exact", from: COM_SOURCE, to: CUSTOM_TARGET, enabled: "1" }).toString();
      const rejected = post(variant, storage, body);
      assert([400, 409].includes(rejected.payload.response.status));
      assertRejected(rejected, rejected.payload.response.status, [[CONFIG_KEY, "private-corrupt-settings"]]);
    }
    assertRedirect(variant, submit(variant, storage, reset, "reset"), "reset");
    assertStored(storage, [], false);
    assert.equal(exported(variant, storage).data.mappingConfig.mode, "discount75");
    assert.equal(run(variant.script, { storage, body: SOURCE }).payload.body, TARGET);
  });

  test("pembacaan tidak tersedia dilewatkan dan melaporkan config-error saat penulisan diagnostik masih berfungsi", () => {
    const faults = [
      { storageAvailable: false },
      { readAvailable: false },
      { read(key, storage) { if (key === CONFIG_KEY) throw new Error("private-read-fixture"); return storage.get(key) || null; } }
    ];
    for (const fault of faults) {
      const storage = withConfig([exactRule({ from: SOURCE })]);
      const original = storage.get(CONFIG_KEY);
      const data = exported(variant, storage, fault).data;
      assert.equal(data.mappingConfig.status, "unavailable");
      assert.equal(data.mappingConfig.revision, "unavailable");
      assert.equal(data.mappingConfig.mode, "");
      assert.deepEqual(data.mappingConfig.rules, []);
      assert(!data.mappingConfig.error.includes("private-read-fixture"));
      const result = run(variant.script, { storage, body: SOURCE, ...fault });
      assert.deepEqual(result.payload, {});
      assert(!result.writes.some(write => write.key === CONFIG_KEY));
      if (fault.storageAvailable !== false) {
        const saved = record(storage, TEST_KEY);
        assert.equal(saved.status, "config-error");
        assert.equal(saved.mappingStatus, "unavailable");
        assert.equal(saved.mappingRevision, "unavailable");
        assert.equal(saved.hitCount, 0);
      }
      assert.equal(storage.get(CONFIG_KEY), original);
      const save = post(variant, storage, "action=reset&revision=unavailable", fault);
      assertRejected(save, 503);
      assert(!save.payload.response.body.includes("private-read-fixture"));
    }
  });

  test("penulisan false, melempar error, atau tidak ada serta baca-ulang gagal mengembalikan 503 tanpa mengklaim berhasil simpan", () => {
    const faults = [
      { writeAvailable: false },
      { write() { return false; } },
      { write() { throw new Error("private-write-fixture"); } },
      { write() { return true; } },
      { read(key, storage, calls) { if (key === CONFIG_KEY && calls.writes.length) throw new Error("private-readback-fixture"); return storage.get(key) || null; } },
      { read(key, storage, calls) { if (key === CONFIG_KEY && calls.writes.length) return JSON.stringify(storedConfig([], { revision: "b".repeat(48) })); return storage.get(key) || null; } },
      { read(key, storage, calls) {
        if (key === CONFIG_KEY && calls.writes.length) {
          const changed = record(storage, CONFIG_KEY);
          changed.rules[0].to = TARGET;
          return JSON.stringify(changed);
        }
        return storage.get(key) || null;
      } }
    ];
    for (const fault of faults) {
      const storage = withConfig([exactRule()]);
      storage.set(SCAN_KEY, "fixture-history-scan");
      storage.set(TEST_KEY, "fixture-history-test");
      const before = storage.get(CONFIG_KEY);
      const form = formFor(htmlPage(variant, storage).payload.response.body, "upsert", "fixture-rule");
      const result = submit(variant, storage, form, "upsert", { to: NEXT_TARGET }, fault);
      assert.equal(result.payload.response.status, 503);
      assert.equal(header(result.payload.response, "Location"), undefined);
      const draft = forms(result.payload.response.body).find(form => form.fields.from === COM_SOURCE && form.fields.to === NEXT_TARGET);
      assert(draft, "persistensi yang gagal harus mempertahankan nilai baris yang dicoba");
      assert.equal(draft.fields.match, "exact");
      assert.equal(draft.fields.enabled, "1");
      assert(result.writes.every(write => write.key === CONFIG_KEY));
      assert.equal(storage.get(SCAN_KEY), "fixture-history-scan");
      assert.equal(storage.get(TEST_KEY), "fixture-history-test");
      assert(!result.payload.response.body.includes("private-write-fixture"));
      assert(!result.payload.response.body.includes("private-readback-fixture"));
      if (!fault.read) assert.equal(storage.get(CONFIG_KEY), before);
    }
  });

  test("penulisan catatan pemindaian dan eksekusi tetap independen dan tidak pernah menulis pemetaan", () => {
    for (const failedKey of [SCAN_KEY, TEST_KEY]) {
      for (const throws of [false, true]) {
        const storage = withConfig([exactRule({ from: SOURCE })]);
        const mappingBefore = storage.get(CONFIG_KEY);
        const result = run(variant.script, {
          storage, body: SOURCE,
          write(value, key, current) {
            if (key === failedKey) {
              if (throws) throw new Error("fixture-record-write");
              return false;
            }
            current.set(key, value);
            return true;
          }
        });
        assert.equal(result.payload.body, CUSTOM_TARGET);
        assert.deepEqual(result.writes.map(write => write.key), [SCAN_KEY, TEST_KEY]);
        assert.equal(storage.has(failedKey), false);
        assert.equal(storage.has(failedKey === SCAN_KEY ? TEST_KEY : SCAN_KEY), true);
        assert.equal(storage.get(CONFIG_KEY), mappingBefore);
      }
    }
  });

  test("mengosongkan riwayat tetap mempertahankan pengaturan dan tidak mengubah penulisan ulang berikutnya", () => {
    const storage = withConfig([exactRule({ from: SOURCE })]);
    storage.set("other-tool", "fixture-untouched");
    run(variant.script, { storage, body: SOURCE });
    const configBefore = storage.get(CONFIG_KEY);
    const beforeExport = [...storage];
    const readonly = exported(variant, storage, { url: ROOT + "?format=json&clear=1" });
    assert.equal(readonly.data.scan.skus.length, 1);
    assert.equal(readonly.data.test.matchedFrom.length, 1);
    assert.deepEqual([...storage], beforeExport);
    const result = htmlPage(variant, storage, { url: ROOT + "?clear=1" });
    assert.deepEqual(result.writes.map(write => write.key), [SCAN_KEY, TEST_KEY]);
    assert.equal(storage.get(CONFIG_KEY), configBefore);
    assert.equal(storage.get("other-tool"), "fixture-untouched");
    const data = exported(variant, storage).data;
    assert.equal(data.configuredMode, "custom");
    assert.equal(data.mappingConfig.revision, "a".repeat(48));
    assert.deepEqual(data.scan.skus, []);
    assert.deepEqual(data.test.matchedFrom, []);
    assert.equal(data.test.mappingRevision, "");
    assert.equal(data.test.mappingUpdatedAt, "");
    assert.equal(data.test.mappingStatus, "");
    assert.equal(run(variant.script, { storage, body: SOURCE }).payload.body, CUSTOM_TARGET);
  });

  test("mode, target, dan metadata revisi tersimpan tetap historis setelah pengeditan konfigurasi", () => {
    const labels = {
      trial: "Prioritas Uji Coba Gratis Ultra 1 Bulan (Mode Lama)",
      discount: "Prioritas Diskon 90% Ultra 3 Bulan (Mode Lama)",
      discount75: "Ultra 3 Bulan 75p (Diskon 75% / Bayar 25%)",
      custom: "Pemetaan Manual"
    };
    for (const mode of Object.keys(labels)) {
      const storage = withConfig(DEFAULT_RULES.map(rule => rule.id === "default-2tb" ? { ...rule, to: CUSTOM_TARGET } : rule));
      const scan = { schemaVersion: 1, version: "g1-acq-fixture-history", mode, skus: [{ id: SOURCE, count: 2, lastSeen: FIXED_TIME }] };
      const test = {
        schemaVersion: 1, version: "g1-acq-fixture-history", mode, target: mode === "custom" ? CUSTOM_TARGET : TARGET,
        targetOrigin: mode === "custom" ? "user-configured" : "user-specified", updatedAt: FIXED_TIME,
        hitCount: 2, annualHitCount: 2, status: "rewritten", mappingRevision: "b".repeat(48), mappingUpdatedAt: FIXED_TIME,
        mappingStatus: mode === "custom" ? "custom" : "default",
        matchedFrom: [{ id: SOURCE, to: mode === "custom" ? CUSTOM_TARGET : TARGET, count: 2, fallback: false }]
      };
      storage.set(SCAN_KEY, JSON.stringify(scan));
      storage.set(TEST_KEY, JSON.stringify(test));
      const before = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
      change(variant, storage, "upsert", "default-2tb", { to: NEXT_TARGET });
      const data = exported(variant, storage).data;
      assert.equal(data.configuredMode, "custom");
      assert.equal(data.configuredTarget, NEXT_TARGET);
      assert.equal(data.scan.mode, mode);
      assert.equal(data.test.mode, mode);
      assert.equal(data.test.target, test.target);
      assert.equal(data.test.targetOrigin, test.targetOrigin);
      assert.equal(data.test.mappingRevision, test.mappingRevision);
      assert.equal(data.test.mappingUpdatedAt, test.mappingUpdatedAt);
      assert.equal(data.test.mappingStatus, test.mappingStatus);
      assert.deepEqual(data.test.matchedFrom, test.matchedFrom);
      assert(htmlPage(variant, storage).payload.response.body.includes(labels[mode]));
      assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], before);
    }
  });

  test("kartu templat menampilkan deskripsi berurutan, target tepat, field asli, dan kandidat datalist", () => {
    const storage = new Map();
    const page = htmlPage(variant, storage);
    const html = page.payload.response.body;
    const section = presetSection(html);
    assert(section.includes("Templat Pemetaan Siap Pakai"));
    assert(html.indexOf(section) < html.indexOf(formFor(html, "upsert", "default-2tb").html));
    assertNoScript(page.payload.response);
    const presetForms = forms(section).filter(form => form.actions.has("preset"));
    assert.deepEqual(presetForms.map(form => form.fields.preset), PRESETS.map(preset => preset.id));
    const lists = [...html.matchAll(/<datalist\b[^>]*>([\s\S]*?)<\/datalist\s*>/gi)];
    const candidates = new Set(lists.flatMap(list => [...list[1].matchAll(/<option\b([^>]*)>/gi)]
      .map(option => attributes(option[1]).value)));
    for (const preset of PRESETS) {
      const form = formFor(html, "preset", preset.id);
      assert(form.controls.some(control => control.type === "hidden" && control.name === "preset" && control.value === preset.id));
      assert.equal(form.fields.revision, DEFAULT_REVISION);
      const submitted = new URLSearchParams(formBody(form, "preset"));
      assert.deepEqual([...submitted.keys()].sort(), ["action", "preset", "revision"]);
      assert.equal(submitted.get("preset"), preset.id);
      assert(form.html.includes("Terapkan Templat"));
      const card = presetCardText(html, preset.id);
      assert(card.includes(preset.description));
      for (const rule of preset.rules) {
        assert(card.includes(rule.from));
        assert(card.includes(rule.to));
        assert(card.includes(rule.match === "exact" ? "SKU Persis" : "Awalan SKU"));
        assert(candidates.has(rule.to), "target templat harus berada di datalist");
      }
      assert.equal(card.includes("Aturan saat ini cocok"), ["ultra-75p", "pro-12months-90p"].includes(preset.id));
    }
    assert(!section.includes("1month_eft"));
    assert(!section.includes("3months_ip_90p"));
    assert(!html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
    assert.deepEqual(page.writes, []);
    assert.equal(storage.size, 0, "merender bawaan internal yang cocok bukanlah penyimpanan");
  });

  for (const preset of PRESETS) {
    test("templat asli " + preset.id + " hanya menyimpan satu kunci, mengalihkan baca-saja, dan mengatur respons runtime berikutnya", () => {
      const storage = withConfig([]);
      run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY]) });
      const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
      const original = exported(variant, storage).data;
      const page = htmlPage(variant, storage);
      const form = formFor(page.payload.response.body, "preset", preset.id);
      const result = submit(variant, storage, form, "preset");
      const html = assertRedirect(variant, result, "preset");
      assert(html.includes("Templat telah disimpan di perangkat"));
      assert.match(html, /respons[^<]*membaca konfigurasi baru/);
      assert(presetCardText(html, preset.id).includes("Aturan saat ini cocok"));
      assert(html.includes("Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini"));
      assert(!html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
      const current = exported(variant, storage).data;
      assert.deepEqual(Object.keys(current).sort(), Object.keys(original).sort());
      assert.equal(current.configuredMode, "custom");
      assert.equal(current.mappingConfig.status, "custom");
      assert.equal(current.mappingConfig.customized, true);
      assert.equal(current.mappingConfig.rules.length, preset.rules.length);
      assert.deepEqual(withoutIds(current.mappingConfig.rules), preset.rules);
      assertPresetRules(current.mappingConfig, preset);
      const saved = assertStored(storage, current.mappingConfig.rules);
      assert.notEqual(saved.revision, form.fields.revision);
      assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
      assert.deepEqual(current.scan, original.scan);
      assert.deepEqual(current.test, original.test);
      const values = [SOURCE, OTHER_SOURCE, TWENTY, THIRTY, COM_SOURCE];
      const expected = values.map(id => {
        const match = preset.rules.find(rule => rule.match === "exact" ? id === rule.from : id.startsWith(rule.from));
        return match ? match.to : id;
      });
      const body = JSON.stringify({ products: values, price: "2949.99", currency: "TRY", period: "fixture-period", renewAt: FIXED_TIME });
      const runtime = run(variant.script, { storage, body });
      assert.equal(runtime.payload.body, JSON.stringify({ products: expected, price: "2949.99", currency: "TRY", period: "fixture-period", renewAt: FIXED_TIME }));
      assert.deepEqual(runtime.writes.map(write => write.key), [SCAN_KEY, TEST_KEY]);
      assert.equal(storage.get(CONFIG_KEY), JSON.stringify(saved));
      const data = exported(variant, storage).data;
      assert.equal(data.reportVersion, REPORT_VERSION);
      assert.equal(data.scan.version, VERSION);
      assert.equal(data.test.version, VERSION);
      assert.equal(data.test.mappingRevision, saved.revision);
      assert.equal(data.test.mappingUpdatedAt, saved.updatedAt);
      assert.equal(data.test.mappingStatus, "custom");
      assert.equal(data.test.mode, "custom");
      assert.equal(data.test.hitCount, expected.filter((value, index) => value !== values[index]).length);
      assert.equal(data.test.annualHitCount, ["pro-1yuan", "pro-12months-90p"].includes(preset.id) ? 2 : 0);
      assert(data.test.matchedFrom.every(row => row.fallback === false));
      assert.deepEqual(data.test.matchedFrom.map(row => [row.id, row.to]).sort(),
        values.flatMap((id, index) => id === expected[index] ? [] : [[id, expected[index]]]).sort());
      assert.deepEqual(data.scan.skus.map(row => row.id), [...values].sort());
      assert(!JSON.stringify(data).includes("fixture-period"));
      const executed = htmlPage(variant, storage).payload.response.body;
      assert(executed.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
      assert(presetCardText(executed, preset.id).includes("Aturan saat ini cocok"));
    });
  }

  test("Pro dan TR20 hidup berdampingan dalam urutan mana pun sementara Ultra75p dan Pro12 hanya mengganti sumbernya sendiri", () => {
    const twenty75 = DEFAULT_RULES.find(rule => rule.id === "default-20tb").to;
    const thirty75 = DEFAULT_RULES.find(rule => rule.id === "default-30tb").to;
    const sequences = [
      [
        { id: "pro-1yuan", targets: [TR_PRO_TARGET, twenty75, thirty75] },
        { id: "tr-ultra-20tb", targets: [TR_PRO_TARGET, TURKEY_TWENTY_TARGET, thirty75] },
        { id: "ultra-75p", targets: [TR_PRO_TARGET, twenty75, thirty75] },
        { id: "pro-1yuan", targets: [TR_PRO_TARGET, twenty75, thirty75] }
      ],
      [
        { id: "tr-ultra-20tb", targets: [TARGET, TURKEY_TWENTY_TARGET, thirty75] },
        { id: "pro-1yuan", targets: [TR_PRO_TARGET, TURKEY_TWENTY_TARGET, thirty75] },
        { id: "pro-12months-90p", targets: [TARGET, TURKEY_TWENTY_TARGET, thirty75] }
      ]
    ];
    for (const sequence of sequences) {
      const storage = new Map();
      run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY]) });
      let previousRevision = DEFAULT_REVISION;
      for (const step of sequence) {
        const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
        const changed = change(variant, storage, "preset", step.id);
        assertPresetRules(changed.config, presetById(step.id));
        assert.deepEqual(changed.config.rules, DEFAULT_RULES.map((rule, index) => ({ ...rule, to: step.targets[index] })));
        assert.notEqual(changed.config.revision, previousRevision);
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
        assert(changed.html.includes("Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini"));
        assert(!changed.html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
        const badges = {
          "pro-1yuan": step.targets[0] === TR_PRO_TARGET,
          "tr-ultra-20tb": step.targets[1] === TURKEY_TWENTY_TARGET,
          "tr-ultra-30tb": false,
          "ultra-75p": step.targets[1] === twenty75 && step.targets[2] === thirty75,
          "pro-12months-90p": step.targets[0] === TARGET
        };
        for (const [id, matches] of Object.entries(badges)) {
          assert.equal(presetCardText(changed.html, id).includes("Aturan saat ini cocok"), matches, step.id + " -> " + id);
        }
        const runtime = run(variant.script, { storage, body: JSON.stringify([SOURCE, OTHER_SOURCE, TWENTY, THIRTY]) });
        assert.deepEqual(JSON.parse(runtime.payload.body), [step.targets[0], step.targets[0], step.targets[1], step.targets[2]]);
        const data = exported(variant, storage).data;
        assert.equal(data.configuredTarget, step.targets[0]);
        assert.equal(data.test.target, step.targets[0]);
        assert.equal(data.test.targetOrigin, "user-configured");
        assert.equal(data.test.version, VERSION);
        assert.equal(data.test.mappingRevision, changed.config.revision);
        assert.equal(data.test.hitCount, 4);
        assert.equal(data.test.annualHitCount, 2);
        assert.deepEqual(data.test.matchedFrom.map(row => [row.id, row.to]).sort(),
          [[SOURCE, step.targets[0]], [OTHER_SOURCE, step.targets[0]], [TWENTY, step.targets[1]], [THIRTY, step.targets[2]]].sort());
        assert(htmlPage(variant, storage).payload.response.body.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
        previousRevision = changed.config.revision;
      }
    }
  });

  test("20TB ke Gemini warisan v7.11 tetap historis pada GET dan tetap terkonfigurasi hingga Pro diterapkan", () => {
    const rules = DEFAULT_RULES.map(rule => rule.from === TWENTY ? { ...rule, to: TR_PRO_TARGET } : rule);
    const storage = legacyProStorage(rules);
    const before = [...storage];
    const page = htmlPage(variant, storage);
    const data = exported(variant, storage).data;
    assert.deepEqual(data.mappingConfig.rules, rules);
    assert.equal(data.scan.version, "g1-acq-v7.11-mappings");
    assert.equal(data.test.version, "g1-acq-v7.11-mappings");
    assert.deepEqual(data.test.matchedFrom, [{ id: TWENTY, to: TR_PRO_TARGET, count: 1, fallback: false }]);
    assert(page.payload.response.body.includes("Catatan pengumpulan versi lama"));
    assert(page.payload.response.body.includes("Catatan eksekusi terakhir berasal dari <code>g1-acq-v7.11-mappings</code>"));
    assert(!page.payload.response.body.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
    assert(!presetCardText(page.payload.response.body, "pro-1yuan").includes("Aturan saat ini cocok"));
    assert.deepEqual(page.writes, []);
    assert.deepEqual([...storage], before);
    const runtime = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY]) });
    assert.deepEqual(JSON.parse(runtime.payload.body), [TARGET, TR_PRO_TARGET]);
    assert.equal(storage.get(CONFIG_KEY), before.find(([key]) => key === CONFIG_KEY)[1]);
    assert.deepEqual(runtime.writes.map(write => write.key), [SCAN_KEY, TEST_KEY]);
    assert.equal(record(storage, TEST_KEY).version, VERSION);
    assert.equal(record(storage, TEST_KEY).matchedFrom.find(row => row.id === TWENTY).to, TR_PRO_TARGET);
    assert.deepEqual(exported(variant, storage).data.mappingConfig.rules, rules);
  });

  test("Pro menonaktifkan secara atomik hanya aturan 20TB warisannya, menjaga ID dan riwayat, serta TR20 memakai ulang baris itu", () => {
    for (const enabled of [true, false]) {
      for (const prefixState of ["absent", "disabled", "already-gemini"]) {
        const legacy = exactRule({ id: "legacy-pro-entry", from: TWENTY, to: TR_PRO_TARGET, enabled });
        const prefix = { ...DEFAULT_RULES[0], id: "existing-pro-prefix",
          to: prefixState === "already-gemini" ? TR_PRO_TARGET : TARGET, enabled: prefixState === "already-gemini" };
        const rules = [exactRule({ id: "other-rule", enabled: false }), legacy, DEFAULT_RULES[2],
          ...(prefixState === "absent" ? [] : [prefix])];
        const storage = legacyProStorage(rules);
        const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
        const historical = exported(variant, storage).data;
        const initialHTML = htmlPage(variant, storage).payload.response.body;
        assert.equal(presetCardText(initialHTML, "pro-1yuan").includes("Aturan saat ini cocok"), prefixState === "already-gemini" && !enabled);
        const changed = change(variant, storage, "preset", "pro-1yuan");
        assertPresetRules(changed.config, presetById("pro-1yuan"));
        assert.deepEqual(changed.config.rules.slice(0, rules.length).map(rule => rule.id), rules.map(rule => rule.id));
        assert.deepEqual(changed.config.rules.find(rule => rule.id === legacy.id), { ...legacy, enabled: false });
        assert.deepEqual(changed.config.rules[0], rules[0]);
        assert.deepEqual(changed.config.rules[2], rules[2]);
        assert.equal(changed.config.rules.length, rules.length + (prefixState === "absent" ? 1 : 0));
        assert.equal(changed.config.rules.at(-1).from, "g1.ios.2tb.");
        if (prefixState !== "absent") assert.equal(changed.config.rules.at(-1).id, prefix.id);
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
        const afterSave = exported(variant, storage).data;
        assert.deepEqual(afterSave.scan, historical.scan);
        assert.deepEqual(afterSave.test, historical.test);
        assert(presetCardText(changed.html, "pro-1yuan").includes("Aturan saat ini cocok"));
        assert(!changed.html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
        assert(changed.html.includes("Catatan eksekusi terakhir berasal dari <code>g1-acq-v7.11-mappings</code>"));
        const repeated = change(variant, storage, "preset", "pro-1yuan");
        assert.notEqual(repeated.config.revision, changed.config.revision);
        assert.deepEqual(repeated.config.rules, changed.config.rules);
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
        const runtime = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY, COM_SOURCE]) });
        assert.deepEqual(JSON.parse(runtime.payload.body), [TR_PRO_TARGET, TWENTY, DEFAULT_RULES[2].to, COM_SOURCE]);
        const executed = exported(variant, storage).data;
        assert.equal(executed.test.version, VERSION);
        assert.equal(executed.test.mappingRevision, repeated.config.revision);
        assert.equal(executed.test.target, TR_PRO_TARGET);
        assert.deepEqual(executed.test.matchedFrom.map(row => [row.id, row.to]).sort(),
          [[SOURCE, TR_PRO_TARGET], [THIRTY, DEFAULT_RULES[2].to]].sort());
        const currentHTML = htmlPage(variant, storage).payload.response.body;
        assert(currentHTML.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
        assert(!currentHTML.includes("Catatan eksekusi terakhir berasal dari <code>g1-acq-v7.11-mappings</code>"));
        const beforeTR20 = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
        const turkey = change(variant, storage, "preset", "tr-ultra-20tb");
        assert.deepEqual(turkey.config.rules.map(rule => rule.id), changed.config.rules.map(rule => rule.id));
        assert.deepEqual(turkey.config.rules.find(rule => rule.id === legacy.id), { ...legacy, to: TURKEY_TWENTY_TARGET, enabled: true });
        assertPresetRules(turkey.config, presetById("pro-1yuan"));
        assertPresetRules(turkey.config, presetById("tr-ultra-20tb"));
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], beforeTR20);
        assert(presetCardText(turkey.html, "pro-1yuan").includes("Aturan saat ini cocok"));
        assert(presetCardText(turkey.html, "tr-ultra-20tb").includes("Aturan saat ini cocok"));
        const combined = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY]) });
        assert.deepEqual(JSON.parse(combined.payload.body), [TR_PRO_TARGET, TURKEY_TWENTY_TARGET]);
        assert.equal(exported(variant, storage).data.test.mappingRevision, turkey.config.revision);
      }
    }
  });

  test("Pro mempertahankan target 20TB lain dan aturan Gemini dengan sumber atau tipe pencocokan berbeda", () => {
    for (const twentyTarget of [TURKEY_TWENTY_TARGET, DEFAULT_RULES[1].to, NEXT_TARGET]) {
      const rules = [
        exactRule({ id: "twenty-manual", from: TWENTY, to: twentyTarget }),
        exactRule({ id: "twenty-prefix", match: "prefix", from: "g1.ios.20tb.", to: TR_PRO_TARGET }),
        exactRule({ id: "twenty-extra", from: TWENTY + ".extra", to: TR_PRO_TARGET }),
        exactRule({ id: "thirty-gemini", from: THIRTY, to: TR_PRO_TARGET }),
        exactRule(),
        { ...DEFAULT_RULES[0], enabled: false }
      ];
      const storage = legacyProStorage(rules);
      const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
      const changed = change(variant, storage, "preset", "pro-1yuan");
      assert.deepEqual(changed.config.rules.slice(0, -1), rules.slice(0, -1));
      assert.deepEqual(changed.config.rules.map(rule => rule.id), rules.map(rule => rule.id));
      assertPresetRules(changed.config, presetById("pro-1yuan"));
      assert(presetCardText(changed.html, "pro-1yuan").includes("Aturan saat ini cocok"));
      assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
      const values = [SOURCE, TWENTY, "g1.ios.20tb.other", TWENTY + ".extra", THIRTY, COM_SOURCE];
      const runtime = run(variant.script, { storage, body: JSON.stringify(values) });
      assert.deepEqual(JSON.parse(runtime.payload.body), [TR_PRO_TARGET, twentyTarget, TR_PRO_TARGET, TR_PRO_TARGET, TR_PRO_TARGET, CUSTOM_TARGET]);
      assert.equal(exported(variant, storage).data.test.matchedFrom.find(row => row.id === TWENTY).to, twentyTarget);
    }
  });

  test("migrasi Pro warisan mengisi slot ketiga puluh, memperbarui pada kapasitas penuh, dan gagal tanpa penonaktifan parsial saat penuh", () => {
    for (const scenario of [
      { count: 29, prefix: false, status: 303 },
      { count: 30, prefix: true, status: 303 },
      { count: 30, prefix: false, status: 400 }
    ]) {
      const legacy = exactRule({ id: "legacy-pro-entry", from: TWENTY, to: TR_PRO_TARGET });
      const base = [legacy, ...(scenario.prefix ? [{ ...DEFAULT_RULES[0], enabled: false }] : [])];
      const fillers = Array.from({ length: scenario.count - base.length }, (_, index) =>
        exactRule({ id: "filler-" + index, from: "g1.fixture.filler_" + index }));
      const rules = [...base, ...fillers];
      const storage = legacyProStorage(rules);
      const before = [...storage];
      const form = formFor(htmlPage(variant, storage).payload.response.body, "preset", "pro-1yuan");
      const result = submit(variant, storage, form, "preset");
      if (scenario.status === 400) {
        assertRejected(result, 400, before);
        assert.deepEqual(exported(variant, storage).data.mappingConfig.rules, rules);
        assert.equal(formFor(result.payload.response.body, "upsert", legacy.id).fields.enabled, "1");
      } else {
        const html = assertRedirect(variant, result, "preset");
        const config = exported(variant, storage).data.mappingConfig;
        assert.equal(config.rules.length, 30);
        assert.deepEqual(config.rules.slice(0, rules.length).map(rule => rule.id), rules.map(rule => rule.id));
        assert.deepEqual(config.rules[0], { ...legacy, enabled: false });
        assert.deepEqual(config.rules.slice(base.length, scenario.count), fillers);
        assertPresetRules(config, presetById("pro-1yuan"));
        assert(presetCardText(html, "pro-1yuan").includes("Aturan saat ini cocok"));
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], before.slice(1).map(([, value]) => value));
      }
    }
  });

  test("formulir Pro usang dan kedua race merge-save mempertahankan baris warisan aktif serta riwayat pada 409", () => {
    const rules = [DEFAULT_RULES[0], exactRule({ id: "legacy-pro-entry", from: TWENTY, to: TR_PRO_TARGET }), DEFAULT_RULES[2]];
    const storage = legacyProStorage(rules);
    const old = formFor(htmlPage(variant, storage).payload.response.body, "preset", "pro-1yuan");
    const latest = change(variant, storage, "upsert", "default-2tb", { to: CUSTOM_TARGET });
    const before = [...storage];
    const stale = submit(variant, storage, old, "preset");
    assertRejected(stale, 409, before);
    assert.equal(formFor(stale.payload.response.body, "preset", "pro-1yuan").fields.revision, latest.config.revision);
    assert.equal(formFor(stale.payload.response.body, "upsert", "legacy-pro-entry").fields.enabled, "1");
    for (const changedRead of [2, 3]) {
      const racedStorage = legacyProStorage(rules);
      const form = formFor(htmlPage(variant, racedStorage).payload.response.body, "preset", "pro-1yuan");
      const concurrent = storedConfig([...rules, exactRule({ id: "concurrent-rule" })], { revision: "b".repeat(48) });
      const expected = [...racedStorage].map(([key, value]) => [key, key === CONFIG_KEY ? JSON.stringify(concurrent) : value]);
      let configReads = 0;
      const raced = submit(variant, racedStorage, form, "preset", {}, {
        read(key, current) {
          if (key === CONFIG_KEY && ++configReads === changedRead) current.set(key, JSON.stringify(concurrent));
          return current.get(key) || null;
        }
      });
      assertRejected(raced, 409, expected);
      assert(configReads >= changedRead);
      assert.equal(formFor(raced.payload.response.body, "preset", "pro-1yuan").fields.revision, concurrent.revision);
      assert.equal(formFor(raced.payload.response.body, "upsert", "legacy-pro-entry").fields.enabled, "1");
      assert.deepEqual(exported(variant, racedStorage).data.mappingConfig.rules, concurrent.rules);
      assert(!presetCardText(raced.payload.response.body, "pro-1yuan").includes("Aturan saat ini cocok"));
    }
  });

  test("Pro, Turki, Ultra 75p, dan Pro12 memulihkan target saat ini tanpa menghidupkan ulang penawaran historis", () => {
    const oldTargets = ["g1.2tb.ai.annual", "g1.20tb.1month_eft.acq", "g1.ai.ultra.3months_ip_90p.acq"];
    const rules = DEFAULT_RULES.map((rule, index) => ({ ...rule, to: oldTargets[index], enabled: false }));
    const unrelated = exactRule();
    const storage = withConfig([...rules, unrelated]);
    const expectedById = {
      "pro-1yuan": [TR_PRO_TARGET, TWENTY, THIRTY, CUSTOM_TARGET],
      "tr-ultra-20tb": [TR_PRO_TARGET, TURKEY_TWENTY_TARGET, THIRTY, CUSTOM_TARGET],
      "tr-ultra-30tb": [TR_PRO_TARGET, TURKEY_TWENTY_TARGET, TURKEY_TARGET, CUSTOM_TARGET],
      "ultra-75p": [TR_PRO_TARGET, DEFAULT_RULES[1].to, DEFAULT_RULES[2].to, CUSTOM_TARGET],
      "pro-12months-90p": [TARGET, DEFAULT_RULES[1].to, DEFAULT_RULES[2].to, CUSTOM_TARGET]
    };
    for (const preset of PRESETS) {
      const changed = change(variant, storage, "preset", preset.id);
      assertPresetRules(changed.config, preset);
      assert.deepEqual(changed.config.rules.map(rule => rule.id), [...rules, unrelated].map(rule => rule.id));
      assert.deepEqual(changed.config.rules.at(-1), unrelated);
      const response = run(variant.script, { storage, body: JSON.stringify([SOURCE, TWENTY, THIRTY, COM_SOURCE]) });
      assert.deepEqual(JSON.parse(response.payload.body), expectedById[preset.id]);
    }
    const config = exported(variant, storage).data.mappingConfig;
    assert.deepEqual(config.rules, [...DEFAULT_RULES, unrelated]);
    assert(config.rules.every(rule => !oldTargets.includes(rule.to) && rule.to !== TURKEY_TARGET && rule.to !== TR_PRO_TARGET));
    const reset = change(variant, storage, "reset");
    assert.deepEqual(reset.config.rules, DEFAULT_RULES);
    assertStored(storage, [], false);
  });

  test("penggabungan templat mempertahankan ID dan urutan sambil mengaktifkan yang cocok serta mempertahankan override lebih sempit", () => {
    const rules = [
      exactRule({ id: "unrelated-disabled", enabled: false }),
      exactRule({ id: "two-exact", from: SOURCE, to: "g1.fixture.exact_override" }),
      { id: "two-narrow", match: "prefix", from: "g1.ios.2tb.deep.", to: "g1.fixture.narrow_override", enabled: true },
      { ...DEFAULT_RULES[2], id: "existing-thirty", to: NEXT_TARGET, enabled: false },
      { ...DEFAULT_RULES[1], id: "existing-twenty", to: NEXT_TARGET, enabled: false },
      { id: "broad-custom", match: "prefix", from: "g1.ios.", to: "g1.fixture.broad_override", enabled: true },
      { ...DEFAULT_RULES[0], id: "existing-pro", to: CUSTOM_TARGET, enabled: false }
    ];
    const storage = withConfig(rules);
    const unrelatedIndexes = [0, 1, 2, 5];
    for (const id of ["pro-1yuan", "tr-ultra-20tb", "ultra-75p", "pro-12months-90p"]) {
      const preset = presetById(id);
      const changed = change(variant, storage, "preset", id);
      assertPresetRules(changed.config, preset);
      assert.deepEqual(changed.config.rules.map(rule => rule.id), rules.map(rule => rule.id));
      for (const index of unrelatedIndexes) assert.equal(JSON.stringify(changed.config.rules[index]), JSON.stringify(rules[index]));
    }
    const values = [SOURCE, OTHER_SOURCE, "g1.ios.2tb.deep.member", TWENTY, THIRTY, COM_SOURCE, "g1.ios.12tb.fixture"];
    const response = run(variant.script, { storage, body: JSON.stringify(values) });
    assert.deepEqual(JSON.parse(response.payload.body), ["g1.fixture.exact_override", TARGET, "g1.fixture.narrow_override",
      DEFAULT_RULES[1].to, DEFAULT_RULES[2].to, COM_SOURCE, "g1.fixture.broad_override"]);
    assert(record(storage, TEST_KEY).matchedFrom.every(row => row.fallback === false));
    assert(presetCardText(htmlPage(variant, storage).payload.response.body, "pro-12months-90p").includes("Aturan saat ini cocok"));
  });

  test("templat memperbarui kecocokan yang ada pada 30 aturan dan mengisi tepat satu slot tersisa", () => {
    const fillers = Array.from({ length: 27 }, (_, index) => exactRule({ id: "filler-" + index, from: "g1.fixture.filler_" + index }));
    const storage = withConfig([...DEFAULT_RULES.map(rule => ({ ...rule, to: NEXT_TARGET, enabled: false })), ...fillers]);
    for (const preset of PRESETS) {
      const changed = change(variant, storage, "preset", preset.id);
      assert.equal(changed.config.rules.length, 30);
      assertPresetRules(changed.config, preset);
      assert.deepEqual(changed.config.rules.slice(3), fillers);
    }
    assert.equal(run(variant.script, { storage, body: THIRTY }).payload.body, DEFAULT_RULES[2].to);
    const oneSlot = withConfig([DEFAULT_RULES[1], ...fillers,
      exactRule({ id: "last-filler", from: "g1.fixture.last_filler", enabled: false })]);
    const added = change(variant, oneSlot, "preset", "ultra-75p");
    assert.equal(added.config.rules.length, 30);
    assertPresetRules(added.config, presetById("ultra-75p"));
    assert.equal(added.config.rules[0].id, "default-20tb");
    assert.equal(added.config.rules.at(-1).from, THIRTY);
    assert.equal(new Set(added.config.rules.map(rule => rule.id)).size, 30);
  });

  test("penggabungan templat melebihi batas gagal secara atomik bahkan setelah kecocokan yang ada berubah", () => {
    for (const existing of [true, false]) {
      const fillers = Array.from({ length: 29 }, (_, index) => exactRule({ id: "filler-" + index, from: "g1.fixture.filler_" + index }));
      const rules = existing ? [{ ...DEFAULT_RULES[1], to: NEXT_TARGET, enabled: false }, ...fillers] : fillers;
      const storage = withConfig(rules);
      storage.set(SCAN_KEY, "fixture-scan-history");
      storage.set(TEST_KEY, "fixture-test-history");
      const before = [...storage];
      const form = formFor(htmlPage(variant, storage).payload.response.body, "preset", "ultra-75p");
      // Pertahankan field tersembunyi yang dirender sambil melewati kontrol UI nonaktif opsional.
      const body = new URLSearchParams({ ...form.fields, action: "preset" }).toString();
      assertRejected(post(variant, storage, body), 400, before);
      assert.deepEqual(record(storage, CONFIG_KEY).rules, rules);
    }
  });

  test("menerapkan ulang setiap templat yang cocok membuat revisi custom baru tanpa aturan duplikat", () => {
    for (const preset of PRESETS) {
      const storage = new Map();
      const first = change(variant, storage, "preset", preset.id);
      const expectedRules = DEFAULT_RULES.map(rule => {
        const replacement = preset.rules.find(candidate => candidate.match === rule.match && candidate.from === rule.from);
        return replacement ? { ...rule, ...replacement } : rule;
      });
      assert.deepEqual(first.config.rules, expectedRules);
      assertStored(storage, expectedRules);
      assert.equal(first.config.mode, "custom");
      const source = preset.rules[0].match === "prefix" ? SOURCE : preset.rules[0].from;
      run(variant.script, { storage, body: source });
      const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
      const second = change(variant, storage, "preset", preset.id);
      assert.notEqual(second.config.revision, first.config.revision);
      assert.deepEqual(second.config.rules, first.config.rules);
      assert.equal(new Set(second.config.rules.map(rule => rule.id)).size, 3);
      assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
      assert(second.html.includes("Menunggu respons halaman paket berikutnya membaca konfigurasi saat ini"));
      assert(!second.html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
      assert.equal(run(variant.script, { storage, body: source }).payload.body, preset.rules[0].to);
      assert.equal(record(storage, TEST_KEY).mappingRevision, second.config.revision);
    }
  });

  test("formulir templat lama mengembalikan 409 setelah penyimpanan templat lain dan menampilkan revisi terbaru", () => {
    const storage = new Map();
    const old = formFor(htmlPage(variant, storage).payload.response.body, "preset", "tr-ultra-30tb");
    const latest = change(variant, storage, "preset", "ultra-75p");
    const before = [...storage];
    const stale = submit(variant, storage, old, "preset");
    assertRejected(stale, 409, before);
    assert.equal(formFor(stale.payload.response.body, "preset", "tr-ultra-30tb").fields.revision, latest.config.revision);
    assert.equal(record(storage, CONFIG_KEY).rules.find(rule => rule.from === THIRTY).to, DEFAULT_RULES[2].to);
  });

  test("pembacaan merge templat dan pembacaan save akhir masing-masing menolak revisi sela", () => {
    for (const changedRead of [2, 3]) {
      const storage = withConfig(DEFAULT_RULES);
      const form = formFor(htmlPage(variant, storage).payload.response.body, "preset", "tr-ultra-30tb");
      const concurrent = storedConfig([...DEFAULT_RULES, exactRule()], { revision: "b".repeat(48) });
      let configReads = 0;
      const result = submit(variant, storage, form, "preset", {}, {
        read(key, current) {
          if (key === CONFIG_KEY && ++configReads === changedRead) current.set(key, JSON.stringify(concurrent));
          return current.get(key) || null;
        }
      });
      assertRejected(result, 409, [[CONFIG_KEY, JSON.stringify(concurrent)]]);
      assert(configReads >= changedRead);
      assert.equal(formFor(result.payload.response.body, "preset", "tr-ultra-30tb").fields.revision, concurrent.revision);
      assert.deepEqual(record(storage, CONFIG_KEY).rules, concurrent.rules);
    }
  });

  test("kegagalan baca, tulis, dan baca-ulang templat mengembalikan 503 tanpa redirect sukses atau mutasi riwayat", () => {
    const faults = [
      { storageAvailable: false },
      { readAvailable: false },
      { read() { throw new Error("private-preset-read"); } },
      ...[2, 3].map(at => ({ read(key, storage, calls) {
        if (key === CONFIG_KEY && calls.reads.filter(value => value === CONFIG_KEY).length === at) throw new Error("private-preset-read");
        return storage.get(key) || null;
      } })),
      { writeAvailable: false },
      { write() { return false; } },
      { write() { throw new Error("private-preset-write"); } },
      { write() { return true; } },
      { read(key, storage, calls) {
        if (key === CONFIG_KEY && calls.writes.length) throw new Error("private-preset-readback");
        return storage.get(key) || null;
      } },
      { read(key, storage, calls) {
        if (key === CONFIG_KEY && calls.writes.length) return JSON.stringify(storedConfig(DEFAULT_RULES, { revision: "b".repeat(48) }));
        return storage.get(key) || null;
      } },
      { read(key, storage, calls) {
        if (key === CONFIG_KEY && calls.writes.length) {
          const changed = record(storage, CONFIG_KEY);
          changed.rules.find(rule => rule.from === THIRTY).to = NEXT_TARGET;
          return JSON.stringify(changed);
        }
        return storage.get(key) || null;
      } }
    ];
    for (const fault of faults) {
      const storage = withConfig(DEFAULT_RULES);
      storage.set(SCAN_KEY, "fixture-scan-history");
      storage.set(TEST_KEY, "fixture-test-history");
      const previous = storage.get(CONFIG_KEY);
      const form = formFor(htmlPage(variant, storage).payload.response.body, "preset", "tr-ultra-30tb");
      const result = submit(variant, storage, form, "preset", {}, fault);
      assert.equal(result.payload.response.status, 503);
      assert.equal(header(result.payload.response, "Location"), undefined);
      assert(result.writes.length <= 1);
      assert(result.writes.every(write => write.key === CONFIG_KEY));
      assert.equal(storage.get(SCAN_KEY), "fixture-scan-history");
      assert.equal(storage.get(TEST_KEY), "fixture-test-history");
      assert(!result.payload.response.body.includes("Templat telah disimpan di perangkat"));
      assert(!result.payload.response.body.includes("private-preset-"));
      if (!result.writes.length || !fault.read) assert.equal(storage.get(CONFIG_KEY), previous);
    }
  });

  test("templat membiarkan pengaturan tidak valid apa adanya sampai formulir pulihkan asli memperbaikinya", () => {
    const storage = new Map([[CONFIG_KEY, "fixture-invalid-config"]]);
    const page = htmlPage(variant, storage);
    for (const preset of PRESETS) {
      const form = formFor(page.payload.response.body, "preset", preset.id);
      assert.equal(form.fields.revision, "invalid");
      assert.equal(form.disabled, true);
      const body = new URLSearchParams({ ...form.fields, action: "preset" }).toString();
      assertRejected(post(variant, storage, body), 400, [[CONFIG_KEY, "fixture-invalid-config"]]);
    }
    const reset = formFor(page.payload.response.body, "reset");
    assertRedirect(variant, submit(variant, storage, reset, "reset"), "reset");
    assertStored(storage, [], false);
    const applied = change(variant, storage, "preset", "tr-ultra-30tb");
    assertPresetRules(applied.config, presetById("tr-ultra-30tb"));
    assert.equal(run(variant.script, { storage, body: THIRTY }).payload.body, TURKEY_TARGET);
  });

  test("formulir templat menolak field hilang, duplikat, tambahan, cacat, dan di luar daftar izin", () => {
    const storage = new Map();
    const form = formFor(htmlPage(variant, storage).payload.response.body, "preset", "tr-ultra-30tb");
    const body = formBody(form, "preset");
    const changes = [
      { action: undefined }, { revision: undefined }, { preset: undefined },
      { action: "Preset" }, { preset: "" }, { preset: "constructor" }, { preset: "__proto__" },
      { preset: "toString" }, { preset: "hasOwnProperty" }, { preset: "unknown" },
      { preset: "tr-ultra-30tb " }, { preset: " tr-ultra-30tb" }, { preset: "TR-ULTRA-30TB" },
      { preset: "tr-ultra-30tb\n" }, { preset: "tr-ultra-30tb\u0000" },
      { preset: '<img src=x onerror="preset-marker">' }
    ];
    for (const fields of changes) assertRejected(post(variant, storage, formBody(form, "preset", fields)), 400, []);
    for (const suffix of [
      "&preset=ultra-75p", "&pres%65t=tr-ultra-30tb", "&action=preset", "&revision=" + DEFAULT_REVISION,
      "&id=default-30tb", "&match=exact", "&from=" + THIRTY, "&to=" + NEXT_TARGET, "&enabled=1",
      "&rules=%5B%5D", "&unknown=1", "&__proto__=tr-ultra-30tb", "&constructor=ultra-75p", "&clear=1"
    ]) assertRejected(post(variant, storage, body + suffix), 400, []);
    for (const value of ["%", "%GG", "%E0%A4%A", "%C0%AF", "%ED%A0%80"]) {
      assertRejected(post(variant, storage, body.replace("preset=tr-ultra-30tb", "preset=" + value)), 400, []);
    }
    assertRejected(post(variant, storage, body + "&preset=" + "a".repeat(20000)), 413, []);
    const valid = submit(variant, storage, form, "preset");
    assertRedirect(variant, valid, "preset");
    assert.equal(record(storage, CONFIG_KEY).rules.find(rule => rule.from === THIRTY).to, TURKEY_TARGET);
  });

  test("aksi upsert, delete, dan reset yang ada menolak field preset tambahan", () => {
    const storage = withConfig(DEFAULT_RULES);
    const html = htmlPage(variant, storage).payload.response.body;
    const before = [...storage];
    for (const action of ["upsert", "delete", "reset"]) {
      const form = formFor(html, action, action === "reset" ? undefined : "default-20tb");
      assertRejected(submit(variant, storage, form, action, { preset: "tr-ultra-30tb" }), 400, before);
    }
  });

  test("query GET preset, tautan laporan, dan formulir ekspor JSON asli tetap baca-saja", () => {
    const storage = new Map();
    run(variant.script, { storage, body: THIRTY });
    const page = htmlPage(variant, storage);
    const baseline = exported(variant, storage).data;
    const form = formFor(page.payload.response.body, "preset", "tr-ultra-30tb");
    const body = formBody(form, "preset");
    const before = [...storage];
    for (const suffix of ["", "&format=json", "&clear=1", "&format=json&clear=1"]) {
      const result = run(variant.report, { storage, url: ROOT + "?" + body + suffix, method: "GET", headers: FORM_HEADERS, requestBody: body });
      assertRejected(result, 405, before);
    }
    for (const suffix of ["?preset=tr-ultra-30tb", "?preset=tr-ultra-30tb&revision=" + DEFAULT_REVISION, "?notice=preset", "?format=json&preset=tr-ultra-30tb"]) {
      const result = run(variant.report, { storage, url: ROOT + suffix });
      assert.equal(result.payload.response.status, 200);
      assert.deepEqual(result.writes, []);
      assert.deepEqual([...storage], before);
    }
    for (const link of page.payload.response.body.matchAll(/<a\b([^>]*)>/gi)) {
      const href = attributes(link[1]).href;
      if (!href || !new URL(href, ROOT).href.startsWith(ROOT)) continue;
      const result = htmlPage(variant, storage, { url: new URL(href, ROOT).href });
      assert.deepEqual(result.writes, []);
      assert.deepEqual([...storage], before);
    }
    const exportForm = forms(page.payload.response.body).find(form => form.attrs.method.toLowerCase() === "get" &&
      form.buttons.some(button => button.name === "format" && button.value === "json"));
    assert(exportForm);
    const url = new URL(exportForm.attrs.action, ROOT);
    for (const [key, value] of Object.entries(exportForm.fields)) url.searchParams.set(key, value);
    url.searchParams.set("format", "json");
    const exportedData = exported(variant, storage, { url: url.href }).data;
    assert.deepEqual(exportedData, baseline);
    assert.deepEqual([...storage], before);
    assert.equal(storage.has(CONFIG_KEY), false);
  });

  test("POST preset mempertahankan Origin persis, fetch-site, content-type, dan penegakan CSP", () => {
    const storage = new Map();
    const page = htmlPage(variant, storage);
    const form = formFor(page.payload.response.body, "preset", "tr-ultra-30tb");
    assertNoScript(page.payload.response);
    for (const origin of [undefined, "", "null", "https://example.test", ORIGIN + ".evil", "http://one.google.com", ORIGIN + "/", ORIGIN + ":443"]) {
      const headers = { "Content-Type": FORM_HEADERS["Content-Type"] };
      if (origin !== undefined) headers.Origin = origin;
      assertRejected(submit(variant, storage, form, "preset", {}, { headers }), 403, []);
    }
    for (const site of ["cross-site", "same-site", "none", "", "null"]) {
      assertRejected(submit(variant, storage, form, "preset", {}, { headers: { ...FORM_HEADERS, "Sec-Fetch-Site": site } }), 403, []);
    }
    for (const contentType of [undefined, "application/json", "text/plain", "application/x-www-form-urlencodedx"]) {
      const headers = { Origin: ORIGIN };
      if (contentType !== undefined) headers["Content-Type"] = contentType;
      assertRejected(submit(variant, storage, form, "preset", {}, { headers }), 415, []);
    }
    const headers = { origin: ORIGIN, "content-type": "application/x-www-form-urlencoded; charset=UTF-8", "sec-fetch-site": "same-origin" };
    const touched = [];
    for (const key of ["Cookie", "Authorization"]) Object.defineProperty(headers, key, {
      enumerable: true, get() { touched.push(key); throw new Error("private-preset-header"); }
    });
    const result = submit(variant, storage, form, "preset", {}, { headers });
    const html = assertRedirect(variant, result, "preset");
    assertNoScript(result.payload.response);
    assert(html.includes("Aturan saat ini cocok"));
    assert.deepEqual(touched, []);
  });

  test("label konsistensi templat membutuhkan setiap pasangan aktif dan tetap terpisah dari bukti runtime", () => {
    for (const rules of [
      [DEFAULT_RULES[1]],
      [DEFAULT_RULES[1], { ...DEFAULT_RULES[2], enabled: false }],
      [DEFAULT_RULES[1], { ...DEFAULT_RULES[2], to: TURKEY_TARGET }],
      [DEFAULT_RULES[1], DEFAULT_RULES[2]]
    ]) {
      const storage = withConfig(rules);
      const html = htmlPage(variant, storage).payload.response.body;
      const matches = rules.length === 2 && rules[1].enabled && rules[1].to === DEFAULT_RULES[2].to;
      assert.equal(presetCardText(html, "ultra-75p").includes("Aturan saat ini cocok"), matches);
      assert(!html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
    }
    const storage = withConfig([exactRule({ from: SOURCE }), { ...DEFAULT_RULES[0], enabled: false }]);
    const changed = change(variant, storage, "preset", "pro-12months-90p");
    assert(presetCardText(changed.html, "pro-12months-90p").includes("Aturan saat ini cocok"));
    assert(!changed.html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
    assert.equal(run(variant.script, { storage, body: SOURCE }).payload.body, CUSTOM_TARGET);
    const html = htmlPage(variant, storage).payload.response.body;
    assert(presetCardText(html, "pro-12months-90p").includes("Aturan saat ini cocok"));
    assert(html.includes("Eksekusi pemetaan terakhir telah membaca konfigurasi saat ini"));
    assert.equal(record(storage, TEST_KEY).matchedFrom[0].to, CUSTOM_TARGET, "awalan yang cocok tetap menghormati override persis");
  });

  test("kontrol templat dinonaktifkan untuk pengaturan invalid atau tidak tersedia serta API tulis yang absen", () => {
    const scenarios = [
      { storage: new Map([[CONFIG_KEY, "fixture-invalid-config"]]) },
      { storage: new Map(), options: { storageAvailable: false } },
      { storage: new Map(), options: { readAvailable: false } },
      { storage: new Map(), options: { read() { throw new Error("private-disabled-read"); } } },
      { storage: new Map(), options: { writeAvailable: false } }
    ];
    for (const scenario of scenarios) {
      const before = [...scenario.storage];
      const page = htmlPage(variant, scenario.storage, scenario.options);
      for (const preset of PRESETS) {
        const form = formFor(page.payload.response.body, "preset", preset.id);
        assert(form.disabled || form.buttons.length === 0, "setiap kontrol submit templat harus dinonaktifkan");
      }
      assert.deepEqual(page.writes, []);
      assert.deepEqual([...scenario.storage], before);
      assertNoScript(page.payload.response);
    }
  });

  test("menerapkan setiap templat mempertahankan mode historis, target cadangan, 300 ID, dan 10 kedatangan", () => {
    for (const mode of ["trial", "discount", "discount75"]) {
      const version = mode === "discount75" ? "g1-acq-v7.9-mappings" : "g1-acq-v7.7-" + mode;
      const scan = {
        schemaVersion: 1, version, mode, updatedAt: FIXED_TIME, scannedResponses: 40, matchedResponses: 35,
        nonTextResponses: 5, truncated: true, limit: 300,
        skus: Array.from({ length: 300 }, (_, index) => ({ id: "g1.fixture.history_" + index, count: index + 1, lastSeen: FIXED_TIME })),
        recentResponses: Array.from({ length: 10 }, () => ({ at: FIXED_TIME, path: "/plans", bodyType: "text",
          status: "known-skus", candidateCount: 2, addedCount: 0, omittedCount: 0 }))
      };
      const test = {
        schemaVersion: 1, version, mode, updatedAt: FIXED_TIME, target: TARGET, targetOrigin: "user-specified",
        status: "rewritten", hitCount: 3, annualHitCount: 1, mappingRevision: "b".repeat(48), mappingUpdatedAt: FIXED_TIME,
        mappingStatus: "default", matchedFrom: [
          { id: SOURCE, to: TARGET, count: 1, fallback: false },
          { id: TWENTY, to: "g1.20tb.1month_eft.acq", count: 1, fallback: false },
          { id: THIRTY, to: "g1.ai.ultra.3months_ip_90p.acq", count: 1, fallback: true }
        ]
      };
      const storage = new Map([[SCAN_KEY, JSON.stringify(scan)], [TEST_KEY, JSON.stringify(test)]]);
      const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
      const baseline = exported(variant, storage).data;
      for (const preset of PRESETS) {
        change(variant, storage, "preset", preset.id);
        const data = exported(variant, storage).data;
        assert.deepEqual(data.scan, baseline.scan);
        assert.deepEqual(data.test, baseline.test);
        assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
        assert.equal(data.scan.skus.length, 300);
        assert.equal(data.scan.recentResponses.length, 10);
        assert.deepEqual([...storage.keys()].sort(), [CONFIG_KEY, SCAN_KEY, TEST_KEY].sort());
        const html = htmlPage(variant, storage).payload.response.body;
        assert(html.includes("g1.ai.ultra.3months_ip_90p.acq</code></td><td>90p</td>"));
      }
    }
  });

  test("inferensi asal-target 2TB historis memakai nilai bawaan tetap alih-alih awalan yang sudah diedit", () => {
    for (const previous of [
      { version: "g1-acq-v7.8-75p", target: TARGET, expected: TARGET, origin: "user-specified" },
      { version: "pro-annual-test-v1", expected: "g1.2tb.ai.annual", origin: "legacy" },
      { version: "g1-acq-v7.1", expected: "g1.2tb.ai.annual", origin: "legacy" }
    ]) {
      const storage = withConfig(DEFAULT_RULES.map(rule => rule.id === "default-2tb" ? { ...rule, to: CUSTOM_TARGET } : rule));
      const saved = JSON.stringify({ schemaVersion: 1, version: previous.version, target: previous.target, hitCount: 2, matchedFrom: [{ id: SOURCE, count: 2 }] });
      storage.set(TEST_KEY, saved);
      const data = exported(variant, storage).data;
      assert.equal(data.configuredTarget, CUSTOM_TARGET);
      assert.equal(data.test.target, previous.expected);
      assert.equal(data.test.targetOrigin, previous.origin);
      assert.equal(data.test.matchedFrom[0].to, previous.expected);
      assert.equal(data.test.mappingRevision, "");
      assert.equal(data.test.mappingUpdatedAt, "");
      assert.equal(data.test.mappingStatus, "");
      assert.equal(storage.get(TEST_KEY), saved);
    }
  });
}

nodeTest("katalog templat memiliki bentuk publik persis dan mengembalikan objek, array, serta aturan terisolasi", () => {
  const harness = engineHarness();
  const first = harness.invoke("presets");
  const second = harness.invoke("presets");
  assert.deepEqual(plain(first), PRESETS);
  assert.deepEqual(plain(second), PRESETS);
  assert.notEqual(first, second);
  for (let index = 0; index < first.length; index++) {
    assert.notEqual(first[index], second[index]);
    assert.notEqual(first[index].rules, second[index].rules);
    assert.deepEqual(Object.keys(first[index]).sort(), ["description", "id", "rules", "title"]);
    for (let ruleIndex = 0; ruleIndex < first[index].rules.length; ruleIndex++) {
      assert.notEqual(first[index].rules[ruleIndex], second[index].rules[ruleIndex]);
      assert.deepEqual(Object.keys(first[index].rules[ruleIndex]).sort(), ["enabled", "from", "match", "to"]);
    }
  }
  const pro = first.find(preset => preset.id === "pro-1yuan");
  pro.id = "changed-id";
  pro.title = "changed-title";
  pro.description = "changed-description";
  pro.rules[0].to = NEXT_TARGET;
  first.find(preset => preset.id === "tr-ultra-30tb").rules.pop();
  first.find(preset => preset.id === "ultra-75p").rules = [];
  first.push({ id: "injected-preset", rules: [] });
  assert.deepEqual(plain(harness.invoke("presets")), PRESETS);
  assert.deepEqual(plain(second), PRESETS);
  assert.deepEqual(harness.reads, []);
  assert.deepEqual(harness.writes, []);
});

nodeTest("applyPreset hanya menerima ID bawaan dan mengabaikan payload aturan dari pemanggil", () => {
  const harness = engineHarness({ storage: withConfig([]) });
  for (const id of [undefined, null, "", "unknown", "constructor", "__proto__", "toString", "hasOwnProperty",
    "tr-ultra-30tb ", "tr-ultra-30tb\n", 0, true, ["tr-ultra-30tb"], { id: "tr-ultra-30tb" },
    { toString() { return "tr-ultra-30tb"; } }]) {
    const result = plain(harness.invoke("applyPreset", "a".repeat(48), id));
    assert.deepEqual(Object.keys(result).sort(), ["config", "error", "ok", "status"]);
    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.equal(typeof result.error, "string");
    assert(result.error.length > 0);
    assert.deepEqual(result.config.rules, []);
    assert.deepEqual(harness.writes, []);
  }
  const catalog = harness.invoke("presets");
  catalog.find(preset => preset.id === "tr-ultra-30tb").rules[0].to = NEXT_TARGET;
  const result = plain(harness.invoke("applyPreset", "a".repeat(48), "tr-ultra-30tb", [exactRule({ from: THIRTY, to: NEXT_TARGET })]));
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.equal(result.error, "");
  assert.deepEqual(withoutIds(result.config.rules), presetById("tr-ultra-30tb").rules);
  assert.deepEqual(harness.writes.map(write => write.key), [CONFIG_KEY]);
  assertStored(harness.storage, result.config.rules);
});

nodeTest("penyisipan templat tetap unik dan terbatas ketika setiap nilai acak berulang", () => {
  const base = "rule-" + "0".repeat(16);
  const rules = Array.from({ length: 28 }, (_, index) => exactRule({
    id: index === 0 ? base : base + "-" + index, from: "g1.fixture.collision_" + index, enabled: index % 2 === 0
  }));
  const harness = engineHarness({ storage: withConfig(rules), random: () => 0 });
  // Timeout VM membuat pengulangan kolisi tak terbatas langsung gagal di node ini.
  const applied = plain(harness.invoke("applyPreset", "a".repeat(48), "ultra-75p"));
  assert.equal(applied.status, 200);
  assert.equal(applied.config.rules.length, 30);
  assert.deepEqual(applied.config.rules.slice(0, 28), rules);
  assert.deepEqual(withoutIds(applied.config.rules.slice(28)), presetById("ultra-75p").rules);
  assert.equal(new Set(applied.config.rules.map(rule => rule.id)).size, 30);
  assert(applied.config.rules.every(rule => /^[a-z][a-z0-9-]{0,39}$/.test(rule.id)));
  assert.equal(harness.invoke("validateRules", applied.config.rules).ok, true);
  const repeated = plain(harness.invoke("applyPreset", applied.config.revision, "ultra-75p"));
  assert.equal(repeated.status, 200);
  assert.notEqual(repeated.config.revision, applied.config.revision);
  assert.deepEqual(repeated.config.rules, applied.config.rules);
  assert.deepEqual(harness.writes.map(write => write.key), [CONFIG_KEY, CONFIG_KEY]);
  assertStored(harness.storage, repeated.config.rules);
});

nodeTest("applyPreset menampilkan kegagalan usang, invalid, unavailable, melebihi batas, dan race simpan akhir tanpa menulis", () => {
  const scenarios = [
    { options: { storage: withConfig(DEFAULT_RULES) }, revision: "b".repeat(48), status: 409 },
    { options: { storage: new Map([[CONFIG_KEY, "fixture-invalid-config"]]) }, revision: "invalid", status: 400 },
    { options: { storageAvailable: false }, revision: DEFAULT_REVISION, status: 503 },
    { options: { readAvailable: false }, revision: DEFAULT_REVISION, status: 503 },
    { options: { read() { throw new Error("fixture-read-failure"); } }, revision: DEFAULT_REVISION, status: 503 },
    { options: { storage: withConfig(Array.from({ length: 30 }, (_, index) => exactRule({ id: "limit-" + index, from: "g1.fixture.limit_" + index }))) },
      revision: "a".repeat(48), status: 400 }
  ];
  for (const scenario of scenarios) {
    const harness = engineHarness(scenario.options);
    const before = [...harness.storage];
    const result = plain(harness.invoke("applyPreset", scenario.revision, "tr-ultra-30tb"));
    assert.deepEqual(Object.keys(result).sort(), ["config", "error", "ok", "status"]);
    assert.equal(result.ok, false);
    assert.equal(result.status, scenario.status);
    assert.equal(typeof result.error, "string");
    assert(result.error.length > 0);
    assert.deepEqual(harness.writes, []);
    assert.deepEqual([...harness.storage], before);
  }
  const concurrent = storedConfig([...DEFAULT_RULES, exactRule()], { revision: "b".repeat(48) });
  const harness = engineHarness({
    storage: withConfig(DEFAULT_RULES),
    read(key, storage, calls) {
      if (calls.reads.length === 2) storage.set(key, JSON.stringify(concurrent));
      return storage.get(key) || null;
    }
  });
  const raced = plain(harness.invoke("applyPreset", "a".repeat(48), "tr-ultra-30tb"));
  assert.equal(raced.status, 409);
  assert.equal(raced.ok, false);
  assert.deepEqual(raced.config.rules, concurrent.rules);
  assert.equal(raced.config.revision, concurrent.revision);
  assert.deepEqual(harness.reads, [CONFIG_KEY, CONFIG_KEY]);
  assert.deepEqual(harness.writes, []);
  assert.equal(harness.storage.get(CONFIG_KEY), JSON.stringify(concurrent));
});

nodeTest("pembersihan Pro membiarkan konfigurasi saat ini dan penyimpanan tetap utuh saat gagal kapasitas atau konflik revisi", () => {
  const legacy = exactRule({ id: "legacy-pro-entry", from: TWENTY, to: TR_PRO_TARGET });
  const fillers = Array.from({ length: 29 }, (_, index) =>
    exactRule({ id: "filler-" + index, from: "g1.fixture.filler_" + index }));
  for (const scenario of [
    { rules: [legacy, ...fillers], revision: "a".repeat(48), status: 400 },
    { rules: [legacy, DEFAULT_RULES[0]], revision: "b".repeat(48), status: 409 }
  ]) {
    const storage = legacyProStorage(scenario.rules);
    const harness = engineHarness({ storage });
    const current = harness.invoke("read");
    const snapshot = plain(current);
    const before = [...storage];
    const result = plain(harness.invoke("applyPreset", scenario.revision, "pro-1yuan"));
    assert.equal(result.ok, false);
    assert.equal(result.status, scenario.status);
    assert.deepEqual(result.config, snapshot, "penggabungan yang gagal harus mengembalikan baris warisan aktif asli");
    assert.deepEqual(plain(current), snapshot);
    assert.deepEqual(harness.writes, []);
    assert.deepEqual([...storage], before);
  }
  const rules = [legacy, DEFAULT_RULES[0]];
  const concurrent = storedConfig([...rules, exactRule()], { revision: "b".repeat(48) });
  const storage = legacyProStorage(rules);
  const history = [storage.get(SCAN_KEY), storage.get(TEST_KEY)];
  const harness = engineHarness({
    storage,
    read(key, current, calls) {
      if (calls.reads.length === 2) current.set(key, JSON.stringify(concurrent));
      return current.get(key) || null;
    }
  });
  const result = plain(harness.invoke("applyPreset", "a".repeat(48), "pro-1yuan"));
  assert.equal(result.status, 409);
  assert.equal(result.ok, false);
  assert.deepEqual(result.config.rules, concurrent.rules);
  assert.equal(result.config.revision, concurrent.revision);
  assert.deepEqual(harness.writes, []);
  assert.equal(storage.get(CONFIG_KEY), JSON.stringify(concurrent));
  assert.deepEqual([storage.get(SCAN_KEY), storage.get(TEST_KEY)], history);
});

nodeTest("blok yang dihasilkan dan alias konfigurasi pemetaan berbagi mesin yang sama serta --check bersifat baca-saja", () => {
  const enginePath = path.join(root, "lib/mapping-config.js");
  const engine = fs.readFileSync(enginePath, "utf8").trimEnd();
  const begin = "// BEGIN GENERATED MAPPING CONFIG";
  const end = "// END GENERATED MAPPING CONFIG";
  for (const name of ["g1-acq.js", "g1-sku-report.js"]) {
    const source = sources[name];
    assert.equal(source.split(begin).length, 2, name);
    assert.equal(source.split(end).length, 2, name);
    const embedded = source.slice(source.indexOf(begin) + begin.length + 1, source.indexOf(end));
    assert.equal(embedded.trimEnd(), engine, name);
  }
  for (const [canonical, alias] of [["g1-acq.js", "g1-acq-discount.js"], ["g1-sku-report.js", "g1-sku-report-discount.js"]]) {
    assert.equal(sources[alias], "/* Generated from " + canonical + " by tools/build-variants.cjs. */\n" + sources[canonical]);
  }
  const paths = [enginePath, ...Object.keys(sources).map(name => path.join(root, name))];
  const before = paths.map(file => ({ contents: fs.readFileSync(file, "utf8"), mtime: fs.statSync(file).mtimeMs }));
  const checked = spawnSync(process.execPath, [path.join(root, "tools/build-variants.cjs"), "--check"], { cwd: root, encoding: "utf8", timeout: 10000 });
  assert.equal(checked.status, 0, checked.stdout + checked.stderr);
  assert.deepEqual(paths.map(file => ({ contents: fs.readFileSync(file, "utf8"), mtime: fs.statSync(file).mtimeMs })), before);
});
