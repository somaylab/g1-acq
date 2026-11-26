# g1-acq

[![Telegram](https://img.shields.io/badge/Telegram-AI%20Promo%20Group-26A5E4?logo=telegram&logoColor=white)](https://t.me/muihbb)

> 💬 **Grup Diskusi Promo AI**: https://t.me/muihbb —— Diskusi promo AI & trik langganan

Alat penulisan ulang (*rewriting*) dan pengumpulan ID produk (SKU) untuk pintu masuk langganan Google One (iOS), dirancang untuk **Shadowrocket / Little Rocket** (fork & terjemahan Bahasa Indonesia berbasis `crhywun/g1-acq`).

**Modul utama v7.12.1 adalah `Manajemen SKU G1 ACQ` (`g1-acq-ultra-discount.sgmodule`) dengan total lima templat siap pakai; templat Pro 99p memakai awalan `g1.ios.2tb.` milik Pro sendiri -> `com.google.gemini.2tb.ai.m.3month_ip_99p`, dan tersedia templat baru Turki 20TB catatan `1989.99 TRY`.** Proses pemasangan atau upgrade tetap mempertahankan konfigurasi sebelumnya — **buka [Halaman Laporan Lokal](https://one.google.com/g1-sku-report), lalu klik "Terapkan Templat" pada kartu templat yang diinginkan** untuk langsung menggabungkan dan menyimpan aturan ke ponsel. Saat menerapkan templat Pro terbaru, aturan warisan `exact` `g1.ios.20tb.m.v2` -> Gemini akan dinonaktifkan otomatis sambil mempertahankan target 20TB lain; templat Pro dan Turki 20TB dapat digunakan bersamaan. **Konfigurasi disimpan saat tombol diklik, dan baru berlaku pada respons `/ai?` berikutnya**; setelah memakai templat Pro, buka ulang halaman paket Pro itu sendiri lalu periksa versi eksekusi terakhir, revisi konfigurasi, dan sumber/target yang mengenai aturan. Halaman tetap mendukung tambah/edit/hapus/pulihkan manual hingga 30 aturan dengan kandidat SKU dan target templat.

Mode bawaan `discount75` mempertahankan 20TB / 30TB 3 bulan `75p` dan iOS 2TB asli -> `g1.2tb.ai.12months_ip_90p`; setelah menerapkan templat atau menyimpan aturan manual, mode berubah menjadi `custom` (meskipun targetnya kebetulan sama dengan bawaan). **75p = diskon 75% (bayar 25%)**. Versi runtime penulisan ulang saat ini adalah `g1-acq-v7.12-mappings`, tetap menyertakan pengumpulan SKU asli, 10 respons terakhir, diagnostik duplikat, dan ekspor JSON tanpa perlu memasang pemindai terpisah; langkah lengkap lihat [Pengelolaan SKU, Uji Promo 12 Bulan Pro, dan Pengumpulan](docs/pro-annual-test.md).

Pengumpulan hanya membaca respons cocok yang benar-benar diterima ponsel dan **tidak secara aktif melakukan query seluruh katalog SKU**; ID lama yang muncul kembali akan menambah jumlah kemunculan. Penulisan ulang string dan respons produk App Store dicatat terpisah — nama produk, siklus tagihan, nominal awal, dan perpanjangan dicocokkan langsung dari tampilan kasir App Store, sedangkan hak paket (*benefit*) dicatat berdasarkan status aktual akun Google One.

## Alamat Pemasangan Modul Utama

**Manajemen SKU G1 ACQ — Lima templat siap pakai & pemetaan manual lokal, mempertahankan bawaan 75p & target 2TB**

```text
https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.12.1/g1-acq-ultra-discount.sgmodule
```

| Item | Entri Utama Saat Ini |
|---|---|
| Konfigurasi saat ini `configuredMode` | Bawaan `discount75`; setelah menerapkan templat atau menyimpan aturan manual menjadi `custom` |
| Skrip respons | [g1-acq-discount.js](g1-acq-discount.js), implementasi identik dengan [g1-acq.js](g1-acq.js) |
| Versi runtime respons | `g1-acq-v7.12-mappings` |
| Skrip laporan | [g1-sku-report-discount.js](g1-sku-report-discount.js), implementasi identik dengan [g1-sku-report.js](g1-sku-report.js) |
| Versi laporan | `v7.12.1` |
| Target bawaan 2TB | `g1.2tb.ai.12months_ip_90p`, tanpa `.acq` |
| Data lokal | Melanjutkan ketiga kunci schema 1 dari v7.9; hasil templat tersimpan di `g1.sku.mappings.v1` tanpa migrasi otomatis |

Saat memasang pertama kali, tambahkan alamat di atas ke menu pengelolaan modul Shadowrocket lalu aktifkan. Urutan upgrade adalah: **Matikan modul lama -> Pasang alamat baru -> Aktifkan hanya satu entri penulisan ulang (`Manajemen SKU G1 ACQ`) -> Sambungkan ulang Shadowrocket -> Buka laporan & terapkan templat yang dibutuhkan -> Buka ulang halaman paket terkait -> Periksa eksekusi terakhir**. Untuk templat Promo Pro 99p, buka **halaman paket 2TB / Pro itu sendiri**. Jika pernah memasang **G1 ACQ Ultra 75p**, **G1 ACQ**, **G1 ACQ Ultra 90p**, **G1 ACQ Ultra Trial**, **G1 SKU Scan** terpisah, **G1 Pro Annual Test**, atau salinan penulisan ulang lainnya, nonaktifkan modul lama agar tidak terjadi penghitungan atau penulisan ulang ganda.

Entri pemasangan dan ke-8 `script-path` internal pada empat modul dipin ke `@v7.12.1`, tidak perlu menambahkan skrip terpisah. **Tautan pin lama harus diganti ke alamat baru karena tidak otomatis terperbarui, dan pemasangan tidak otomatis menerapkan templat.** Cabang saat ini tetap menyediakan 4 modul (modul trial tetap tidak disertakan).

Upgrade tetap melanjutkan pemakaian `g1.sku.scan.v1`, `g1.pro.annual.test.v1`, dan `g1.sku.mappings.v1` dengan `schemaVersion=1` tanpa migrasi konfigurasi otomatis; aturan manual, total SKU kumulatif, 10 respons terakhir, dan catatan eksekusi lama tetap dipertahankan. Menerapkan templat, menyimpan, atau memulihkan aturan tidak menimpa versi, mode, target, atau waktu historis.

[g1-acq-v7.sgmodule](g1-acq-v7.sgmodule) dan [g1-pro-annual-test.sgmodule](g1-pro-annual-test.sgmodule) memakai skrip respons & konfigurasi lokal yang sama (hanya cakupan `/ai?` untuk `g1-pro-annual-test.sgmodule`). [g1-sku-scan.sgmodule](g1-sku-scan.sgmodule) memperbarui pin unduhan dan mempertahankan konfigurasi request body laporan (`requires-body=1,max-size=0`), sedangkan implementasi pemindaiannya tetap `pro-annual-test-v2` yang hanya mengenali `g1.*` / `com.google.one.*` tanpa memodifikasi respons. [g1-pro-annual-test.js](g1-pro-annual-test.js) juga tetap dipertahankan sebagai implementasi historis terpisah. Keempat modul menetapkan `requires-body=1,max-size=0` pada `http-request` laporan untuk pengiriman formulir lokal.

## Lima Templat Pemetaan Siap Pakai

Bagian **Templat Pemetaan Siap Pakai** tampil sebelum editor aturan manual pada halaman laporan lokal; mengklik **Terapkan Templat** langsung mengirimkan POST HTML asli dan mengalihkan (`303`) kembali ke halaman laporan dengan notifikasi penyimpanan sukses.

| Templat | Cara Pencocokan | Sumber -> Target Lengkap |
|---|---|---|
| **Promo Pro Murah (3 Bulan Pertama Diskon 99%)** (`pro-1yuan`) | Awalan `prefix` | `g1.ios.2tb.` -> `com.google.gemini.2tb.ai.m.3month_ip_99p` |
| **Turki 20TB · Catatan 1989.99 Lira** (`tr-ultra-20tb`) | Persis `exact` | `g1.ios.20tb.m.v2` -> `g1.ios.20tb.m` |
| **Turki 30TB · Catatan 2949.99 Lira** (`tr-ultra-30tb`) | Persis `exact` | `g1.ios.30tb.ai.pro.m` -> `g1.ios.30tb.m` |
| **Ultra 20TB / 30TB · 3 Bulan 75p** (`ultra-75p`) | Dua `exact` | `g1.ios.20tb.m.v2` -> `g1.20tb.3months_ip_75p.acq`<br>`g1.ios.30tb.ai.pro.m` -> `g1.ai.ultra.3months_ip_75p.acq` |
| **2TB / Pro · 12 Bulan 90p** (`pro-12months-90p`) | Awalan `prefix` | `g1.ios.2tb.` -> `g1.2tb.ai.12months_ip_90p` |

- **Promo Pro Murah (`pro-1yuan`)** memakai awalan `g1.ios.2tb.` milik Pro sendiri (berbagi awalan yang sama dengan `pro-12months-90p`; templat yang diterapkan belakangan mengganti target awalan tersebut). Target `com.google.gemini.2tb.ai.m.3month_ip_99p` berasal dari kontribusi [@duwqijlk](https://github.com/duwqijlk) pada [PR #8](https://github.com/crhywun/g1-acq/pull/8) yang dulu diuji via rute lama `g1.ios.20tb.m.v2`.
- **Turki 20TB (`tr-ultra-20tb`)** dan **Turki 30TB (`tr-ultra-30tb`)** memakai ID iOS generasi lama (`g1.ios.20tb.m` dan `g1.ios.30tb.m`) berdasarkan catatan publik penawaran **1989.99 TRY** dan **2949.99 TRY**. Nominal, siklus, perpanjangan, dan hak paket tetap harus dicek dari kasir App Store dan akun Google One aktual.
- **Koeksistensi**: Promo Pro 99p dan Turki 20TB / 30TB dapat dipakai bersamaan karena menyasar sumber berbeda (`g1.ios.2tb.` vs `g1.ios.20tb.m.v2` / `g1.ios.30tb.ai.pro.m`).
- **Penggabungan & Pengaktifan**: Pencarian dilakukan berdasarkan `(match, from)`; aturan yang cocok diperbarui dan diaktifkan (`enabled=true`) dengan tetap mempertahankan `id` dan urutannya, sedangkan aturan manual, aturan nonaktif, serta override yang lebih sempit tetap dipertahankan.
- **Pembersihan Aturan Warisan Pro**: Khusus saat menekan `pro-1yuan`, aturan `exact` lama `g1.ios.20tb.m.v2` -> `com.google.gemini.2tb.ai.m.3month_ip_99p` otomatis dinonaktifkan secara atomik dalam penyimpanan yang sama, tanpa mengubah target 20TB lain (Turki 20TB, 75p, maupun target manual).
- **Kapasitas & Atomik**: Aturan nonaktif ikut dihitung ke batas maksimal **30 aturan**; saat sudah 30 aturan, memperbarui sumber yang ada tetap sukses, sedangkan penambahan aturan baru melebihi 30 aturan ditolak penuh (`400`) tanpa perubahan sebagian.
- **Label Konsistensi vs Eksekusi**: Label **Aturan saat ini cocok** membandingkan aturan aktif lokal (untuk `pro-1yuan`, juga mensyaratkan aturan warisan 20TB -> Gemini sudah nonaktif). Untuk memastikan eksekusi aktual, periksa **`test.version=g1-acq-v7.12-mappings`**, kesamaan `test.mappingRevision` dengan `mappingConfig.revision`, `test.updatedAt`, serta baris `test.matchedFrom`.

## Aturan Bawaan & Pemetaan Manual

Entri utama terlebih dahulu mengumpulkan respons teks asli di `one.google.com/`, kemudian hanya menjalankan aturan pada SKU lengkap di dalam respons `one.google.com/ai?`. Saat pertama digunakan atau setelah pemulihan bawaan (`discount75`), ketiga aturan berikut aktif:

| Cara Pencocokan | Asal (*From*) | Target ID (*To*) |
|---|---|---|
| Awalan `prefix` | `g1.ios.2tb.` | `g1.2tb.ai.12months_ip_90p` |
| Persis `exact` | `g1.ios.20tb.m.v2` | `g1.20tb.3months_ip_75p.acq` |
| Persis `exact` | `g1.ios.30tb.ai.pro.m` | `g1.ai.ultra.3months_ip_75p.acq` |

Saat mengedit, pilih **Persis (`exact`) atau Awalan (`prefix`)**, isi SKU asal dan SKU target lengkap. Sumber persis dan target mendukung **`g1.*` / `com.google.one.*` / `com.google.gemini.*`** dengan 1–160 karakter `[A-Za-z0-9._-]` setelah namespace (batas `maxlength=178` menampung 18 karakter namespace `com.google.gemini.` + 160 karakter akhiran), dan ID lengkap tidak boleh diakhiri titik; **sumber awalan (`prefix`) wajib diakhiri titik**. **Aturan persis yang aktif didahulukan; jika tidak ada, dipilih awalan aktif yang paling panjang.** Setiap ID asal hanya diganti satu kali tanpa penulisan ulang berantai (`fallback=false`).

## Pemasangan (Shadowrocket / Little Rocket)

Buka **Tab Config -> ikon (i) di sebelah kanan konfigurasi yang sedang aktif -> HTTPS Decryption**.

![Ilustrasi entri halaman konfigurasi: ketuk ikon (i) di kanan konfigurasi aktif untuk membuka edit konfigurasi dan melihat HTTPS Decryption](docs-config-entry-example.png)

1. Di pengelolaan modul Shadowrocket, aktifkan `v7.12.1` **Manajemen SKU G1 ACQ** — aktifkan hanya satu entri penulisan ulang; matikan modul lama dulu sebelum memasang alamat baru, dan jaga koneksi VPN di beranda tetap aktif.
2. Dari ikon **(i)** di konfigurasi aktif tadi, masuk ke **HTTPS Decryption** lalu aktifkan sakelarnya. Jika belum punya sertifikat tepercaya, buat dan pasang sertifikat dari halaman tersebut.
3. Buka **Pengaturan iOS -> Umum -> VPN & Manajemen Perangkat** untuk memasang profil Shadowrocket.
4. Buka **Pengaturan iOS -> Umum -> Mengenai -> Pengaturan Kepercayaan Sertifikat**, lalu aktifkan kepercayaan penuh untuk sertifikat root Shadowrocket.
5. Di daftar **Hostname HTTPS Decryption** pada konfigurasi aktif, pastikan terdapat `one.google.com`.
6. Sambungkan ulang Shadowrocket setiap kali memasang/meng-upgrade modul atau mengubah dekripsi HTTPS.

## Alur Penggunaan di Ponsel

1. Pastikan modul utama aktif dan Shadowrocket tersambung, lalu buka **Google App (ikon G berwarna) -> Kelola Google One**, jelajahi paket 2TB / Pro, 20TB / 30TB, bulanan, tahunan, dan promo yang ditampilkan agar modul mengumpulkan SKU asli (`g1.*`, `com.google.one.*`, dan `com.google.gemini.*`).
2. Buka [Laporan Lokal](https://one.google.com/g1-sku-report) di Safari, pastikan tampil **Skrip lokal telah mengambil alih** dan **v7.12.1**. Pada **Templat Pemetaan Siap Pakai**, klik **Terapkan Templat** yang diinginkan.
3. Untuk aturan manual, gunakan tautan pra-isi dari daftar pengumpulan atau isi langsung formulir tambah/edit aturan lalu klik **Simpan**. **Hapus** hanya menghapus baris tersebut; **Pulihkan Pemetaan Bawaan** mengembalikan tiga aturan bawaan tanpa menghapus riwayat.
4. Tutup paksa (*force-close*) dan buka ulang halaman paket yang sesuai di Google App (untuk `pro-1yuan`, buka **halaman paket 2TB / Pro**).
5. Segarkan laporan lokal untuk memeriksa **`test.version=g1-acq-v7.12-mappings`**, kesamaan `test.mappingRevision` dengan `mappingConfig.revision`, `test.updatedAt`, serta `test.matchedFrom`.
6. Verifikasi nama produk aktual, siklus tagihan, nominal awal, dan nominal perpanjangan pada panel App Store, lalu klik **Ekspor JSON** bila ingin menyimpan arsip.

![Panel pilihan paket Google One Ultra: contoh pintu masuk paket 20TB pada modul lama](docs-ultra-plans-example.png)

## Laporan Lokal & Pemecahan Masalah

Jika laporan sudah menunjukkan **v7.12.1**, tetapi aturan Gemini menyebabkan status **`invalid` / `config-error`**:
1. Pastikan hanya satu modul `@v7.12.1` aktif dan kedua `script-path` menunjuk ke `somaylab/g1-acq@v7.12.1` (`g1-acq-discount.js` dan `g1-sku-report-discount.js`) — skrip respons versi lama sebelum v7.11 menganggap namespace `com.google.gemini.` tidak sah.
2. Sambungkan ulang VPN, kembali ke laporan lalu klik **Terapkan Templat** pada Promo Pro 99p.
3. Buka ulang halaman paket Pro di Google App lalu segarkan laporan; jika masih `invalid` saat kedua skrip sudah seragam v7.12.1, ekspor JSON dulu bila perlu lalu klik **Pulihkan Pemetaan Bawaan**.

Cakupan penyimpanan lokal menggunakan tiga kunci schema 1 (`g1.sku.scan.v1`, `g1.pro.annual.test.v1`, `g1.sku.mappings.v1`), maksimal 300 ID terkumpul, 10 kejadian respons terakhir, dan 30 aturan pemetaan dalam UTC. `?clear=1` hanya mengosongkan dua kunci riwayat tanpa menghapus pemetaan. Penjelasan lengkap tersedia di [Dokumentasi Penggunaan Pengelolaan SKU](docs/pro-annual-test.md).

## Verifikasi Offline

Menggunakan Node.js 22 atau lebih baru (validasi `pattern` formulir HTML memakai semantik UnicodeSets `v`), jalankan di direktori root repositori:

```sh
node tools/build-variants.cjs --check
node --test tests/*.test.cjs
```

## Apresiasi Kontributor

- Terima kasih kepada [@cehomecambodia-lang](https://github.com/cehomecambodia-lang) melalui [PR #3](https://github.com/crhywun/g1-acq/pull/3) (pemetaan SKU uji coba 1 bulan Ultra 20TB/30TB & cadangan 90p).
- Terima kasih kepada [@duwqijlk](https://github.com/duwqijlk) melalui [PR #8](https://github.com/crhywun/g1-acq/pull/8) atas target `com.google.gemini.2tb.ai.m.3month_ip_99p` dan catatan uji pembelian dari entri lama `20TB -> Pro`.
