/* Laporan khusus lokal yang disajikan oleh skrip http-request Shadowrocket.
 * Penulis Asli: crhywun | Penerjemah Bahasa Indonesia: Somaylab (@somaylab) */
"use strict";

(function () {
  var ROOT = "https://one.google.com/g1-sku-report";
  var VERSION = "v7.6.0";
  var COLLECTOR_VERSION = "g1-acq-v7.6";
  var CONFIGURED_TARGET = "g1.2tb.ai.12months_ip_90p";
  var LEGACY_TARGET = "g1.2tb.ai.annual";
  var SCAN_KEY = "g1.sku.scan.v1";
  var TEST_KEY = "g1.pro.annual.test.v1";
  var url = typeof $request === "object" && $request ? $request.url : "";
  if (typeof url !== "string" || !/^https:\/\/one\.google\.com\/g1-sku-report\/?(?:\?|$)/.test(url)) {
    $done({});
    return;
  }

  var storageAvailable = typeof $persistentStore !== "undefined" &&
    typeof $persistentStore.read === "function";
  var clearMessage = "";
  if (/(?:\?|&)clear=1(?:&|$)/.test(url)) {
    try {
      var scanCleared = $persistentStore.write("{}", SCAN_KEY);
      var testCleared = $persistentStore.write("{}", TEST_KEY);
      clearMessage = scanCleared && testCleared ? "Kedua catatan lokal alat ini telah dibersihkan." : "Pembersihan catatan lokal belum selesai.";
    } catch (error) {
      clearMessage = "Antarmuka penyimpanan lokal belum siap.";
    }
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
  function count(value) {
    var number = Number(value);
    return isFinite(number) && number > 0 ? Math.floor(number) : 0;
  }
  function sku(value) {
    return typeof value === "string" && /^g1\.[A-Za-z0-9._-]{1,160}$/.test(value) ? value : "";
  }
  function rows(value, withTime, defaultTarget) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 300).filter(function (row) {
      return row && typeof row.id === "string" &&
        /^(?:g1\.|com\.google\.one\.)[A-Za-z0-9._-]{1,160}$/.test(row.id);
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
    "new-skus": "Menemukan dan mencatat ID baru",
    "known-skus": "Menerima respons, ID duplikat dengan catatan yang ada",
    "no-skus": "Menerima respons teks, tidak ada ID produk kali ini",
    "limit-reached": "Menerima ID baru, batas kapasitas pengumpulan tercapai",
    "non-text": "Menerima respons, isi bukan teks yang dapat dipindai"
  };
  var scanPaths = ["/", "/ai", "/plans", "/_/…/data/batchexecute", "[Path one.google.com lainnya]"];
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
        path: scanPaths.indexOf(event.path) !== -1 ? event.path : "[Path one.google.com lainnya]",
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
  if (!recordedTarget) {
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
  var targetOrigin = recordedTarget && /^(?:user-specified|pattern-derived|legacy)$/.test(storedOrigin) ?
    storedOrigin : recordedTarget === CONFIGURED_TARGET ? "user-specified" :
      recordedTarget === LEGACY_TARGET ? "legacy" : "";
  var report = {
    schemaVersion: 1,
    reportVersion: VERSION,
    configuredTarget: CONFIGURED_TARGET,
    storageAvailable: storageAvailable,
    scan: {
      version: text(scanRaw.version, 32),
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
      updatedAt: text(testRaw.updatedAt, 32),
      sourcePrefix: "g1.ios.2tb.",
      target: recordedTarget,
      targetOrigin: targetOrigin,
      status: text(testRaw.status, 32),
      hitCount: count(testRaw.hitCount),
      annualHitCount: annualHitCount,
      matchedFrom: matchedFrom
    }
  };

  var headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-G1-Report-Version": VERSION,
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
  };
  var exportJSON = /(?:\?|&)format=json(?:&|$)/.test(url);
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
      (withTime ? "<th>Waktu Terakhir Ditemukan (UTC)</th>" : "<th>SKU Target Aktual</th><th>Tingkat Cadangan</th>") + "</tr></thead><tbody>" +
      items.map(function (row) {
        return "<tr><td><code>" + escape(row.id) + "</code></td><td>" + row.count + "</td>" +
          (withTime ? "<td>" + escape(row.lastSeen) + "</td>" :
            "<td><code>" + escape(row.to || "Tidak tercatat") + "</code></td><td>" + fallbackName(row) + "</td>") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }
  function recentTable(events) {
    if (!events.length) return "<p>Belum ada catatan respons per kejadian; data pengumpulan versi lama tidak memiliki diagnostik ini.</p>";
    return "<div class=scroll><table><thead><tr><th>Waktu (UTC)</th><th>Kategori Path</th><th>Hasil Kali Ini</th><th>ID Teridentifikasi</th><th>Baru Dicatat</th><th>ID di Luar Kapasitas</th></tr></thead><tbody>" +
      events.slice().reverse().map(function (event) {
        return "<tr><td>" + escape(event.at) + "</td><td>" + escape(event.path) +
          "</td><td>" + scanStatuses[event.status] + "</td><td>" + event.candidateCount +
          "</td><td>" + event.addedCount + "</td><td>" + event.omittedCount + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  var latestScan = report.scan.recentResponses.length ?
    report.scan.recentResponses[report.scan.recentResponses.length - 1] : null;
  var scanVersionStatus = report.scan.version === COLLECTOR_VERSION ?
    "Catatan berasal dari skrip pengumpul versi ini; gunakan waktu respons dan hitungan untuk menilai apakah ada catatan baru." :
    report.scan.version ? "Catatan pengumpulan lama; belum menyimpan catatan respons pengumpulan versi ini." : "Belum menyimpan catatan respons pengumpulan versi ini.";
  var statuses = {
    "rewritten": "Penggantian string telah dijalankan",
    "no-match": "Respons ini tidak cocok dengan produk sumber dalam pemetaan tiga tingkat",
    "non-text": "Respons ini tidak memiliki isi teks yang dapat diproses"
  };
  var status = Object.prototype.hasOwnProperty.call(statuses, report.test.status) ?
    statuses[report.test.status] : "Belum ada catatan eksekusi pengujian";
  if (report.test.version === "pro-annual-test-v1" && report.test.status === "no-match") {
    status = "Catatan v1 lama: respons ini tidak cocok dengan prefiks iOS 2TB";
  }
  var html = [
    "<!doctype html><html lang=id><meta charset=utf-8>",
    "<meta name=viewport content=\"width=device-width,initial-scale=1\"><title>Laporan Lokal SKU Google One</title>",
    "<style>body{font:16px/1.6 -apple-system,BlinkMacSystemFont,sans-serif;max-width:960px;margin:24px auto;padding:0 18px;color:#1c2737;background:#f5f7fa}section{background:white;border:1px solid #dde3ec;border-radius:12px;padding:18px;margin:18px 0}h1{font-size:24px;margin-bottom:10px}h2{font-size:20px}code{overflow-wrap:anywhere}a{color:#1259be}table{border-collapse:collapse;width:100%;font-size:14px}td,th{padding:9px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}.scroll{overflow:auto}.note{color:#46556b}.badge{display:inline-block;background:#e0f4e8;color:#176238;padding:4px 10px;border-radius:8px}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:20px 0}.actions form{margin:0}button,.actions a{font:inherit;padding:10px 16px;border:0;border-radius:8px;cursor:pointer;text-decoration:none}.actions a{background:#e4eaf3}.actions button{background:#1259be;color:white}button{background:#e4eaf3;color:#1c2737}</style>",
    "<h1>Laporan Lokal SKU Google One</h1>",
    "<p class=badge>Skrip lokal telah mengambil alih · " + VERSION + "</p>",
    "<nav class=actions aria-label=\"Aksi Laporan\"><form method=get action=\"" + ROOT + "\"><button type=submit name=format value=json>Ekspor JSON</button></form><a href=\"" + ROOT + "\">Muat Ulang Laporan</a></nav>",
    "<p class=note>Halaman ini dibuat oleh Shadowrocket di perangkat ini; bilah alamat tetap menggunakan one.google.com dan catatan pengumpulan disimpan secara lokal di perangkat.</p>",
    "<p class=note>Cukup aktifkan satu modul G1 ACQ saja: kumpulkan ID dari respons asli terlebih dahulu, lalu jalankan penulisan ulang tiga tingkat.</p>",
    clearMessage ? "<p>" + escape(clearMessage) + "</p>" : "",
    storageAvailable ? "" : "<p>Antarmuka penyimpanan lokal belum siap; halaman ini belum dapat membaca catatan pengumpulan.</p>",
    "<section><h2>Catatan Aktivitas Pengumpulan</h2>",
    "<p>Skrip pengumpul aktual: <code>" + escape(report.scan.version || "Belum ada catatan") + "</code><br>" + scanVersionStatus + "</p>",
    "<p>Respons teks dipindai: " + report.scan.scannedResponses + "; respons non-teks tercatat: " + report.scan.nonTextResponses +
      "; respons berisi ID produk: " + report.scan.matchedResponses + "; total ID terkumpul: " + report.scan.skus.length + "</p>",
    "<p>Waktu penyimpanan terakhir (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p>",
    latestScan ? "<p><strong>Kejadian terakhir: " + scanStatuses[latestScan.status] + "</strong><br>Mengidentifikasi " +
      latestScan.candidateCount + " ID berbeda, baru dicatat " + latestScan.addedCount + ", di luar kapasitas " + latestScan.omittedCount + ".</p>" : "",
    "<p class=note>Daftar kumulatif dideduplikasi berdasarkan ID; saat ID yang sama diterima lagi, jumlah kemunculan diperbarui dan jumlah baris daftar tetap sama. Catat jumlah dan waktu terlebih dahulu, buka kembali halaman paket di Google App, lalu muat ulang laporan ini untuk membandingkan.</p>",
    "<h3>10 Respons Terakhir</h3>", recentTable(report.scan.recentResponses),
    "<p class=note>Jika hitungan bertambah dan menampilkan ID duplikat, artinya respons telah diterima; jika waktu dan hitungan tetap sama, berarti belum ada catatan respons baru yang cocok—periksa cache halaman, sakelar modul, dekripsi HTTPS, domain permintaan, dan <code>saved=no</code> pada log skrip. Path hanya disimpan sebagai kategori.</p></section>",
    "<section><h2>Pemetaan Tiga Tingkat Terakhir</h2>",
    "<p>Target kandidat 2TB yang dikonfigurasi saat ini: <code>" + CONFIGURED_TARGET + "</code></p>",
    "<p class=note>Versi ini menguji ID 12months_ip_90p yang ditentukan, dengan target lengkap berakhiran _ip_90p; periksa produk aktual, harga, dan siklus penagihan di panel pembelian App Store.</p>",
    "<p>Versi: " + escape(report.test.version || "Belum ada") + "<br>Status: " + escape(status) + "; total penggantian: " + report.test.hitCount + "; Di antaranya 2TB: " + report.test.annualHitCount + "</p>",
    "<p>Prefiks sumber 2TB: <code>g1.ios.2tb.</code><br>Target 2TB pada catatan ini: <code>" + escape(report.test.target || "Belum ada catatan") + "</code><br>Saat ini 20TB / 30TB mendukung uji coba gratis 1 bulan Ultra (1month_eft), dengan 90p tiga bulan sebagai cadangan; tabel di bawah mempertahankan target aktual dan tingkat cadangan pada catatan tersebut, sementara catatan riwayat 75p ditampilkan apa adanya.<br>Waktu eksekusi (UTC): " + escape(report.test.updatedAt || "Belum ada") + "</p>",
    "<p class=note>Yang tercatat di sini adalah hasil eksekusi skrip; apakah produk dikenali oleh App Store, harga, dan siklusnya harus dilihat pada panel pembelian.</p>",
    table(report.test.matchedFrom, false), "</section>",
    "<section><h2>Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman</h2>",
    "<p>Total ID terkumpul: " + report.scan.skus.length + "; ID yang sama digabung hitungannya, sedangkan status penambahan baru dan duplikat per respons dapat dilihat pada catatan aktivitas pengumpulan di atas.</p>",
    "<p class=note>ID diekstrak dari respons asli sebelum penulisan ulang, bukan katalog lengkap toko; target pengganti yang dihasilkan skrip tidak otomatis masuk ke daftar ini.</p>",
    report.scan.truncated ? "<p>Catatan telah mencapai batas 300 item; setelah dibersihkan, halaman target dapat dikumpulkan ulang.</p>" : "",
    table(report.scan.skus, true),
    "<p>Waktu pembaruan (UTC): " + escape(report.scan.updatedAt || "Belum ada") + "</p></section>",
    "<form method=get action=\"" + ROOT + "\"><button name=clear value=1>Bersihkan Catatan Pengumpulan & Pengujian Alat Ini</button></form>",
    "<p class=note>Muat ulang halaman ini setelah melihat paket untuk memeriksa catatan; nonaktifkan pengumpul terpisah dan salinan penulisan ulang lama untuk menghindari pencatatan ganda.</p>",
    "<p class=note>Penulis asli: <code>crhywun</code> · Terjemahan Bahasa Indonesia: <code>Somaylab</code></p></html>"
  ].join("");
  $done({ response: { status: 200, headers: headers, body: html } });
})();
