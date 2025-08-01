let queue = [];
let selectedRow = null;

// Ambil referensi elemen
const form = document.getElementById("queueForm");
const tableBody = document.querySelector("#queueTable tbody");
const fisioterapisModal = document.getElementById("fisioterapisModal");
const dropdown = document.getElementById("fisioterapisDropdown");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("patientName").value.trim();
  const rm = document.getElementById("patientRM").value.trim();
  const diagnosa = document.getElementById("diagnosa").value.trim();
  const time = document.getElementById("examDateTime").value;
  const tindakan = Array.from(document.querySelectorAll('input[name="tindakan"]:checked'))
    .map(cb => cb.value)
    .join(", ");

  if (!name || !rm || !diagnosa || !time || !tindakan) {
    alert("Semua kolom wajib diisi!");
    return;
  }

  const data = {
    name,
    rm,
    diagnosa,
    time,
    tindakan,
    status: "Menunggu",
    fisio: "",
    respon: ""
  };

  queue.push(data);
  renderTable();
  form.reset();
});

function renderTable() {
  tableBody.innerHTML = "";
  queue.forEach((data, index) => {
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${data.name}<br><small>No RM: ${data.rm}<br>Dx: ${data.diagnosa}</small></td>
      <td>${new Date(data.time).toLocaleString("id-ID")}</td>
      <td>${data.tindakan}</td>
      <td>${data.status}</td>
      <td>${data.fisio}</td>
      <td>${data.respon}</td>
      <td>
        <button onclick="openFisioterapisModal(${index})">Pilih Fisioterapis</button>
        <button onclick="markAsDone(${index})">Selesai</button>
      </td>
    `;
  });
}

function openFisioterapisModal(index) {
  selectedRow = index;
  fisioterapisModal.style.display = "block";
}

function closeFisioterapisModal() {
  fisioterapisModal.style.display = "none";
}

function confirmFisioterapisDropdown() {
  const fisioName = dropdown.value;
  if (!fisioName || selectedRow === null) return;

  queue[selectedRow].fisio = fisioName;
  queue[selectedRow].status = "Sedang Diperiksa";
  renderTable();
  closeFisioterapisModal();
}

function markAsDone(index) {
  queue[index].status = "Selesai";
  queue[index].respon = "✅";
  renderTable();
}

window.onclick = function (event) {
  if (event.target === fisioterapisModal) {
    closeFisioterapisModal();
  }
};

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const ws_data = [
    ["No", "Nama", "No RM", "Diagnosa", "Waktu", "Tindakan", "Status", "Fisioterapis", "Respon"],
    ...queue.map((d, i) => [
      i + 1,
      d.name,
      d.rm,
      d.diagnosa,
      new Date(d.time).toLocaleString("id-ID"),
      d.tindakan,
      d.status,
      d.fisio,
      d.respon
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Antrian");
  XLSX.writeFile(wb, "antrian-fisioterapi.xlsx");
}
