const API_BASE = 'https://vins-license-api.alvinstamvans.workers.dev';

const gate = document.getElementById('authGate');
const shell = document.getElementById('appShell');
const form = document.getElementById('licenseForm');
const msg = document.getElementById('authMessage');

function unlock() {
  gate.style.display = 'none';
  shell.classList.add('unlocked');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  msg.textContent = 'Memeriksa lisensi…';

  const licenseKey = document
    .getElementById('licenseKey')
    .value
    .trim();

  if (!licenseKey) {
    msg.textContent = 'License Key wajib diisi.';
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_key: licenseKey
      })
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      msg.textContent = data.message || 'License tidak valid.';
      return;
    }

    // Simpan license agar tidak perlu memasukkan ulang
    localStorage.setItem('misterius_license', licenseKey);

    msg.textContent = 'License valid. Membuka tools…';

    unlock();

  } catch (error) {
    console.error(error);
    msg.textContent = 'Server lisensi tidak dapat dihubungi.';
  }
});

// Coba gunakan license yang sudah tersimpan
async function checkSavedLicense() {

  const savedLicense = localStorage.getItem('misterius_license');

  if (!savedLicense) {
    return;
  }

  try {

    const response = await fetch(`${API_BASE}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        license_key: savedLicense
      })
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      unlock();
    } else {
      localStorage.removeItem('misterius_license');
      msg.textContent = data.message || 'License tidak valid.';
    }

  } catch (error) {
    msg.textContent = 'Server lisensi tidak dapat dihubungi.';
  }
}

checkSavedLicense();
