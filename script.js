window.addEventListener("DOMContentLoaded", () => {
  let queue = [];
  let form = document.getElementById("queueForm");

  function renderTable() {
    const tableBody = document.querySelector("#antrianTable tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    queue.forEach((data, index) => {
      const row = tableBody.insertRow();

      const fisioterapisDropdown = `
        <select onchange="window.pilihFisioterapis(this, ${index})">
          <option value="">Pilih Fisioterapis</option>
          <option value="Nikita Radiantika, A.Md.Ftr">Nikita Radiantika, A.Md.Ftr</option>
          <option value="Intu Wahyuni, A.Md.Ftr">Intu Wahyuni, A.Md.Ftr</option>
          <option value="Indah Fitricya Niwar, A.Md.Ftr">Indah Fitricya Niwar, A.Md.Ftr</option>
          <option value="Faika Nabila Cheryl, A.Md.Ftr">Faika Nabila Cheryl, A.Md.Ftr</option>
        </select>
      `;

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${data.name}</td>
        <td>${new Date(data.time).toLocaleString("id-ID")}</td>
        <td>${data.tindakan}</td>
        <td>${data.status || '-'}</td>
        <td>${data.fisio || '-'}</td>
        <td>${data.respon || '-'}</td>
        <td>${fisioterapisDropdown}</td>
      `;
    });
  }

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

  // Fungsi global supaya bisa dipanggil dari HTML
  window.pilihFisioterapis = function (selectEl, index) {
    const selectedName = selectEl.value;
    if (!selectedName) return;

    queue[index].fisio = selectedName;
    queue[index].status = "Sedang Diperiksa";
    renderTable();
  };

  window.exportToExcel = function () {
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
  };
});
