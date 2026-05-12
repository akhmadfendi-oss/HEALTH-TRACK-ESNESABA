// Configuration
const GAS_URL = "https://script.google.com/macros/s/AKfycbwfjBXBlmNw_HZyJG0PACpnMltwWKalHTSDuuWHGDGg_-3AJvu2wFx5nfyMAdPUjpDogA/exec";

// Quotes Array
const QUOTES = [
    "Kesehatan adalah investasi terbaik untuk masa depanmu.",
    "Jadilah versi terbaik dirimu setiap hari.",
    "Misi hari ini: Jaga tubuh, kuatkan pikiran.",
    "Pola hidup sehat adalah kunci kemenangan sejati.",
    "Siswa cerdas, siswa sehat. Bangga SMPN 1 Banyubiru!",
    "Disiplin diri adalah bentuk tertinggi dari rasa sayang pada diri sendiri.",
    "Tubuhmu adalah kendaraan misimu di dunia ini. Rawatlah."
];

// State Management
let studentData = JSON.parse(localStorage.getItem('sehatTrack_user')) || null;
let allRecords = [];
let isAdminAuthenticated = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setQuote();
    if (studentData) {
        document.getElementById('nama').value = studentData.nama;
        document.getElementById('kelas').value = studentData.kelas;
        showStats();
    }

    // Toggle Menu Sarapan
    const sarapanSelect = document.getElementById('sarapan');
    const menuSarapanInput = document.getElementById('menuSarapan');
    if (sarapanSelect && menuSarapanInput) {
        const menuGroup = menuSarapanInput.parentElement;
        const toggleMenu = () => {
            menuGroup.style.display = sarapanSelect.value === 'Ya' ? 'block' : 'none';
        };
        sarapanSelect.addEventListener('change', toggleMenu);
        toggleMenu();
    }
});

// View Switcher
function switchView(view) {
    const studentTab = document.getElementById('studentTab');
    const teacherTab = document.getElementById('teacherTab');
    const studentView = document.getElementById('studentView');
    const teacherView = document.getElementById('teacherView');

    if (view === 'student') {
        studentTab.classList.add('active');
        teacherTab.classList.remove('active');
        studentView.style.display = 'block';
        teacherView.style.display = 'none';
    } else {
        studentTab.classList.remove('active');
        teacherTab.classList.add('active');
        studentView.style.display = 'none';
        teacherView.style.display = 'block';
        
        if (isAdminAuthenticated) {
            document.getElementById('teacherLogin').style.display = 'none';
            document.getElementById('teacherContent').style.display = 'block';
            fetchTeacherData();
        } else {
            document.getElementById('teacherLogin').style.display = 'block';
            document.getElementById('teacherContent').style.display = 'none';
        }
    }
}

// Admin Login Logic
function checkAdminLogin() {
    const user = document.getElementById('adminUser').value.trim().toUpperCase();
    const pass = document.getElementById('adminPass').value.trim();

    if (!user || !pass) {
        showToast('Kredensial tidak boleh kosong.', 'error');
        return;
    }

    if (user === 'MAS FENDI' && pass === '696969') {
        isAdminAuthenticated = true;
        document.getElementById('teacherLogin').style.display = 'none';
        document.getElementById('teacherContent').style.display = 'block';
        showToast('AKSES DITERIMA. Selamat datang, Admin.', 'success');
        fetchTeacherData();
    } else {
        showToast('AKSES DITOLAK. Nama Pengguna atau Kata Sandi salah.', 'error');
    }
}

// Set Random Quote
function setQuote() {
    const quoteElement = document.getElementById('motivationQuote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        quoteElement.innerText = `"${QUOTES[randomIndex]}"`;
    }
}

// Form Submission
document.getElementById('healthForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const loader = document.getElementById('btnLoader');
    
    submitBtn.disabled = true;
    loader.style.display = 'inline-block';

    const formData = {
        nama: document.getElementById('nama').value,
        kelas: document.getElementById('kelas').value,
        sarapan: document.getElementById('sarapan').value,
        menuSarapan: document.getElementById('menuSarapan').value,
        airPutih: document.getElementById('airPutih').value,
        olahraga: document.getElementById('olahraga').value,
        tidur: document.getElementById('tidur').value,
        action: 'submit'
    };

    try {
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        showToast('DATA BERHASIL DIUNGGAH. MISI SELESAI.', 'success');
        
        localStorage.setItem('sehatTrack_user', JSON.stringify({
            nama: formData.nama,
            kelas: formData.kelas
        }));
        
        showStats();
    } catch (error) {
        console.error('Error:', error);
        showToast('UNGGAH GAGAL. Periksa koneksi internet.', 'error');
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
    }
});

// Stats Logic
function showStats() {
    const statsBox = document.getElementById('userStats');
    if (statsBox) {
        statsBox.style.display = 'grid';
        const mockScore = Math.floor(Math.random() * 800) + 200; 
        document.getElementById('myScore').innerText = mockScore;
        renderBadges(mockScore);
    }
}

function renderBadges(score) {
    const badgesBox = document.getElementById('myBadges');
    if (!badgesBox) return;
    
    badgesBox.innerHTML = '';
    if (score >= 100) badgesBox.innerHTML += '<span class="badge" style="color: #cd7f32; border: 1px solid #cd7f32; padding: 2px 8px; font-size: 0.7rem; margin-right: 5px;">ELITE I</span>';
    if (score >= 500) badgesBox.innerHTML += '<span class="badge" style="color: #c0c0c0; border: 1px solid #c0c0c0; padding: 2px 8px; font-size: 0.7rem; margin-right: 5px;">MASTER II</span>';
    if (score >= 1000) badgesBox.innerHTML += '<span class="badge" style="color: #ffcc00; border: 1px solid #ffcc00; padding: 2px 8px; font-size: 0.7rem; margin-right: 5px;">GRANDMASTER</span>';
    
    if (score < 100) badgesBox.innerHTML = '<span class="badge" style="opacity: 0.5;">WARRIOR</span>';
}

// Teacher Dashboard Logic
async function fetchTeacherData() {
    const tableContainer = document.getElementById('teacherTable');
    tableContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: #00f2ff; animation: pulse 1s infinite;">MEMINDAI DATABASE...</p>';

    try {
        const response = await fetch(`${GAS_URL}?action=getData`);
        const data = await response.json();
        allRecords = data;
        
        renderTeacherTable(data);
        updateDashboardStats(data);
        
    } catch (error) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #f56565; padding: 20px;">ERROR PINDAI DATABASE. PERIKSA STATUS API.</p>';
    }
}

function renderTeacherTable(data) {
    const tableContainer = document.getElementById('teacherTable');
    
    if (data.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; padding: 20px;">TIDAK ADA DATA MISI DITEMUKAN.</p>';
        return;
    }

    let html = `
        <table style="width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.3); font-size: 0.9rem;">
            <thead style="background: rgba(0, 242, 255, 0.1);">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(0,242,255,0.3); color: #00f2ff;">NAMA AGEN</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(0,242,255,0.3); color: #00f2ff;">REGU/KELAS</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(0,242,255,0.3); color: #ffcc00;">POIN (EXP)</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(item => {
        html += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 12px;">${item.nama || '-'}</td>
                <td style="padding: 12px;">${item.kelas || '-'}</td>
                <td style="padding: 12px; text-align: center; font-weight: bold; color: #ffcc00;">${item.skor || 0}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
}

function updateDashboardStats(data) {
    document.getElementById('totalRespon').innerText = data.length;
    const uniqueStudents = new Set(data.map(d => d.nama));
    document.getElementById('totalSiswa').innerText = uniqueStudents.size;
}

function filterData() {
    const query = document.getElementById('searchStudent').value.toLowerCase();
    const filtered = allRecords.filter(item => 
        (item.nama && item.nama.toLowerCase().includes(query)) || 
        (item.kelas && item.kelas.toLowerCase().includes(query))
    );
    renderTeacherTable(filtered);
}

// Toast System
function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.innerText = message;
        toast.style.borderColor = type === 'success' ? '#00f2ff' : '#f56565';
        toast.style.color = type === 'success' ? '#00f2ff' : '#f56565';
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }
}