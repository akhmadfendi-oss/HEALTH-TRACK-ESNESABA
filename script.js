// Configuration
const GAS_URL = "https://script.google.com/macros/library/d/1HvoE3QdvwpGj7aXBQ0mVf5e4UXxTU8gRQJmHm2LFiOBclZCeRhUtnnS7/2ttps://script.google.com/macros/s/AKfycbwfjBXBlmNw_HZyJG0PACpnMltwWKalHTSDuuWHGDGg_-3AJvu2wFx5nfyMAdPUjpDogA/execthttps://script.google.com/macros/s/AKfycbwfjBXBlmNw_HZyJG0PACpnMltwWKalHTSDuuWHGDGg_-3AJvu2wFx5nfyMAdPUjpDogA/exectps://script.google.com/macros/s/AKfycbymOe2QvwJAu7eQGdlvEvV54cgPq7i0l_16GU9ucu6QpCZ8VXqqGAV6Rrm8SynID_ILJA/exec";

// Quotes Array
const QUOTES = [
  "Kesehatan adalah kekayaan yang paling berharga.",
  "Jangan biarkan hari berlalu tanpa sedikit keringat.",
  "Makan sehat hari ini untuk tubuh kuat esok hari.",
  "Tidur yang cukup adalah investasi untuk otakmu.",
  "Air putih adalah bahan bakar murni untuk organ tubuhmu.",
  "Disiplin adalah jembatan antara tujuan dan pencapaian.",
  "Tubuhmu adalah satu-satunya tempat tinggalmu selamanya. Jaga itu."
];

// State Management
let studentData = JSON.parse(localStorage.getItem('sehatTrack_user')) || null;
let allRecords = [];

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
    toggleMenu(); // Initial state
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
    fetchTeacherData();
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    showToast('Data berhasil dikirim! Tetap semangat!', 'success');

    localStorage.setItem('sehatTrack_user', JSON.stringify({
      nama: formData.nama,
      kelas: formData.kelas
    }));

    showStats(); // Refresh stats display

  } catch (error) {
    console.error('Error:', error);
    showToast('Gagal mengirim data. Coba lagi nanti.', 'error');
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
    // Simulate score based on saved data (In a full app, this would be a GET request)
    const mockScore = Math.floor(Math.random() * 500) + 100;
    document.getElementById('myScore').innerText = mockScore;
    renderBadges(mockScore);
  }
}

function renderBadges(score) {
  const badgesBox = document.getElementById('myBadges');
  if (!badgesBox) return;

  badgesBox.innerHTML = '';
  if (score >= 100) badgesBox.innerHTML += '<span class="badge bronze">Beginner Health</span>';
  if (score >= 500) badgesBox.innerHTML += '<span class="badge silver">Health Enthusiast</span>';
  if (score >= 1000) badgesBox.innerHTML += '<span class="badge gold">Health Master</span>';

  if (score < 100) badgesBox.innerHTML = '<span class="badge">Ayo Mulai!</span>';
}

// Teacher Dashboard Logic
async function fetchTeacherData() {
  const tableContainer = document.getElementById('teacherTable');
  tableContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Memuat data terbaru...</p>';

  try {
    const response = await fetch(`${GAS_URL}?action=getData`);
    const data = await response.json();
    allRecords = data;

    renderTeacherTable(data);
    updateDashboardStats(data);

  } catch (error) {
    tableContainer.innerHTML = '<p style="text-align: center; color: #f56565; padding: 20px;">Gagal memuat data dari server.</p>';
  }
}

function renderTeacherTable(data) {
  const tableContainer = document.getElementById('teacherTable');

  if (data.length === 0) {
    tableContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Belum ada data masuk.</p>';
    return;
  }

  let html = `
        <table style="width: 100%; border-collapse: collapse; background: white;">
            <thead style="background: #f8fafc; position: sticky; top: 0;">
                <tr>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #edf2f7;">Nama</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #edf2f7;">Kelas</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #edf2f7;">Skor</th>
                </tr>
            </thead>
            <tbody>
    `;

  data.forEach(item => {
    html += `
            <tr style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 12px;">${item.nama || '-'}</td>
                <td style="padding: 12px;">${item.kelas || '-'}</td>
                <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--primary);">${item.skor || 0}</td>
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
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }
}