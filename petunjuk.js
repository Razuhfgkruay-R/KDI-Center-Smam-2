/**
 * PETUNJUK INTERAKTIF LENGKAP (FULL GUIDED TOUR) - KDI CENTER
 * Developer: Razuhfgkruay
 * Deskripsi: Panduan interaktif otomatis dengan efek Spotlight terang benderang
 * yang memandu pengurus baru menjelajahi seluruh fitur KDI Center (termasuk Laporan Pembiasaan & Cetak PDF).
 */

const kdiTourSteps = [
  // ================= ALUR 1: BERANDA (HOME) =================
  {
    category: "BERANDA",
    targetId: "status-pill-home",
    title: "🌐 Indikator Status Jaringan",
    description: "Indikator hijau menandakan aplikasi terhubung langsung dengan database Google Spreadsheet. Jika merah, perangkat sedang offline.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewHome");
    }
  },
  {
    category: "BERANDA",
    targetId: "btn-catat-home",
    title: "⚡ Catat Kedisiplinan Langsung",
    description: "Akses cepat tanpa login untuk petugas yang ingin mencatat pelanggaran sholat Dhuha atau Dzuhur secara instan.",
    position: "top"
  },
  {
    category: "BERANDA",
    targetId: "btn-datamasuk-home",
    title: "📥 Log Data Masuk",
    description: "Fitur untuk melihat rekapitulasi data pelanggaran & data haid siswi yang baru saja diinput hari ini.",
    position: "top"
  },
  {
    category: "BERANDA",
    targetId: "btn-dash-home",
    title: "🔐 Masuk Dashboard Admin",
    description: "Pintu masuk utama bagi Pengurus KDI untuk memantau absensi seluruh kelas, rekapitulasi bulanan, dan audit data.",
    position: "top"
  },

  // ================= ALUR 2: INPUT KEDISIPLINAN =================
  {
    category: "INPUT KEDISIPLINAN",
    targetId: "inputSearchSiswaPelanggaran",
    title: "🔍 Cari Nama Siswa (Autocomplete)",
    description: "Ketik nama siswa atau kelas di sini. Sistem akan secara otomatis menampilkan rekomendasi nama dari Master Siswa.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewCatatPelanggaran");
    }
  },
  {
    category: "INPUT KEDISIPLINAN",
    targetId: "btnSesiDhuha",
    title: "🌅 Pemilihan Sesi Sholat",
    description: "Pilih apakah siswa melanggar pada sesi Sholat Dhuha atau Sholat Dzuhur.",
    position: "bottom"
  },
  {
    category: "INPUT KEDISIPLINAN",
    targetId: "btnKatTelat",
    title: "⚠️ Kategori Pelanggaran",
    description: "Pilih jenis pelanggaran yang dilakukan: Telat, Bercanda saat sholat, atau Cabut / Tidak Sholat.",
    position: "bottom"
  },
  {
    category: "INPUT KEDISIPLINAN",
    selector: "button[onclick*='tambahKeDaftarPelanggaran']",
    title: "➕ Masukkan ke Antrean Daftar",
    description: "Setelah memilih nama, sesi, dan jenis pelanggaran, klik tombol ini untuk memasukkan siswa ke dalam daftar antrean di sebelah kanan.",
    position: "top"
  },
  {
    category: "INPUT KEDISIPLINAN",
    targetId: "containerPelanggaranList",
    title: "📋 Antrean Daftar Pelanggar",
    description: "Daftar siswa yang sudah ditambahkan akan muncul di sini. Kamu bisa memeriksa ulang sebelum data dikirim.",
    position: "top"
  },
  {
    category: "INPUT KEDISIPLINAN",
    targetId: "btnKirimPelanggaran",
    title: "🚀 Kirim Data ke Spreadsheet",
    description: "Klik tombol ini untuk mengirim seluruh daftar antrean pelanggaran sekaligus ke database Google Spreadsheet.",
    position: "top"
  },

  // ================= ALUR 3: DASHBOARD MONITORING =================
  {
    category: "DASHBOARD MONITORING",
    targetId: "statTotalKelas",
    title: "📊 Ringkasan Statistik Real-time",
    description: "Menampilkan total kelas, berapa kelas yang sudah mengisi rekap Dhuha/Dzuhur hari ini, dan jumlah peringatan warning.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
    }
  },
  {
    category: "DASHBOARD MONITORING",
    selector: "button[onclick*='openNotificationModal']",
    title: "🔔 Pusat Peringatan (Notifikasi Warning)",
    description: "Ikon lonceng ini akan menampilkan angka merah jika ada siswa Alfa >30%, siswi cabut Dzuhur, atau akumulasi pelanggaran.",
    position: "bottom"
  },
  {
    category: "DASHBOARD MONITORING",
    targetId: "warningListContainer",
    title: "⚠️ Modal Detail Warning & Anomali",
    description: "Di sini kamu bisa melihat rincian warning per siswa, memproses penanganan, atau membagikannya langsung ke WhatsApp Wali Kelas.",
    position: "top",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
      if (typeof openNotificationModal === 'function') openNotificationModal();
    }
  },

  // ================= ALUR 4: LAPORAN PEMBIASAAN (BARU) =================
  {
    category: "LAPORAN PEMBIASAAN",
    targetId: "btnLaporanPembiasaanDash",
    title: "📄 Laporan Pembiasaan Ibadah Siswa",
    description: "Fitur khusus untuk melihat rekapitulasi ibadah periodik per kelas (Triwulan Q1-Q4 & Semester) dilengkapi konversi otomatis Haid dan cetak PDF resmi.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
    }
  },
  {
    category: "LAPORAN PEMBIASAAN",
    targetId: "lpSelectPeriode",
    title: "🗓️ Filter Triwulan & Semester",
    description: "Kamu bisa memilih periode laporan: Triwulan 1 s.d 4 atau Semester Ganjil & Genap sesuai kalender akademik.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
      let sampleClass = "10.1";
      if (typeof KELAS_ORDER !== 'undefined' && KELAS_ORDER.length > 0) sampleClass = KELAS_ORDER[0];
      if (typeof openLaporanPembiasaanModal === 'function') openLaporanPembiasaanModal(sampleClass);
    }
  },
  {
    category: "LAPORAN PEMBIASAAN",
    targetId: "lpTableBody",
    title: "🧮 Konversi Otomatis Haid & % Perform",
    description: "Sistem secara otomatis mengubah status Alfa siswi menjadi Izin (Dispen Haid) jika terdata Haid di Sheet 2, lalu menghitung persentase keaktifan ibadahnya.",
    position: "top"
  },

  // ================= ALUR 5: DETAIL KELAS & WA =================
  {
    category: "DETAIL KELAS",
    targetId: "tabBtnSholat",
    title: "☀️ Tab Sholat & Laporan WA Wali Kelas",
    description: "Di tab ini kamu bisa memantau siapa saja siswa yang Alfa sholat hari ini, serta mengirim laporan otomatis ke WhatsApp Wali Kelas.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
      let sampleClass = "10.1";
      if (typeof classDataStore !== 'undefined' && Object.keys(classDataStore).length > 0) {
        sampleClass = Object.keys(classDataStore)[0];
      }
      if (typeof openClassDetailModal === 'function') openClassDetailModal(sampleClass);
      if (typeof switchDetailTab === 'function') switchDetailTab('sholat');
    }
  },
  {
    category: "DETAIL KELAS",
    targetId: "tabBtnHaid",
    title: "🌺 Tab Data Haid & Deteksi Bentrok",
    description: "Memantau durasi haid siswi. Jika ada siswi terdata Haid namun ikut sholat (atau sebaliknya), sistem akan memberi peringatan 'Bentrok'.",
    position: "bottom",
    beforeShow: () => {
      if (typeof switchDetailTab === 'function') switchDetailTab('haid');
    }
  },

  // ================= ALUR 6: PANTAU & EDIT DATA =================
  {
    category: "PANTAU & EDIT DATA",
    targetId: "pantauSelectBulan",
    title: "📅 Filter Bulan, Tanggal & Kelas",
    description: "Pilih tanggal dan kelas mana saja yang ingin dipantau atau dikoreksi status absensinya jika ada kesalahan input.",
    position: "bottom",
    beforeShow: () => {
      closeAllModals();
      if (typeof goToView === 'function') goToView("viewDashboard");
      if (typeof openPantauDataModal === 'function') openPantauDataModal();
    }
  },
  {
    category: "PANTAU & EDIT DATA",
    targetId: "pantauTableBody",
    title: "✏️ Koreksi Status Absensi Live",
    description: "Kamu bisa mengubah status siswa menjadi Sholat, Sakit, Izin, Alfa, atau Haid lalu klik 'Simpan'. Data di Google Spreadsheet otomatis ter-update!",
    position: "top"
  }
];

let currentStepIndex = 0;

// Tutup Semua Modal yang Sedang Terbuka
function closeAllModals() {
  const modals = ['pantauDataModal', 'sheetPreviewModal', 'dataMasukModal', 'notificationModal', 'classDetailModal', 'bentrokTrackModal', 'laporanPembiasaanModal'];
  modals.forEach(id => {
    if (typeof toggleModal === 'function') toggleModal(id, false);
  });
}

// Memulai Tur Petunjuk Interaktif
function startKdiTour() {
  currentStepIndex = 0;
  createTourElements();
  executeAndShowStep(currentStepIndex);
}

// Inisialisasi Elemen Spotlight & Tooltip di DOM
function createTourElements() {
  if (document.getElementById('kdi-tour-highlight')) return;

  const highlight = document.createElement('div');
  highlight.id = 'kdi-tour-highlight';
  highlight.className = 'fixed rounded-2xl pointer-events-none transition-all duration-300 z-[201] border-2 border-yellow-400';
  highlight.style.boxShadow = '0 0 0 9999px rgba(6, 8, 13, 0.82), 0 0 25px rgba(255, 215, 0, 0.9)';

  const tooltip = document.createElement('div');
  tooltip.id = 'kdi-tour-tooltip';
  tooltip.className = 'fixed z-[202] w-80 max-w-[92vw] glass-card p-5 rounded-3xl border border-yellow-400/60 shadow-2xl transition-all duration-300 text-left space-y-3';
  tooltip.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-2">
      <span id="kdi-tour-category" class="text-[10px] font-black uppercase tracking-widest text-gold bg-yellow-400/20 px-2.5 py-0.5 rounded-md border border-yellow-400/30">BERANDA</span>
      <span id="kdi-tour-step-count" class="text-[10px] font-bold text-p-theme">1/20</span>
    </div>
    <div class="space-y-1">
      <h4 id="kdi-tour-title" class="font-extrabold text-judul-theme text-sm md:text-base">Judul Petunjuk</h4>
      <p id="kdi-tour-desc" class="text-xs text-p-theme leading-relaxed">Penjelasan fitur di sini...</p>
    </div>
    <div class="flex items-center justify-between pt-2">
      <button id="kdi-tour-prev-btn" onclick="prevTourStep()" class="glass-button-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30">Kembali</button>
      <div class="flex gap-2">
        <button onclick="stopKdiTour()" class="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-500 transition">Batal</button>
        <button id="kdi-tour-next-btn" onclick="nextTourStep()" class="glass-button-primary px-4 py-1.5 rounded-xl text-xs font-bold shadow-md">Lanjut</button>
      </div>
    </div>
  `;

  document.body.appendChild(highlight);
  document.body.appendChild(tooltip);
}

function executeAndShowStep(index) {
  const step = kdiTourSteps[index];
  if (!step) return;

  if (typeof step.beforeShow === 'function') {
    step.beforeShow();
  }

  setTimeout(() => {
    showTourStep(index);
  }, 250);
}

function getTargetElement(step) {
  if (step.targetId) {
    return document.getElementById(step.targetId);
  }
  if (step.selector) {
    return document.querySelector(step.selector);
  }
  return null;
}

function showTourStep(index) {
  const step = kdiTourSteps[index];
  if (!step) return;

  const targetEl = getTargetElement(step);
  const highlight = document.getElementById('kdi-tour-highlight');
  const tooltip = document.getElementById('kdi-tour-tooltip');

  if (!targetEl || !highlight || !tooltip) {
    console.warn(`Elemen target tidak ditemukan untuk langkah ${index + 1}.`);
    if (index < kdiTourSteps.length - 1) {
      nextTourStep();
    }
    return;
  }

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  setTimeout(() => {
    const rect = targetEl.getBoundingClientRect();

    highlight.style.top = `${Math.max(0, rect.top - 6)}px`;
    highlight.style.left = `${Math.max(0, rect.left - 6)}px`;
    highlight.style.width = `${rect.width + 12}px`;
    highlight.style.height = `${rect.height + 12}px`;

    document.getElementById('kdi-tour-category').innerText = `[${index + 1}/${kdiTourSteps.length}] ${step.category}`;
    document.getElementById('kdi-tour-step-count').innerText = `${index + 1}/${kdiTourSteps.length}`;
    document.getElementById('kdi-tour-title').innerText = step.title;
    document.getElementById('kdi-tour-desc').innerText = step.description;

    const tooltipHeight = tooltip.offsetHeight || 190;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let targetTop = rect.bottom + 16;
    let targetLeft = Math.max(12, Math.min(screenWidth - 340, rect.left + (rect.width / 2) - 160));

    if (step.position === 'top' || targetTop + tooltipHeight > screenHeight - 20) {
      targetTop = Math.max(16, rect.top - tooltipHeight - 16);
    }

    tooltip.style.top = `${targetTop}px`;
    tooltip.style.left = `${targetLeft}px`;

    const prevBtn = document.getElementById('kdi-tour-prev-btn');
    const nextBtn = document.getElementById('kdi-tour-next-btn');

    prevBtn.disabled = index === 0;
    if (index === kdiTourSteps.length - 1) {
      nextBtn.innerText = 'Selesai ✓';
      nextBtn.className = 'glass-button-primary px-4 py-1.5 rounded-xl text-xs font-bold shadow-md bg-emerald-500 text-slate-900';
    } else {
      nextBtn.innerText = 'Lanjut';
      nextBtn.className = 'glass-button-primary px-4 py-1.5 rounded-xl text-xs font-bold shadow-md';
    }
  }, 150);
}

function nextTourStep() {
  if (currentStepIndex < kdiTourSteps.length - 1) {
    currentStepIndex++;
    executeAndShowStep(currentStepIndex);
  } else {
    stopKdiTour();
    if (typeof showCustomAlert === 'function') {
      showCustomAlert("Petunjuk Selesai 🎉", "Kamu telah mempelajari seluruh alur & fitur KDI Center! Selamat bertugas!");
    }
  }
}

function prevTourStep() {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    executeAndShowStep(currentStepIndex);
  }
}

function stopKdiTour() {
  ['kdi-tour-highlight', 'kdi-tour-tooltip'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  closeAllModals();
  if (typeof goToView === 'function') {
    goToView('viewHome');
  }
}