/**
 * SEHATTRACK ESNESABA - Logic V2.2 (COMPATIBILITY MODE)
 * Dibuat agar tidak merusak rumus Rekap di Google Sheets
 */

// Configuration - URL Web App GAS Anda
const GAS_URL = "https://script.google.com/macros/s/AKfycbyptcuYQp0t7mBceg6u9xqW7lvAV-Hj8Jrvcl7GSPG_GgxMXpYouRxvKf6ldKw2zHX_9w/exec";

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

    // Rank & Motivation Logic (Text Only)
    const rankContainer = document.getElementById('rankContainer');
    const rankText = document.getElementById('rankText');
    const motivationText = document.getElementById('motivationText');

    let kategori = "Perlu Semangat";
    let badge = "🥉 Bronze";
    let rankName = "WARRIOR";
    let pesan = "SEMANGAT! Esok adalah kesempatan baru untuk memulai hidup yang lebih sehat. Kamu pasti bisa!";

    if (score === 100) {
        kategori = "Siswa Teladan";
        badge = "🏆 Diamond";
        rankName = "MYTHIC";
        pesan = "LUAR BIASA! Kamu adalah pahlawan kesehatan sejati. Pertahankan disiplin ini esok hari ya!";
    } else if (score >= 80) {
        kategori = "Sangat Sehat";
        badge = "🥇 Gold";
        rankName = "EPIC / LEGEND";
        pesan = "HEBAT! Tubuhmu berterima kasih padamu. Sedikit lagi menuju sempurna, ayo lebih konsisten esok!";
    } else if (score >= 60) {
        kategori = "Cukup Sehat";
        badge = "🥈 Silver";
        rankName = "GRANDMASTER";
        pesan = "BAGUS! Kamu sudah di jalur yang benar. Mari tingkatkan lagi durasi istirahat dan olahraga esok!";
    }

    if (rankContainer && score > 0) {
        rankContainer.style.display = 'block';
        rankText.innerText = rankName;
        motivationText.innerText = `"${pesan}"`;
        
        // Warna Dinamis
        const color = score === 100 ? 'var(--neon-cyan)' : (score >= 80 ? 'var(--neon-gold)' : 'var(--neon-magenta)');
        rankText.style.color = color;
        motivationText.style.color = color;
    } else if (rankContainer) {
        rankContainer.style.display = 'none';
    }

    return { score, kategori, badge, rankName, pesan };
}

const missionForm = document.getElementById('missionForm');
if (missionForm) {
    missionForm.onsubmit = async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btnSubmit');
        const btnText = document.getElementById('btnText');
        const loader = document.getElementById('loader');

        const { score, kategori, badge, rankName, pesan } = calculateScore();

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
            
            // Tampilkan Overlay Kemenangan (Victory)
            const overlay = document.getElementById('successOverlay');
            const vRank = document.getElementById('victoryRank');
            const vMsg = document.getElementById('victoryMsg');
            
            if (overlay) {
                vRank.innerText = rankName;
                vMsg.innerText = `"${pesan}"`;
                
                // Sesuaikan warna rank
                const color = score === 100 ? 'var(--neon-cyan)' : (score >= 80 ? 'var(--neon-gold)' : 'var(--neon-magenta)');
                vRank.style.color = color;
                vRank.style.textShadow = `0 0 20px ${color}`;
                
                overlay.style.display = 'flex';
            }
        } catch (err) {
            alert("Gagal mengirim data. Cek koneksi.");
        } finally {
            btn.disabled = false;
            btnText.innerText = "SIMPAN MISI HARI INI";
            loader.style.display = "none";
        }
    };
}

// Function untuk menutup Overlay
function closeOverlay() {
    const overlay = document.getElementById('successOverlay');
    if (overlay) overlay.style.display = 'none';
    location.reload(); // Refresh halaman agar form bersih kembali
}

function loginAdmin() {
    const passInput = document.getElementById('passGuru');
    const pass = passInput.value;
    if (pass === '696969') {
        passInput.value = ''; // Clear password
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminContent').style.display = 'block';
        fetchData();
    } else {
        alert("Password Salah!");
    }
}

async function fetchData() {
    const container = document.getElementById('adminTableContainer');
    container.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
            <div class="loader" style="width:40px; height:40px; border-width:4px; border-color:var(--neon-cyan); border-top-color:transparent;"></div>
            <p style="margin-top:15px; font-family:'Orbitron'; font-size:0.8rem; letter-spacing:1px; color:var(--neon-cyan);">MENGHUBUNGKAN KE DATABASE...</p>
        </div>
    `;

    try {
        // Tambahkan timestamp agar tidak terkena cache browser
        const res = await fetch(`${GAS_URL}?action=getData&t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const data = await res.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius:12px;">
                    <i data-lucide="database-zap" style="width:48px; height:48px; color:rgba(255,255,255,0.2); margin-bottom:15px;"></i>
                    <p style="color:rgba(255,255,255,0.5);">Belum ada data siswa yang masuk.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        // --- ANALISA DATA ---
        const totalEntri = data.length;
        const totalSkor = data.reduce((acc, curr) => acc + (parseInt(curr.skor) || 0), 0);
        const rataRata = (totalSkor / totalEntri).toFixed(1);
        const hariIni = new Date().toISOString().split('T')[0];
        const entriHariIni = data.filter(d => (d.tanggal || d.timestamp || '').includes(hariIni)).length;

        let html = `
            <!-- Quick Stats -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:20px;">
                <div style="background:rgba(0,242,255,0.05); padding:10px; border-radius:8px; border:1px solid rgba(0,242,255,0.2); text-align:center;">
                    <div style="font-size:0.6rem; color:var(--neon-gold); margin-bottom:4px;">TOTAL</div>
                    <div style="font-family:'Orbitron'; font-size:1.1rem; color:var(--neon-cyan);">${totalEntri}</div>
                </div>
                <div style="background:rgba(0,242,255,0.05); padding:10px; border-radius:8px; border:1px solid rgba(0,242,255,0.2); text-align:center;">
                    <div style="font-size:0.6rem; color:var(--neon-gold); margin-bottom:4px;">RATA SKOR</div>
                    <div style="font-family:'Orbitron'; font-size:1.1rem; color:var(--neon-cyan);">${rataRata}</div>
                </div>
                <div style="background:rgba(0,242,255,0.05); padding:10px; border-radius:8px; border:1px solid rgba(0,242,255,0.2); text-align:center;">
                    <div style="font-size:0.6rem; color:var(--neon-gold); margin-bottom:4px;">HARI INI</div>
                    <div style="font-family:'Orbitron'; font-size:1.1rem; color:var(--neon-cyan);">${entriHariIni}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:45%">NAMA</th>
                        <th style="width:20%; text-align:center;">SKOR</th>
                        <th style="width:35%; text-align:right;">TANGGAL</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Sort: Terbaru di atas
        const sortedData = [...data].reverse();

        sortedData.forEach(row => {
            const displayScore = parseInt(row.skor) || 0;
            let scoreColor = 'var(--neon-magenta)';
            if (displayScore === 100) scoreColor = 'var(--neon-cyan)';
            else if (displayScore >= 80) scoreColor = 'var(--neon-gold)';

            const tglRaw = row.tanggal || row.timestamp || '-';
            const tglDisplay = tglRaw.split(',')[0].replace('2026-', '').replace('2025-', '');

            html += `
                <tr>
                    <td style="font-weight:600; font-size:0.85rem; color:white;">${(row.nama || 'Anonim').toUpperCase()}</td>
                    <td style="text-align:center; font-family:'Orbitron'; font-weight:900; color:${scoreColor}; font-size:0.9rem;">${displayScore}</td>
                    <td style="text-align:right; font-size:0.75rem; opacity:0.6;">${tglDisplay}</td>
                </tr>
            `;
        });

        html += "</tbody></table>";
        container.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error("Fetch Data Error:", err);
        container.innerHTML = `
            <div style="color:var(--neon-magenta); text-align:center; padding: 30px 20px; border: 1px dashed var(--neon-magenta); border-radius: 12px; background:rgba(255,0,255,0.05);">
                <i data-lucide="alert-triangle" style="width:40px; height:40px; margin-bottom:15px;"></i>
                <p style="font-weight:bold; font-family:'Orbitron'; font-size:0.8rem; margin-bottom:5px;">GAGAL MENGAMBIL DATA</p>
                <p style="font-size:0.75rem; opacity:0.8; margin-bottom:20px;">Pastikan Google Sheets sudah dipublikasikan & script sudah dideploy dengan benar.</p>
                <button onclick="fetchData()" class="btn-primary" style="width:auto; margin:0 auto; padding:8px 20px; font-size:0.7rem;">COBA LAGI</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}