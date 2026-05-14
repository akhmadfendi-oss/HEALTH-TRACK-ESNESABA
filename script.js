/**
 * SEHATTRACK ESNESABA - Logic V2.2 (COMPATIBILITY MODE)
 * Dibuat agar tidak merusak rumus Rekap di Google Sheets
 */

// Configuration - URL Web App GAS Anda
const GAS_URL = "https://script.google.com/macros/s/AKfycbwFaFZ9F2xtxIc9Iy-6upC4J-_Gg6rT2X9wauqdMuir9A4ahqQ7vH82OHYsrdJp7aJNOg/exec";

// Motivation Quotes
const QUOTES = [
    "Kesehatan adalah investasi terbaik untuk masa depanmu.",
    "Jadilah versi terbaik dirimu setiap hari.",
    "Misi hari ini: Jaga tubuh, kuatkan pikiran.",
    "Pola hidup sehat adalah kunci kemenangan sejati.",
    "Siswa cerdas, siswa sehat. Bangga SMPN 1 Banyubiru!",
    "Disiplin diri adalah bentuk tertinggi dari rasa sayang pada diri sendiri.",
    "Tubuhmu adalah kendaraan misimu di dunia ini. Rawatlah."
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setRandomQuote();
    
    const savedUser = JSON.parse(localStorage.getItem('sehatTrack_user'));
    if (savedUser) {
        if (document.getElementById('idSiswa')) document.getElementById('idSiswa').value = savedUser.idSiswa || '';
        if (document.getElementById('nama')) document.getElementById('nama').value = savedUser.nama || '';
        if (document.getElementById('kelas')) document.getElementById('kelas').value = savedUser.kelas || '';
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

function switchView(view) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(view + 'Tab').classList.add('active');
    
    const studentView = document.getElementById('studentView');
    const adminView = document.getElementById('adminView');
    
    if (view === 'student') {
        studentView.style.display = 'block';
        adminView.style.display = 'none';
    } else {
        studentView.style.display = 'none';
        adminView.style.display = 'block';
    }
}

function setRandomQuote() {
    const quoteElement = document.getElementById('motivationQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        quoteElement.innerText = `"${QUOTES[randomIndex]}"`;
    }
}

function toggleMisi(misi) {
    const isChecked = document.getElementById('check' + misi).checked;
    const detail = document.getElementById('detail' + misi);
    const card = document.getElementById('card' + misi);
    
    if (detail) detail.style.display = isChecked ? 'block' : 'none';
    if (isChecked) {
        card.classList.add('active');
    } else {
        card.classList.remove('active');
    }
    calculateScore();
}

function calculateScore() {
    let score = 0;
    if (document.getElementById('checkSarapan').checked) score += 15;
    if (document.getElementById('checkAir').checked) score += 15;
    if (document.getElementById('checkOlahraga').checked) score += 20;
    if (document.getElementById('checkTidur').checked) score += 20;
    if (document.getElementById('checkManis').checked) score += 15;
    if (document.getElementById('checkHP').checked) score += 15;
    
    const scoreValElement = document.getElementById('scoreVal');
    if (scoreValElement) scoreValElement.innerText = score;

    let kategori = "Perlu Semangat";
    let badge = "🥉 Bronze";
    
    if (score === 100) {
        kategori = "Siswa Teladan";
        badge = "🏆 Diamond";
    } else if (score >= 80) {
        kategori = "Sangat Sehat";
        badge = "🥇 Gold";
    } else if (score >= 60) {
        kategori = "Cukup Sehat";
        badge = "🥈 Silver";
    }

    return { score, kategori, badge };
}

const missionForm = document.getElementById('missionForm');
if (missionForm) {
    missionForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btnSubmit');
        const btnText = document.getElementById('btnText');
        const loader = document.getElementById('loader');
        
        const { score, kategori, badge } = calculateScore();

        const kejujuranMisi = document.getElementById("kejujuranMisi");
        if (!kejujuranMisi.checked) {
            alert("Centang persetujuan kejujuran sebelum menyimpan misi hari ini.");
            return;
        }

        if (score === 0) {
            alert("Pilih minimal satu misi!");
            return;
        }

        const jurnalValue = document.getElementById('jurnal').value;
        if (jurnalValue.length < 10) {
            alert("Jurnal minimal 10 karakter!");
            return;
        }

        btn.disabled = true;
        btnText.innerText = "Mengirim data...";
        loader.style.display = "inline-block";

        const now = new Date();
        const tanggalStr = now.toISOString().split('T')[0];
        const idSiswa = document.getElementById('idSiswa').value;
        const submissionId = tanggalStr + "_" + idSiswa;

        // PAYLOAD DISESUAIKAN AGAR KOLOM 1-9 TETAP SAMA (COMPATIBILITY)
        const payload = {
            timestamp: now.toLocaleString(), // Col 1
            nama: document.getElementById('nama').value, // Col 2
            kelas: document.getElementById('kelas').value, // Col 3
            sarapan: document.getElementById('checkSarapan').checked ? "Ya" : "Tidak", // Col 4
            menuSarapan: document.getElementById('menuSarapan').value, // Col 5
            airPutih: document.getElementById('checkAir').checked ? "Ya" : "Tidak", // Col 6
            olahraga: document.getElementById('checkOlahraga').checked ? "Ya" : "Tidak", // Col 7
            tidur: document.getElementById('checkTidur').checked ? "Ya" : "Tidak", // Col 8
            skor: score, // Col 9 (Sama dengan versi lama)
            
            // DATA TAMBAHAN V2 (Mulai Col 10)
            submissionId: submissionId,
            tanggal: tanggalStr,
            idSiswa: idSiswa,
            jumlahAirPutih: document.getElementById('jumlahAir').value,
            jenisOlahraga: document.getElementById('jenisOlahraga').value,
            tidurCukup: document.getElementById('checkTidur').checked ? "Ya" : "Tidak",
            jamTidur: document.getElementById('jamTidur').value,
            jamBangun: document.getElementById('jamBangun').value,
            kurangiManis: document.getElementById('checkManis').checked ? "Ya" : "Tidak",
            batasiHP: document.getElementById('checkHP').checked ? "Ya" : "Tidak",
            kategoriSkor: kategori,
            badgeHarian: badge,
            mood: "😊",
            jurnal: jurnalValue,
            action: "submit"
        };

        localStorage.setItem('sehatTrack_user', JSON.stringify({
            idSiswa: payload.idSiswa,
            nama: payload.nama,
            kelas: payload.kelas
        }));

        try {
            await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
            alert("DATA BERHASIL DISIMPAN!");
        } catch (err) {
            alert("Gagal mengirim data. Cek koneksi.");
        } finally {
            btn.disabled = false;
            btnText.innerText = "SIMPAN MISI HARI INI";
            loader.style.display = "none";
        }
    };
}

function loginAdmin() {
    const pass = document.getElementById('passGuru').value;
    if (pass === '696969') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        fetchData();
    } else {
        alert("Password Salah!");
    }
}

async function fetchData() {
    const container = document.getElementById('adminTableContainer');
    container.innerHTML = "<p style='text-align:center;'>Memindai database...</p>";
    try {
        const res = await fetch(GAS_URL + "?action=getData");
        const data = await res.json();
        if (!data || data.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>Belum ada data.</p>";
            return;
        }
        let html = "<table><thead><tr><th>NAMA</th><th>SKOR</th><th>TANGGAL</th></tr></thead><tbody>";
        data.reverse().forEach(row => {
            const displayScore = row.skor || 0;
            html += `<tr><td>${row.nama || '-'}</td><td style='color:var(--neon-cyan);'>${displayScore}</td><td>${row.tanggal || row.timestamp || '-'}</td></tr>`;
        });
        html += "</tbody></table>";
        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = "<p style='color:red;'>Gagal mengambil data.</p>";
    }
}