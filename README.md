# MISTERIUS TOOLS

Toolkit web dengan proteksi lisensi dan kontrol perangkat.

## Frontend
Upload `index.html` dan `auth.js` ke GitHub Pages. Di `auth.js`, ganti `API_BASE` dengan URL server lisensi.

## Server
```bash
cd server
npm install
ADMIN_KEY="ganti-dengan-admin-key-kuat" SESSION_SECRET="ganti-secret-kuat" INITIAL_LICENSE="individualisme" npm start
```

Untuk production, gunakan HTTPS dan platform hosting Node.js. Jangan commit `.env` atau secret ke GitHub.

## Admin
Buka `admin/index.html`, masukkan URL server dan Admin Key. Kamu dapat melihat perangkat, menonaktifkan/mengaktifkan perangkat, dan mengganti password license.

> Catatan: Device ID berbasis browser/localStorage. Jika pengguna menghapus data browser atau pindah browser/perangkat, ID dapat berubah. Untuk kontrol perangkat yang lebih kuat, gunakan sistem akun/license per pengguna.
