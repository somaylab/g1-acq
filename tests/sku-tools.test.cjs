"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const TARGET = "g1.2tb.ai.12months_ip_90p";
const LEGACY_TARGET = "g1.2tb.ai.annual";
const SCAN_KEY = "g1.sku.scan.v1";
const TEST_KEY = "g1.pro.annual.test.v1";
const REPORT = "https://one.google.com/g1-sku-report";
// ID sumber fixture menguji kontrak pencocokan; ini bukan bukti katalog toko.
const SOURCE = "g1.ios.2tb.fixture_monthly";
const OTHER_SOURCE = "g1.ios.2tb.fixture_annual";
const TWENTY = "g1.ios.20tb.m.v2";
const THIRTY = "g1.ios.30tb.ai.pro.m";
const TWENTY_TARGET = "g1.20tb.1month_eft.acq";
const THIRTY_TARGET = "g1.ai.ultra.1month_eft.acq";
const TWENTY_FALLBACK = "g1.20tb.3months_ip_90p.acq";
const THIRTY_FALLBACK = "g1.ai.ultra.3months_ip_90p.acq";
const LEGACY_TWENTY_FALLBACK = "g1.20tb.3months_ip_75p.acq";
const LEGACY_THIRTY_FALLBACK = "g1.ai.ultra.3months_ip_75p.acq";
const source = Object.fromEntries(
  ["g1-acq.js", "g1-sku-scan.js", "g1-sku-report.js"].map(name =>
    [name, fs.readFileSync(path.join(root, name), "utf8")])
);

function run(name, options = {}) {
  const storage = options.storage || new Map();
  const calls = [];
  const logs = [];
  const reads = [];
  const writes = [];
  const context = {
    $request: {
      url: options.url || "https://one.google.com/ai?fixture=1",
      headers: { Cookie: "cookie-secret", Authorization: "auth-secret" }
    },
    $response: { body: options.body, headers: { "x-private": "response-secret" } },
    $done: payload => calls.push(JSON.parse(JSON.stringify(payload))),
    console: { log: value => logs.push(String(value)) }
  };
  if (options.storageAvailable !== false) {
    context.$persistentStore = {
      read(key) {
        if (options.storageThrows) throw new Error("fixture storage failure");
        reads.push(key);
        return storage.get(key) || null;
      },
      write(value, key) {
        if (options.storageThrows) throw new Error("fixture storage failure");
        writes.push(key);
        if (options.storageWriteFails) return false;
        storage.set(key, value);
        return true;
      }
    };
  }
  vm.runInNewContext(source[name], context, { timeout: 2000, filename: name });
  assert.equal(calls.length, 1, "$done harus dipanggil tepat satu kali");
  return { payload: calls[0], storage, logs, reads, writes };
}

function get(storage, key) {
  return JSON.parse(storage.get(key));
}

test("modul gabungan memetakan 2TB, 20TB, dan 30TB sambil mempertahankan token utuh yang tidak terkait", () => {
  const untouched = [
    "g1.ios.12tb.fixture", TWENTY + ".extra", THIRTY + ".extra",
    "g1.ios.2tbx.fixture", "prefix" + SOURCE, "x." + SOURCE,
    "person@" + SOURCE, "g1.2tb", TARGET
  ];
  const values = [SOURCE, OTHER_SOURCE, SOURCE, TWENTY, THIRTY, ...untouched];
  const result = run("g1-acq.js", { body: JSON.stringify(values) });
  assert.deepEqual(JSON.parse(result.payload.body), [TARGET, TARGET, TARGET, TWENTY_TARGET, THIRTY_TARGET, ...untouched]);
  const record = get(result.storage, TEST_KEY);
  assert.equal(record.hitCount, 5);
  assert.equal(record.annualHitCount, 3);
  assert.equal(record.status, "rewritten");
  assert.equal(record.version, "g1-acq-v7.6");
  assert.deepEqual(record.matchedFrom, [
    { id: TWENTY, to: TWENTY_TARGET, count: 1, fallback: false },
    { id: OTHER_SOURCE, to: TARGET, count: 1, fallback: false },
    { id: SOURCE, to: TARGET, count: 2, fallback: false },
    { id: THIRTY, to: THIRTY_TARGET, count: 1, fallback: false }
  ]);
});

test("respons kosong atau respons tanpa sumber terkonfigurasi dilewatkan apa adanya", () => {
  for (const body of ["", "g1.ios.100gb.m", "g1.ios.20tb.other", "g1.ios.30tb.other"]) {
    const result = run("g1-acq.js", { body });
    assert.deepEqual(result.payload, {});
    assert.equal(get(result.storage, TEST_KEY).status, "no-match");
  }
  for (const body of [undefined, null, 123, {}]) {
    const result = run("g1-acq.js", { body });
    assert.deepEqual(result.payload, {});
    assert.equal(get(result.storage, TEST_KEY).status, "non-text");
  }
});

test("20TB dan 30TB memilih uji coba atau 90p secara independen di seluruh 16 kombinasi penawaran", () => {
  const cases = (target, backup) => [
    { offers: [], to: target, fallback: false },
    { offers: [target], to: target, fallback: false },
    { offers: [backup], to: backup, fallback: true },
    { offers: [target, backup], to: target, fallback: false }
  ];
  for (const twenty of cases(TWENTY_TARGET, TWENTY_FALLBACK)) {
    for (const thirty of cases(THIRTY_TARGET, THIRTY_FALLBACK)) {
      const observed = [...twenty.offers, ...thirty.offers];
      const body = JSON.stringify([TWENTY, THIRTY, TWENTY, ...observed]);
      const result = run("g1-acq.js", { body });
      assert.deepEqual(JSON.parse(result.payload.body), [twenty.to, thirty.to, twenty.to, ...observed]);
      const record = get(result.storage, TEST_KEY);
      assert.equal(record.hitCount, 3);
      assert.equal(record.annualHitCount, 0);
      assert.equal(record.status, "rewritten");
      assert.deepEqual(record.matchedFrom, [
        { id: TWENTY, to: twenty.to, count: 2, fallback: twenty.fallback },
        { id: THIRTY, to: thirty.to, count: 1, fallback: thirty.fallback }
      ]);
    }
  }
});

test("penawaran 75p tetap tidak berubah dan tidak lagi dipilih sebagai cadangan", () => {
  const observed = [LEGACY_TWENTY_FALLBACK, LEGACY_THIRTY_FALLBACK];
  const result = run("g1-acq.js", { body: JSON.stringify([SOURCE, TWENTY, THIRTY, ...observed]) });
  assert.deepEqual(JSON.parse(result.payload.body), [TARGET, TWENTY_TARGET, THIRTY_TARGET, ...observed]);
  assert(get(result.storage, TEST_KEY).matchedFrom.every(row => row.fallback === false));
});

test("cadangan menggunakan respons saat ini bukan penawaran tersimpan serta mempertahankan field harga dan tanggal", () => {
  const storage = new Map();
  run("g1-acq.js", { url: "https://one.google.com/plans", body: JSON.stringify([TWENTY_FALLBACK, THIRTY_FALLBACK]), storage });
  for (const day of ["23", "24"]) {
    const body = {
      product: TWENTY,
      trialStart: "2026-11-" + day,
      regularStart: "2027-02-" + day,
      price: 330,
      regularPrice: 3300
    };
    const result = run("g1-acq.js", { body: JSON.stringify(body), storage });
    assert.deepEqual(JSON.parse(result.payload.body), { ...body, product: TWENTY_TARGET });
    assert.equal(get(storage, TEST_KEY).matchedFrom[0].fallback, false);
  }
  const result = run("g1-acq.js", { body: JSON.stringify([TWENTY, TWENTY_FALLBACK]), storage });
  assert.deepEqual(JSON.parse(result.payload.body), [TWENTY_FALLBACK, TWENTY_FALLBACK]);
  assert(result.logs.some(line => line.includes("fallback=" + TWENTY_FALLBACK)));
  assert(!result.logs.some(line => line.includes("fallback=75p")));
});

test("keputusan cadangan bersifat independen dan target 2TB tetap konstan", () => {
  const body = JSON.stringify([SOURCE, TWENTY, THIRTY, TWENTY_TARGET, TWENTY_FALLBACK, THIRTY_FALLBACK]);
  const result = run("g1-acq.js", { body });
  assert.deepEqual(JSON.parse(result.payload.body).slice(0, 3), [TARGET, TWENTY_TARGET, THIRTY_FALLBACK]);
  const rows = get(result.storage, TEST_KEY).matchedFrom;
  assert.deepEqual(rows.find(row => row.id === SOURCE), { id: SOURCE, to: TARGET, count: 1, fallback: false });
  assert.deepEqual(rows.find(row => row.id === TWENTY), { id: TWENTY, to: TWENTY_TARGET, count: 1, fallback: false });
  assert.deepEqual(rows.find(row => row.id === THIRTY), { id: THIRTY, to: THIRTY_FALLBACK, count: 1, fallback: true });
});

test("modul tunggal mengumpulkan halaman Google lainnya tanpa mengubah catatan pemetaan terakhir", () => {
  for (const url of [
    "https://one.google.com/ai", "https://one.google.com/ai/other?x=1",
    "https://one.google.com/plans?x=1"
  ]) {
    const previous = JSON.stringify({ schemaVersion: 1, version: "previous-record", hitCount: 2 });
    const storage = new Map([[TEST_KEY, previous]]);
    const result = run("g1-acq.js", { url, body: SOURCE, storage });
    assert.deepEqual(result.payload, {});
    assert.equal(storage.get(TEST_KEY), previous);
    assert.equal(get(storage, SCAN_KEY).skus[0].id, SOURCE);
  }
  for (const url of [
    "https://one.google.com.evil/ai?x=1", "http://one.google.com/ai?x=1",
    REPORT, REPORT + "?format=json", REPORT + "/", REPORT + "/?format=json"
  ]) {
    const result = run("g1-acq.js", { url, body: SOURCE });
    assert.deepEqual(result.payload, {});
    assert.equal(result.storage.size, 0);
  }
});

test("modul tunggal menyimpan kandidat asli sebelum menulis ulang tanpa mencatat target yang dihasilkan", () => {
  const body = JSON.stringify([SOURCE, SOURCE, TWENTY, THIRTY, "com.google.one.fixture"]);
  const result = run("g1-acq.js", { body });
  assert.deepEqual(JSON.parse(result.payload.body), [TARGET, TARGET, TWENTY_TARGET, THIRTY_TARGET, "com.google.one.fixture"]);
  const scan = get(result.storage, SCAN_KEY);
  assert.equal(scan.version, "g1-acq-v7.6");
  assert.deepEqual(scan.skus.map(row => row.id), ["com.google.one.fixture", TWENTY, SOURCE, THIRTY]);
  assert.equal(scan.skus.find(row => row.id === SOURCE).count, 2);
  assert.deepEqual(result.writes, [SCAN_KEY, TEST_KEY]);
});

test("pengumpulan modul tunggal mendekode salinan penemuan dan melanjutkan pemetaan saat daftar penuh", () => {
  const escaped = String.raw`g1\u002eios\u002e2tb\u002eescaped`;
  const decoded = run("g1-acq.js", { body: escaped });
  assert.deepEqual(decoded.payload, {});
  assert.equal(get(decoded.storage, SCAN_KEY).skus[0].id, "g1.ios.2tb.escaped");
  const storage = new Map();
  const full = Array.from({ length: 305 }, (_, index) => "g1.fixture." + index).join(" ");
  run("g1-acq.js", { url: "https://one.google.com/plans", body: full, storage });
  const fullEvent = get(storage, SCAN_KEY).recentResponses.at(-1);
  assert.equal(fullEvent.status, "new-skus");
  assert.equal(fullEvent.candidateCount, 305);
  assert.equal(fullEvent.addedCount, 300);
  assert.equal(fullEvent.omittedCount, 5);
  const next = run("g1-acq.js", { body: SOURCE + " g1.fixture.0", storage });
  assert.equal(next.payload.body, TARGET + " g1.fixture.0");
  const scan = get(storage, SCAN_KEY);
  assert.equal(scan.skus.length, 300);
  assert.equal(scan.truncated, true);
  assert.equal(scan.scannedResponses, 2);
  assert.equal(scan.skus.find(row => row.id === "g1.fixture.0").count, 2);
  assert.equal(scan.recentResponses.at(-1).status, "limit-reached");
  assert.equal(scan.recentResponses.at(-1).candidateCount, 2);
  assert.equal(scan.recentResponses.at(-1).addedCount, 0);
  assert.equal(scan.recentResponses.at(-1).omittedCount, 1);
});

test("aktivitas membedakan ID baru, ID berulang, teks kosong, dan respons non-teks", () => {
  const storage = new Map();
  const url = "https://one.google.com/plans?token=private-token";
  const body = [SOURCE, SOURCE, OTHER_SOURCE].join(" ");
  run("g1-acq.js", { url, body, storage });
  let scan = get(storage, SCAN_KEY);
  assert.equal(scan.recentResponses[0].status, "new-skus");
  assert.equal(scan.recentResponses[0].candidateCount, 2);
  assert.equal(scan.recentResponses[0].addedCount, 2);
  run("g1-acq.js", { url, body, storage });
  scan = get(storage, SCAN_KEY);
  assert.equal(scan.skus.length, 2);
  assert.equal(scan.skus.find(row => row.id === SOURCE).count, 4);
  assert.equal(scan.scannedResponses, 2);
  assert.equal(scan.matchedResponses, 2);
  assert.equal(scan.recentResponses.at(-1).status, "known-skus");
  assert.equal(scan.recentResponses.at(-1).candidateCount, 2);
  assert.equal(scan.recentResponses.at(-1).addedCount, 0);
  run("g1-acq.js", { url, body: "no product in this response", storage });
  run("g1-acq.js", { url, body: undefined, storage });
  scan = get(storage, SCAN_KEY);
  assert.deepEqual(scan.recentResponses.map(event => event.status), ["new-skus", "known-skus", "no-skus", "non-text"]);
  assert.equal(scan.scannedResponses, 3);
  assert.equal(scan.matchedResponses, 2);
  assert.equal(scan.nonTextResponses, 1);
  assert.equal(scan.skus.length, 2);
  assert.equal(scan.recentResponses.at(-1).bodyType, "non-text");
  assert.equal(scan.recentResponses.at(-1).candidateCount, 0);
  assert.equal(storage.has(TEST_KEY), false, "halaman non-penulisan ulang mempertahankan catatan pemetaan");
  assert(!storage.get(SCAN_KEY).includes("private-token"));
  const data = JSON.parse(run("g1-sku-report.js", { url: REPORT + "?format=json", storage }).payload.response.body);
  assert.deepEqual(data.scan.recentResponses, scan.recentResponses);
  assert.equal(data.scan.nonTextResponses, 1);
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes("Skrip pengumpul aktual: <code>g1-acq-v7.6</code>"));
  assert(html.includes("ID duplikat dengan catatan yang ada"));
  assert(html.includes("isi bukan teks yang dapat dipindai"));
});

test("aktivitas terkini menyimpan sepuluh kejadian dan meredaksi URL, field ekstra, serta kejadian rusak", () => {
  const valid = {
    at: "2099-01-01T00:00:00.000Z", path: "/ai", bodyType: "text", status: "no-skus",
    candidateCount: 0, addedCount: 0, omittedCount: 0, body: "private-history-body"
  };
  const storage = new Map([[SCAN_KEY, JSON.stringify({
    schemaVersion: 1, recentResponses: [valid, { ...valid, path: "/private-secret" }, { ...valid, status: "bad-status" }]
  })]]);
  run("g1-acq.js", { url: "https://one.google.com/plans?secret=1", body: SOURCE, storage });
  let scan = get(storage, SCAN_KEY);
  assert.equal(scan.recentResponses.length, 2);
  assert.equal(scan.recentResponses[0].at, valid.at);
  assert.equal(scan.recentResponses.at(-1).path, "/plans", "kejadian yang terakhir diterima tetap berada di akhir meskipun jam berubah");
  const paths = ["/", "/ai/", "/plans/", "/_/GoogleOne/account-secret/data/batchexecute", "/account/private@example.test"];
  const expected = ["/", "/ai", "/plans", "/_/…/data/batchexecute", "[Path one.google.com lainnya]"];
  for (let index = 0; index < 14; index++) {
    run("g1-acq.js", { url: "https://one.google.com" + paths[index % 5] + "?secret=query#private-fragment", body: SOURCE, storage });
  }
  scan = get(storage, SCAN_KEY);
  assert.equal(scan.recentResponses.length, 10);
  assert.deepEqual(scan.recentResponses.map(event => event.path), Array.from({ length: 10 }, (_, index) => expected[(index + 4) % 5]));
  assert(scan.recentResponses.every(event => event.status === "known-skus" && event.addedCount === 0));
  for (const forbidden of ["private-history-body", "private-secret", "account-secret", "private@example.test", "query", "private-fragment", "secret="]) {
    assert(!storage.get(SCAN_KEY).includes(forbidden));
  }
});

test("catatan pemindaian lama tetap lama hingga respons aktual membuat kejadian diagnostik baru", () => {
  const old = {
    schemaVersion: 1, version: "g1-acq-v7.1", updatedAt: "2026-11-23T07:40:18.464Z",
    scannedResponses: 5, matchedResponses: 1,
    skus: [{ id: SOURCE, count: 4, lastSeen: "2026-11-23T07:40:06.325Z" }]
  };
  const storage = new Map([[SCAN_KEY, JSON.stringify(old)]]);
  const before = storage.get(SCAN_KEY);
  let data = JSON.parse(run("g1-sku-report.js", { url: REPORT + "?format=json", storage }).payload.response.body);
  assert.equal(data.scan.version, "g1-acq-v7.1");
  assert.deepEqual(data.scan.recentResponses, []);
  assert.equal(data.scan.scannedResponses, 5);
  assert.equal(storage.get(SCAN_KEY), before);
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes("Catatan pengumpulan lama; belum menyimpan catatan respons pengumpulan versi ini"));
  run("g1-acq.js", { url: "https://one.google.com/plans", body: SOURCE, storage });
  data = JSON.parse(run("g1-sku-report.js", { url: REPORT + "?format=json", storage }).payload.response.body);
  assert.equal(data.scan.version, "g1-acq-v7.6");
  assert.equal(data.scan.scannedResponses, 6);
  assert.equal(data.scan.matchedResponses, 2);
  assert.equal(data.scan.skus.length, 1);
  assert.equal(data.scan.skus[0].count, 5);
  assert.equal(data.scan.recentResponses.length, 1);
  assert.equal(data.scan.recentResponses[0].status, "known-skus");
  assert.equal(data.scan.recentResponses[0].addedCount, 0);
});

test("ekspor aktivitas menolak metadata rusak dan mengecualikan field ekstra yang tidak tepercaya", () => {
  const event = {
    at: "2026-11-23T07:40:06.325Z", path: "/plans", bodyType: "text", status: "known-skus",
    candidateCount: 2, addedCount: 0, omittedCount: 0, body: "private-body", query: "private-token"
  };
  const storage = new Map([[SCAN_KEY, JSON.stringify({
    schemaVersion: 1, version: "g1-acq-v7.6",
    recentResponses: [event, { ...event, at: "<script>private</script>" }, { ...event, status: "constructor" }, { ...event, bodyType: "unknown" }]
  })]]);
  const result = run("g1-sku-report.js", { url: REPORT + "?format=json", storage });
  const data = JSON.parse(result.payload.response.body);
  assert.deepEqual(data.scan.recentResponses, [{
    at: event.at, path: event.path, bodyType: "text", status: "known-skus", candidateCount: 2, addedCount: 0, omittedCount: 0
  }]);
  assert(!result.payload.response.body.includes("private"));
});

test("kesalahan penyimpanan tidak menghalangi respons yang cocok untuk diselesaikan", () => {
  for (const flags of [{ storageAvailable: false }, { storageThrows: true }, { storageWriteFails: true }]) {
    const result = run("g1-acq.js", { body: SOURCE, ...flags });
    assert.equal(result.payload.body, TARGET);
  }
});

test("catatan pengujian menghilangkan cookie, header, dan data respons lengkap", () => {
  const result = run("g1-acq.js", { body: JSON.stringify({ sku: SOURCE, email: "private@example.test" }) });
  const saved = result.storage.get(TEST_KEY);
  assert(!saved.includes("private@example.test"));
  assert(!saved.includes("secret"));
  assert.deepEqual(result.reads, [SCAN_KEY]);
  assert(!result.storage.get(SCAN_KEY).includes("private@example.test"));
  assert(!result.storage.get(SCAN_KEY).includes("secret"));
});

test("pengumpul menemukan ID dan titik yang di-escape sambil mempertahankan respons", () => {
  const body = JSON.stringify([
    SOURCE, SOURCE, TARGET, "com.google.one.2tb.fixture.iog", "private@example.test"
  ]) + String.raw` "g1\u002eios\u002e2tb\u002eescaped" "g1&#46;2tb&#46;html"`;
  const result = run("g1-sku-scan.js", { body });
  assert.deepEqual(result.payload, {});
  const state = get(result.storage, SCAN_KEY);
  assert.equal(state.scannedResponses, 1);
  assert.equal(state.matchedResponses, 1);
  assert.equal(state.skus.length, 5);
  assert.equal(state.skus.find(row => row.id === SOURCE).count, 2);
  assert(state.skus.some(row => row.id === "g1.ios.2tb.escaped"));
  assert(state.skus.some(row => row.id === "g1.2tb.html"));
  assert(!JSON.stringify(state).includes("private@example.test"));
  assert(!JSON.stringify(state).includes("secret"));
});

test("pengumpul mengakumulasi catatan sebelumnya dan memulihkan penyimpanan yang rusak", () => {
  const storage = new Map([[SCAN_KEY, "corrupt JSON"]]);
  run("g1-sku-scan.js", { body: SOURCE, storage });
  run("g1-sku-scan.js", { url: "https://one.google.com/plans", body: SOURCE + " " + TARGET, storage });
  const state = get(storage, SCAN_KEY);
  assert.equal(state.scannedResponses, 2);
  assert.equal(state.skus.length, 2);
  assert.equal(state.skus.find(row => row.id === SOURCE).count, 2);
});

test("pengumpul membatasi kandidat tersimpan pada 300 dan tetap menghitung ID yang sudah ada", () => {
  const body = Array.from({ length: 305 }, (_, index) => "g1.fixture." + index).join(" ");
  const result = run("g1-sku-scan.js", { body });
  assert.equal(get(result.storage, SCAN_KEY).skus.length, 300);
  assert.equal(get(result.storage, SCAN_KEY).truncated, true);
  run("g1-sku-scan.js", { body: "g1.fixture.0", storage: result.storage });
  assert.equal(get(result.storage, SCAN_KEY).skus.find(row => row.id === "g1.fixture.0").count, 2);
});

test("pengumpul melewati laporan lokal, domain lain, dan isi non-teks", () => {
  for (const options of [
    { url: REPORT, body: SOURCE },
    { url: REPORT + "?format=json", body: SOURCE },
    { url: REPORT + "/", body: SOURCE },
    { url: REPORT + "/?format=json", body: SOURCE },
    { url: "https://one.google.com.evil/ai?x=1", body: SOURCE },
    { body: undefined }, { body: new Uint8Array([1, 2]) }
  ]) {
    const result = run("g1-sku-scan.js", options);
    assert.deepEqual(result.payload, {});
    assert.equal(result.storage.size, 0);
  }
});

test("pengumpul melewatkan respons saat penyimpanan gagal", () => {
  const result = run("g1-sku-scan.js", { body: SOURCE, storageThrows: true });
  assert.deepEqual(result.payload, {});
  assert(result.logs.some(line => line.includes("saved=no")));
});

test("laporan menampilkan ID tertangkap dan sumber pengujian tanpa aset eksternal", () => {
  const storage = new Map();
  run("g1-sku-scan.js", { body: SOURCE, storage });
  run("g1-acq.js", { body: SOURCE, storage });
  const { payload } = run("g1-sku-report.js", { url: REPORT, storage });
  assert.equal(payload.response.status, 200);
  assert.match(payload.response.body, /Laporan Lokal SKU Google One/);
  assert(payload.response.body.includes(SOURCE));
  assert(payload.response.body.includes(TARGET));
  assert(payload.response.body.includes("Skrip lokal telah mengambil alih · v7.6.0"));
  assert.match(payload.response.body, /<button\b[^>]*name=format[^>]*value=json[^>]*>Ekspor JSON<\/button>/);
  assert(!/<(?:script|img|iframe)\b/i.test(payload.response.body));
  assert.equal(payload.response.headers["Cache-Control"], "no-store");
});

test("formulir ekspor laporan mengarah ke lampiran JSON dan mendukung garis miring akhir", () => {
  const storage = new Map();
  run("g1-acq.js", { body: SOURCE, storage });
  const html = run("g1-sku-report.js", { url: REPORT + "/", storage }).payload.response.body;
  const action = html.match(/<form method=get action="([^"]+)"><button type=submit name=format value=json>/);
  assert(action, "tombol ekspor yang terlihat harus mengirimkan formulir GET");
  const url = new URL(action[1]);
  url.searchParams.set("format", "json");
  assert.equal(url.href, REPORT + "?format=json");
  for (const exportURL of [url.href, REPORT + "/?format=json"]) {
    const result = run("g1-sku-report.js", { url: exportURL, storage });
    assert.equal(result.payload.response.status, 200);
    assert.equal(result.payload.response.headers["Content-Disposition"], 'attachment; filename="g1-sku-report.json"');
    assert.equal(result.payload.response.headers["X-G1-Report-Version"], "v7.6.0");
    const data = JSON.parse(result.payload.response.body);
    assert.equal(data.reportVersion, "v7.6.0");
    assert.equal(data.configuredTarget, TARGET);
    assert.equal(data.test.target, TARGET);
    assert.equal(data.test.targetOrigin, "user-specified");
    assert.equal(data.scan.skus[0].id, SOURCE);
    assert.equal(data.test.matchedFrom[0].to, TARGET);
    assert(result.logs.some(line => line.includes("[g1-sku-report] v7.6.0 json")));
  }
});

test("laporan mengekspor setiap target aktual dan memisahkan hit tahunan dari total hit", () => {
  const storage = new Map();
  run("g1-acq.js", {
    body: JSON.stringify([SOURCE, TWENTY, THIRTY, THIRTY_FALLBACK]), storage
  });
  const result = run("g1-sku-report.js", { url: REPORT + "?format=json", storage });
  const data = JSON.parse(result.payload.response.body).test;
  assert.equal(data.version, "g1-acq-v7.6");
  assert.equal(data.hitCount, 3);
  assert.equal(data.annualHitCount, 1);
  assert.equal(data.matchedFrom.find(row => row.id === TWENTY).to, TWENTY_TARGET);
  assert.deepEqual(data.matchedFrom.find(row => row.id === THIRTY), {
    id: THIRTY, count: 1, to: THIRTY_FALLBACK, fallback: true
  });
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes("Pemetaan Tiga Tingkat Terakhir"));
  assert(html.includes("Di antaranya 2TB: 1"));
  assert(html.includes(TWENTY_TARGET));
  assert(html.includes(THIRTY_FALLBACK));
  assert(html.includes(THIRTY_FALLBACK + "</code></td><td>90p</td>"));
  assert(html.includes("mendukung uji coba gratis 1 bulan Ultra"));
});

test("laporan mempertahankan cadangan 75p historis dan membedakan default 90p lama", () => {
  const previous = {
    schemaVersion: 1, version: "g1-acq-v7.5", target: TARGET, targetOrigin: "user-specified",
    hitCount: 2, annualHitCount: 0, status: "rewritten",
    matchedFrom: [
      { id: TWENTY, to: LEGACY_TWENTY_FALLBACK, count: 1, fallback: true },
      { id: THIRTY, to: THIRTY_FALLBACK, count: 1, fallback: false }
    ]
  };
  const before = JSON.stringify(previous);
  const storage = new Map([[TEST_KEY, before]]);
  const result = run("g1-sku-report.js", { url: REPORT + "?format=json", storage });
  const data = JSON.parse(result.payload.response.body).test;
  assert.equal(data.version, previous.version);
  assert.deepEqual(data.matchedFrom, previous.matchedFrom);
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes(LEGACY_TWENTY_FALLBACK + "</code></td><td>75p</td>"));
  assert(html.includes(THIRTY_FALLBACK + "</code></td><td>Tidak</td>"));
  assert.equal(storage.get(TEST_KEY), before);
});

test("laporan tidak mengarang diskon untuk cadangan yang targetnya tidak tercatat", () => {
  const storage = new Map([[TEST_KEY, JSON.stringify({
    schemaVersion: 1, version: "g1-acq-v7.5", matchedFrom: [{ id: TWENTY, count: 1, fallback: true }]
  })]]);
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes("<code>Tidak tercatat</code></td><td>Ya</td>"));
});

test("laporan baru menampilkan catatan v1 yang ada dengan target 2TB aslinya", () => {
  const storage = new Map([[TEST_KEY, JSON.stringify({
    schemaVersion: 1, version: "pro-annual-test-v1", hitCount: 2, status: "rewritten",
    matchedFrom: [{ id: SOURCE, count: 2 }]
  })]]);
  const result = run("g1-sku-report.js", { url: REPORT + "?format=json", storage });
  const data = JSON.parse(result.payload.response.body).test;
  assert.equal(data.version, "pro-annual-test-v1");
  assert.equal(data.hitCount, 2);
  assert.equal(data.annualHitCount, 2);
  assert.equal(data.target, LEGACY_TARGET);
  assert.equal(data.targetOrigin, "legacy");
  assert.deepEqual(data.matchedFrom, [{ id: SOURCE, count: 2, to: LEGACY_TARGET, fallback: false }]);
  storage.set(TEST_KEY, JSON.stringify({
    schemaVersion: 1, version: "pro-annual-test-v1", hitCount: 0,
    status: "no-match", matchedFrom: []
  }));
  const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
  assert(html.includes("Catatan v1 lama: respons ini tidak cocok dengan prefiks iOS 2TB"));
});

test("laporan mempertahankan target dan asal v7.1 hingga v7.5 secara independen dari konfigurasi saat ini", () => {
  for (const prior of [
    { version: "g1-acq-v7.1", target: LEGACY_TARGET, origin: "legacy" },
    { version: "g1-acq-v7.2", target: "g1.2tb.ai.annual.3months_ip_90p.acq", origin: "pattern-derived" },
    { version: "g1-acq-v7.3", target: "g1.2tb.ai.annual_ip_90p.acq", origin: "user-specified" },
    { version: "g1-acq-v7.4", target: "g1.2tb.ai.annual_ip_90p.acq", origin: "user-specified" },
    { version: "g1-acq-v7.5", target: TARGET, origin: "user-specified" }
  ]) {
    const record = {
      schemaVersion: 1, version: prior.version, target: prior.target,
      status: "rewritten", hitCount: 9, annualHitCount: 9,
      matchedFrom: [{ id: "g1.ios.2tb.ai.a", to: prior.target, count: 9, fallback: false }]
    };
    if (prior.origin !== "legacy") record.targetOrigin = prior.origin;
    const storage = new Map([[TEST_KEY, JSON.stringify(record)]]);
    const before = storage.get(TEST_KEY);
    const data = JSON.parse(run("g1-sku-report.js", { url: REPORT + "?format=json", storage }).payload.response.body);
    assert.equal(data.configuredTarget, TARGET);
    assert.equal(data.test.version, prior.version);
    assert.equal(data.test.target, prior.target);
    assert.equal(data.test.targetOrigin, prior.origin);
    assert.equal(data.test.matchedFrom[0].to, prior.target);
    assert.equal(storage.get(TEST_KEY), before);
    const html = run("g1-sku-report.js", { url: REPORT, storage }).payload.response.body;
    assert(html.includes("Target kandidat 2TB yang dikonfigurasi saat ini: <code>" + TARGET + "</code>"));
    assert(html.includes("Target 2TB pada catatan ini: <code>" + prior.target + "</code>"));
  }
  const empty = JSON.parse(run("g1-sku-report.js", { url: REPORT + "?format=json" }).payload.response.body);
  assert.equal(empty.configuredTarget, TARGET);
  assert.equal(empty.test.target, "");
  assert.equal(empty.test.targetOrigin, "");
  assert.equal(empty.test.status, "");
});

test("ekspor JSON dibatasi pada field laporan dan meng-escape teks HTML tidak tepercaya", () => {
  const storage = new Map([[SCAN_KEY, JSON.stringify({
    schemaVersion: 1, updatedAt: "<script>fixture</script>", scannedResponses: 1,
    secret: "must-not-export", body: "must-not-export",
    skus: [{ id: SOURCE, count: 2, lastSeen: "<img src=x>", secret: "must-not-export" }]
  })]]);
  const jsonResult = run("g1-sku-report.js", { url: REPORT + "?format=json", storage });
  assert.match(jsonResult.payload.response.headers["Content-Type"], /application\/json/);
  const report = JSON.parse(jsonResult.payload.response.body);
  assert.equal(report.scan.skus[0].id, SOURCE);
  assert(!jsonResult.payload.response.body.includes("must-not-export"));
  const htmlResult = run("g1-sku-report.js", { url: REPORT, storage });
  assert(!htmlResult.payload.response.body.includes("<script>fixture"));
  assert(htmlResult.payload.response.body.includes("&lt;img src=x&gt;"));
});

test("aksi bersihkan hanya memengaruhi dua kunci penyimpanan milik alat ini", () => {
  const storage = new Map([
    [SCAN_KEY, JSON.stringify({ schemaVersion: 1, skus: [{ id: SOURCE, count: 1 }] })],
    [TEST_KEY, JSON.stringify({ schemaVersion: 1, hitCount: 1 })],
    ["other-tool", "untouched"]
  ]);
  const result = run("g1-sku-report.js", { url: REPORT + "?clear=1", storage });
  assert.deepEqual(get(storage, SCAN_KEY), {});
  assert.deepEqual(get(storage, TEST_KEY), {});
  assert.equal(storage.get("other-tool"), "untouched");
  assert.deepEqual(new Set(result.reads), new Set([SCAN_KEY, TEST_KEY]));
});

test("laporan menangani penyimpanan tidak tersedia dan melewati path URL lainnya", () => {
  const unavailable = run("g1-sku-report.js", { url: REPORT + "?format=json", storageAvailable: false });
  assert.equal(JSON.parse(unavailable.payload.response.body).storageAvailable, false);
  for (const url of ["https://one.google.com/ai?x=1", REPORT + "-other", "https://example.test/g1-sku-report"]) {
    const result = run("g1-sku-report.js", { url });
    assert.deepEqual(result.payload, {});
    assert.deepEqual(result.reads, []);
  }
});

test("pemasang baru menggantikan entri lama dan seluruh modul berbagi satu rilis tetap", () => {
  assert.equal(fs.existsSync(path.join(root, "g1-acq.sgmodule")), false);
  let scriptBase;
  for (const file of ["g1-acq-v7.sgmodule", "g1-pro-annual-test.sgmodule", "g1-sku-scan.sgmodule"]) {
    const module = fs.readFileSync(path.join(root, file), "utf8");
    const scripts = module.split("\n").filter(line => line.includes("script-path="));
    assert.equal(scripts.length, 2);
    if (file === "g1-acq-v7.sgmodule") assert.match(module, /^#!name=G1 ACQ$/m);
    for (const script of scripts) {
      const url = script.match(/script-path=([^,\s]+)/)[1];
      assert.match(url, /^https:\/\/cdn\.jsdelivr\.net\/gh\/somaylab\/g1-acq@v7\.6\.0\/[a-z0-9.-]+\.js$/);
      const base = url.slice(0, url.lastIndexOf("/") + 1);
      if (!scriptBase) scriptBase = base;
      assert.equal(base, scriptBase);
      assert(fs.existsSync(path.join(root, url.split("/").at(-1))));
    }
    assert.match(module, /hostname = %APPEND% one\.google\.com/);
    const responseLine = scripts.find(line => line.includes("type=http-response"));
    const pattern = new RegExp(responseLine.match(/pattern=([^,]+)/)[1]);
    assert(pattern.test("https://one.google.com/ai?x=1"));
    assert(!pattern.test("https://one.google.com.evil/ai?x=1"));
    assert.equal(pattern.test("https://one.google.com/plans"), file !== "g1-pro-annual-test.sgmodule");
    assert.equal(pattern.test("https://one.google.com/ai"), file !== "g1-pro-annual-test.sgmodule");
    if (file !== "g1-sku-scan.sgmodule") {
      assert.equal(responseLine.match(/script-path=([^,\s]+)/)[1],
        scriptBase + "g1-acq.js");
    }
    const requestLine = scripts.find(line => line.includes("type=http-request"));
    assert.equal(requestLine.match(/script-path=([^,\s]+)/)[1],
      scriptBase + "g1-sku-report.js");
    const reportPattern = new RegExp(requestLine.match(/pattern=([^,]+)/)[1]);
    for (const url of [REPORT, REPORT + "?format=json", REPORT + "/", REPORT + "/?format=json"]) {
      assert(reportPattern.test(url));
    }
    for (const url of [REPORT + "-other", REPORT + "/other", "https://one.google.com.evil/g1-sku-report"]) {
      assert(!reportPattern.test(url));
    }
  }
});
