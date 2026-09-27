// =================================================================================
// laporanpembiasaan.js 
// Versi: jsPDF + AutoTable + Transparan Logo Fix + Layout Header Anti-Terpotong
// Developer: Razuhfgkruay / KDI Center System
// =================================================================================

document.addEventListener('DOMContentLoaded', () => {
  setupLaporanUI();
});

// HELPER: Convert & Compress Logo Image dengan Background Putih (Cegah Kotak Hitam PNG)
function getBase64ImageFromURL(url) {
  return new Promise((resolve, reject) => {
    var img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      var canvas = document.createElement("canvas");
      var maxDim = 150;
      var scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      var ctx = canvas.getContext("2d");
      // Isi background dengan warna putih agar area transparan PNG tidak jadi hitam
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = error => reject(error);
    img.src = url;
  });
}

// Fungsi Jeda agar UI browser tidak Freeze saat render PDF
function sleepPaint(ms) {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(resolve, ms);
    });
  });
}

function setupLaporanUI() {
  const modalHTML = `
  <div id="laporanModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm hidden items-center justify-center z-[60] p-4 transition-all duration-300">
    <div class="glass-card w-full max-w-md rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
      
      <!-- Header Modal -->
      <div class="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center border border-[#FFD700]/30">
            <i data-lucide="file-text" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-bold text-white text-base md:text-lg tracking-wide">Cetak Laporan KDI</h3>
            <p class="text-xs text-slate-400 font-medium">Monitoring & Evaluasi Ibadah</p>
          </div>
        </div>
        <button onclick="closeLaporanPembiasaanModal()" id="btnCloseModalHeader" class="text-slate-400 hover:text-rose-500 transition">
          <i data-lucide="x" class="w-6 h-6"></i>
        </button>
      </div>

      <!-- Body Modal -->
      <div class="p-6 space-y-4 bg-slate-50 dark:bg-slate-900">
        <div>
          <label class="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">1. Pilih Kelas</label>
          <select id="laporanSelectKelas" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-xs md:text-sm font-bold cursor-pointer focus:ring-2 focus:ring-[#FFD700] outline-none transition">
            <option value="">-- Pilih Kelas --</option>
            ${KELAS_ORDER.map(k => `<option value="${k}">Kelas ${k}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">2. Pilih Periode Laporan</label>
          <select id="laporanSelectPeriode" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-white text-xs md:text-sm font-bold cursor-pointer focus:ring-2 focus:ring-[#FFD700] outline-none transition">
            <option value="">-- Pilih Periode --</option>
            <optgroup label="Semester 1 (Ganjil)">
              <option value="7">Bulan Juli</option>
              <option value="8">Bulan Agustus</option>
              <option value="9">Bulan September</option>
              <option value="7-9">Triwulan 1 (Juli - September)</option>
              <option value="10-12">Triwulan 2 (Oktober - Desember)</option>
              <option value="7-12">Full Semester 1 (Juli - Desember)</option>
            </optgroup>
            <optgroup label="Semester 2 (Genap)">
              <option value="1-3">Triwulan 3 (Januari - Maret)</option>
              <option value="4-6">Triwulan 4 (April - Juni)</option>
              <option value="1-6">Full Semester 2 (Januari - Juni)</option>
            </optgroup>
          </select>
        </div>
      </div>

      <!-- PROGRESS BAR UI (#FFD700 GOLD GRADIENT) -->
      <div id="laporanProgressContainer" class="hidden flex-col gap-2 p-6 pt-0 bg-slate-50 dark:bg-slate-900">
        <div class="flex justify-between items-end text-xs font-bold">
          <span id="laporanProgressText" class="text-[#D4AF37] dark:text-[#FFD700]">Memulai...</span>
          <span id="laporanProgressPercent" class="text-slate-800 dark:text-white text-lg font-black">0%</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div id="laporanProgressBar" class="bg-gradient-to-r from-[#FFD700] to-[#B8860B] h-3 rounded-full transition-all duration-300 ease-out" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Footer Modal -->
      <div id="laporanModalFooter" class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
        <button onclick="closeLaporanPembiasaanModal()" class="flex-1 py-3 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition">Batal</button>
        <button id="btnProsesCetak" onclick="prosesCetakLaporan()" class="flex-1 py-3 rounded-xl text-xs font-bold bg-[#FFD700] hover:bg-[#E6C200] text-slate-900 transition flex justify-center items-center gap-2 shadow-lg shadow-[#FFD700]/30">
          <i data-lucide="printer" class="w-4 h-4"></i> Generate PDF
        </button>
      </div>

    </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function updateProgressBar(percent, textStatus) {
  const container = document.getElementById('laporanProgressContainer');
  const footer = document.getElementById('laporanModalFooter');
  const btnCloseHeader = document.getElementById('btnCloseModalHeader');
  
  const bar = document.getElementById('laporanProgressBar');
  const txt = document.getElementById('laporanProgressText');
  const pct = document.getElementById('laporanProgressPercent');

  if (percent > 0) {
    container.classList.remove('hidden'); container.classList.add('flex');
    footer.classList.add('hidden');
    btnCloseHeader.style.pointerEvents = 'none'; btnCloseHeader.classList.add('opacity-30');
  }

  bar.style.width = `${percent}%`;
  txt.innerText = textStatus;
  pct.innerText = `${percent}%`;

  await sleepPaint(150); 

  if (percent === 100) {
    setTimeout(() => {
      container.classList.add('hidden'); container.classList.remove('flex');
      footer.classList.remove('hidden');
      btnCloseHeader.style.pointerEvents = 'auto'; btnCloseHeader.classList.remove('opacity-30');
      bar.style.width = `0%`; pct.innerText = `0%`;
    }, 2000); 
  }
}

function openLaporanPembiasaanModal() {
  const m = document.getElementById('laporanModal');
  if (m) {
    m.classList.remove('hidden'); m.classList.add('flex');
    if (typeof selectedClassForDetail !== 'undefined' && selectedClassForDetail) {
      document.getElementById('laporanSelectKelas').value = selectedClassForDetail;
    }
  }
}

function closeLaporanPembiasaanModal() {
  const m = document.getElementById('laporanModal');
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
}

async function prosesCetakLaporan() {
  const kelasVal = document.getElementById('laporanSelectKelas').value;
  const periodeVal = document.getElementById('laporanSelectPeriode').value;

  if (!kelasVal || !periodeVal) {
    showCustomAlert("Perhatian", "Pilih Kelas dan Periode Laporan terlebih dahulu!");
    return;
  }

  try {
    await updateProgressBar(15, "Menghubungkan ke Pusat Data...");
    const res = await fetch(`${API_URL}?action=getDashboardData&bulan=${periodeVal}`);
    const result = await res.json();

    await updateProgressBar(45, "Menganalisa Data Ibadah & Kedisiplinan...");

    if (result && result.status === "success" && result.data && result.data[kelasVal]) {
      const dataSiswa = result.data[kelasVal].students;
      
      if (!dataSiswa || dataSiswa.length === 0) {
        showCustomAlert("Info", "Tidak ada data siswa untuk kelas tersebut.");
        await updateProgressBar(100, "Dibatalkan");
        return;
      }

      const selectElement = document.getElementById('laporanSelectPeriode');
      const periodeText = selectElement.options[selectElement.selectedIndex].text;
      
      await buatPDFVektor(kelasVal, periodeText, dataSiswa);
      
    } else {
      showCustomAlert("Gagal", "Gagal menarik data absensi dari Spreadsheet.");
      await updateProgressBar(100, "Gagal");
    }
  } catch (err) {
    console.error(err);
    showCustomAlert("Error Koneksi", "Terjadi kesalahan saat menghubungi server.");
    await updateProgressBar(100, "Error Jaringan");
  } 
}

// --------------------------------------------------------------------------------
// ENGINE GENERATOR PDF (FIX TRANSPARAN LOGO & LAYOUT TABEL ANTI-TERPOTONG)
// --------------------------------------------------------------------------------
async function buatPDFVektor(kelas, periodeTeks, listSiswa) {
  const { jsPDF } = window.jspdf;
  
  const doc = new jsPDF({
    orientation: 'l',
    unit: 'mm',
    format: 'a4',
    compress: true
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  await updateProgressBar(65, "Memuat Desain Eksekutif...");
  const logoBase64 = await getBase64ImageFromURL("logo-kdi.png").catch(() => null);
  
  await updateProgressBar(75, "Menyusun Kalkulasi Target Hari & Haid...");
  
  let targetDhuha = 0;
  let targetDzuhur = 0;
  let dataOlahan = [];

  // STEP 1: HITUNG TARGET HARI MAKSIMAL
  listSiswa.forEach((s) => {
    let sholatDhuha = s.totalDhuha || 0;
    let sholatDzuhur = s.totalDzuhur || 0;
    let alfaDhuha = s.dhuhaAlfa !== undefined ? s.dhuhaAlfa : 0;
    let alfaDzuhur = s.dzuhurAlfa !== undefined ? s.dzuhurAlfa : 0;
    let sakitDhuha = s.dhuhaSakit !== undefined ? s.dhuhaSakit : 0;
    let sakitDzuhur = s.dzuhurSakit !== undefined ? s.dzuhurSakit : 0;
    let izinDhuha = s.dhuhaIzin !== undefined ? s.dhuhaIzin : 0;
    let izinDzuhur = s.dzuhurIzin !== undefined ? s.dzuhurIzin : 0;

    let totalHariDhuhaSiswa = sholatDhuha + alfaDhuha + sakitDhuha + izinDhuha;
    let totalHariDzuhurSiswa = sholatDzuhur + alfaDzuhur + sakitDzuhur + izinDzuhur;

    if (totalHariDhuhaSiswa > targetDhuha) targetDhuha = totalHariDhuhaSiswa;
    if (totalHariDzuhurSiswa > targetDzuhur) targetDzuhur = totalHariDzuhurSiswa;
  });

  // STEP 2: OLAH DATA DAN HITUNG KEHADIRAN SISWA DENGAN BOBOT ADIL
  listSiswa.forEach((s, idx) => {
    let sholatDhuha = s.totalDhuha || 0;
    let sholatDzuhur = s.totalDzuhur || 0;
    let alfaDhuha = s.dhuhaAlfa !== undefined ? s.dhuhaAlfa : 0;
    let alfaDzuhur = s.dzuhurAlfa !== undefined ? s.dzuhurAlfa : 0;
    let sakitDhuha = s.dhuhaSakit !== undefined ? s.dhuhaSakit : 0;
    let sakitDzuhur = s.dzuhurSakit !== undefined ? s.dzuhurSakit : 0;
    let izinDhuha = s.dhuhaIzin !== undefined ? s.dhuhaIzin : 0;
    let izinDzuhur = s.dzuhurIzin !== undefined ? s.dzuhurIzin : 0;

    // Logika Konversi Haid Ketat
    let haid = s.gender === 'P' ? (s.haidDays || 0) : 0;
    if (haid > 0) {
        let pemaafanDhuha = Math.min(alfaDhuha, haid);
        alfaDhuha -= pemaafanDhuha;
        izinDhuha += haid;

        let pemaafanDzuhur = Math.min(alfaDzuhur, haid);
        alfaDzuhur -= pemaafanDzuhur;
        izinDzuhur += haid;
    }

    // Pelanggaran
    let telat = s.totalTelat || 0;
    let bercanda = s.totalBercanda || 0;
    let cabut = s.totalCabut || 0;

    // FORMULA KEHADIRAN ADIL (Sholat=1.0, Izin=0.8, Sakit=0.7, Alfa=0.0)
    let poinDhuha = sholatDhuha + (izinDhuha * 0.8) + (sakitDhuha * 0.7);
    let poinDzuhur = sholatDzuhur + (izinDzuhur * 0.8) + (sakitDzuhur * 0.7);
    let totalPoinDiperoleh = poinDhuha + poinDzuhur;

    let totalTargetDuaSesi = targetDhuha + targetDzuhur;
    let persenKehadiran = 0;

    if (totalTargetDuaSesi > 0) {
      persenKehadiran = Math.min(100, Math.round((totalPoinDiperoleh / totalTargetDuaSesi) * 100));
    }

    let teksKehadiran = `${persenKehadiran}%`;

    dataOlahan.push([
      idx + 1, s.name,
      sholatDhuha, alfaDhuha, sakitDhuha, izinDhuha,
      sholatDzuhur, alfaDzuhur, sakitDzuhur, izinDzuhur,
      telat, bercanda, cabut,
      teksKehadiran
    ]);
  });

  // ================= KOP SURAT MODERN (#FFD700) =================
  doc.setFillColor(255, 215, 0); 
  doc.rect(0, 0, pageWidth, 4, 'F');

  if (logoBase64) doc.addImage(logoBase64, 'PNG', 12, 10, 22, 22); 

  doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(30, 41, 59); 
  doc.text("KAJIAN DAKWAH ISLAM (KDI) PR IPM", 39, 17);
  
  doc.setFontSize(12); doc.setTextColor(71, 85, 105); 
  doc.text("SMA MUHAMMADIYAH 2 DEPOK", 39, 23);
  
  doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(100, 116, 139); 
  doc.text("Pusat Data Monitoring dan Evaluasi Ibadah Siswa (KDI Center)", 39, 29);

  // Kotak Info Kanan Atas
  doc.setFillColor(248, 250, 252); doc.setDrawColor(226, 232, 240);
  doc.rect(pageWidth - 82, 10, 70, 20, 'FD');
  
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(15, 23, 42);
  doc.text("LAPORAN KEDISIPLINAN", pageWidth - 47, 16, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text(`Kelas : ${kelas}`, pageWidth - 47, 22, { align: "center" });
  doc.text(`Periode : ${periodeTeks}`, pageWidth - 47, 26, { align: "center" });

  doc.setDrawColor(203, 213, 225); doc.setLineWidth(0.5);
  doc.line(12, 35, pageWidth - 12, 35);

  await updateProgressBar(85, "Melukis Tabel Laporan...");

  // ================= STRUKTUR HEADER TABEL =================
  const tabelKolom = [
    [
      { content: 'No', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [248, 250, 252], textColor: [15,23,42] } },
      { content: 'Nama Siswa', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [248, 250, 252], textColor: [15,23,42] } },
      { content: `Dhuha (${targetDhuha} Hari)`, colSpan: 4, styles: { halign: 'center', fillColor: [30, 41, 59] } }, 
      { content: `Dzuhur (${targetDzuhur} Hari)`, colSpan: 4, styles: { halign: 'center', fillColor: [15, 23, 42] } }, 
      { content: 'Pelanggaran', colSpan: 3, styles: { halign: 'center', fillColor: [153, 27, 27] } }, 
      { content: 'Kehadiran', rowSpan: 2, styles: { halign: 'center', valign: 'middle', fillColor: [248, 250, 252], textColor: [15,23,42] } }
    ],
    [
      // Sub-kolom Dhuha
      { content: 'Sholat', styles: { fillColor: [51, 65, 85] } },
      { content: 'Alfa', styles: { fillColor: [51, 65, 85] } },
      { content: 'Sakit', styles: { fillColor: [51, 65, 85] } },
      { content: 'Izin', styles: { fillColor: [51, 65, 85] } },
      // Sub-kolom Dzuhur
      { content: 'Sholat', styles: { fillColor: [30, 41, 59] } },
      { content: 'Alfa', styles: { fillColor: [30, 41, 59] } },
      { content: 'Sakit', styles: { fillColor: [30, 41, 59] } },
      { content: 'Izin', styles: { fillColor: [30, 41, 59] } },
      // Sub-kolom Pelanggaran
      { content: 'Terlambat', styles: { fillColor: [185, 28, 28] } },
      { content: 'Bercanda', styles: { fillColor: [185, 28, 28] } },
      { content: 'Cabut', styles: { fillColor: [185, 28, 28] } }
    ]
  ];

  // ================= RENDER TABEL PDF (OPTIMASI LEBAR & PADDING) =================
  doc.autoTable({
    startY: 42,
    head: tabelKolom,
    body: dataOlahan,
    theme: 'grid',
    headStyles: { 
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7.8,       // Ukuran font header sedikit diperkecil agar kata panjang tidak terpotong
      cellPadding: 1.2     // Padding sel dikurangi agar teks lebih leluasa di dalam sel
    },
    bodyStyles: {
      font: 'helvetica', 
      fontSize: 8, 
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    // PERBAIKAN DISTRIBUSI LEBAR KOLOM
    columnStyles: {
      0: { halign: 'center', cellWidth: 9 },         // No (Ditingkatkan ke 9mm agar "No" muat 1 baris)
      1: { halign: 'left', fontStyle: 'bold' },       // Nama Siswa (Otomatis mengambil sisa lebar yang luas)
      2: { halign: 'center', cellWidth: 12 },          // Sholat Dhuha
      3: { halign: 'center', cellWidth: 12, textColor: [220, 38, 38] }, // Alfa Dhuha
      4: { halign: 'center', cellWidth: 12 },          // Sakit Dhuha
      5: { halign: 'center', cellWidth: 12 },          // Izin Dhuha
      6: { halign: 'center', cellWidth: 12 },          // Sholat Dzuhur
      7: { halign: 'center', cellWidth: 12, textColor: [220, 38, 38] }, // Alfa Dzuhur
      8: { halign: 'center', cellWidth: 12 },          // Sakit Dzuhur
      9: { halign: 'center', cellWidth: 12 },          // Izin Dzuhur
      10: { halign: 'center', cellWidth: 18, textColor: [220, 38, 38] }, // Terlambat
      11: { halign: 'center', cellWidth: 17, textColor: [220, 38, 38] }, // Bercanda
      12: { halign: 'center', cellWidth: 13, textColor: [220, 38, 38] }, // Cabut
      13: { halign: 'center', fontStyle: 'bold', cellWidth: 19, textColor: [21, 128, 61] } // Kehadiran
    },
    didParseCell: function (data) {
      if (data.section === 'body' && (data.cell.raw === "-" || data.cell.raw === 0)) {
          data.cell.styles.textColor = [203, 213, 225]; 
      }
    },
    margin: { left: 8, right: 8, bottom: 25 } // Margin diperluas ke samping
  });

  // ================= TANDA TANGAN =================
  let finalY = doc.lastAutoTable.finalY + 15; 
  if (finalY > 170) { doc.addPage(); finalY = 25; }

  const tglMasehi = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);

  const xKiri = 40; const xTengah = pageWidth / 2; const xKanan = pageWidth - 40;
  doc.text(`Depok, ${tglMasehi}`, xKanan, finalY, { align: "center" });
  doc.text("Ketua KDI PR IPM,", xKanan, finalY + 5, { align: "center" });
  doc.text("........................................", xKanan, finalY + 25, { align: "center" });
  doc.text("Mengetahui,", xKiri, finalY, { align: "center" });
  doc.text(`Wali Kelas ${kelas},`, xKiri, finalY + 5, { align: "center" });
  doc.text("........................................", xKiri, finalY + 25, { align: "center" });
  doc.text("Menyetujui,", xTengah, finalY, { align: "center" });
  doc.text("Bidang Ismuba,", xTengah, finalY + 5, { align: "center" });
  doc.text("........................................", xTengah, finalY + 25, { align: "center" });

  // ================= FOOTER =================
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(148, 163, 184); 
    doc.text("KDI Center System - SMAN 2 Depok", 12, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Halaman ${i} / ${pageCount}`, pageWidth - 12, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  }

  await updateProgressBar(100, "Selesai! Menyimpan Dokumen...");

  const namaFile = `Laporan_KDI_Kelas_${kelas}_${periodeTeks.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(namaFile);
  
  setTimeout(() => {
    closeLaporanPembiasaanModal();
    showCustomAlert("Sukses", `Laporan KDI Kelas ${kelas} berhasil diunduh!`);
  }, 1000);
}