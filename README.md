# SehatTrack Esnesaba - Panduan Setup

Aplikasi ini adalah sistem monitoring 30 hari hidup sehat untuk siswa SMP Esnesaba. Dibangun menggunakan HTML, CSS modern, dan JavaScript, dengan backend Google Sheets via Google Apps Script (GAS).

## 1. Persiapan Google Sheets & Apps Script

Aplikasi ini memerlukan Google Sheets sebagai database. Ikuti langkah berikut:

1.  Buka [Google Sheets](https://sheets.new) baru.
2.  Beri nama file: `SehatTrack_Database`.
3.  Ubah nama tab bawah dari "Sheet1" menjadi **"Data"**.
4.  Buat header di baris pertama:
    `Timestamp | Nama | Kelas | Sarapan | Menu | Air Putih | Olahraga | Tidur | Skor`
5.  Klik menu **Extensions > Apps Script**.
6.  Hapus semua kode di editor `Code.gs` dan ganti dengan kode berikut:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'submit') {
    // Hitung Skor Sederhana (25 poin per 'Ya')
    let skor = 0;
    if (data.sarapan === 'Ya') skor += 25;
    if (data.airPutih === 'Ya') skor += 25;
    if (data.olahraga === 'Ya') skor += 25;
    if (data.tidur === 'Ya') skor += 25;

    sheet.appendRow([
      new Date(),
      data.nama,
      data.kelas,
      data.sarapan,
      data.menuSarapan,
      data.airPutih,
      data.olahraga,
      data.tidur,
      skor
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: "success", score: skor }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const rows = sheet.getDataRange().getValues();
  const header = rows.shift();
  
  const data = rows.map(row => {
    let obj = {};
    header.forEach((key, i) => {
      if (key) obj[key.toLowerCase().replace(/ /g, "")] = row[i];
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

7.  Klik **Deploy > New Deployment**.
8.  Pilih type: **Web App**.
9.  Description: `SehatTrack Production`.
10. Execute as: **Me**.
11. Who has access: **Anyone** (PENTING!).
12. Klik **Deploy** dan copy **Web App URL**.
13. Buka file `script.js` di folder proyek Anda, cari baris `const GAS_URL = "..."`, dan ganti dengan URL yang Anda copy tadi.

## 2. Deploy ke GitHub Pages

1.  Buat repository baru di GitHub (misal: `sehattrack-esnesaba`).
2.  Upload file `index.html`, `style.css`, dan `script.js`.
3.  Buka tab **Settings > Pages**.
4.  Pada bagian **Build and deployment**, pilih Branch: `main` dan folder: `/(root)`.
5.  Klik **Save**. Website Anda akan aktif dalam beberapa menit di URL `https://username.github.io/repository-name/`.

## 3. Fitur Utama

-   **Form Siswa**: Validasi input nama dan kelas.
-   **Dashboard Guru**: Melihat total respon, jumlah siswa aktif, dan tabel data yang bisa dicari.
-   **Skor & Badge**: Memberikan apresiasi instan (Bronze, Silver, Gold) berdasarkan aktivitas.
-   **Motivation Quotes**: Pesan penyemangat yang berubah setiap refresh.
-   **Mobile Friendly**: Tampilan responsif yang nyaman dibuka di HP siswa.

---
*Dibuat untuk SMP Esnesaba - Sehat Dimulai dari Kita!*
