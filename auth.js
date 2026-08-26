const API_BASE =
  'https://vins-license-api.alvinstamvans.workers.dev';

const DEVICE_KEY = 'misterius_device_id';

let deviceId =
  localStorage.getItem(DEVICE_KEY);

if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem(
    DEVICE_KEY,
    deviceId
  );
}

const gate =
  document.getElementById('authGate');

const shell =
  document.getElementById('appShell');

const form =
  document.getElementById('licenseForm');

const msg =
  document.getElementById('authMessage');


function unlock() {

  gate.style.display = 'none';

  shell.classList.add('unlocked');

}


/* =========================
   VERIFY LICENSE
========================= */

async function verifyLicense(
  licenseKey
) {

  const response =
    await fetch(
      `${API_BASE}/verify`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          license_key:
            licenseKey
        }),

        cache: 'no-store'
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.valid
  ) {

    throw new Error(
      data.message ||
      'License tidak valid.'
    );

  }

  return data;

}


/* =========================
   HEARTBEAT
========================= */

async function heartbeat() {

  const licenseKey =
    localStorage.getItem(
      'misterius_license'
    );

  if (!licenseKey) {
    return;
  }

  try {

    const response =
      await fetch(
        `${API_BASE}/heartbeat`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({

            license_key:
              licenseKey,

            device_id:
              deviceId,

            user_agent:
              navigator.userAgent

          }),

          cache: 'no-store'
        }
      );

    const data =
      await response.json();

    /*
      Kalau license dimatikan
      dari panel admin, tools
      akan dikunci.
    */

    if (
      !response.ok ||
      !data.success
    ) {

      localStorage.removeItem(
        'misterius_license'
      );

      location.reload();

    }

  } catch (error) {

    console.log(
      'Heartbeat gagal:',
      error
    );

  }

}


/* =========================
   LICENSE FORM
========================= */

form.addEventListener(
  'submit',
  async (e) => {

    e.preventDefault();

    msg.textContent =
      'Memeriksa lisensi…';

    const licenseKey =
      document
        .getElementById(
          'licenseKey'
        )
        .value
        .trim();

    if (!licenseKey) {

      msg.textContent =
        'License Key wajib diisi.';

      return;

    }

    try {

      await verifyLicense(
        licenseKey
      );

      localStorage.setItem(
        'misterius_license',
        licenseKey
      );

      msg.textContent =
        'License valid. Membuka tools…';

      unlock();

      // Kirim heartbeat pertama
      await heartbeat();

    } catch (error) {

      msg.textContent =
        error.message;

    }

  }
);


/* =========================
   SAVED LICENSE
========================= */

async function checkSavedLicense() {

  const licenseKey =
    localStorage.getItem(
      'misterius_license'
    );

  if (!licenseKey) {
    return;
  }

  try {

    await verifyLicense(
      licenseKey
    );

    unlock();

    await heartbeat();

  } catch (error) {

    localStorage.removeItem(
      'misterius_license'
    );

    msg.textContent =
      error.message;

  }

}


/* =========================
   HEARTBEAT LOOP
========================= */

/*
  Kirim heartbeat setiap 30 detik.
*/

setInterval(
  heartbeat,
  30000
);


/* =========================
   START
========================= */

checkSavedLicense();
