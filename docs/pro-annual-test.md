# Pengelolaan SKU Google One, Uji Promo 12 Bulan Pro, dan Pengumpulan

**Modul utama v7.12.4 adalah `Manajemen SKU G1 ACQ`, dengan versi runtime respons `g1-acq-v7.12-mappings`.** [Laporan Lokal](https://one.google.com/g1-sku-report) menyediakan **lima templat pemetaan siap pakai**: Promo Pro 99p (`pro-1yuan`), Turki 20TB (`tr-ultra-20tb`), Turki 30TB (`tr-ultra-30tb`), Ultra 75p (`ultra-75p`), dan 2TB / Pro 12 Bulan 90p (`pro-12months-90p`). **Templat Pro 99p memakai awalan `g1.ios.2tb.` -> `com.google.gemini.2tb.ai.m.3month_ip_99p`, sementara Turki 20TB memakai `exact` `g1.ios.20tb.m.v2` -> `g1.ios.20tb.m` (catatan publik 1989.99 TRY); keduanya dapat digunakan bersamaan.** Pemasangan atau upgrade mempertahankan konfigurasi lama; pengguna perlu membuka laporan dan mengklik **Terapkan Templat** untuk menyimpan aturan terkait. Menerapkan Pro 99p turut menonaktifkan aturan warisan `exact` 20TB -> target Gemini yang sama secara atomik sambil mempertahankan target 20TB lain, lalu masuk kembali lewat **halaman paket Pro sendiri**.

Mode bawaan `discount75` mempertahankan tiga pemetaan awal: 20TB / 30TB 3 bulan `75p` serta target 2TB `g1.2tb.ai.12months_ip_90p` (tanpa `.acq`); setelah menerapkan templat atau menyimpan manual, mode menjadi `custom` (meskipun targetnya sama dengan bawaan). **75p = diskon 75%, bayar 25%**; baris yang cocok pada versi ini memakai `fallback=false`. Pemetaan uji coba historis berasal dari [GitHub PR #3](https://github.com/crhywun/g1-acq/pull/3) ([@cehomecambodia-lang](https://github.com/cehomecambodia-lang)), sedangkan target `com.google.gemini.2tb.ai.m.3month_ip_99p` berasal dari [GitHub PR #8](https://github.com/crhywun/g1-acq/pull/8) ([@duwqijlk](https://github.com/duwqijlk)).

Pengumpulan hanya membaca respons asli yang cocok dan benar-benar diterima ponsel, serta **tidak melakukan query seluruh katalog SKU secara aktif**. Maksimal menyimpan 300 ID (`g1.*`, `com.google.one.*`, `com.google.gemini.*`) dan 10 kejadian respons tersanitasi terakhir dalam waktu UTC. Kemunculan ulang ID lama akan menambah hitungan; versi laporan saat ini dan versi catatan aktual ditampilkan terpisah sehingga upgrade tidak menimpa label historis.

## 1. Memasang dan Meng-upgrade Modul Utama

**Manajemen SKU G1 ACQ — Lima templat siap pakai & pemetaan manual lokal, mempertahankan bawaan 75p & target 2TB**

```text
https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.12.4/g1-acq-ultra-discount.sgmodule
```

| Item | Entri Utama Saat Ini |
|---|---|
| Mode saat ini | Bawaan `discount75`; setelah menerapkan templat atau simpan manual menjadi `custom` |
| Skrip respons | [g1-acq-discount.js](../g1-acq-discount.js), identik dengan [g1-acq.js](../g1-acq.js) |
| Versi runtime respons | `g1-acq-v7.12-mappings` |
| Skrip laporan | [g1-sku-report-discount.js](../g1-sku-report-discount.js), identik dengan [g1-sku-report.js](../g1-sku-report.js) |
| Versi laporan | `v7.12.4` |
| Penyimpanan lokal | Melanjutkan ketiga kunci schema 1 dari v7.9; templat tersimpan ke `g1.sku.mappings.v1` tanpa migrasi otomatis |

1. Matikan **G1 ACQ Ultra 75p**, **G1 ACQ**, **G1 ACQ Ultra 90p**, **G1 ACQ Ultra Trial**, **G1 SKU Scan** terpisah, **G1 Pro Annual Test**, maupun salinan penulisan ulang lama lainnya.
2. Tambahkan alamat `v7.12.4` di atas pada pengelolaan modul Shadowrocket dan aktifkan hanya **Manajemen SKU G1 ACQ**. Modul sudah memuat skrip respons dan laporan sehingga tidak perlu menambah skrip terpisah.
3. Sambungkan ulang Shadowrocket, buka [Laporan Lokal](https://one.google.com/g1-sku-report), pastikan tampil **Skrip lokal telah mengambil alih** dan **v7.12.4**, lalu klik **Terapkan Templat** pada kartu templat yang diinginkan (mis. Promo Pro 99p menonaktifkan aturan warisan 20TB -> Gemini secara atomik dan mengaktifkan awalan 2TB Pro).
4. Tutup halaman paket yang terbuka atau di-cache, lalu buka kembali halaman paket terkait di Google App (untuk Promo Pro 99p, masuk ke **halaman paket 2TB / Pro**).
5. Segarkan laporan lalu verifikasi **`test.version=g1-acq-v7.12-mappings`**, kesamaan `test.mappingRevision` dengan `mappingConfig.revision`, `test.updatedAt` terbaru, serta baris **`test.matchedFrom`** (`id` berawalan `g1.ios.2tb.` dan `to` adalah `com.google.gemini.2tb.ai.m.3month_ip_99p`).

Keempat modul menambahkan `requires-body=1,max-size=0` pada `http-request` laporan dan mem-pin seluruh 8 `script-path` internal ke `@v7.12.4`. Pencocokan respons, `[Rule]` pemblokiran global UDP 443, dan `[MITM]` (`%APPEND% one.google.com`) tetap dipertahankan. [g1-sku-scan.js](../g1-sku-scan.js) dan [g1-pro-annual-test.js](../g1-pro-annual-test.js) tetap mempertahankan implementasi historis terpisah (tanpa perluasan `com.google.gemini.*`).

## 2. Mengatur Dekripsi HTTPS

1. Aktifkan hanya `v7.12.4` **Manajemen SKU G1 ACQ** dari Bagian 1 dan pastikan VPN Shadowrocket terhubung.
2. Masuk ke **Halaman Config -> ikon (i) di kanan konfigurasi aktif -> HTTPS Decryption**, lalu aktifkan sakelarnya.
3. Jika sertifikat Shadowrocket belum terpasang/dipercaya, buat & pasang dari halaman tersebut lalu buka **Pengaturan iOS -> Umum -> VPN & Manajemen Perangkat** untuk memasang profilnya.
4. Buka **Pengaturan iOS -> Umum -> Mengenai -> Pengaturan Kepercayaan Sertifikat** dan aktifkan kepercayaan penuh root sertifikat Shadowrocket.
5. Pastikan `one.google.com` ada di daftar **Hostname HTTPS Decryption** konfigurasi aktif.
6. Sambungkan ulang Shadowrocket setiap kali mengubah sakelar modul, meng-upgrade modul, atau mengubah dekripsi HTTPS.

[Tangkapan layar entri konfigurasi](../docs-config-entry-example.png) menunjukkan ikon `(i)` pada konfigurasi aktif; [tangkapan layar paket Ultra](../docs-ultra-plans-example.png) menampilkan contoh pintu masuk 20TB lama.

## 3. Menjelajah Paket untuk Mengumpulkan SKU Asli Secara Pasif

Saat memproses respons `one.google.com/`, entri utama mengumpulkan teks asli terlebih dahulu sebelum mengecek `/ai?`. Pengumpul versi ini mengenali **`g1.*`**, **`com.google.one.*`**, dan **`com.google.gemini.*`**, serta mendekode `\u002e`, `\x2e`, `&#46;`, `&#x2e;`, dan `&period;` pada salinan penemuan tanpa memodifikasi respons. Maksimal menyimpan **300 ID unik** dan **10 kejadian** respons terbaru dalam waktu UTC (`new-skus`, `known-skus`, `no-skus`, `limit-reached`, `non-text`).

## 4. Menerapkan Templat Siap Pakai, Mengedit Aturan, dan Verifikasi Eksekusi

### 4.1 Lima Templat Pemetaan Siap Pakai (Simpan Sekali Klik)

Bagian **Templat Pemetaan Siap Pakai** di atas editor manual menampilkan 5 kartu secara berurutan:

| Urutan & ID Templat | Judul Kartu | Pencocokan & Pemetaan Lengkap |
|---|---|---|
| 1 · `pro-1yuan` | **Promo Pro Murah (3 Bulan Pertama Diskon 99%)** | Awalan `prefix`: `g1.ios.2tb.` -> `com.google.gemini.2tb.ai.m.3month_ip_99p` |
| 2 · `tr-ultra-20tb` | **Turki 20TB · Catatan 1989.99 Lira** | Persis `exact`: `g1.ios.20tb.m.v2` -> `g1.ios.20tb.m` |
| 3 · `tr-ultra-30tb` | **Turki 30TB · Catatan 2949.99 Lira** | Persis `exact`: `g1.ios.30tb.ai.pro.m` -> `g1.ios.30tb.m` |
| 4 · `ultra-75p` | **Ultra 20TB / 30TB · 3 Bulan 75p** | Persis `exact`: `g1.ios.20tb.m.v2` -> `g1.20tb.3months_ip_75p.acq`<br>Persis `exact`: `g1.ios.30tb.ai.pro.m` -> `g1.ai.ultra.3months_ip_75p.acq` |
| 5 · `pro-12months-90p` | **2TB / Pro · 12 Bulan 90p** | Awalan `prefix`: `g1.ios.2tb.` -> `g1.2tb.ai.12months_ip_90p` |

1. Klik **Terapkan Templat** mengirimkan POST asli dan mengembalikan `303` ke `?notice=preset` sehingga refresh tidak mengirim ulang. Pemasangan, upgrade, maupun GET tidak otomatis menerapkan templat.
2. Penggabungan mencari berdasarkan `(match, from)`: jika sudah ada, target diperbarui dan `enabled=true` dengan tetap mempertahankan `id` & urutan; jika belum ada, ditambahkan aturan baru ber-ID unik. Menerapkan `pro-1yuan` sekaligus menonaktifkan aturan warisan `exact` `g1.ios.20tb.m.v2` -> `com.google.gemini.2tb.ai.m.3month_ip_99p` (`enabled=false`), sedangkan target 20TB lainnya dipertahankan.
3. Menerapkan ulang templat yang sudah cocok tetap menghasilkan `revision` baru dan mode `custom` tanpa membuat aturan ganda. Label **Aturan saat ini cocok** mengecek aturan aktif saat ini (dan untuk `pro-1yuan` mensyaratkan aturan warisan 20TB -> Gemini dalam keadaan nonaktif).
4. Validasi batas **30 aturan** (termasuk aturan nonaktif) berjalan secara atomik: bila penuh 30 aturan, pembaruan baris yang sudah ada tetap sukses, sedangkan penambahan aturan ke-31 gagal penuh dengan `400` tanpa perubahan sebagian.
5. Konflik halaman usang / race sebelum penyimpanan mengembalikan `409`; kegagalan baca/tulis/baca-ulang penyimpanan mengembalikan `503`. Status `invalid` atau `unavailable` menonaktifkan tombol templat hingga konfigurasi dipulihkan/tersedia.

### 4.2 Editor Manual, Aturan Bawaan, dan Catatan Eksekusi

| Field Aturan | Ketentuan Pengisian & Pencocokan |
|---|---|
| `match` | `exact` mencocokkan sumber persis; `prefix` mencocokkan SKU lengkap berakhiran non-kosong |
| `from` | Sumber `exact` berupa ID lengkap `g1.*` / `com.google.one.*` / `com.google.gemini.*`; sumber `prefix` wajib diakhiri titik setelah namespace dan diikuti setidaknya 1 karakter sebelum titik |
| `to` | ID target lengkap (`g1.*` / `com.google.one.*` / `com.google.gemini.*`), tidak boleh diakhiri titik, tidak boleh sama dengan `from` |
| Karakter & Batas | 1–160 karakter `[A-Za-z0-9._-]` setelah namespace; input formulir memiliki `maxlength=178` untuk menampung namespace `com.google.gemini.` (18 karakter) + 160 karakter akhiran; spasi ujung dipangkas |
| `enabled` | Dicentang berarti aktif; aturan nonaktif tetap terhitung ke batas 30 dan cek duplikat |
| `id` | ID stabil yang dibuat lokal oleh alat dan dipertahankan saat edit atau penggabungan templat |

Aturan `exact` aktif diprioritaskan atas `prefix`; jika beberapa `prefix` cocok, dipilih yang terpanjang; setiap ID asal hanya diganti satu kali (`fallback=false`). Saat semua aturan dihapus atau dinonaktifkan, respons diteruskan tanpa perubahan. Catatan historis (`v7.1`–`v7.11`) tetap ditampilkan sesuai versi, mode, target, dan fallback aslinya tanpa backfill konfigurasi baru.

## 5. Halaman Pengelolaan Lokal, JSON, Penyimpanan, dan Pembersihan

[Laporan Lokal](https://one.google.com/g1-sku-report) bebas JavaScript dan aset eksternal, dilindungi CSP `form-action https://one.google.com/g1-sku-report`, menerima `Origin: https://one.google.com` & `Sec-Fetch-Site: same-origin`, serta menolak payload `> 20KB` UTF-8. Formulir templat hanya menerima 3 field (`action=preset`, `revision`, `preset`) dan menolak field tambahan/duplikat atau ID templat tak dikenal (`400`).

Tiga kunci lokal `$persistentStore` (`schemaVersion: 1`):
- `g1.sku.scan.v1`: Daftar SKU terkumpul (maks. 300) + 10 respons terakhir + counter.
- `g1.pro.annual.test.v1`: Eksekusi `/ai?` terakhir + `mappingRevision`, `mappingUpdatedAt`, `mappingStatus`.
- `g1.sku.mappings.v1`: `{schemaVersion: 1, revision, updatedAt, customized, rules}` (maks. 30 aturan).

`?clear=1` hanya mengosongkan dua kunci pertama dan **tidak menghapus pemetaan**; tombol **Pulihkan Pemetaan Bawaan** mengembalikan 3 aturan bawaan (`discount75`) dan **tidak menghapus riwayat**.

## 6. Mengumpulkan dan Memverifikasi SKU Tersembunyi di iOS Shadowrocket

1. Buka Google App dan jelajahi entri paket bulanan, tahunan, serta promo untuk mengumpulkan kandidat tersembunyi.
2. Di Safari ([Laporan Lokal](https://one.google.com/g1-sku-report)), terapkan templat atau pakai tautan pra-isi asal untuk membuat aturan baru.
3. Buka ulang halaman paket terkait (`Pro` untuk `pro-1yuan`, `20TB`/`30TB` untuk preset Ultra/Turki), lalu cek `test.version`, `test.mappingRevision`, `test.updatedAt`, dan `test.matchedFrom`.
4. Cek panel pembayaran StoreKit asli di App Store untuk memastikan nama produk, harga awal, harga perpanjangan, dan siklus tagihan aktual, lalu ekspor JSON.

## 7. Penilaian Hasil & Pemecahan Masalah Campuran Versi (v7.12.4)

Bila **laporan menampilkan `v7.12.4` tetapi memakai target `com.google.gemini.*` memunculkan `invalid` / `config-error`**:
1. Ekspor JSON terlebih dahulu untuk mencadangkan aturan dan cek `test.version`.
2. Pastikan hanya satu modul `@v7.12.4` aktif di Shadowrocket dan kedua `script-path` memakai `@v7.12.4` (skrip respons versi lama v7.10/sebelumnya belum mengenali namespace `com.google.gemini.*`). Sambungkan ulang VPN.
3. Buka laporan lokal, klik **Terapkan Templat** pada **Promo Pro Murah (`pro-1yuan`)**, tutup paksa Google App, masuk ulang ke halaman paket Pro, lalu segarkan laporan untuk memverifikasi `test.version=g1-acq-v7.12-mappings` dan `test.mappingRevision` cocok.
4. Jika kedua skrip sudah seragam `@v7.12.4` tetapi `mappingConfig.status` masih `invalid`, klik **Pulihkan Pemetaan Bawaan** lalu terapkan ulang templat.

## 8. Templat Pencatatan Perangkat Nyata

```text
Waktu Pengumpulan / Pengujian (termasuk zona waktu): [Isi]
Versi iOS / Google App / Shadowrocket: [Isi]
Modul Utama Tunggal yang Aktif: Manajemen SKU G1 ACQ
Alamat Pemasangan Utama: https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.12.4/g1-acq-ultra-discount.sgmodule
Alamat / Versi Rilis Modul Aktual: [Isi; saat ini v7.12.4]
Versi Respons yang Diharapkan: g1-acq-v7.12-mappings
Status Penonaktifan Modul Lama & Pemindai Terpisah: [Isi kondisi aktual]
Waktu Sambung Ulang VPN / Buka Ulang Paket: [Isi]
Penanda Lokal Laporan / reportVersion: [Isi tampilan aktual; saat ini v7.12.4]
configuredMode / configuredTarget Saat Ini: [Isi aktual; bawaan discount75 / g1.2tb.ai.12months_ip_90p]
mappingConfig.status / customized / error Saat Ini: [Isi]
mappingConfig.revision / updatedAt (UTC) Saat Ini: [Isi]
mappingConfig.rules Saat Ini: [Isi {id, match, from, to, enabled}, maks. 30]
Aksi Templat / Tambah / Edit / Nonaktifkan / Hapus / Pulihkan Kali Ini: [Isi aksi aktual]
ID / Judul Templat yang Dipakai: [pro-1yuan / tr-ultra-20tb / tr-ultra-30tb / ultra-75p / pro-12months-90p / Tidak dipakai]
Status Label "Aturan saat ini cocok" pada Kartu: [Isi tampilan aktual]
Perbandingan Aturan / ID / Urutan Sebelum & Sesudah Penggabungan Templat: [Isi perbedaan]
Aturan Warisan exact g1.ios.20tb.m.v2->com.google.gemini.2tb.ai.m.3month_ip_99p: [Status sebelum & sesudah Pro diterapkan]
Target 20TB Lain & Status Aktivasinya: [Hasil pelestarian Turki 20TB / 75p / manual]
Hasil Simpan / Pesan Error / Status POST & Redirect 303: [Isi]
Waktu Buka Ulang Paket Setelah Simpan: [Isi]
scan.version / mode / updatedAt (UTC) Aktual: [Isi catatan aktual]
Sebelum / Sesudah Buka Paket scannedResponses / matchedResponses / nonTextResponses: [Isi]
scan.recentResponses: [Isi maks. 10 dari JSON lama->baru]
Google App Paket Aktual / SKU Asal Lengkap Asli: [Isi tampilan & nilai terkumpul]
Target Bawaan 2TB: g1.2tb.ai.12months_ip_90p (tanpa .acq)
Target Bawaan 20TB / 30TB: g1.20tb.3months_ip_75p.acq / g1.ai.ultra.3months_ip_75p.acq
Target Templat / Aturan Manual: [Isi; Promo Pro: prefix g1.ios.2tb. -> com.google.gemini.2tb.ai.m.3month_ip_99p; Turki 20TB: exact g1.ios.20tb.m.v2 -> g1.ios.20tb.m]
Referensi Catatan Publik Turki (Bukan Bukti Harga Sesi Ini): 20TB 1989.99 TRY; 30TB 2949.99 TRY
test.version / mode / updatedAt (UTC) Aktual: [Isi]
test.mappingRevision / mappingUpdatedAt / mappingStatus Aktual: [Isi]
Apakah Revisi Konfigurasi Saat Ini Cocok dengan Eksekusi Aktual: [Isi hasil perbandingan]
test.matchedFrom: [Isi per baris {id, to, count, fallback}]
test.target / targetOrigin / hitCount / annualHitCount / status: [Isi]
Panel App Store Muncul / Nama Produk / Siklus / Mata Uang / Harga Awal / Perpanjangan / Error: [Isi tampilan aktual]
Pembelian Selesai / Hak Akun Google One Setelah Beli: [Isi kondisi aktual]
File Ekspor JSON Sesi Ini: [Isi]
```

## 9. Verifikasi Offline dan Salinan Hasil Generasi

Menggunakan Node.js 22 atau lebih baru (validasi `pattern` formulir HTML memakai semantik UnicodeSets `v`), jalankan di root repositori:

```sh
node tools/build-variants.cjs --check
node --test tests/*.test.cjs
```

[lib/mapping-config.js](../lib/mapping-config.js) menyediakan mesin konfigurasi bersama; [tools/build-variants.cjs](../tools/build-variants.cjs) menyematkan blok hasil generasi ke [g1-acq.js](../g1-acq.js) dan [g1-sku-report.js](../g1-sku-report.js), lalu menghasilkan [g1-acq-discount.js](../g1-acq-discount.js) serta [g1-sku-report-discount.js](../g1-sku-report-discount.js).
