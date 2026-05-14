# SehatTrack Esnesaba - Panduan Setup V2

Aplikasi ini adalah sistem monitoring 30 hari hidup sehat untuk siswa SMP Negeri 1 Banyubiru. Dibangun menggunakan HTML5, CSS modern, dan JavaScript, dengan backend Google Sheets via Google Apps Script (GAS).

## 1. Persiapan Google Sheets & Apps Script

Aplikasi ini memerlukan Google Sheets sebagai database. Ikuti langkah berikut:

1.  Buka [Google Sheets](https://sheets.new) baru.
2.  Beri nama file: `SehatTrack_Database`.
3.  Ubah nama tab bawah dari "Sheet1" menjadi **"Data"**.
4.  Buat header di baris pertama sesuai urutan berikut:
    `SubmissionID | Timestamp | Tanggal | ID Siswa | Nama | Kelas | Sarapan | Menu | Air Putih | Gelas | Olahraga | Jenis | Tidur Cukup | Jam Tidur | Jam Bangun | Kurangi Manis | Batasi HP | Skor | Kategori | Badge | Mood | Jurnal`
5.  Klik menu **Extensions > Apps Script**.
6.  Hapus semua kode di editor dan ganti dengan kode backend modern berikut:

```javascript
/**
 * BACKEND SEHATTRACK V2
 * Simpan kode ini di Google Apps Script editor
 */

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'submit') {
    // Cari apakah sudah ada entri untuk ID & Tanggal yang sama (Upsert)
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.submissionId) {
        rowIndex = i + 1;
        break;
      }
    }

    const newRow = [
      data.submissionId,
      data.timestamp,
      data.tanggal,
      data.idSiswa,
      data.nama,
      data.kelas,
      data.sarapan,
      data.menuSarapan,
      data.airPutih,
      data.jumlahAirPutih,
      data.olahraga,
      data.jenisOlahraga,
      data.tidurCukup,
      data.jamTidur,
      data.jamBangun,
      data.kurangiManis,
      data.batasiHP,
      data.skorHarian,
      data.kategoriSkor,
      data.badgeHarian,
      data.mood,
      data.jurnal
    ];

    if (rowIndex !== -1) {
      sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
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
      if (key) {
        // Konversi header ke camelCase atau lowercase untuk JS
        const cleanKey = key.toLowerCase().replace(/ /g, "");
        obj[cleanKey] = row[i];
      }
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

7.  Klik **Deploy > New Deployment**.
8.  Pilih type: **Web App**.
9.  Execute as: **Me**.
10. Who has access: **Anyone**.
11. Klik **Deploy** dan copy **Web App URL**.
12. Buka file `script.js` di folder proyek Anda, cari baris `const GAS_URL = "..."`, dan ganti dengan URL yang Anda copy tadi.

## 2. Struktur File Proyek

- `index.html`: Struktur utama aplikasi (UI).
- `style.css`: Desain tema HUD Neon modern.
- `script.js`: Logika aplikasi, perhitungan skor, dan koneksi database.

## 3. Fitur Utama

-   **Anti-Duplicate**: Jika siswa mengirim data dua kali di hari yang sama, data lama akan diperbarui (bukan duplikat).
-   **Auto-Save**: Nama dan Kelas tersimpan otomatis di browser agar tidak perlu mengetik ulang besok.
-   **Dashboard Guru**: Melihat skor dan progress siswa secara real-time dengan proteksi password.
-   **Skor & Badge**: Sistem poin (Max 100) dengan tingkatan Bronze hingga Diamond.
-   **Responsive Design**: Nyaman digunakan di smartphone maupun laptop.

---
*Dikembangkan untuk SMP Negeri 1 Banyubiru oleh Fendi Akhmad, S.Pd.*
