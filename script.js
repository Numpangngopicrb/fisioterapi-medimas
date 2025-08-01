import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKzafXriDQa2etQeqGNY3Xgp0xeDq3c7U",
  authDomain: "fisioterapi-medimas.firebaseapp.com",
  projectId: "fisioterapi-medimas",
  storageBucket: "fisioterapi-medimas.firebasestorage.app",
  messagingSenderId: "86725418821",
  appId: "1:86725418821:web:b47d84c9c964a6df80e82c",
  measurementId: "G-QVTC940VL5",
  databaseURL: "https://fisioterapi-medimas-default-rtdb.asia-southeast1.firebasedatabase.app/" // ✅ updated
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const queueRef = ref(db, 'antrian');

const form = document.getElementById('queueForm');
const tableBody = document.querySelector('#queueTable tbody');
let currentRowKey = null;

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const name = document.getElementById('patientName').value;
  const dateTime = document.getElementById('examDateTime').value;
  const type = document.getElementById('examinationType').value;

  try {
    await push(queueRef, {
      nama: name,
      waktu: dateTime,
      jenis: type,
      status: 'MENUNGGU',
      fisioterapis: '-',
      respons: '-'
    });
    alert('Pasien berhasil ditambahkan!');
    form.reset();
  } catch (err) {
    console.error('Gagal push ke Firebase:', err);
    alert('Gagal tambah pasien. Cek console!');
  }
});

onValue(queueRef, (snapshot) => {
  tableBody.innerHTML = '';
  let no = 1;
  snapshot.forEach(child => {
    const data = child.val();
    const key = child.key;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${no++}</td>
      <td>${data.nama}</td>
      <td>${data.waktu}</td>
      <td>${data.jenis}</td>
      <td class="status ${getStatusClass(data.status)}">${data.status}</td>
      <td class="handled-by">${data.fisioterapis}</td>
      <td class="response-time">${data.respons}</td>
      <td class="action-buttons">
        <button onclick="openFisioterapisModal('${key}')">Proses</button>
        <button onclick="completeQueue('${key}')" style="${data.status === 'PROSES' ? '' : 'display:none;'}">Selesai</button>
        <button onclick="deleteQueue('${key}')">Hapus</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
});

function getStatusClass(status) {
  switch(status) {
    case 'MENUNGGU': return 'status-waiting';
    case 'PROSES': return 'status-processing';
    case 'SELESAI': return 'status-done';
    default: return '';
  }
}

window.openFisioterapisModal = function(key) {
  currentRowKey = key;
  document.getElementById('modal').style.display = 'flex';
}

window.confirmFisioterapis = async function () {
  const selected = document.getElementById('fisioterapisSelect').value;
  const startTime = new Date().toISOString();
  await update(ref(db, 'antrian/' + currentRowKey), {
    status: 'PROSES',
    fisioterapis: selected,
    startTime: startTime
  });
  document.getElementById('modal').style.display = 'none';
}

window.completeQueue = async function (key) {
  const res = await fetch(`${firebaseConfig.databaseURL}/antrian/${key}.json`);
  const data = await res.json();
  if (data.startTime) {
    const start = new Date(data.startTime);
    const end = new Date();
    const diff = end - start;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const duration = `${minutes}m ${seconds}s`;
    await update(ref(db, 'antrian/' + key), {
      status: 'SELESAI',
      respons: duration
    });
  }
}

window.deleteQueue = async function (key) {
  await remove(ref(db, 'antrian/' + key));
}

window.exportToExcel = function () {
  const table = document.getElementById("queueTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Antrian Fisioterapi" });
  XLSX.writeFile(wb, "Antrian-Fisioterapi.xlsx");
}
