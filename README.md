# ♻️ EcoBot – Game Edukasi Pengelolaan Sampah & Algoritma Pemrograman

Game edukasi interaktif berbasis web yang menggabungkan pembelajaran konsep dasar **Algoritma & Pemrograman** (*Computational Thinking*) dengan edukasi lingkungan hidup (**Pemilahan Sampah Organik & Anorganik**).

---

## 🎮 Fitur Utama

1. **Papan Permainan 5x5 Grid**:
   - Karakter robot ramah lingkungan dimulai dari petak 1 (kiri bawah) menghadap Timur.
   - Kompas arah hadap dinamis (Utara, Timur, Selatan, Barat).
   - Penomoran petak berbasis baris naik (*bottom-left origin*).

2. **Blok Instruksi Algoritma**:
   - ➡️ **Maju 1 Langkah**: Menggerakkan robot 1 langkah ke depan sesuai arah hadap.
   - 🔃 **Putar Kanan 90°**: Memutar arah hadap searah jarum jam.
   - 🔄 **Putar Kiri 90°**: Memutar arah hadap berlawanan jarum jam.
   - 🤏 **Ambil Sampah**: Memasukkan sampah ke inventoris (maks. 1 sampah).
   - 📥 **Letakkan Sampah**: Membuang sampah ke tempat sampah yang sesuai jenisnya.
   - 🔁 **Ulangi X Kali**: Kontainer perulangan (*looping*) dengan jumlah iterasi yang dapat diatur.

3. **Mekanika Edukasi & Validasi Logika**:
   - **Pemilahan Sampah**:
     - 🟢 *Organik*: Makanan, Daun, Kulit Buah $\rightarrow$ Tempat Sampah Hijau.
     - 🔵 *Anorganik*: Botol Plastik, Kaleng, Kantong Plastik $\rightarrow$ Tempat Sampah Biru.
   - **Kondisi Gagal (Game Over)**: Menabrak batu/keluar grid, salah memilah jenis sampah, pelanggaran kapasitas inventoris, atau perintah aksi di petak yang keliru.
   - **Kondisi Menang**: Seluruh sampah berhasil dipilah dengan benar ke tempat sampahnya.

4. **Multi-Level**:
   - **Level 1**: Dasar pemilahan botol plastik (anorganik) dengan penghalang batu.
   - **Level 2**: Dua jenis sampah berbeda (organik & anorganik).
   - **Level 3**: Labirin sampah dengan beberapa penghalang batu.

---

## 🚀 Cara Menjalankan Game

1. Buka file [`index.html`](index.html) langsung di browser Anda (Google Chrome, Microsoft Edge, Firefox, dll).
2. Atau jalankan menggunakan local server:
   ```bash
   python -m http.server 8000
   ```
   Lalu buka `http://localhost:8000` di browser.

---

## 🛠️ Teknologi yang Digunakan
- **HTML5**: Semantik antarmuka dan struktur aplikasi.
- **Vanilla CSS3**: Tampilan modern bertema gelap (*Dark Mode*), glassmorphism, dan animasi interaktif responsif.
- **JavaScript (ES6+)**: Engine permainan, simulasi eksekusi langkah demi langkah (*step-by-step*), dan sistem perulangan (*loop*).
