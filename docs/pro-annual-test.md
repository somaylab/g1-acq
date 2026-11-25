# Uji Promo 12 Bulan Pro & Pemindaian SKU

> **Penulis Asli (Original Author)**: [@crhywun](https://github.com/crhywun) ([crhywun/g1-acq](https://github.com/crhywun/g1-acq))  
> **Penerjemah Bahasa Indonesia (Translator)**: **Somaylab** ([@somaylab](https://github.com/somaylab))

**Cukup pasang dan aktifkan satu modul G1 ACQ untuk mendukung uji coba gratis 1 bulan Ultra serta uji promo 12 bulan 2TB**, sekaligus mengumpulkan SKU asli secara pasif, menjalankan penulisan ulang tiga tingkat, dan melihat laporan lokal; `v7.6.0` tetap menyediakan diagnostik 10 respons terakhir, penambahan baru kali ini, dan duplikat. Skrip terlebih dahulu mengumpulkan ID produk dari respons teks asli `one.google.com/`, lalu hanya pada respons `/ai?` mengubah **SKU utuh iOS 2TB asli** berprefiks `g1.ios.2tb.` menjadi `g1.2tb.ai.12months_ip_90p`; 20TB / 30TB secara bawaan memakai SKU uji coba gratis 1 bulan Ultra `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq`, dan masing-masing melakukan fallback independen ke SKU cadangan 90p tiga bulan yang sesuai. 2TB memakai kandidat tetap pilihan pengguna tanpa tingkat cadangan; pemetaan lengkap ada pada Bagian 4; versi skrip respons saat ini adalah `g1-acq-v7.6`.

Versi ini mengintegrasikan [GitHub PR #3](https://github.com/crhywun/g1-acq/pull/3), menambahkan dukungan uji coba gratis 1 bulan Ultra untuk tingkat 20TB / 30TB; apakah uji coba ditampilkan pada akun saat ini, siklus langganan aktual, dan biaya perpanjangan dicatat berdasarkan kasir App Store, sedangkan hak manfaat dicatat berdasarkan status aktual akun Google One.

Pengumpul hanya membaca respons cocok yang benar-benar diterima oleh ponsel, **tidak melakukan kueri aktif terhadap seluruh katalog SKU**. Kemunculan ulang ID lama akan menambah hitungan, tetapi tidak menjadi ID baru; melihat daftar lama saja tidak cukup untuk menyimpulkan skrip di ponsel gagal, dan putaran ini tidak memiliki kesimpulan kegagalan perangkat nyata yang terverifikasi.

**Kandidat lengkap untuk uji promo 12 bulan putaran ini adalah `g1.2tb.ai.12months_ip_90p`, tanpa akhiran `.acq`.** Item pertama pada tangkapan layar pengguna menyediakan kandidat tersebut beserta label harga `$1.99 × 12 months = $23.88/year`, yang menggambarkan promo bulanan selama 12 bulan berturut-turut; `90p` berarti **diskon 90% (90% off), sekitar sepersepuluh harga**, bukan membayar 90% (diskon 10%). `$23.88/year` adalah label total 12 bulan pada tangkapan layar, bukan bukti penagihan tahunan sekali bayar.

Judul pada tangkapan layar adalah **Pro 5TB**, namun produk sumber putaran ini tetap SKU utuh iOS 2TB asli berprefiks `g1.ios.2tb.`, tanpa penambahan prefiks sumber 5TB baru. Tangkapan layar merupakan sumber kandidat dan label harga, bukan data produk toko iOS yang terverifikasi, dan tidak membuktikan harga iOS aktual, siklus penagihan, maupun hak 5TB. Lingkungan operasi adalah Shadowrocket dan Google App di iPhone; nama kandidat, siklus, biaya awal, dan biaya perpanjangan menunggu verifikasi dari produk aktual yang dikembalikan App Store, dan hak manfaat mengacu pada tampilan akun Google One. Pengujian offline memverifikasi pencocokan string dan perilaku laporan.

## 1. Memasang atau Memperbarui Modul Utama

**G1 ACQ — Uji coba gratis 1 bulan Ultra, uji promo 12 bulan 2TB, pengumpulan pasif, diagnostik 10 respons terakhir & ekspor JSON**

```text
https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.6.0/g1-acq-v7.sgmodule
```

Alternatif langsung via GitHub Raw:

```text
https://raw.githubusercontent.com/somaylab/g1-acq/main/g1-acq-v7.sgmodule
```

Saat instalasi pertama kali, tambahkan alamat di atas pada manajemen modul Shadowrocket lalu aktifkan; saat meningkatkan dari versi lama, ganti modul **G1 ACQ** lama dengan alamat ini satu kali. Nama modul tetap **G1 ACQ**, sedangkan pintu masuk instalasi dan seluruh skrip internal seluruhnya mengacu tetap pada `@v7.6.0` sehingga tidak perlu menambahkan skrip terpisah. Setelah memasang atau memperbarui, sambungkan ulang VPN lalu buka kembali halaman paket di Google App. Merilis versi baru mengharuskan pembaruan isi skrip sekaligus pin versi tetap; menggabungkan PR tidak akan membuat alamat CDN tetap versi lama otomatis terbarui atau kedaluwarsa—alamat lama tetap merujuk ke versi aslinya. Pembaruan tetap mempertahankan riwayat catatan; menginstal ulang tidak akan memaksa server mengirimkan SKU baru, sehingga saat melakukan diagnostik bandingkan terlebih dahulu versi, hitungan, dan waktu respons.

Pengumpulan dan penulisan ulang dijalankan berurutan dalam satu modul utama yang sama, tanpa perlu memasang atau berganti ke **G1 SKU Scan**. Jika hanya memasang satu modul utama, tidak ada langkah penonaktifan tambahan; jika sebelumnya pernah memasang pemindai terpisah, **G1 Pro Annual Test**, atau salinan penulisan ulang lain, nonaktifkan salinan lama tersebut agar tidak terjadi penghitungan ganda atau penulisan ulang ganda. Tag historis `v7.0.0` / `v7.1.0` / `v7.2.0` / `v7.3.0` / `v7.4.0` / `v7.5.0` serta `pro-annual-test-v1` / `pro-annual-test-v2` tetap dipertahankan.

Diagnostik aktivitas respons versi ini berasal dari skrip utama `g1-acq-v7.6`. Pintu masuk kompatibilitas **G1 Pro Annual Test** mereferensikan skrip baru yang sama, tetapi tetap hanya mencocokkan `/ai?`; pintu masuk kompatibilitas **G1 SKU Scan** terpisah hanya memperbarui pin unduhan, sementara skrip pemindainya mempertahankan implementasi historis dengan versi catatan pengumpulan tetap `pro-annual-test-v2` tanpa field aktivitas respons baru. Ketika laporan versi baru membaca catatan pemindaian terpisah tersebut, tampil versi lama asli dan **Catatan pengumpulan lama**, dengan `recentResponses` kosong tanpa mengarang aktivitas.

Modul utama mencakup skrip laporan lokal, hanya menambahkan hostname MITM `one.google.com`, dan mempertahankan aturan pemblokiran UDP 443 global yang ada; aturan tersebut juga memengaruhi HTTP/3, kecepatan, atau konektivitas aplikasi lain.

## 2. Mengonfigurasi Dekripsi HTTPS

Agar modul dapat memproses respons HTTPS, dekripsi harus diaktifkan pada konfigurasi yang sedang digunakan dan sertifikatnya harus dipercaya.

1. Aktifkan **G1 ACQ** yang dipasang dari alamat `v7.6.0` pada Bagian 1; pengguna versi lama perbarui satu kali sesuai Bagian 1, dan pertahankan koneksi VPN Shadowrocket tetap aktif.
2. Masuk ke **Halaman Konfigurasi → ikon (i) di sebelah kanan konfigurasi aktif → HTTPS Decryption**, lalu nyalakan sakelar dekripsi.
3. Jika sudah ada sertifikat Shadowrocket yang valid dan tepercaya, langsung gunakan; jika belum ada sertifikat terkonfigurasi, buat dan pasang sertifikat di halaman tersebut, lalu lanjutkan ke **Pengaturan → Umum → VPN & Manajemen Perangkat** di iOS untuk menyelesaikan pemasangan profil deskripsi.
4. Saat konfigurasi sertifikat pertama kali, masuk ke iOS **Pengaturan → Umum → Mengenai → Pengaturan Kepercayaan Sertifikat**, lalu aktifkan kepercayaan penuh untuk sertifikat root Shadowrocket yang sesuai.
5. Periksa `one.google.com` pada **daftar hostname HTTPS Decryption** di konfigurasi aktif. Modul menambahkan domain ini menggunakan `%APPEND%`; ini adalah daftar dekripsi HTTPS, bukan DNS Hosts.
6. Setelah mengubah sakelar modul atau konfigurasi dekripsi, sambungkan ulang Shadowrocket lalu buka kembali halaman paket di Google App.

[Tangkapan layar pintu masuk konfigurasi di README](../README.md#instalasi-shadowrocket) menampilkan pintu masuk `(i)` di sebelah kanan konfigurasi aktif. Hostname MITM mencakup seluruh domain `one.google.com`, sedangkan cakupan pembacaan dan penulisan ulang skrip dibatasi oleh pencocokan URL di bawah ini.

## 3. Menjelajahi Paket & Mengumpulkan SKU Asli Secara Pasif

Cukup biarkan satu modul **G1 ACQ** tetap aktif. Setiap kali memproses respons teks `one.google.com/`, skrip utama terlebih dahulu mengumpulkan dari isi teks asli, baru kemudian memeriksa apakah respons tersebut perlu penulisan ulang tiga tingkat—nomor kandidat yang tercatat tidak akan tertimpa oleh penulisan ulang berikutnya pada respons yang sama; respons non-teks yang cocok hanya dihitung ke diagnostik non-teks.

1. Jaga Shadowrocket tetap terhubung, tempelkan [alamat laporan lokal](https://one.google.com/g1-sku-report) lengkap di bilah alamat Safari ponsel yang sama, lalu pastikan tampil **Skrip lokal telah mengambil alih** dan versi laporan **v7.6.0**; catat terlebih dahulu `scan.version` aktual, `scannedResponses`, `matchedResponses`, `nonTextResponses`, dan waktu respons terbaru.
2. Buka **Google App (ikon G berwarna) → Kelola Google One**, masuk kembali ke paket **2TB / Pro** yang benar-benar tersedia di halaman; saat memverifikasi pemetaan uji coba gratis 1 bulan Ultra, buka juga paket **20TB / 30TB** yang tersedia.
3. Jika halaman menyediakan tombol pindah bulanan dan tahunan, buka satu per satu dan tunggu hingga selesai dimuat. Hanya respons cocok yang baru diterima yang menghasilkan aktivitas pengumpulan, tanpa perlu menyelesaikan pembelian; akun, wilayah, dan versi aplikasi menentukan paket dan kontrol yang ditampilkan, dan cache halaman juga memengaruhi apakah permintaan baru dikirimkan.
4. Kembali ke Safari dan muat ulang laporan, bandingkan hitungan dan respons terbaru, lalu periksa jumlah penambahan baru dan status kali ini. Hitungan bertambah dengan `known-skus` menandakan data berulang; daftar yang tidak bertambah tidak berarti pengumpulan berhenti. Jika hitungan maupun waktu respons terbaru tidak berubah, hanya dapat dipastikan putaran ini tidak menyimpan catatan pengumpulan baru; kegagalan penulisan penyimpanan juga mempertahankan hitungan lama—periksa log `saved=no` / `SKU collection unavailable`, cache, cakupan pencocokan, dan konfigurasi modul sesuai Bagian 7.
5. Periksa "Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman", catat ID lengkap, jumlah, dan waktu terakhir ditemukan. Cari ID utuh berprefiks `g1.ios.2tb.` yang benar-benar muncul; untuk 20TB / 30TB, cocokan dengan dua ID sumber utuh pada Bagian 4 tanpa melengkapi atau menebak akhiran sendiri.
6. Tekan tombol **Ekspor JSON** di area aksi laporan untuk menyimpan hasil, atau buka langsung [alamat ekspor JSON](https://one.google.com/g1-sku-report?format=json).

Pengumpulan pasif mencakup respons teks di bawah `https://one.google.com/`, melewati `/g1-sku-report`, path yang sama dengan `/` di akhir, serta query-nya. Pengumpul mengenali string `g1.*` dan `com.google.one.*`, melakukan deduplikasi per ID, dan mengakumulasi jumlah kemunculannya; kemunculan berulang satu ID dalam satu respons atau kemunculan kembali pada respons berikutnya sama-sama menambah hitungan—hitungan ini bukan jumlah pembelian.

Maksimum **300 ID berbeda** yang disimpan. Setelah batas tercapai, hitungan dan waktu ID yang sudah tersimpan tetap diperbarui; ID baru yang melebihi batas tidak lagi ditambahkan ke daftar, dan `omittedCount` mencatat jumlah ID berbeda yang dibuang kali ini akibat kapasitas. Ketika `addedCount>0`, status diprioritaskan menjadi `new-skus` meskipun ada pembuangan kapasitas bersamaan; hanya saat `addedCount=0` dan `omittedCount>0` baru ditandai `limit-reached`. Pertahankan daftar lama agar mudah membandingkan penambahan baru dan duplikat; hanya jika benar-benar ingin mereset riwayat, jalankan pembersihan manual dua kunci pada Bagian 5 setelah mengekspor—diagnostik harian tidak memerlukan pembersihan.

Pengumpulan memulihkan `\u002e`, `\x2e`, dan entitas titik HTML di dalam salinan teks untuk pengenalan; langkah pemulihan ini tidak mengubah isi respons. Setelah pengumpulan selesai, hanya respons yang cocok dengan `/ai?` yang masuk ke penulisan ulang tiga tingkat, sedangkan respons lain dikembalikan apa adanya. Skrip tidak membaca header atau body permintaan, tidak menyimpan isi respons lengkap, tidak mengkueri App Store, dan tidak mengirim data pengumpulan ke luar.

## 4. Menguji Promo 12 Bulan 2TB & Uji Coba Gratis 1 Bulan Ultra

Pengumpulan dan penulisan ulang dijalankan secara berurutan otomatis oleh modul utama; saat memeriksa kasir, tetap aktifkan modul **G1 ACQ** yang sama.

1. Pastikan **G1 ACQ** versi baru aktif dan Shadowrocket terhubung, tanpa perlu mengganti ke modul pengumpul lain.
2. Periksa sakelar di konfigurasi aktif bagian **(i) → HTTPS Decryption**, hostname `one.google.com`, dan kepercayaan sertifikat iOS, lalu sambungkan ulang Shadowrocket.
3. Keluar dari halaman paket saat ini, lalu masuk kembali ke paket **2TB / Pro** dari **Google App (G berwarna) → Kelola Google One**. Produk sumber uji promo 12 bulan adalah iOS 2TB asli; saat memverifikasi pemetaan uji coba gratis 1 bulan Ultra, buka masing-masing paket 20TB / 30TB yang benar-benar tersedia di halaman.
4. Masuk ke alur langganan dari paket yang tersedia di halaman, lalu periksa **nama produk, siklus langganan, mata uang, biaya awal, dan biaya perpanjangan** pada kasir App Store. Jika kasir tidak muncul, catat pesan aktual di layar; hasil 2TB, 20TB, dan 30TB dicatat terpisah.
5. Buka [laporan lokal](https://one.google.com/g1-sku-report) di Safari, periksa versi, waktu eksekusi, dan status pada "Pemetaan Tiga Tingkat Terakhir"; "total penggantian" adalah jumlah ketiga tingkat, "Di antaranya 2TB" adalah jumlah penulisan ulang promo 2TB / Pro, dan tabel di bawahnya menampilkan per baris ID sumber utuh, target aktual, serta status cadangan.
6. Tekan tombol **Ekspor JSON** pada area aksi laporan, atau buka [alamat ekspor JSON](https://one.google.com/g1-sku-report?format=json), simpan `reportVersion`, `configuredTarget`, `test.version`, `test.matchedFrom`, `test.target`, `test.targetOrigin`, `test.hitCount`, `test.annualHitCount`, `test.status`, dan `test.updatedAt`, lalu catat bersama hasil tampilan App Store kali ini.

Skrip utama terlebih dahulu mengumpulkan SKU dari respons teks asli yang cocok dengan `^https://one\.google\.com/`, lalu hanya pada respons yang cocok dengan `^https://one\.google\.com/ai\?` mengenali ID teks polos utuh dan menerapkan pemetaan berikut:

| SKU sumber utuh di isi respons | Target bawaan | Target cadangan |
|---|---|---|
| SKU utuh berprefiks `g1.ios.2tb.` | `g1.2tb.ai.12months_ip_90p` (kandidat pilihan pengguna) | Tidak ada |
| `g1.ios.20tb.m.v2` | `g1.20tb.1month_eft.acq` (uji coba gratis 1 bulan Ultra) | `g1.20tb.3months_ip_90p.acq` (promo 90p tiga bulan) |
| `g1.ios.30tb.ai.pro.m` | `g1.ai.ultra.1month_eft.acq` (uji coba gratis 1 bulan Ultra) | `g1.ai.ultra.3months_ip_90p.acq` (promo 90p tiga bulan) |

ID sumber utuh yang cocok pada 2TB selalu diganti ke kandidat `g1.2tb.ai.12months_ip_90p`, tanpa target cadangan dan tidak mensyaratkan target tersebut muncul sebelumnya di isi respons. 20TB / 30TB harus cocok tepat dengan ID sumber utuh di tabel, dan tiap tingkat menentukan target secara independen dari isi teks respons asli:

- Jika target bawaan `1month_eft` tingkat tersebut muncul di isi teks, target bawaan diprioritaskan; meskipun cadangan 90p yang sesuai juga muncul, tetap pakai target bawaan dan catat `fallback=false`.
- Jika target bawaan `1month_eft` tingkat tersebut tidak muncul sementara cadangan 90p yang sesuai muncul, gunakan 90p tingkat tersebut dan catat `fallback=true`.
- Jika baik target bawaan maupun cadangan 90p tingkat tersebut tidak muncul, tetap ganti menggunakan target bawaan `1month_eft` dan catat `fallback=false`.

Penilaian fallback 20TB hanya memeriksa target 20TB, dan penilaian fallback 30TB hanya memeriksa target 30TB. `75p` tidak lagi menjadi target fallback pada versi ini; hanya catatan historis versi lama yang mempertahankan `g1.20tb.3months_ip_75p.acq` atau `g1.ai.ultra.3months_ip_75p.acq` sebagai target cadangan aktual. Ini adalah pemeriksaan string target pada isi respons, bukan kueri katalog produk ke App Store. ID lain dipertahankan apa adanya; jika ketiga tingkat tidak cocok, respons dikembalikan apa adanya. Kedua target bawaan `1month_eft` menyediakan pintu masuk uji coba gratis 1 bulan Ultra; 90p tiga bulan adalah promo cadangan masing-masing tingkat, sehingga laporan dan catatan perangkat nyata harus membedakan antara uji coba dan promo cadangan berdasarkan `to` aktual kali ini.

| Field laporan | Arti |
|---|---|
| `reportVersion` | Versi skrip laporan saat ini `v7.6.0`, ditampilkan terpisah dari versi catatan eksekusi yang tersimpan |
| `configuredTarget` | Kandidat 2TB yang dikonfigurasi saat ini `g1.2tb.ai.12months_ip_90p` |
| `test.version` | Versi skrip yang menghasilkan catatan eksekusi tersebut; skrip utama saat ini adalah `g1-acq-v7.6`, catatan lama yang tersisa tetap menampilkan versi aslinya |
| `test.matchedFrom` | ID sumber utuh yang benar-benar cocok pada respons kali ini, format tiap baris `{id, to, count, fallback}`; `to` adalah target aktual sumber kali ini, `count` adalah jumlah penulisan ulang sumber tersebut; `fallback=true` berarti memakai tingkat cadangan versi eksekusi tersebut—versi ini memakai 90p terkait, catatan historis versi lama dapat berupa 75p, dan laporan membedakannya berdasarkan `to` aktual |
| `test.target` | Target 2TB yang benar-benar tersimpan pada eksekusi terakhir; catatan baru dan catatan v7.5 lama sama-sama `g1.2tb.ai.12months_ip_90p`, namun `test.version` v7.5 lama tetap `g1-acq-v7.5`; catatan v7.3 / v7.4 lama mempertahankan `g1.2tb.ai.annual_ip_90p.acq`, catatan v7.2 lama mempertahankan `g1.2tb.ai.annual.3months_ip_90p.acq`, dan catatan v1 / v7.1 lama tetap `g1.2tb.ai.annual`; target aktual 20TB / 30TB lihat `to` di tiap baris |
| `test.targetOrigin` | Catatan kandidat baru dan catatan v7.3 / v7.4 / v7.5 lama bernilai `user-specified`, catatan v7.2 lama mempertahankan `pattern-derived`, catatan tahunan biasa v1 / v7.1 lama bernilai `legacy`, dan kosong jika belum ada catatan eksekusi |
| `test.hitCount` | Total penulisan ulang tiga tingkat pada respons kali ini; berkorespondensi dengan `hits=N` pada keluaran skrip |
| `test.annualHitCount` | Mempertahankan nama field kompatibel, hanya menghitung penulisan ulang promo 2TB / Pro pada respons kali ini; berkorespondensi dengan `annualHits=N` di log dan di laporan ditampilkan "Di antaranya 2TB"; nama field dan hitungan tidak membuktikan penagihan tahunan |
| `test.updatedAt` | Waktu eksekusi terakhir, UTC |
| `test.status = rewritten` | Minimal satu dari tiga tingkat menjalankan penggantian string; tetap berstatus ini jika hanya 20TB / 30TB yang cocok |
| `test.status = no-match` | Tidak ada ID sumber utuh dari ketiga tingkat yang cocok pada respons teks kali ini; respons dikembalikan apa adanya |
| `test.status = non-text` | Respons kali ini tidak memiliki isi teks yang dapat diproses; respons dikembalikan apa adanya |

Log saat ini menggunakan prefiks `[g1-acq]`, dengan format ringkasan `g1-acq-v7.6 hits=N annualHits=N`, dan mencetak per baris `SKU sumber → target aktual xN`; saat 20TB / 30TB memilih tingkat cadangan, baris tersebut disertai `fallback=nomor target lengkap aktual`, yakni `fallback=g1.20tb.3months_ip_90p.acq` atau `fallback=g1.ai.ultra.3months_ip_90p.acq` pada versi ini. `fallback=75p` di log versi lama hanyalah format historis. `to` di laporan berkorespondensi dengan log per baris, HTML menampilkan cadangan 90p atau cadangan 75p historis berdasarkan `to` aktual, dan `hits` serta `annualHits` pada ringkasan utama masing-masing berkorespondensi dengan `hitCount` dan `annualHitCount`.

Yang disimpan di sini adalah **catatan eksekusi terakhir yang masuk ke pemeriksaan penulisan ulang tiga tingkat**, bukan riwayat uji kumulatif; respons berikutnya dalam cakupan tersebut yang nol kecocokan juga akan memperbarui catatan ini. `configuredTarget` menunjukkan konfigurasi saat ini, sedangkan `test.target` menunjukkan target aktual saat eksekusi terakhir; catatan v7.5 lama tetap memiliki target 2TB `g1.2tb.ai.12months_ip_90p` dan asal `user-specified` dengan `test.version` tetap `g1-acq-v7.5`; catatan v7.3 / v7.4 lama tetap mempertahankan `g1.2tb.ai.annual_ip_90p.acq` dan `user-specified`, catatan v7.2 lama mempertahankan `g1.2tb.ai.annual.3months_ip_90p.acq` dan `pattern-derived`, serta catatan v1 / v7.1 lama mempertahankan `g1.2tb.ai.annual` dan `legacy`. Pembaruan sendiri mempertahankan ID historis, target aktual, versi lama, dan `test.targetOrigin` lama tanpa melabeli ulang menjadi kandidat saat ini atau `user-specified`. Target yang sama pun harus tetap diperiksa `test.version` dan waktu eksekusinya; kesamaan target 2TB tidak berarti catatan v7.5 lama telah diperbarui. Jumlah kecocokan hanya membuktikan penggantian teks, bukan bahwa App Store menerima produk target atau langganan telah selesai.

`hitCount=0` dan `status=no-match` berarti tidak satu pun dari ketiga tingkat yang cocok pada respons teks kali ini—bukan berarti akun tidak memiliki produk 2TB atau produk target tidak ada. Jika `annualHitCount=0` dan `hitCount>0`, artinya hanya 20TB / 30TB yang cocok sementara statusnya tetap `rewritten`; untuk menilai uji promo 12 bulan 2TB harus melihat `annualHitCount`, lalu mencocokkan `id` dan `to` pada tiap baris.

Cakupan pengumpulan modul utama yang sama mencakup seluruh `one.google.com/` dan mengenali titik yang di-escape; penulisan ulang tiga tingkat hanya memproses ID teks polos utuh pada isi asli `/ai?`. Karena itu, kemunculan ID kandidat di laporan tidak menjamin respons `/ai?` lain pasti cocok. Saat target tidak cocok, terus jelajahi paket yang benar-benar disediakan, periksa ID utuh yang terkumpul pasif sesuai Bagian 3 tanpa perlu ganti modul, dan jangan menebak-nebak SKU iOS baru.

## 5. Halaman Hasil Lokal, Ekspor, dan Pembersihan

Pastikan Shadowrocket terhubung dan **G1 ACQ** versi baru aktif, lalu tempelkan [alamat laporan lokal](https://one.google.com/g1-sku-report) lengkap di bilah alamat Safari. Di bagian atas halaman harus tampil **Skrip lokal telah mengambil alih** dan tanda **v7.6.0**, serta tombol **Ekspor JSON** di area aksi; cukup tekan tombol tersebut untuk mengekspor, atau gunakan alamat langsung di bawah ini:

| Alamat | Aksi |
|---|---|
| [Laporan Lokal](https://one.google.com/g1-sku-report) | Menampilkan hasil pengumpulan kumulatif dan catatan uji gabungan tiga tingkat terakhir |
| [Ekspor JSON](https://one.google.com/g1-sku-report?format=json) | Mengembalikan respons unduhan `g1-sku-report.json` |
| [Bersihkan Catatan Alat Ini](https://one.google.com/g1-sku-report?clear=1) | Membersihkan catatan pengumpulan dan catatan uji terakhir milik alat ini |

**Alamat menggunakan domain Google, namun halaman laporan disediakan oleh skrip lokal di ponsel.** Skrip `http-request` Shadowrocket mengambil alih `https://one.google.com/g1-sku-report`, termasuk `/` di akhir dan query, menghasilkan HTML atau JSON secara lokal dan mengembalikannya langsung tanpa meneruskan permintaan ke Google. HTML tidak memuat sumber daya eksternal, dan skrip laporan maupun ekspor tidak melakukan pemanggilan pelaporan jaringan.

Jika terlihat halaman biasa Google atau 404, artinya kali ini tidak menampilkan laporan lokal. Periksa apakah **G1 ACQ** versi baru aktif, Shadowrocket terhubung, **Konfigurasi aktif (i) → HTTPS Decryption**, hostname `one.google.com`, dan sertifikat tepercaya di iOS, lalu tempelkan kembali URL laporan lengkap ke bilah alamat Safari.

Data disimpan di `$persistentStore` ponsel, dengan waktu pengumpulan, kejadian respons, dan catatan eksekusi menggunakan UTC; nama kedua kunci dan `schemaVersion: 1` tetap sama:

| Kunci | Isi |
|---|---|
| `g1.sku.scan.v1` | ID kandidat, hitungan kumulatif, waktu terakhir ditemukan, versi pengumpul aktual, hitungan respons teks/cocok/non-teks, status batas kapasitas, dan maksimum 10 kejadian respons teredaksi |
| `g1.pro.annual.test.v1` | Versi skrip eksekusi terakhir, prefiks sumber 2TB, ID sumber cocok tiga tingkat beserta target aktual dan status cadangan per baris, target 2TB, total penulisan ulang, penulisan ulang 2TB, waktu, dan status |

HTML menampilkan per baris yang cocok ID sumber utuh, target aktual, hitungan, dan status cadangan agar `test.target` tidak disalahartikan sebagai target 20TB / 30TB. Target bawaan versi ini masing-masing `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq`; target cadangan masing-masing `g1.20tb.3months_ip_90p.acq` / `g1.ai.ultra.3months_ip_90p.acq`. HTML menggabungkan `fallback` dan `to` aktual untuk menampilkan cadangan 90p, cadangan 75p historis, atau "Tidak"; jika ditandai cadangan namun informasi target kurang hanya tampil "Ya", dan baris 20TB / 30TB versi lama mempertahankan target serta status cadangan aslinya. Halaman hasil versi baru kompatibel dengan catatan v1 lama yang hanya berisi 2TB: jika baris lama kekurangan `to`, diisi target tahunan biasa awal `g1.2tb.ai.annual`, dan `annualHitCount` yang kurang dihitung dari hitungan baris 2TB lama; baris lama ditampilkan seolah tidak memakai tingkat cadangan. Catatan v1 / v7.1 lama mempertahankan `test.target` ke target tahunan biasa awal dengan `test.targetOrigin` bernilai `legacy`; catatan v7.2 lama mempertahankan `g1.2tb.ai.annual.3months_ip_90p.acq` dan `pattern-derived`; catatan v7.3 / v7.4 lama mempertahankan `g1.2tb.ai.annual_ip_90p.acq` dan `user-specified`; catatan v7.5 lama mempertahankan `g1.2tb.ai.12months_ip_90p` yang sama dengan konfigurasi saat ini, `user-specified`, dan versi lama `g1-acq-v7.5`. Pembaruan tidak melabeli ulang ID lama, asal lama, atau versi lama. Mempertahankan catatan lama tidak memerlukan pembersihan kedua kunci ini terlebih dahulu.

Field inti pengumpulan pada JSON adalah `scan.skus`, tiap item berisi `id`, `count`, dan `lastSeen`; field pengujian ada pada Bagian 4. Laporan menampilkan **versi laporan `reportVersion=v7.6.0`** terpisah dari **versi catatan pengumpulan aktual `scan.version`**; yang terakhir berasal dari catatan tersimpan, dan pengumpul utama versi ini adalah `g1-acq-v7.6`. Catatan skrip lama menampilkan **Catatan pengumpulan lama; belum menyimpan catatan respons pengumpulan versi ini.** Jika versi tidak diketahui atau belum ada catatan, ditandai **Belum menyimpan catatan respons pengumpulan versi ini**. Pembaruan skrip laporan saja tidak berarti pengumpul versi baru telah menerima respons, dan label-label ini bukan kesimpulan kerusakan ponsel.

| Field pengumpulan | Arti |
|---|---|
| `scan.version` | Versi skrip yang menghasilkan catatan pengumpulan aktual, mempertahankan nilai asli catatan lama |
| `scan.scannedResponses` | Total kumulatif respons teks; mempertahankan arti asli, non-teks tidak dihitung |
| `scan.matchedResponses` | Total kumulatif respons teks yang mengenali minimal satu ID kandidat, ID berulang juga dihitung cocok; mempertahankan arti asli |
| `scan.nonTextResponses` | Total kumulatif respons non-teks, terpisah dari respons teks |
| `scan.recentResponses` | Maksimum 10 kejadian; array JSON disimpan berurutan lama → baru sesuai penerimaan, jika melebihi 10 maka kejadian terlama dikeluarkan; tabel HTML ditampilkan baru → lama |

Setiap kejadian respons memuat field berikut:

| Field kejadian | Arti |
|---|---|
| `at` | Waktu pemrosesan respons kali ini, UTC |
| `path` | Kategori path tetap, hanya bernilai `/`, `/ai`, `/plans`, `/_/…/data/batchexecute`, atau `[Path one.google.com lainnya]` |
| `bodyType` | Tipe isi respons, tidak memuat isi respons |
| `status` | Status diagnostik pengumpulan untuk respons kali ini, lihat tabel di bawah |
| `candidateCount` | Jumlah ID kandidat berbeda yang dikenali dalam respons ini; kemunculan ganda ID yang sama hanya dihitung 1 kandidat |
| `addedCount` | Jumlah ID berbeda yang baru ditambahkan dan benar-benar disimpan kali ini |
| `omittedCount` | Jumlah ID berbeda yang dibuang kali ini akibat batas kapasitas 300 ID; kemunculan ganda ID yang tidak disimpan hanya dihitung 1 pembuangan |

| `status` | Arti |
|---|---|
| `new-skus` | `addedCount>0`, menyimpan ID baru kali ini; meskipun `omittedCount>0` juga ada, status ini tetap diprioritaskan |
| `known-skus` | Seluruh ID yang dikenali kali ini sudah tersimpan, hanya memperbarui hitungan kumulatif dan waktu ditemukan |
| `no-skus` | Tidak ada ID kandidat yang dikenali pada respons teks kali ini |
| `limit-reached` | Hanya digunakan saat `addedCount=0` dan `omittedCount>0`: tidak ada ID baru yang disimpan, terdapat pembuangan kapasitas |
| `non-text` | Respons kali ini bukan teks yang dapat dikumpulkan, menambah `nonTextResponses` |

`candidateCount`, `addedCount`, dan `omittedCount` dihitung per ID berbeda di setiap respons; sedangkan `scan.skus[].count` tetap mengakumulasi jumlah kemunculan string—keduanya memiliki arti berbeda. Jika catatan yang ada kekurangan `recentResponses`, laporan tidak mengarang riwayat respons berdasarkan waktu lama atau hitungan kumulatif; hanya respons aktual yang diproses selanjutnya yang membuat kejadian baru. Hitungan lama dan kandidat asli tetap dipertahankan, dan 10 respons terakhir juga tidak mewakili seluruh riwayat.

Path respons diredaksi secara tetap: `…` di `/_/…/data/batchexecute` adalah teks tampilan tetap; path lain digabung ke `[Path one.google.com lainnya]`. Kejadian dan ekspor tidak menyimpan query, URL lengkap, header permintaan, header respons, body permintaan, atau isi respons. Laporan menampilkan waktu respons terakhir dan riwayat respons terkini untuk dicocokkan dengan waktu pembukaan halaman paket kali ini.

`?clear=1` tetap menjadi aksi manual yang hanya mengosongkan isi kedua kunci di atas, tidak menjalankan "Hapus semua data" milik Shadowrocket; membaca laporan dan memuat ulang alamat laporan biasa tidak membersihkan catatan. Hanya lakukan ekspor lalu bersihkan ketika benar-benar ingin mereset riwayat; saat daftar tidak bertambah, bandingkan dulu hitungan, versi, dan kejadian untuk mempertahankan bukti diagnostik. Setelah membersihkan, kembali ke [alamat laporan lokal](https://one.google.com/g1-sku-report) tanpa `clear=1` agar tidak terhapus ulang saat menyegarkan halaman.

## 6. Mengumpulkan dan Memverifikasi SKU Tersembunyi di Shadowrocket iOS

Proyek saat ini berjalan di **iPhone + Shadowrocket + Google App**. Pengumpul membaca seluruh respons teks asli yang cocok: meskipun paket yang berisi suatu ID tidak ditampilkan di halaman, selama ID tersebut sudah muncul di respons tersebut, ID itu tetap akan diekstrak. Halaman hanya menampilkan beberapa paket bukan berarti isi respons hanya memuat beberapa ID saja.

1. Jaga satu modul **G1 ACQ** tetap aktif, buka secara berurutan 2TB / Pro, bulanan, tahunan, dan pintu masuk promo yang benar-benar disediakan di Google App; tunggu setiap halaman selesai dimuat agar modul mengumpulkan respons asli dari berbagai pintu masuk.
2. Buka [laporan lokal](https://one.google.com/g1-sku-report) di Safari, periksa "Kandidat SKU yang Dikumpulkan Saat Menjelajah Halaman"; bagian ini menyimpan ID utuh yang diperoleh sebelum penulisan ulang, maksimum 300 item.
3. Untuk kandidat yang ditentukan putaran ini `g1.2tb.ai.12months_ip_90p`, masuk kembali ke paket 2TB / Pro asli agar modul mengganti ID sumber pada pintu masuk tersebut; periksa pada laporan `test.version=g1-acq-v7.6`, `test.target`, dan `to` pada baris terkait.
4. Dari paket tersebut, masuk ke alur langganan bawaan untuk memeriksa produk, siklus, biaya awal, dan biaya perpanjangan aktual yang ditampilkan App Store; simpan hasil tampilan aktual lalu ekspor JSON untuk mencocokkan catatan eksekusi skrip.

Daftar pengumpulan asli dan kandidat pengganti yang dikonfigurasi disimpan terpisah. Target baru yang ditulis oleh modul sendiri tidak otomatis menjadi "SKU tersembunyi yang dikumpulkan"; ID yang tidak dikirimkan oleh server juga tidak masuk dalam hasil pengumpulan kali ini. Skrip Shadowrocket saat ini memproses respons jaringan dan tidak memanggil langsung antarmuka StoreKit di dalam Google App, sehingga "penggantian berhasil" pada laporan hanya mendeskripsikan penulisan ulang teks.

Kueri produk iOS bawaan menggunakan StoreKit `Product.products(for:)` atau `SKProductsRequest` dengan mengirimkan ID yang diketahui dari konteks aplikasi terkait; kueri tersebut mengembalikan detail produk, bukan antarmuka katalog yang mencantumkan seluruh produk. Alur operasi di ponsel untuk proyek ini adalah mengumpulkan ID asli, mengganti kandidat yang ditentukan, memeriksa hasil langganan bawaan, lalu menyimpan laporan.

## 7. Penilaian Hasil yang Umum Ditemui

| Hasil pengamatan | Langkah selanjutnya |
|---|---|
| Halaman laporan menampilkan "Belum ada catatan" atau "Belum menyimpan catatan respons pengumpulan versi ini" | Simpan dulu `scan.version` dan hitungan aktual, lalu masuk kembali ke halaman 2TB / Pro yang tersedia di Google App dan muat ulang laporan; versi tidak diketahui atau belum ada catatan tidak langsung berarti ponsel rusak |
| Laporan bertuliskan `v7.6.0`, area pengumpulan bertanda "Catatan pengumpulan lama" | Laporan sudah diperbarui, namun catatan pengumpulan yang tersimpan masih berasal dari skrip lama; bandingkan `scan.version` aktual, hitungan, dan waktu respons terakhir, lalu buka ulang paket dan cek lagi |
| Catatan lama tidak memiliki `recentResponses` | Pertahankan kandidat asli dan hitungan kumulatif, tunggu respons baru aktual mengisi riwayat; laporan tidak memalsukan hitungan lama menjadi aktivitas terkini |
| Safari menampilkan halaman biasa Google atau 404 | Saat ini belum menampilkan laporan lokal; periksa G1 ACQ versi baru, koneksi, HTTPS Decryption di konfigurasi aktif, `one.google.com`, dan sertifikat tepercaya sesuai Bagian 5, lalu tempelkan URL laporan lengkap ke bilah alamat Safari |
| Halaman tidak menampilkan "Skrip lokal telah mengambil alih", tanda `v7.6.0`, atau tombol "Ekspor JSON" | Pastikan sudah memperbarui ke modul utama versi baru sesuai Bagian 1, lalu buka kembali laporan lokal Bagian 5; alamat ekspor JSON langsung juga tercantum di Bagian 5 |
| Halaman laporan menampilkan antarmuka penyimpanan lokal belum siap | Skrip halaman belum memperoleh antarmuka baca `$persistentStore`, halaman saat ini bukan bukti pengumpulan berhasil; catat tampilan hasil dan versi Shadowrocket |
| Daftar masih berisi ID lama, namun hitungan respons teks naik dan berstatus `known-skus` | Kali ini menerima data duplikat, jumlah kemunculan dan waktu ditemukan diperbarui; pertahankan catatan yang ada dan bandingkan jumlah kandidat serta penambahan baru per respons |
| `scannedResponses`, `matchedResponses`, `nonTextResponses`, dan waktu respons terbaru tidak berubah | Hanya bisa memastikan putaran ini tidak menyimpan catatan pengumpulan baru; kegagalan penulisan penyimpanan juga mempertahankan hitungan lama; periksa dulu log skrip `saved=no` / `SKU collection unavailable`, lalu cek satu per satu cache, cakupan `one.google.com/`, sakelar modul, VPN, HTTPS Decryption konfigurasi aktif, kepercayaan sertifikat, dan hostname, kemudian buka ulang paket aktual dan muat ulang laporan |
| Hitungan respons teks bertambah dengan status terakhir `no-skus` | Isi yang diproses kali ini tidak memunculkan string yang cocok; lanjutkan memeriksa halaman 2TB / Pro serta bulanan dan tahunan yang tersedia tanpa mengarang ID |
| Hanya `nonTextResponses` yang bertambah dengan status terakhir `non-text` | Telah menerima respons non-teks, hitungan teks mempertahankan arti aslinya; catat tipe dan path teredaksi kali ini lalu periksa halaman paket lainnya |
| Status terakhir adalah `new-skus` | `addedCount>0`, ID baru benar-benar disimpan kali ini; meskipun `omittedCount>0` juga ada, status tetap `new-skus`; `count` pada daftar kandidat tetap merupakan jumlah kemunculan kumulatif |
| ID 2TB sudah terkumpul, tetapi `annualHitCount` bernilai 0 | Cocokkan waktu eksekusi, ID sumber utuh, prefiks `g1.ios.2tb.`, dan cakupan `/ai?`; kumpulkan ulang sesuai Bagian 3 |
| `status=rewritten`, `hitCount>0`, tetapi `annualHitCount=0` | Kali ini hanya menulis ulang 20TB / 30TB; periksa `id`, `to`, dan `fallback` tiap baris—status ini tidak berarti penulisan ulang promo 2TB berhasil |
| `status=no-match`, `hitCount=0` | Tidak satu pun dari ketiga tingkat yang cocok pada respons teks kali ini; cocokkan dengan ID sumber utuh dan cakupan URL pada Bagian 4, lalu kumpulkan ulang sesuai Bagian 3 |
| `fallback=false` pada 20TB / 30TB versi ini | `to` aktual adalah SKU uji coba bawaan `1month_eft` tingkat tersebut; target bawaan dipilih baik saat ia muncul di teks maupun saat baik bawaan maupun cadangan 90p tidak muncul—periksa nomor utuh sesuai Bagian 4 |
| `fallback=true` pada 20TB / 30TB versi ini | Target bawaan `1month_eft` terkait tidak ditemukan pada teks asli, sehingga memilih cadangan 90p tiga bulan tingkat tersebut dari teks; `to` aktual adalah `g1.20tb.3months_ip_90p.acq` atau `g1.ai.ultra.3months_ip_90p.acq`, dan baris ini bukan target uji coba gratis 1 bulan |
| Baris historis 20TB / 30TB menampilkan cadangan 75p | Ini adalah `to` dan `fallback` aktual yang tersimpan di versi lama; pertahankan nilai lama, cocokkan dengan `test.version`, waktu eksekusi, dan hasil kasir aslinya; 75p tidak ikut fallback pada versi ini |
| `test.target` 2TB sama dengan konfigurasi saat ini, tetapi `test.version=g1-acq-v7.5` | Ini masih catatan eksekusi v7.5 lama; targetnya sama-sama `g1.2tb.ai.12months_ip_90p`, namun target yang sama tidak berarti sudah menjalankan `g1-acq-v7.6` |
| `hitCount` lebih dari 0, tetapi kasir error atau tidak muncul | Catat pesan aktual dan target aktual `to` pada tingkat tersebut; keberhasilan penggantian teks dan penerimaan produk target oleh toko dicatat terpisah |
| Produk, siklus, atau nominal App Store berbeda dari perkiraan | Catat sesuai produk yang dikembalikan App Store dan tampilan kasir kali ini; periksa dulu apakah `to` adalah uji coba `1month_eft`, cadangan 90p tiga bulan, atau target 2TB; kata `1month_eft`, `12months`, `90p` pada SKU serta label harga tangkapan layar tidak menggantikan hasil aktual kali ini |
| `addedCount=0` dan `omittedCount>0` dengan status `limit-reached` | Tidak ada ID baru yang disimpan kali ini dan ada pembuangan kapasitas; ID yang sudah tersimpan tetap diperbarui; hanya jika jelas ingin mengosongkan ruang untuk putaran pengumpulan baru, ekspor dulu lalu bersihkan manual kedua kunci dengan `?clear=1` |

Cukup jalankan satu putaran diagnostik "catat dulu → buka ulang paket aktual → muat ulang dan bandingkan" sesuai Bagian 3 untuk menyimpan bukti sebelum dan sesudah; ID baru ditentukan oleh isi respons aktual, dan memasang ulang modul atau berulang kali membersihkan catatan tidak akan membuat server mengirimkan SKU baru.

## 8. Templat Catatan Perangkat Nyata

```text
Waktu pengumpulan / pengujian (termasuk zona waktu): [Isi]
Versi iOS / Google App / Shadowrocket: [Isi]
Nama modul utama: G1 ACQ
Alamat modul utama: https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.6.0/g1-acq-v7.sgmodule
Versi rilis modul utama: v7.6.0
Versi skrip modul utama: g1-acq-v7.6
Cara kerja: Modul tunggal mengumpulkan SKU asli dan 10 respons terakhir secara pasif, lalu menjalankan penulisan ulang tiga tingkat (uji coba gratis 1 bulan Ultra / cadangan 90p tiga bulan, kandidat promo 12 bulan 2TB)
Modul utama yang aktif saat ini: G1 ACQ
Penanda lokal dan versi di bagian atas laporan: [Isi tampilan aktual]
Versi skrip laporan reportVersion: [Isi tampilan aktual; saat ini v7.6.0]
Versi skrip pengumpulan aktual scan.version: [Isi nilai aktual tersimpan; pengumpul utama versi ini g1-acq-v7.6]
Pesan versi pengumpulan: [Isi tampilan aktual; Catatan pengumpulan lama / Belum menyimpan catatan respons pengumpulan versi ini / Status versi ini]
Hitungan teks sebelum membuka paket scan.scannedResponses: [Isi]
Hitungan teks setelah membuka paket scan.scannedResponses: [Isi]
Hitungan cocok sebelum membuka paket scan.matchedResponses: [Isi]
Hitungan cocok setelah membuka paket scan.matchedResponses: [Isi]
Hitungan non-teks sebelum membuka paket scan.nonTextResponses: [Isi; jika catatan lama tidak ada tulis "Belum tercatat"]
Hitungan non-teks setelah membuka paket scan.nonTextResponses: [Isi]
Waktu respons terakhir sebelum membuka paket: [Isi; jika catatan lama tanpa riwayat tulis "Belum tercatat"]
Waktu respons terakhir setelah membuka paket: [Isi]
Respons terkini scan.recentResponses: [Isi maks 10 baris sesuai urutan JSON lama→baru; tabel HTML baru→lama; jika tanpa riwayat tulis "Belum tercatat"]
Respons terbaru at / path / bodyType: [Isi nilai aktual tersimpan; at dalam UTC, path hanya kategori teredaksi]
Status respons terbaru status: [Isi new-skus / known-skus / no-skus / limit-reached / non-text]
Respons terbaru candidateCount / addedCount / omittedCount: [Isi jumlah kandidat berbeda / baru disimpan / dibuang karena kapasitas]
Target konfigurasi saat ini configuredTarget: g1.2tb.ai.12months_ip_90p
Asal kandidat: Pilihan tangkapan layar pengguna (user-specified), nilai literal g1.2tb.ai.12months_ip_90p, tanpa akhiran .acq
Label harga tangkapan layar: $1.99 × 12 months = $23.88/year; label promo bulanan 12 bulan berturut-turut, bukan harga iOS atau siklus penagihan terverifikasi
Arti diskon tangkapan layar: 90p = 90% off, sekitar sepersepuluh harga, bukan bayar 90%
Judul tangkapan layar: Pro 5TB; produk sumber putaran ini tetap iOS 2TB asli, tangkapan layar tidak membuktikan hak 5TB
Status verifikasi kandidat 2TB: Menunggu produk aktual App Store; isi sesuai nama produk, siklus, biaya awal, dan biaya perpanjangan putaran ini
Uji coba gratis 1 bulan Ultra: Didukung versi ini; apakah tampil pada akun saat ini: [Isi sesuai kasir kali ini]
SKU sumber 20TB: g1.ios.20tb.m.v2
SKU uji coba bawaan 20TB: g1.20tb.1month_eft.acq
SKU cadangan 90p tiga bulan 20TB: g1.20tb.3months_ip_90p.acq
SKU sumber 30TB: g1.ios.30tb.ai.pro.m
SKU uji coba bawaan 30TB: g1.ai.ultra.1month_eft.acq
SKU cadangan 90p tiga bulan 30TB: g1.ai.ultra.3months_ip_90p.acq
Aturan pilihan independen versi ini: Tiap tingkat memprioritaskan bawaan jika muncul; jika bawaan absen dan cadangan 90p muncul maka jatuh ke 90p; jika keduanya absen tetap pilih bawaan 1month_eft; 75p tidak ikut fallback pada versi ini
Kemunculan bawaan / cadangan 90p 20TB di teks asli: [Isi bukti respons asli kali ini; jika belum dicek tulis "Belum diperiksa"]
Kemunculan bawaan / cadangan 90p 30TB di teks asli: [Isi bukti respons asli kali ini; jika belum diperiksa tulis "Belum diperiksa"]
Apakah melihat dan menekan tombol "Ekspor JSON": [Isi]
Nama paket yang benar-benar dibuka di Google App: [Isi nama aktual 2TB / Pro, 20TB, atau 30TB]
SKU utuh iOS 2TB asli yang terkumpul: [Isi teks asli; jika tidak muncul tulis "Tidak terkumpul"]
SKU utuh iOS 20TB / 30TB asli yang terkumpul: [Isi teks asli; jika tidak muncul tulis "Tidak terkumpul"]
Versi skrip eksekusi test.version: [Isi nilai aktual tersimpan; versi ini g1-acq-v7.6, v7.5 lama tetap g1-acq-v7.5]
Waktu pengujian terakhir test.updatedAt (UTC): [Isi]
ID sumber, target aktual, hitungan, status cadangan per baris test.matchedFrom: [Isi {id, to, count, fallback}]
Target aktual to / fallback 20TB: [Isi nilai aktual tersimpan; bawaan versi ini g1.20tb.1month_eft.acq / false, cadangan g1.20tb.3months_ip_90p.acq / true]
Target aktual to / fallback 30TB: [Isi nilai aktual tersimpan; bawaan versi ini g1.ai.ultra.1month_eft.acq / false, cadangan g1.ai.ultra.3months_ip_90p.acq / true]
Cadangan 75p historis: [Isi to dan fallback asli hanya untuk catatan versi lama; mempertahankan g1.20tb.3months_ip_75p.acq atau g1.ai.ultra.3months_ip_75p.acq]
Log fallback: [Isi nomor target lengkap kali ini; jika tidak pakai cadangan tulis "Tidak ada"]
Target 2TB eksekusi terakhir test.target: [Isi nilai aktual tersimpan; catatan lama mempertahankan ID target aslinya; v7.5 lama sama-sama g1.2tb.ai.12months_ip_90p tetapi versi tetap nilai lama]
Asal target eksekusi terakhir test.targetOrigin: [Isi user-specified / pattern-derived / legacy / kosong; pertahankan asal lama]
Total penulisan ulang tiga tingkat test.hitCount: [Isi]
Khusus penulisan ulang promo 2TB / Pro test.annualHitCount: [Isi; nama field kompatibel, tidak membuktikan penagihan tahunan]
Status eksekusi test.status: [Isi]
Apakah kasir App Store muncul: [Isi]
Nama produk App Store: [Isi tampilan aktual]
Siklus langganan: [Isi tampilan aktual]
Mata uang / biaya awal / biaya perpanjangan: [Isi tampilan aktual]
Pesan error aktual: [Isi teks asli; jika tidak ada tulis "Tidak ada"]
Apakah benar-benar menyelesaikan pembelian: [Isi]
Hak manfaat yang tampil di akun Google One setelah pembelian: [Isi hanya jika benar-benar melakukan pembelian]
File ekspor JSON putaran ini: [Isi]
```
