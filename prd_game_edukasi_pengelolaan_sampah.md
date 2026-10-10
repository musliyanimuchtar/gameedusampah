# Product Requirement Document (PRD)
## Game Edukasi Pengelolaan Sampah & Algoritma Pemrograman

---

## 1. Ringkasan Eksekutif & Tujuan

Game edukasi ini dirancang untuk mengajarkan konsep dasar **Algoritma dan Pemrograman** (seperti urutan/sequencing, rotasi, perulangan/loops, dan logika variabel bawaan) kepada siswa sekolah dasar/menengah melalui tema lingkungan, yaitu **Pengelolaan Sampah**. 

Pemain bertugas menyusun blok perintah guna mengarahkan karakter mengambil dan memilah sampah ke tempat sampah yang sesuai pada papan grid 5x5.

### Tujuan Utama:
* **Edukasi Pemrograman:** Memahami pemikiran komputasional (*Computational Thinking*), penyusunan alur logika sekuensial, dan pemanfaatan instruksi perulangan.
* **Edukasi Lingkungan:** Meningkatkan kesadaran akan pemilahan jenis sampah organik dan anorganik.

---

## 2. Target Pengguna & Platform

* **Audiens Utama:** Siswa SD (Kelas 4-6) hingga SMP.
* **Platform Target:** Web Application (Desktop / Tablet Interactive).

---

## 3. Sistem & Mekanika Permainan

### 3.1. Spesifikasi Grid (5x5) & Penomoran Petak

Papan permainan terdiri dari **25 petak** dengan skema penomoran berbasis baris naik (*bottom-left origin*):

* **Petak 1:** Pojok kiri bawah.
* **Petak 6:** Tepat di atas petak 1.
* **Petak 25:** Pojok kanan atas.

**Pemetaan Grid 5x5:**

| Baris | Petak (Kiri $\rightarrow$ Kanan) |
| :--- | :--- |
| **Baris 5 (Atas)** | `[21]` `[22]` `[23]` `[24]` `[25]` |
| **Baris 4** | `[16]` `[17]` `[18]` `[19]` `[20]` |
| **Baris 3** | `[11]` `[12]` `[13]` `[14]` `[15]` |
| **Baris 2** | `[ 6]` `[ 7]` `[ 8]` `[ 9]` `[10]` |
| **Baris 1 (Bawah)**| `[ 1]` `[ 2]` `[ 3]` `[ 4]` `[ 5]` |

### 3.2. Objek dalam Permainan

1. **Karakter Pemain:**
   * Posisi Awal: Selalu dimulai pada **Petak 1**.
   * Arah Hadap Awal: Menghadap ke **Timur (Kanan)**.
   * Kapasitas Inventoris: **Maksimal membawa 1 sampah** dalam satu waktu.
2. **Sampah:**
   * **Organik:** Makanan, daun, kulit buah.
   * **Anorganik:** Botol plastik, kaleng, kantong plastik.
3. **Tempat Sampah:**
   * **Tempat Sampah Organik** (Warna Hijau).
   * **Tempat Sampah Anorganik** (Warna Kuning/Biru).
4. **Penghalang (Obstacles):**
   * **Batu / Rumput Tebal:** Petak melintang yang tidak dapat dilalui karakter.

---

## 4. Spesifikasi Blok Perintah (Algorithm Block Suite)

Pemain menyusun instruksi visual (*drag-and-drop* atau *sequence builder*) menggunakan blok berikut:

| No | Nama Blok Perintah | Fungsi / Perilaku |
| :-: | :--- | :--- |
| 1 | **Maju 1 Langkah** | Menggerakkan karakter 1 petak ke depan sesuai arah hadap saat ini. |
| 2 | **Berputar 90° Searah Jarum Jam** | Memutar arah hadap karakter $90^\circ$ ke kanan (misal: Timur $\rightarrow$ Selatan). |
| 3 | **Berputar 90° Berlawanan Jarum Jam** | Memutar arah hadap karakter $90^\circ$ ke kiri (misal: Timur $\rightarrow$ Utara). |
| 4 | **Ambil Sampah** | Mengambil sampah di petak tempat karakter berdiri. Masuk ke inventoris. |
| 5 | **Letakkan Sampah** | Membuang sampah di inventoris ke tempat sampah di petak tempat karakter berdiri. |
| 6 | **Ulangi X Kali** | Blok kontainer (*Loop*) yang mengeksekusi sub-instruksi di dalamnya sebanyak $X$ kali. |

---

## 5. Logika Aturan, Kalah, dan Menang

### 5.1. Kondisi Kalah (Game Over)

Permainan **langsung dihentikan dan dinyatakan Gagal** apabila terjadi kondisi berikut:

1. **Menabrak Penghalang / Keluar Papan:** Karakter melangkah ke petak berisi Batu/Rumput atau melangkah keluar dari batas grid (petak 1–25).
2. **Salah Memilah Sampah:** Memasukkan Sampah Organik ke Tempat Sampah Anorganik (atau sebaliknya).
3. **Pelanggaran Inventoris:** Menjalankan perintah `Ambil Sampah` saat sudah membawa 1 sampah.
4. **Aksi Tidak Valid:** 
   * Menjalankan `Ambil Sampah` di petak kosong.
   * Menjalankan `Letakkan Sampah` saat tidak membawa sampah atau tidak berada di petak tempat sampah.
5. **Program Selesai Tanpa Hasil:** Seluruh instruksi selesai dieksekusi, namun masih ada sampah di grid atau belum terbuang dengan benar.

### 5.2. Kondisi Menang (Victory)

* Seluruh sampah di grid berhasil diambil dan diletakkan pada jenis tempat sampah yang sesuai.

---

## 6. Contoh Alur & Level

### Level 1 (Dasar Pemilahan Botol Plastik)

* **Karakter:** Petak 1 (Menghadap Timur).
* **Botol Plastik (Anorganik):** Petak 3.
* **Tempat Sampah Anorganik:** Petak 13.
* **Penghalang (Batu):** Petak 8.

**Algoritma Solusi:**
```text
1. Ulangi 2 Kali:
      - Maju 1 Langkah
2. Ambil Sampah
3. Berputar 90° Berlawanan Jarum Jam
4. Ulangi 2 Kali:
      - Maju 1 Langkah
5. Letakkan Sampah
```

---

## 7. Kebutuhan Antarmuka Pengguna (UI/UX)

* **Area Grid (Sisi Kiri/Tengah):** Tampilan visual grid 5x5, posisi karakter beserta arah hadapnya, indikator sampah, dan tempat sampah.
* **Panel Perintah (Sisi Kanan):** Daftar pilihan blok perintah yang dapat ditarik/dipilih.
* **Area Kerja (Workspace):** Area penyusunan urutan kode/algoritma.
* **Tombol Kontrol:**
  * **Jalankan / Play:** Mengeksekusi urutan kode step-by-step.
  * **Reset:** Mengembalikan posisi karakter dan objek ke kondisi awal level.