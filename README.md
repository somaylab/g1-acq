# g1-acq (Edisi Bahasa Indonesia)

> **Penulis Asli (Original Author)**: [@crhywun](https://github.com/crhywun) ([crhywun/g1-acq](https://github.com/crhywun/g1-acq))  
> **Penerjemah Bahasa Indonesia (Translator)**: **Somaylab** ([@somaylab](https://github.com/somaylab))

[![Telegram](https://img.shields.io/badge/Telegram-Grup%20Diskusi%20Promo%20AI-26A5E4?logo=telegram&logoColor=white)](https://t.me/muihbb)

> 💬 **Grup Diskusi Promo AI**: https://t.me/muihbb —— Diskusi seputar promo AI dan trik langganan

Alat penulisan ulang dan pengumpulan ID produk untuk pintu masuk langganan Google One (iOS), ditujukan bagi **Shadowrocket**.

**Cukup satu modul G1 ACQ: mendukung uji coba gratis 1 bulan Ultra, uji promo 12 bulan 2TB, pengumpulan pasif SKU asli, serta menyediakan 10 respons terakhir, penambahan baru kali ini, diagnostik duplikat, dan ekspor JSON.** iOS 2TB asli → kandidat uji promo 12 bulan `g1.2tb.ai.12months_ip_90p` yang ditentukan dari tangkapan layar pengguna; 20TB / 30TB secara bawaan menggunakan SKU uji coba gratis 1 bulan Ultra `g1.20tb.1month_eft.acq` / `g1.ai.ultra.1month_eft.acq`, dan masing-masing melakukan fallback independen ke SKU cadangan 90p tiga bulan yang sesuai. Versi instalasi saat ini adalah `v7.6.0`, skrip responsnya adalah `g1-acq-v7.6`, tidak perlu memasang pemindai terpisah atau bolak-balik mengganti modul. Pengumpulan hanya membaca respons cocok yang benar-benar diterima oleh ponsel, **tidak melakukan kueri aktif terhadap seluruh katalog SKU**; kemunculan ulang ID lama akan menambah hitungan kemunculan, sehingga daftar yang tetap sama tetap menandakan perangkat sedang menerima data berulang. Langkah instalasi lengkap dan verifikasi di perangkat nyata dapat dilihat di [Uji Promo 12 Bulan Pro & Pemindaian SKU](docs/pro-annual-test.md).

Versi ini mengintegrasikan [GitHub PR #3](https://github.com/crhywun/g1-acq/pull/3), menambahkan dukungan uji coba gratis 1 bulan Ultra untuk tingkat 20TB / 30TB; apakah uji coba ditampilkan ke akun saat ini, siklus langganan aktual, dan biaya perpanjangan dicatat berdasarkan kasir App Store, sedangkan hak manfaat dicatat berdasarkan status aktual akun Google One.

> Kemunculan ID produk dalam respons hanya membuktikan bahwa halaman membawa string tersebut, bukan validasi katalog produk App Store. Kecocokan penulisan ulang juga tidak berarti produk dapat dibeli; nama produk, siklus, biaya awal, dan biaya perpanjangan harus diperiksa di kasir App Store, dan hak manfaat mengacu pada status aktual akun Google One.

## Alamat Instalasi Modul Utama

**G1 ACQ: Uji coba gratis 1 bulan Ultra, uji promo 12 bulan 2TB, pengumpulan pasif & diagnostik aktivitas respons**

Via CDN jsDelivr (disarankan):

```text
https://cdn.jsdelivr.net/gh/somaylab/g1-acq@v7.6.0/g1-acq-v7.sgmodule
```

Alternatif langsung via GitHub Raw:

```text
https://raw.githubusercontent.com/somaylab/g1-acq/main/g1-acq-v7.sgmodule
```

Saat instalasi pertama kali, tambahkan alamat di atas pada manajemen modul Shadowrocket lalu aktifkan; saat meningkatkan dari versi lama, ganti modul **G1 ACQ** lama dengan alamat ini satu kali. Pintu masuk instalasi modul serta skrip respons dan laporan internal seluruhnya mengacu tetap pada `@v7.6.0`, tidak perlu menambahkan skrip secara terpisah; setelah memasang atau memperbarui, sambungkan ulang VPN lalu buka kembali halaman langganan di Google App. Merilis versi baru mengharuskan pembaruan isi skrip sekaligus pin versi tetap; menggabungkan PR tidak akan membuat alamat CDN tetap versi lama otomatis terbarui atau kedaluwarsa—alamat lama tetap merujuk ke versi aslinya. Pembaruan tetap mempertahankan riwayat lokal; diagnostik respons tidak menjamin munculnya ID baru, dan instalasi ulang juga tidak memaksa server mengirimkan SKU baru.

Cukup aktifkan satu modul **G1 ACQ** ini saja. Jika ponsel pernah memasang **G1 SKU Scan**, **G1 Pro Annual Test** terpisah, atau salinan penulisan ulang lainnya, nonaktifkan salinan lama tersebut agar tidak terjadi penghitungan ganda atau penulisan ulang ganda; jika hanya memasang satu modul utama, tidak ada langkah penonaktifan tambahan. Tag historis `v7.0.0` / `v7.1.0` / `v7.2.0` / `v7.3.0` / `v7.4.0` / `v7.5.0` serta `pro-annual-test-v1` / `pro-annual-test-v2` tetap dipertahankan.

Diagnostik 10 respons terakhir disediakan oleh skrip utama `g1-acq-v7.6`; pintu masuk kompatibilitas **G1 Pro Annual Test** juga memakai skrip ini, tetapi tetap hanya mencocokkan `/ai?`. Pintu masuk kompatibilitas **G1 SKU Scan** terpisah hanya memperbarui pin unduhan, skripnya tetap menyimpan versi historis `pro-annual-test-v2` tanpa menambahkan diagnostik aktivitas baru; ketika laporan versi baru membacanya, akan tampil **Catatan pengumpulan lama** dengan riwayat respons kosong.

## Pemetaan Tiga Tingkat

Skrip terlebih dahulu mengumpulkan SKU dari respons teks asli `one.google.com/`, lalu hanya pada respons yang cocok dengan `one.google.com/ai?` menjalankan pemetaan berikut berdasarkan SKU sumber utuh:

| SKU sumber utuh di isi respons | Target bawaan | Target cadangan |
|---|---|---|
| SKU utuh berprefiks `g1.ios.2tb.` | `g1.2tb.ai.12months_ip_90p` (kandidat pilihan pengguna) | Tidak ada |
| `g1.ios.20tb.m.v2` | `g1.20tb.1month_eft.acq` (uji coba gratis 1 bulan Ultra) | `g1.20tb.3months_ip_90p.acq` (promo 90p tiga bulan) |
| `g1.ios.30tb.ai.pro.m` | `g1.ai.ultra.1month_eft.acq` (uji coba gratis 1 bulan Ultra) | `g1.ai.ultra.3months_ip_90p.acq` (promo 90p tiga bulan) |

Produk sumber uji promo 12 bulan 2TB adalah **iOS 2TB asli**, dengan target tetap dan tanpa tingkat cadangan. Tingkat 20TB / 30TB masing-masing memilih secara independen berdasarkan isi teks respons asli: jika target bawaan `1month_eft` muncul, target bawaan diprioritaskan meskipun cadangan 90p yang sesuai juga muncul; hanya jika target bawaan tidak muncul sementara cadangan 90p yang sesuai muncul, maka beralih ke 90p; jika kedua target tidak muncul, tetap menggunakan target bawaan `1month_eft`. `75p` tidak lagi menjadi target cadangan pada versi ini; catatan historis versi lama untuk `g1.20tb.3months_ip_75p.acq` dan `g1.ai.ultra.3months_ip_75p.acq` tetap dipertahankan apa adanya. Ini adalah penilaian string pada isi respons, bukan kueri produk toko. Jika ketiga tingkat tidak cocok, respons dikembalikan apa adanya.

**Kandidat 2TB ditetapkan sebagai `g1.2tb.ai.12months_ip_90p`, tanpa akhiran `.acq`.** Item pertama pada tangkapan layar pengguna menyediakan kandidat tersebut beserta label harga `$1.99 × 12 months = $23.88/year`, yang menggambarkan promo bulanan selama 12 bulan berturut-turut; `90p` berarti **diskon 90% (90% off), sekitar sepersepuluh harga**, bukan membayar 90% (diskon 10%). `$23.88/year` adalah label total 12 bulan pada tangkapan layar, bukan bukti penagihan tahunan sekali bayar.

Judul pada tangkapan layar adalah **Pro 5TB**, namun produk sumber putaran ini tetap SKU utuh iOS 2TB asli berprefiks `g1.ios.2tb.`, tanpa penambahan prefiks sumber 5TB baru. Tangkapan layar merupakan sumber kandidat dan label harga, bukan data produk toko iOS yang terverifikasi, dan tidak membuktikan harga iOS aktual, siklus penagihan, maupun hak 5TB. Nama aktual, siklus, serta biaya awal dan perpanjangan diverifikasi lewat produk yang dikembalikan App Store, dan hak manfaat mengacu pada tampilan akun Google One. Pengujian offline memverifikasi pencocokan string dan perilaku laporan.

## Instalasi (Shadowrocket)

Masuk ke **Halaman Konfigurasi (Config) → ikon (i) di sebelah kanan konfigurasi yang sedang digunakan → HTTPS Decryption (Dekripsi HTTPS)**.

![Ilustrasi pintu masuk konfigurasi: ketuk ikon (i) di sebelah kanan konfigurasi aktif untuk masuk ke editor konfigurasi agar dapat melihat HTTPS Decryption](docs-config-entry-example.png)

Nama konfigurasi pada gambar hanyalah contoh; daftar file pribadi, waktu modifikasi, ukuran file, dan bilah status perangkat telah dihapus.

1. Pada manajemen modul Shadowrocket, aktifkan **G1 ACQ** yang dipasang dari alamat `v7.6.0` di atas; pengguna versi lama perbarui satu kali sesuai langkah sebelumnya, dan jaga koneksi VPN tetap aktif di beranda.
2. Dari pintu masuk **(i)** pada konfigurasi aktif di atas, masuk ke **HTTPS Decryption**, lalu aktifkan sakelar dekripsi. Jika sudah ada sertifikat Shadowrocket yang valid dan tepercaya, langsung gunakan; jika belum dikonfigurasi, buat dan pasang sertifikat di halaman tersebut lalu selesaikan dua langkah berikut.
3. Saat konfigurasi sertifikat pertama kali, selesaikan instalasi profil Shadowrocket di iOS melalui **Pengaturan → Umum → VPN & Manajemen Perangkat**.
4. Saat konfigurasi sertifikat pertama kali, aktifkan kepercayaan penuh untuk sertifikat root Shadowrocket terkait di iOS melalui **Pengaturan → Umum → Mengenai → Pengaturan Kepercayaan Sertifikat**.
5. Periksa `one.google.com` pada **daftar hostname HTTPS Decryption** di konfigurasi aktif; modul menambahkan domain ini via `%APPEND%`. Ini adalah daftar dekripsi HTTPS, bukan DNS Hosts.
6. Setelah memasang modul, mengubah sakelar modul, atau mengubah konfigurasi dekripsi, sambungkan ulang Shadowrocket lalu buka kembali halaman langganan di Google App.

## Alur Penggunaan di Ponsel

1. Pastikan **G1 ACQ** versi baru aktif dan Shadowrocket terhubung; setelah menerima respons yang cocok, pengumpulan dan penulisan ulang dijalankan secara berurutan otomatis.
2. Buka **Google App (ikon G berwarna) → Kelola Google One**, masuk ke paket **2TB / Pro** untuk menguji promo 12 bulan; untuk memverifikasi pemetaan uji coba gratis 1 bulan Ultra, buka masing-masing paket **20TB / 30TB** yang tersedia di halaman.
3. Setelah masuk ke alur langganan, periksa nama produk, siklus, biaya awal, dan biaya perpanjangan pada kasir App Store; tempelkan [alamat laporan lokal](https://one.google.com/g1-sku-report) lengkap di bilah alamat Safari untuk melihat kandidat SKU asli dan catatan penulisan ulang, lalu tekan tombol **Ekspor JSON** pada area aksi.

![Panel pemilihan paket Google One Ultra: contoh pintu masuk paket 20TB dari modul lama](docs-ultra-plans-example.png)

Tangkapan layar menampilkan pintu masuk 20TB; untuk uji promo 12 bulan 2TB, buka paket **2TB / Pro**. Akun, wilayah, dan versi memengaruhi tampilan halaman—aculah pada paket yang benar-benar tersedia di ponsel. Antarmuka StoreKit bawaan sendiri tidak termasuk dalam cakupan penulisan ulang respons web.

Saat menjelajahi paket dan menerima respons yang cocok, modul utama terlebih dahulu membaca `g1.*` dan `com.google.one.*` dari isi teks asli, melakukan deduplikasi berdasarkan ID dan mengakumulasi jumlah kemunculannya hingga maksimum **300 ID**, baru kemudian menjalankan penulisan ulang tiga tingkat untuk cakupan `/ai?`. ID berulang hanya memperbarui hitungan dan waktu; setelah mencapai kapasitas, ID yang sudah tersimpan tetap diperbarui dan jumlah ID baru yang dibuang karena kapasitas tetap dicatat. Pengumpulan menyimpan nomor asli sebelum penulisan ulang, dan melewati halaman laporan lokal; tidak diperlukan pemindai tambahan. Ponsel hanya menyimpan ID kandidat, hitungan, waktu, status pemindaian, dan maksimum 10 kejadian respons dengan path yang telah diredaksi—tidak menyimpan isi respons lengkap, tidak mengkueri App Store, dan tidak mengirim laporan ke jaringan luar.

Untuk mencari SKU yang tidak ditampilkan di halaman, buka secara berurutan opsi bulanan, tahunan, dan promo yang benar-benar disediakan oleh Google App: ID yang dibawa dalam respons asli tetap akan dikumpulkan meskipun tidak terlihat di antarmuka. ID yang tidak dikirimkan oleh server tidak akan masuk ke daftar asli; kandidat yang ditentukan diganti oleh modul lalu diverifikasi pada antarmuka langganan bawaan App Store. Prosedur iOS lengkap ada di [Pengumpulan SKU & Verifikasi Kandidat](docs/pro-annual-test.md#6-mengumpulkan-dan-memverifikasi-sku-tersembunyi-di-shadowrocket-ios).

## Laporan Lokal & Pemecahan Masalah

Jaga **G1 ACQ** tetap aktif dan Shadowrocket terhubung, lalu tempelkan [alamat laporan lokal](https://one.google.com/g1-sku-report) lengkap di bilah alamat Safari. Di bagian atas halaman harus tampil **Skrip lokal telah mengambil alih** dan tanda **v7.6.0**, serta tombol **Ekspor JSON** pada area aksi; Anda juga dapat membuka langsung [alamat ekspor JSON](https://one.google.com/g1-sku-report?format=json).

Alamatnya menggunakan `one.google.com`, namun halaman dibuat secara lokal di ponsel oleh skrip `http-request` Shadowrocket, **bukan halaman laporan dari Google**. Cakupan intersepsi meliputi `/g1-sku-report`, path yang sama dengan `/` di akhir, beserta query-nya; setelah diambil alih secara lokal, HTML atau JSON dikembalikan langsung tanpa meneruskan permintaan ke Google.

Jika yang terlihat adalah halaman biasa Google, 404, atau tidak ada tanda lokal serta tombol ekspor di atas, maka yang tampil bukanlah laporan lokal versi ini. Periksa apakah modul baru aktif, Shadowrocket terhubung, **Konfigurasi aktif (i) → HTTPS Decryption**, hostname `one.google.com`, dan sertifikat tepercaya, lalu tempelkan kembali URL lengkap di bilah alamat Safari.

`reportVersion=v7.6.0` menunjukkan versi skrip laporan, **bukan bukti bahwa pengumpul versi baru sudah menerima respons**. Laporan menampilkan `scan.version` aktual yang tersimpan, waktu respons terakhir, dan riwayat secara terpisah; pengumpul utama versi ini adalah `g1-acq-v7.6`. Catatan skrip lama menampilkan **Catatan pengumpulan lama; belum menyimpan catatan respons pengumpulan versi ini.** Jika versi tidak diketahui atau belum ada catatan, tampil **Belum menyimpan catatan respons pengumpulan versi ini**; saat catatan lama tidak memiliki `recentResponses`, riwayat aktivitas tidak dibuat-buat dan hal itu tidak dijadikan kesimpulan bahwa ponsel bermasalah.

| Field pengumpulan | Arti |
|---|---|
| `scan.scannedResponses` | Total kumulatif respons teks yang diproses, mempertahankan arti hitungan sebelumnya |
| `scan.matchedResponses` | Total kumulatif respons teks yang mengidentifikasi minimal satu ID kandidat, termasuk ID berulang; mempertahankan arti sebelumnya |
| `scan.nonTextResponses` | Total kumulatif respons non-teks, tidak dihitung ke `scannedResponses` |
| `scan.recentResponses` | Maksimum 10 kejadian respons; array JSON disimpan berurutan lama → baru sesuai kedatangan, tabel HTML ditampilkan baru → lama; tiap item berisi `{at, path, bodyType, status, candidateCount, addedCount, omittedCount}` |

Pada setiap kejadian tunggal, `candidateCount` adalah jumlah kandidat unik di dalam respons tersebut, `addedCount` adalah jumlah ID baru yang ditambahkan dan benar-benar disimpan kali ini, sedangkan `omittedCount` adalah jumlah ID berbeda yang dibuang kali ini akibat batas kapasitas. Status meliputi `new-skus` (ada penambahan baru), `known-skus` (duplikat), `no-skus` (tanpa ID), `limit-reached` (tidak ada penambahan baru yang disimpan dan ada pembuangan kapasitas), serta `non-text` (non-teks). Ketika `addedCount>0`, status diprioritaskan menjadi `new-skus` meskipun `omittedCount>0` juga terjadi; hanya saat `addedCount=0` dan `omittedCount>0` baru ditandai `limit-reached`. Path hanya menyimpan `/`, `/ai`, `/plans`, `/_/…/data/batchexecute`, atau `[Path one.google.com lainnya]`—tidak menyimpan query, URL lengkap, isi respons, header permintaan, maupun header respons.

`configuredTarget=g1.2tb.ai.12months_ip_90p` di tingkat atas menunjukkan konfigurasi saat ini; sedangkan `test.version` dan `test.target` berasal dari catatan eksekusi terakhir yang tersimpan, sehingga setelah pembaruan tetap mempertahankan versi lama dan target lama yang sebenarnya tersimpan sampai tercipta catatan baru. Skrip respons saat ini adalah `g1-acq-v7.6`, dengan `test.targetOrigin=user-specified` untuk catatan kandidat baru. Catatan v7.5 lama juga memiliki target 2TB `g1.2tb.ai.12months_ip_90p` dan asal `user-specified`, namun `test.version`-nya tetap `g1-acq-v7.5`; target yang sama tidak berarti catatan lama telah diperbarui. Catatan v7.3 / v7.4 lama mempertahankan `g1.2tb.ai.annual_ip_90p.acq` dan `user-specified`; catatan v7.2 lama mempertahankan `g1.2tb.ai.annual.3months_ip_90p.acq` dan `pattern-derived`; catatan langganan tahunan biasa v1 / v7.1 lama mempertahankan `g1.2tb.ai.annual` dan `legacy`; jika tidak ada catatan, asalnya kosong. Pembaruan tidak melabeli ulang ID historis maupun asal target menjadi kandidat saat ini. `test.target` hanya menyatakan target 2TB yang dikonfigurasi pada eksekusi tersebut; target aktual 20TB / 30TB dilihat pada kolom `to` tiap baris.

`test.hitCount` adalah total penulisan ulang tiga tingkat; `test.annualHitCount` mempertahankan nama field kompatibel dan hanya menghitung penulisan ulang promo 2TB / Pro, sama dengan `annualHits` pada log, dan di laporan ditampilkan sebagai "Di antaranya 2TB". Nama field dan hitungan tidak membuktikan penagihan tahunan. Setiap baris `test.matchedFrom` berisi `{id, to, count, fallback}`: `to` adalah target aktual sumber tersebut kali ini, `fallback=true` berarti menggunakan target cadangan sesuai versi eksekusi tersebut. Pada versi ini, target cadangan 20TB / 30TB masing-masing adalah `g1.20tb.3months_ip_90p.acq` / `g1.ai.ultra.3months_ip_90p.acq`; catatan historis versi lama tetap dapat menyimpan target cadangan 75p. HTML menggabungkan `fallback` dan `to` aktual untuk menampilkan cadangan 90p, cadangan 75p historis, atau "Tidak"; jika ditandai sebagai cadangan tetapi informasi target kurang, hanya ditampilkan "Ya", dan nilai asli baris lama tetap dipertahankan. Saat `fallback=false` pun tetap perlu mencocokkan `test.version` dan `to` untuk memverifikasi target bawaan.

`status=no-match` hanya berarti ketiga tingkat tidak cocok, dan respons dikembalikan apa adanya; jika 2TB tidak cocok tetapi 20TB / 30TB cocok, status tetap `rewritten`, sehingga harus melihat `annualHitCount` untuk menilai penulisan ulang promo 2TB. Laporan hanya menyimpan catatan eksekusi terakhir yang diperiksa berdasarkan waktu; konfirmasikan ID sumber utuh dari hasil pengumpulan tanpa menebak-nebak SKU iOS baru. Laporan kompatibel dengan catatan v1 lama yang hanya berisi 2TB: jika baris lama tidak memiliki `to`, diisi dengan target tahunan biasa awal `g1.2tb.ai.annual`, dan `annualHitCount` yang kosong dihitung dari jumlah hitungan baris lama. Catatan eksekusi v1 / v7.1 lama tetap menampilkan `g1.2tb.ai.annual`; catatan v7.2 lama tetap menampilkan `g1.2tb.ai.annual.3months_ip_90p.acq` yang tersimpan; catatan v7.3 / v7.4 lama tetap menampilkan `g1.2tb.ai.annual_ip_90p.acq`; catatan v7.5 lama tetap menampilkan `g1.2tb.ai.12months_ip_90p` dan versi lama `g1-acq-v7.5`. Target aktual, asal, dan versi catatan lama seluruhnya dipertahankan.

Prefiks log skrip saat ini adalah `[g1-acq]`, periksa hasil eksekusi berdasarkan field berikut:

| Penanda keluaran | Arti |
|---|---|
| `g1-acq-v7.6 status=<status> addedCount=N candidates=N omittedCount=N occurrences=N saved=yes/no` | Status pengumpulan, jumlah ID baru yang disimpan kali ini, kandidat unik per respons, jumlah yang dibuang karena kapasitas, total kemunculan string, dan hasil penyimpanan; hanya `saved=yes` yang berarti catatan kali ini telah ditulis |
| `saved=no` / `SKU collection unavailable` | Penulisan catatan kali ini gagal, atau proses pengumpulan belum selesai; laporan tetap bisa menampilkan hitungan dan waktu lama—periksa log semacam ini |
| `g1-acq-v7.6 hits=N annualHits=N` | Versi skrip saat ini, total penulisan ulang tiga tingkat, dan di antaranya penulisan ulang promo 2TB / Pro (nama log kompatibel, tidak membuktikan penagihan tahunan) |
| `SKU sumber → target aktual xN` | Mencatat per baris ID sumber utuh, target aktual kali ini, dan jumlah penulisan ulang sumber tersebut |
| `fallback=nomor target lengkap aktual` | Baris 20TB / 30TB tersebut menggunakan tingkat cadangan; versi ini mengeluarkan `fallback=g1.20tb.3months_ip_90p.acq` atau `fallback=g1.ai.ultra.3months_ip_90p.acq`, konsisten dengan `to` aktual baris tersebut; `fallback=75p` di log versi lama hanyalah format historis |

Jika daftar masih berisi SKU lama, bandingkan aktivitas aktual satu kali dengan urutan berikut:

1. Catat `reportVersion`, `scan.version` aktual, tiga hitungan respons, dan waktu kejadian terbaru di laporan, lalu pertahankan daftar saat ini.
2. Dari Google App, masuk kembali ke paket 2TB / Pro yang benar-benar tersedia, lalu buka halaman paket lain yang tersedia dan tunggu hingga selesai dimuat.
3. Kembali ke Safari dan muat ulang laporan. Jika hitungan teks bertambah dan kejadian terbaru adalah `known-skus`, berarti yang diterima adalah ID yang sudah tersimpan—hitungan kemunculan akan naik sementara daftar tidak bertambah; `no-skus` berarti respons tersebut tidak membawa ID yang dapat dikenali. Jika hanya `nonTextResponses` yang naik, periksa kejadian `non-text`.
4. Jika ketiga hitungan dan waktu kejadian terbaru tidak berubah sama sekali, hanya dapat dipastikan putaran ini tidak menyimpan catatan pengumpulan baru; kegagalan penulisan penyimpanan juga mempertahankan hitungan lama. Periksa dulu apakah log skrip memunculkan `saved=no` atau `SKU collection unavailable`, lalu cek satu per satu cache halaman, cakupan pencocokan `one.google.com/`, koneksi VPN, sakelar modul, HTTPS Decryption pada konfigurasi aktif, kepercayaan sertifikat, dan hostname. Peningkatan versi laporan saja tidak berarti skrip pengumpul sudah tereksekusi.

Diagnostik ini tidak menjamin kemunculan SKU baru; menginstal ulang modul atau berulang kali membersihkan catatan tidak akan membuat server mengirimkan ID baru. `?clear=1` tetap berupa pembersihan dua kunci secara manual dan hanya digunakan jika benar-benar ingin mereset riwayat. Kamus field lengkap, pengumpulan, dan templat catatan perangkat nyata ada di [Uji Promo 12 Bulan Pro & Pemindaian SKU](docs/pro-annual-test.md).

## Cakupan Kerja & Penyimpanan Lokal

| Alat | Cakupan pencocokan skrip | Perilaku |
|---|---|---|
| Pengumpulan pasif G1 ACQ | Respons `^https://one\.google\.com/`, melewati halaman laporan lokal | Mengumpulkan ID kandidat dari isi teks asli; menghitung non-teks secara terpisah; menyimpan diagnostik 10 respons terakhir |
| Penulisan ulang tiga tingkat G1 ACQ | Respons `^https://one\.google\.com/ai\?` | Setelah pengumpulan, menjalankan penulisan ulang SKU utuh, fallback independen, dan menyimpan catatan eksekusi terakhir |
| Halaman hasil lokal | `/g1-sku-report`, path yang sama dengan `/` di akhir, beserta query-nya | Menampilkan hasil pengumpulan secara lokal, catatan penulisan ulang terakhir, atau mengekspor JSON |

- **Cakupan pemrosesan skrip**: G1 ACQ membaca isi respons halaman yang cocok secara pasif, menyimpan ID kandidat, hitungan, waktu, status pemindaian, serta maksimum 10 kejadian respons teredaksi terlebih dahulu, lalu memeriksa cakupan penulisan ulang; tidak membaca header permintaan maupun body permintaan, dan tidak menyimpan isi respons lengkap. Kejadian respons hanya menyimpan waktu, kategori path tetap, tipe body, status diagnostik, dan hitungan—tidak menyimpan query atau URL lengkap. Penulisan ulang hanya mengganti ID produk dan tidak menyentuh field harga; harga teks di halaman tidak menggantikan nominal pada kasir App Store.
- **Perilaku keluar jaringan aktual**: Skrip saat ini tidak memiliki pemanggilan pelaporan ke jaringan luar; G1 ACQ menulis log skrip, sementara pengumpulan, penulisan ulang, dan laporan berbagi `$persistentStore` lokal ponsel. Host skrip Shadowrocket menyediakan API jaringan dan penyimpanan; tidak adanya pemanggilan pelaporan jaringan pada kode saat ini tidak berarti host tidak memiliki kemampuan keluar jaringan. Pengunduhan modul dan skrip tetap menggunakan alamat GitHub / jsDelivr.
- **Cakupan MITM**: Modul hanya menambahkan `one.google.com`, sehingga seluruh lalu lintas situs tersebut masuk cakupan dekripsi; penulisan ulang halaman dibatasi oleh path skrip. Sertifikat dibuat, dipasang, dan dipercaya di perangkat, sedangkan pengaturan HTTPS Decryption berada di konfigurasi aktif.
- **Izin sistem**: Skrip tidak meminta panggilan lokasi, album foto, maupun notifikasi; proses penggunaan mencakup koneksi VPN Shadowrocket serta pemasangan profil deskripsi dan kepercayaan sertifikat root iOS.
- **Dampak aturan global**: Bagian `[Rule]` modul memblokir UDP 443 secara global agar permintaan QUIC yang mendukung fallback beralih ke TCP, yang juga memengaruhi penggunaan HTTP/3, kecepatan, atau konektivitas aplikasi lain.
- **Versi & penyimpanan**: Pintu masuk instalasi modul dan seluruh skrip internal kali ini diseragamkan ke `@v7.6.0`; versi historis dan tag v1 / v2 tetap dipertahankan tanpa dipindah. Kunci lokal tetap `g1.sku.scan.v1` dan `g1.pro.annual.test.v1` dengan `schemaVersion` tetap `1`; waktu pengumpulan, kejadian respons, dan catatan eksekusi menggunakan UTC; `?clear=1` di halaman hasil hanya membersihkan dua kunci ini.

## Daftar File

| File | Kegunaan |
|---|---|
| [g1-acq-v7.sgmodule](g1-acq-v7.sgmodule) | Satu-satunya modul utama: pengumpulan pasif, penulisan ulang tiga tingkat, dan diagnostik aktivitas respons |
| [g1-acq.js](g1-acq.js) | Skrip respons `g1-acq-v7.6`, mengumpulkan SKU asli dan diagnostik aktivitas terlebih dahulu, lalu menulis ulang dan menyimpan catatan |
| [g1-pro-annual-test.sgmodule](g1-pro-annual-test.sgmodule) | File kompatibilitas versi lama, mempertahankan cakupan pencocokan `/ai?`, tidak perlu dipasang atau diaktifkan dalam alur utama |
| [g1-sku-scan.sgmodule](g1-sku-scan.sgmodule) | File kompatibilitas pemindaian terpisah versi lama, tidak perlu dipasang atau diaktifkan dalam alur utama |
| [g1-sku-scan.js](g1-sku-scan.js) | Skrip pemindaian terpisah historis, mempertahankan deduplikasi ID kandidat, hitungan, dan pencatatan waktu; tidak menambah diagnostik aktivitas respons |
| [g1-sku-report.js](g1-sku-report.js) | Laporan HTML lokal, versi pengumpulan aktual & riwayat respons, ekspor JSON, dan pembersihan manual dua kunci |
| [docs/pro-annual-test.md](docs/pro-annual-test.md) | Penggunaan modul tunggal, diagnostik pengumpulan pasif, verifikasi perangkat nyata promo 12 bulan, dan field laporan |

## Verifikasi Offline

Gunakan Node.js 18 atau lebih baru, jalankan di direktori root repositori:

```sh
node --test tests/sku-tools.test.cjs
```

Pemeriksaan offline berpusat pada skrip utama [g1-acq.js](g1-acq.js), mencakup pencocokan nomor utuh tiga tingkat, kandidat tetap promo 12 bulan 2TB, prioritas bawaan `1month_eft` dan 16 kombinasi fallback independen 90p untuk 20TB / 30TB, tetap memakai `1month_eft` saat target bawaan maupun cadangan tidak ada, `75p` tidak ikut fallback pada versi ini, halaman yang hanya memiliki 20TB / 30TB, cakupan URL, nol kecocokan pada tiga tingkat, total penulisan ulang dan penulisan ulang 2TB, tampilan cadangan 90p dan cadangan 75p historis berdasarkan `to` aktual, pemisahan konfigurasi saat ini dengan target eksekusi terakhir, kompatibilitas laporan v1 / v7.1 / v7.2 / v7.3 / v7.4 / v7.5 lama, error penyimpanan, deduplikasi dan batas pengumpulan, laporan lokal, field ekspor, serta versi skrip modul. Cocokkan hasil berdasarkan keluaran eksekusi aktual; ID sumber dalam pengujian merupakan sampel sintetis, bukan bukti ketersediaan di toko maupun bukti pembelian di perangkat nyata.

## Ucapan Terima Kasih Kontributor & Kredit

- **Penulis Asli**: [@crhywun](https://github.com/crhywun) ([crhywun/g1-acq](https://github.com/crhywun/g1-acq))
- **Penerjemah Bahasa Indonesia**: **Somaylab** ([@somaylab](https://github.com/somaylab))
- Terima kasih kepada [@cehomecambodia-lang](https://github.com/cehomecambodia-lang) yang melalui [PR #3](https://github.com/crhywun/g1-acq/pull/3) menyediakan pemetaan SKU uji coba gratis 1 bulan Ultra 20TB / 30TB serta skema cadangan 90p tiga bulan.
