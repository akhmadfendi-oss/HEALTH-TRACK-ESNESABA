/**
 * SEHATTRACK ESNESABA - Logic V2.2 (COMPATIBILITY MODE)
 * Dibuat agar tidak merusak rumus Rekap di Google Sheets
 */

// Configuration - URL Web App GAS Anda
const GAS_URL = "https://script.google.com/macros/s/AKfycbyYCpPkfocILorUBT4ZIu8wViu2xFdDAhU_x7EJO7a92wUoi9Wyg2Yvogye8CnKiROn4g/exec";

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
        
        // Warna Dinamis Matrix
        const color = score === 100 ? 'var(--neon-green)' : (score >= 80 ? '#8cff8c' : 'var(--dark-green)');
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
            tanggal: tanggalStr,
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
            nama: payload.nama,
            kelas: payload.kelas
        }));

        try {
            // Karena GAS Anda menggunakan e.postData, kita gunakan format JSON dengan text/plain
            await fetch(GAS_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
            
            // Tampilkan Overlay Kemenangan (Victory)
            const overlay = document.getElementById('successOverlay');
            const vRank = document.getElementById('victoryRank');
            const vMsg = document.getElementById('victoryMsg');
            
            if (overlay) {
                vRank.innerText = rankName;
                vMsg.innerText = `"${pesan}"`;
                
                // Sesuaikan warna rank Matrix
                const color = score === 100 ? 'var(--neon-green)' : (score >= 80 ? '#8cff8c' : 'var(--dark-green)');
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
            <div class="loader" style="width:40px; height:40px; border-width:4px; border-color:var(--neon-green); border-top-color:transparent;"></div>
            <p style="margin-top:15px; font-family:'VT323', monospace; font-size:1rem; letter-spacing:1px; color:var(--neon-green);">> MENGHUBUNGKAN KE DATABASE_</p>
        </div>
    `;

    try {
        // Tambahkan timestamp agar tidak terkena cache browser
        const res = await fetch(`${GAS_URL}?action=getData&t=${Date.now()}`, {
            method: 'GET',
            cache: 'no-store'
        });

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        let rawData = await res.json();
        
        // --- UNIVERSAL DATA CONNECTOR ---
        let data = [];
        if (Array.isArray(rawData)) {
            data = rawData;
        } else if (rawData.data && Array.isArray(rawData.data)) {
            data = rawData.data;
        } else if (rawData.values && Array.isArray(rawData.values)) {
            data = rawData.values;
        } else if (typeof rawData === 'object') {
            // Coba cari property apapun yang berisi array
            const firstArrayKey = Object.keys(rawData).find(k => Array.isArray(rawData[k]));
            if (firstArrayKey) data = rawData[firstArrayKey];
        }

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius:12px;">
                    <i data-lucide="database-zap" style="width:48px; height:48px; color:rgba(255,255,255,0.2); margin-bottom:15px;"></i>
                    <p style="color:rgba(255,255,255,0.5);">Database terhubung, tapi tidak ada data yang ditemukan.</p>
                    <p style="font-size:0.7rem; opacity:0.4; margin-top:10px;">Format: ${typeof rawData}</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        // --- PARSING DATA SUPER FLEKSIBEL V2 (Letter-Key Support) ---
        let processedData = [];
        let keyNama = '', keySkor = '', keyTgl = '';

        if (data.length > 0) {
            const firstRow = data[0];
            const isLetterKeys = Object.keys(firstRow).every(k => k.length <= 2);
            
            if (isLetterKeys) {
                // Kasus: Keys adalah 'a', 'b', 'c'... Baris pertama adalah Header Nama
                const entries = Object.entries(firstRow);
                
                // Cari key mana yang value-nya mengandung kata kunci
                const findKeyByValue = (words) => {
                    const match = entries.find(([k, v]) => 
                        words.some(w => v.toString().toLowerCase().includes(w))
                    );
                    return match ? match[0] : null;
                };

                keyNama = findKeyByValue(['nama', 'name']) || 'b';
                keySkor = findKeyByValue(['skor', 'score', 'poin', 'point']) || 'i';
                keyTgl = findKeyByValue(['tanggal', 'timestamp', 'date', 'waktu']) || 'a';
                
                // Ambil data mulai dari index 1 (karena index 0 adalah Header)
                processedData = data.slice(1);
            } else {
                // Kasus: Keys sudah berupa nama kolom (timestamp, nama, dll)
                const headers = Object.keys(firstRow);
                const findKey = (words) => headers.find(h => words.some(w => String(h).toLowerCase().includes(w))) || words[0];
                
                keyNama = findKey(['nama', 'name']);
                keySkor = findKey(['skor', 'score', 'poin', 'point']);
                keyTgl = findKey(['tanggal', 'timestamp', 'date', 'waktu']);
                processedData = data;
            }
        }

        // --- ANALISA DATA ---
        const totalEntri = processedData.length;
        const totalSkor = processedData.reduce((acc, curr) => {
            const s = curr[keySkor] || 0;
            return acc + (parseInt(s) || 0);
        }, 0);
        
        const rataRata = (totalSkor / totalEntri).toFixed(1);
        const hariIni = new Date().toISOString().split('T')[0];
        const entriHariIni = processedData.filter(d => {
            const t = (d[keyTgl] || '').toString();
            return t.includes(hariIni);
        }).length;

        let html = `
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:20px;">
                <div style="background:rgba(0,243,255,0.05); padding:10px; border-radius:4px; border:1px dashed rgba(0,243,255,0.3); text-align:center;">
                    <div style="font-size:0.7rem; color:#00f3ff; font-family:'Share Tech Mono', monospace; margin-bottom:4px; text-shadow:0 0 5px rgba(0,243,255,0.4);">TOTAL</div>
                    <div style="font-family:'VT323', monospace; font-size:1.5rem; color:#ffffff; text-shadow:0 0 8px rgba(255,255,255,0.5);">${totalEntri}</div>
                </div>
                <div style="background:rgba(0,243,255,0.05); padding:10px; border-radius:4px; border:1px dashed rgba(0,243,255,0.3); text-align:center;">
                    <div style="font-size:0.7rem; color:#00f3ff; font-family:'Share Tech Mono', monospace; margin-bottom:4px; text-shadow:0 0 5px rgba(0,243,255,0.4);">RATA SKOR</div>
                    <div style="font-family:'VT323', monospace; font-size:1.5rem; color:#ffffff; text-shadow:0 0 8px rgba(255,255,255,0.5);">${rataRata}</div>
                </div>
                <div style="background:rgba(0,243,255,0.05); padding:10px; border-radius:4px; border:1px dashed rgba(0,243,255,0.3); text-align:center;">
                    <div style="font-size:0.7rem; color:#00f3ff; font-family:'Share Tech Mono', monospace; margin-bottom:4px; text-shadow:0 0 5px rgba(0,243,255,0.4);">HARI INI</div>
                    <div style="font-family:'VT323', monospace; font-size:1.5rem; color:#ffffff; text-shadow:0 0 8px rgba(255,255,255,0.5);">${entriHariIni}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:45%; color:#00f3ff; text-shadow:0 0 5px rgba(0,243,255,0.3);">NAMA</th>
                        <th style="width:20%; text-align:center; color:#00f3ff; text-shadow:0 0 5px rgba(0,243,255,0.3);">SKOR</th>
                        <th style="width:35%; text-align:right; color:#00f3ff; text-shadow:0 0 5px rgba(0,243,255,0.3);">TANGGAL</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Sort: Terbaru di atas
        const sortedData = [...processedData].reverse();

        sortedData.forEach(row => {
            const nama = (row[keyNama] || 'Anonim').toString();
            const displayScore = parseInt(row[keySkor]) || 0;
            
            const tglRaw = (row[keyTgl] || '-').toString();
            let tglDisplay = tglRaw.split(',')[0].replace('2026-', '').replace('2025-', '');
            if (tglDisplay.includes('T')) tglDisplay = tglDisplay.split('T')[0];

            let scoreColor = '#a8c6e2'; // Light dim blue
            if (displayScore === 100) scoreColor = '#00f3ff'; // Neon Cyan
            else if (displayScore >= 80) scoreColor = '#ffffff'; // White

            html += `
                <tr>
                    <td style="font-weight:600; font-size:0.85rem; color:white;">${nama.toUpperCase()}</td>
                    <td style="text-align:center; font-family:'Orbitron'; font-weight:900; color:${scoreColor}; font-size:0.9rem; text-shadow:0 0 8px ${scoreColor};">${displayScore}</td>
                    <td style="text-align:right; font-size:0.75rem; color:#00f3ff; opacity:0.7;">${tglDisplay}</td>
                </tr>
            `;
        });


        html += "</tbody></table>";
        container.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();

    } catch (err) {
        console.error("Fetch Data Error:", err);
        container.innerHTML = `
            <div style="color:red; text-align:center; padding: 30px 20px; border: 1px dashed red; border-radius: 4px; background:rgba(255,0,0,0.05);">
                <i data-lucide="alert-triangle" style="width:40px; height:40px; margin-bottom:15px;"></i>
                <p style="font-weight:bold; font-family:'VT323', monospace; font-size:1.2rem; margin-bottom:5px;">> GAGAL MENGAMBIL DATA_</p>
                <p style="font-size:0.75rem; opacity:0.8; margin-bottom:20px;">Pastikan Google Sheets sudah dipublikasikan & script sudah dideploy dengan benar.</p>
                <button onclick="fetchData()" class="btn-primary" style="width:auto; margin:0 auto; padding:8px 20px; font-size:0.7rem;">COBA LAGI</button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ==========================================
// MATRIX RAIN ANIMATION LOGIC
// ==========================================
const canvas = document.getElementById('matrixRain');
if (canvas) {
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレゲゼデベペオォコソトノホモヨョロゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = [];

    for(let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for(let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if(rainDrops[i] * fontSize > canvas.height && Math.random() > 0.97){
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    setInterval(draw, 35);
}