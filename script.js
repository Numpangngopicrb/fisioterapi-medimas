document.addEventListener("DOMContentLoaded", () => {
  let queue = [];
  let selectedRow = null;

  const form = document.getElementById("queueForm");
  const tableBody = document.querySelector("#antrianTable tbody");
  const modal = document.getElementById("fisioterapisModal");
  const dropdown = document.getElementById("fisioterapisDropdown");

  // Tambah data antrian
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("patientName").value.trim();
    const rm = document.getElementById("patientRM").value.trim();
    const diagnosa = document.getElementById("diagnosa").value.trim();
    const waktu = document.getElementById("examDateTime").value;
    const tindakan = Array.from(
      document.querySelectorAll("input[name='tindakan']:checked")
    ).map((el) => el.value);

    if (!name || !rm || !diagnosa || !waktu || tindakan.length === 0) {
      alert("Mohon isi semua kolom dan pilih minimal satu tindakan.");
      return;
    }

    queue.push({
      name,
      rm,
      diagnosa,
      waktu,
      tindakan: tindakan.join(", "),
      status: "Menunggu",
      fisioterapis: "",
      respon: ""
    });

    form.reset();
    renderTable();
  });

  // Render tabel
  function renderTable() {
    if (!tableBody) return;

    tableBody.innerHTML = "";
    queue.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name} <br><small>RM: ${item.rm}<br>${item.diagnosa}</small></td>
        <td>${item.waktu}</td>
        <td>${item.tindakan}</td>
        <td>${item.status}</td>
        <td>${item.fisioterapis}</td>
        <td>${item.respon}</td>
        <td>
          <button onclick="openFisioterapisModal(${index})">Pilih</button>
          <button onclick="selesaiAntrian(${index})">Selesai</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Fungsi ekspor Excel
  window.exportToExcel = function () {
    const ws = XLSX.utils.json_to_sheet(queue);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Antrian");
    XLSX.writeFile(wb, "antrian-fisioterapi.xlsx");
  };

  // Tampilkan modal fisioterapis
  window.openFisioterapisModal = function (index) {
    selectedRow = index;
    dropdown.value = "";
    modal.style.display = "block";
  };

  // Tutup modal
  window.closeFisioterapisModal = function () {
    modal.style.display = "none";
  };

  // Konfirmasi dropdown fisioterapis
  window.confirmFisioterapisDropdown = function () {
    const selectedFisio = dropdown.value;
    if (selectedFisio && selectedRow !== null) {
      queue[selectedRow].fisioterapis = selectedFisio;
      queue[selectedRow].status = "Diproses";
      queue[selectedRow].respon = "✅";
      renderTable();
      closeFisioterapisModal();
    } else {
      alert("Silakan pilih fisioterapis.");
    }
  };

  // Tandai selesai
  window.selesaiAntrian = function (index) {
    if (queue[index].status === "Selesai") return;
    queue[index].status = "Selesai";
    queue[index].respon = "✔️";
    renderTable();
  };
});
