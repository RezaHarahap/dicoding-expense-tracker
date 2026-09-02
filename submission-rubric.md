# Submission Expense Tracker — Ringkasan Rubrik

Project ini merupakan submission kelas **Belajar Membuat Front-End Web untuk Pemula** Dicoding.

## Kriteria Utama

### 1. Manipulasi DOM untuk Form dan Daftar Transaksi
- Menampilkan transaksi pemasukan dan pengeluaran pada daftar yang sesuai.
- Validasi judul transaksi dan nominal minimal Rp1.
- Dashboard saldo, pemasukan, dan pengeluaran diperbarui otomatis.

### 2. Web Storage API
- Data disimpan ke `localStorage` menggunakan `JSON.stringify()`.
- Data dimuat kembali menggunakan `JSON.parse()`.
- Mendukung penghapusan dan pengeditan transaksi.
- Perubahan data memicu Custom Event melalui `dispatchEvent()`.

### 3. Fitur Interaktif
- Tombol **Ubah Tipe** memindahkan transaksi antara pemasukan dan pengeluaran.
- Pencarian transaksi berdasarkan judul bekerja secara langsung saat pengguna mengetik.
- Ketika pencarian dikosongkan, seluruh transaksi kembali ditampilkan.

## Struktur Data

```javascript
{
  id: string | number,
  title: string,
  amount: number,
  date: string,
  type: string
}
```

## Atribut Pengujian

Atribut `data-testid` pada elemen yang dibutuhkan oleh sistem penilaian Dicoding dipertahankan di dalam project.

> Dokumen ini merupakan ringkasan rubrik untuk dokumentasi repository. Implementasi utama dapat dilihat pada `index.html`, `main.js`, dan `style.css`.
