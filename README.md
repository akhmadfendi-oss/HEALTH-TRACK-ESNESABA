# SehatTrack Esnesaba - Panduan Setup Compatibility Mode

Gunakan panduan ini jika Anda sudah memiliki Google Sheets dengan rumus Rekap yang sudah berjalan.

## 1. Persiapan Google Sheets

Pastikan header di tab **"Data"** (baris pertama) mengikuti urutan ini:

1. `Timestamp`
2. `Nama`
3. `Kelas`
4. `Sarapan`
5. `Menu`
6. `Air Putih`
7. `Olahraga`
8. `Tidur`
9. `Skor`
10. `SubmissionID`
11. `Tanggal`
12. `ID Siswa`
13. `Gelas`
14. `Jenis`
15. `Jam Tidur`
16. `Jam Bangun`
17. `Kurangi Manis`
18. `Batasi HP`
19. `Kategori`
20. `Badge`
21. `Mood`
22. `Jurnal`

**Kenapa urutan ini?**
Kolom 1-9 tetap sama dengan versi lama Anda, sehingga rumus Rekap Anda tidak akan berubah hasilnya (tidak menjadi 0). Data tambahan V2 akan masuk di kolom 10 dan seterusnya.

## 2. Kode Backend (Google Apps Script)

Hapus kode lama di Apps Script dan ganti dengan ini:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'submit') {
    const rows = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    // Cari SubmissionID di kolom ke-10 (Index 9)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][9] === data.submissionId) {
        rowIndex = i + 1;
        break;
      }
    }

    const newRow = [
      data.timestamp,   // 1
      data.nama,        // 2
      data.kelas,       // 3
      data.sarapan,     // 4
      data.menuSarapan, // 5
      data.airPutih,    // 6
      data.olahraga,    // 7
      data.tidur,       // 8
      data.skor,        // 9 (SKOR TETAP DI KOLOM 9)
      data.submissionId,// 10
      data.tanggal,
      data.idSiswa,
      data.jumlahAirPutih,
      data.jenisOlahraga,
      data.jamTidur,
      data.jamBangun,
      data.kurangiManis,
      data.batasiHP,
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

---
*Dikembangkan oleh Fendi Akhmad, S.Pd.*
