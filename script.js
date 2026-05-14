/**
 * SEHATTRACK ESNESABA - Logic V2
 * Optimized for SMP Negeri 1 Banyubiru
 */

// Configuration - Ganti URL ini dengan URL Web App GAS Anda
const GAS_URL = "https://script.google.com/macros/s/AKfycbwgN3Q01sFrdLM8H_L93Q6elJ14UuBrLXO7KlLnolIItcpJFBqOKeTtFj7SWHzsucYU/exec";

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
    
    // Load local storage if available
    const savedUser = JSON.parse(localStorage.getItem('sehatTrack_user'));
    if (savedUser) {
        if (document.getElementById('idSiswa')) document.getElementById('idSiswa').value = savedUser.idSiswa || '';
        if (document.getElementById('nama')) document.getElementById('nama').value = savedUser.nama || '';
        if (document.getElementById('kelas')) document.getElementById('kelas').value = savedUser.kelas || '';
    }

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// View Switcher
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

// Random Quote
function setRandomQuote() {
    const quoteElement = document.getElementById('motivationQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        quoteElement.innerText = `"${QUOTES[randomIndex]}"`;
    }
}

// Toggle Mission Details
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

// Calculate Score & Badge
function calculateScore() {
    let score = 0;
    
    // Mission points mapping
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

// Form Submission
const missionForm = document.getElementById('missionForm');
if (missionForm) {
    missionForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('btnSubmit');
        const btnText = document.getElementById('btnText');
        const loader = document.getElementById('loader');
        
        // FIX: Extracting values from the result object
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

        // Preparation for submission
        btn.disabled = true;
        btnText.innerText = "Mengirim data misi...";
        loader.style.display = "inline-block";

        const now = new Date();
        const tanggalStr = now.toISOString().split('T')[0];
        const idSiswa = document.getElementById('idSiswa').value;
        const submissionId = tanggalStr + "_" + idSiswa;

        const payload = {
            submissionId: submissionId,
            timestamp: now.toLocaleString(),
            tanggal: tanggalStr,
            idSiswa: idSiswa,
            nama: document.getElementById('nama').value,
            kelas: document.getElementById('kelas').value,
            sarapan: document.getElementById('checkSarapan').checked ? "Ya" : "Tidak",
            menuSarapan: document.getElementById('menuSarapan').value,
            airPutih: document.getElementById('checkAir').checked ? "Ya" : "Tidak",
            jumlahAirPutih: document.getElementById('jumlahAir').value,
            olahraga: document.getElementById('checkOlahraga').checked ? "Ya" : "Tidak",
            jenisOlahraga: document.getElementById('jenisOlahraga').value,
            tidurCukup: document.getElementById('checkTidur').checked ? "Ya" : "Tidak",
            jamTidur: document.getElementById('jamTidur').value,
            jamBangun: document.getElementById('jamBangun').value,
            kurangiManis: document.getElementById('checkManis').checked ? "Ya" : "Tidak",
            batasiHP: document.getElementById('checkHP').checked ? "Ya" : "Tidak",
            skorHarian: score,
            kategoriSkor: kategori,
            badgeHarian: badge,
            mood: "😊",
            jurnal: jurnalValue,
            action: "submit"
        };

        // Save to localStorage
        localStorage.setItem('sehatTrack_user', JSON.stringify({
            idSiswa: payload.idSiswa,
            nama: payload.nama,
            kelas: payload.kelas
        }));

        try {
            // Post data to GAS
            await fetch(GAS_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify(payload) 
            });
            alert("DATA BERHASIL DISIMPAN! Terima kasih sudah jujur hari ini.");
            // Reset form partly or stay for confirmation
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim data ke cloud. Periksa koneksi internet Anda.");
        } finally {
            btn.disabled = false;
            btnText.innerText = "SIMPAN MISI HARI INI";
            loader.style.display = "none";
        }
    };
}

// Admin Logic
function loginAdmin() {
    const pass = document.getElementById('passGuru').value;
    if (pass === '696969') {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        fetchData();
    } else {
        alert("Password Salah! Akses ditolak.");
    }
}

async function fetchData() {
    const container = document.getElementById('adminTableContainer');
    container.innerHTML = "<p style='text-align:center; padding: 20px;'>Memindai database...</p>";
    
    try {
        const res = await fetch(GAS_URL + "?action=getData");
        const data = await res.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:var(--neon-gold); padding: 20px;'>Belum ada data monitoring ditemukan.</p>";
            return;
        }

        let html = "<table>";
        html += "<thead><tr><th>NAMA AGEN</th><th>SKOR</th><th>TANGGAL</th></tr></thead><tbody>";
        
        // Sort by date (reverse)
        data.reverse().forEach(row => {
            const displayScore = row.skorharian || row.skor || 0;
            const nama = row.nama || 'Anonim';
            const tanggal = row.tanggal || '-';
            
            html += `<tr>
                <td>${nama}</td>
                <td style='color:var(--neon-cyan); font-weight:bold;'>${displayScore}</td>
                <td style='font-size:0.7rem; opacity:0.7;'>${tanggal}</td>
            </tr>`;
        });
        
        html += "</tbody></table>";
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = "<p style='color:red; text-align:center; padding: 20px;'>Gagal mengambil data dari server.</p>";
    }
}