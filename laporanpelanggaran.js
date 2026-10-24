/**
 * =========================================================
 * LAPORAN PELANGGARAN KDI CENTER (PDF GENERATOR - ALL TIME)
 * File: laporanpelanggaran.js
 * Pustaka: jsPDF & jsPDF-AutoTable
 * =========================================================
 */

async function generatePDFLaporanPelanggaran() {
  // 1. Cek ketersediaan pustaka jsPDF
  if (!window.jspdf || !window.jspdf.jsPDF) {
    if (typeof showCustomAlert === 'function') {
      showCustomAlert("Error Pustaka", "Pustaka jsPDF belum terinstal atau gagal dimuat.");
    } else {
      alert("Pustaka jsPDF belum dimuat.");
    }
    return;
  }

  // Set indikator memuat data
  if (typeof setSyncState === 'function') {
    setSyncState("loading", "Memuat seluruh data akumulasi...");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Urutan kelas standar KDI (10.1 - 12.6)
  const KELAS_ORDER_REF = [
    "10.1", "10.2", "10.3", "10.4", "10.5", "10.6",
    "11.1", "11.2", "11.3", "11.4", "11.5", "11.6",
    "12.1", "12.2", "12.3", "12.4", "12.5", "12.6"
  ];

  let dataStore = {};

  // 2. Tarik data akumulasi SELURUH BULAN (bulan=all) dari Apps Script API
  try {
    const apiUrl = (typeof API_URL !== 'undefined') 
      ? API_URL 
      : "https://script.google.com/macros/s/AKfycbyxJqB21sfGOrXqpD9OIKTM83yb6Et1PEymXJdT0rhidN1FW8vvgGuBG5ZnxUO8ff7ofg/exec";

    const res = await fetch(`${apiUrl}?action=getDashboardData&bulan=all`);
    const result = await res.json();

    if (result && result.status === "success" && result.data) {
      dataStore = result.data;
    } else {
      // Fallback ke dataStore lokal jika API gagal
      dataStore = (typeof classDataStore !== 'undefined' && Object.keys(classDataStore).length > 0) 
        ? classDataStore 
        : (window.classDataStore || {});
    }
  } catch (err) {
    console.error("Gagal menarik data akumulasi pelanggaran all-time:", err);
    dataStore = (typeof classDataStore !== 'undefined' && Object.keys(classDataStore).length > 0) 
      ? classDataStore 
      : (window.classDataStore || {});
  } finally {
    if (typeof setSyncState === 'function') {
      setSyncState("online", "Terhubung");
    }
  }

  const availableClasses = Object.keys(dataStore);

  if (availableClasses.length === 0) {
    if (typeof showCustomAlert === 'function') {
      showCustomAlert("Data Belum Siap", "Belum ada data kelas yang dimuat dari Spreadsheet.");
    } else {
      alert("Belum ada data kelas yang dimuat.");
    }
    return;
  }

  // Urutkan kelas sesuai KELAS_ORDER_REF
  const sortedClasses = availableClasses.sort((a, b) => {
    let idxA = KELAS_ORDER_REF.indexOf(a);
    let idxB = KELAS_ORDER_REF.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  const tglCetak = new Date().toLocaleDateString("id-ID", {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // --- HEADER DOKUMEN ---
  function drawPDFHeader(docPage) {
    docPage.setFillColor(255, 215, 0); // Gold Banner
    docPage.rect(0, 0, 210, 12, 'F');

    docPage.setFont("helvetica", "bold");
    docPage.setFontSize(15);
    docPage.setTextColor(15, 23, 42);
    docPage.text("LAPORAN REKAPITULASI KEDISIPLINAN IBADAH SISWA", 105, 22, { align: "center" });

    docPage.setFontSize(10);
    docPage.setFont("helvetica", "bold");
    docPage.setTextColor(184, 134, 11);
    docPage.text("KDI CENTER • PR IPM SMA MUHAMMADIYAH 2 DEPOK", 105, 27, { align: "center" });

    docPage.setFontSize(8);
    docPage.setFont("helvetica", "normal");
    docPage.setTextColor(100, 116, 139);
    docPage.text(`Dicetak pada: ${tglCetak} | Rekapitulasi Akumulasi Keseluruhan`, 105, 32, { align: "center" });

    docPage.setDrawColor(212, 175, 55);
    docPage.setLineWidth(0.8);
    docPage.line(14, 35, 196, 35);
  }

  drawPDFHeader(doc);

  let currentY = 42;
  let totalSiswaPelanggarKeseluruhan = 0;

  // --- ITERASI PER KELAS ---
  sortedClasses.forEach((className) => {
    const classInfo = dataStore[className];
    if (!classInfo || !classInfo.students) return;

    // Filter hanya siswa yang MEMILIKI pelanggaran (> 0)
    const pelanggarList = classInfo.students.filter(s => {
      const totTelat = s.totalTelat || 0;
      const totBercanda = s.totalBercanda || 0;
      const totCabut = s.totalCabut || 0;
      return (totTelat + totBercanda + totCabut) > 0;
    });

    totalSiswaPelanggarKeseluruhan += pelanggarList.length;

    if (currentY > 240) {
      doc.addPage();
      drawPDFHeader(doc);
      currentY = 42;
    }

    // Header Nama Kelas
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`KELAS ${className}`, 14, currentY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`(Total Pelanggar: ${pelanggarList.length} Siswa)`, 45, currentY);

    currentY += 4;

    if (pelanggarList.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("✓ Nihil - Tidak ada catatan pelanggaran di kelas ini.", 18, currentY + 2);
      currentY += 10;
    } else {
      const tableData = pelanggarList.map((s, idx) => {
        const telat = s.totalTelat || 0;
        const bercanda = s.totalBercanda || 0;
        const cabut = s.totalCabut || 0;
        const totalPoin = telat + bercanda + cabut;

        return [
          idx + 1,
          s.name,
          s.gender || "-",
          `${telat}x`,
          `${bercanda}x`,
          `${cabut}x`,
          `${totalPoin} Kali`
        ];
      });

      doc.autoTable({
        startY: currentY,
        head: [['No', 'Nama Siswa', 'L/P', 'Telat', 'Bercanda', 'Cabut', 'Total']],
        body: tableData,
        margin: { left: 14, right: 14 },
        theme: 'grid',
        headStyles: {
          fillColor: [184, 134, 11],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [30, 41, 59]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 'auto' },
          2: { halign: 'center', cellWidth: 12 },
          3: { halign: 'center', cellWidth: 20 },
          4: { halign: 'center', cellWidth: 22 },
          5: { halign: 'center', cellWidth: 20 },
          6: { halign: 'center', cellWidth: 22, fontStyle: 'bold' }
        },
        styles: { cellPadding: 2 },
        didDrawPage: (data) => {
          currentY = data.cursor.y;
        }
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY) + 8;
    }
  });

  // --- RINGKASAN AKHIR & TANDA TANGAN ---
  if (currentY > 230) {
    doc.addPage();
    drawPDFHeader(doc);
    currentY = 42;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTAL KESELURUHAN PELANGGAR: ${totalSiswaPelanggarKeseluruhan} SISWA`, 14, currentY);

  currentY += 12;
  const signatureY = currentY > 240 ? 240 : currentY;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Kolom 1 (Kiri): Ketua KDI Center
  doc.text("Mengetahui,", 45, signatureY, { align: "center" });
  doc.text("Ketua KDI", 45, signatureY + 5, { align: "center" });
  doc.text("( ____________________ )", 45, signatureY + 25, { align: "center" });

  // Kolom 2 (Tengah): Koordinator ISMUBA
  doc.text("Menyetujui,", 105, signatureY, { align: "center" });
  doc.text("Koordinator ISMUBA", 105, signatureY + 5, { align: "center" });
  doc.text("( ____________________ )", 105, signatureY + 25, { align: "center" });

  // Kolom 3 (Kanan): Tim Kesiswaan
  const formattedDate = (tglCetak.split(',')[1] || tglCetak).trim();
  doc.text("Depok, " + formattedDate, 165, signatureY, { align: "center" });
  doc.text("Tim Kesiswaan", 165, signatureY + 5, { align: "center" });
  doc.text("( ____________________ )", 165, signatureY + 25, { align: "center" });


  // --- FOOTER PENOMORAN HALAMAN ---
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text(`KDI Center System • Halaman ${i} dari ${totalPages}`, 105, 290, { align: "center" });
  }

  const filename = `Laporan_Pelanggaran_KDI_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

window.generatePDFLaporanPelanggaran = generatePDFLaporanPelanggaran;
