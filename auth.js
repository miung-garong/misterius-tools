const API_BASE = localStorage.getItem('misterius_api') || 'https://YOUR-SERVER-DOMAIN.example.com';
const DEVICE_KEY='misterius_device_id';
let deviceId=localStorage.getItem(DEVICE_KEY);
if(!deviceId){ deviceId=crypto.randomUUID(); localStorage.setItem(DEVICE_KEY,deviceId); }
document.getElementById('deviceIdShort').textContent=deviceId.slice(0,8)+'…';
const gate=document.getElementById('authGate'), shell=document.getElementById('appShell'), form=document.getElementById('licenseForm'), msg=document.getElementById('authMessage');
function unlock(){gate.style.display='none';shell.classList.add('unlocked');}
async function check(){
  if(!API_BASE || API_BASE.includes('YOUR-SERVER-DOMAIN')) return;
  try{const r=await fetch(API_BASE+'/api/health',{cache:'no-store'}); if(!r.ok) throw new Error();}catch(e){msg.textContent='Server lisensi tidak dapat dihubungi.';}
}
form.addEventListener('submit',async e=>{
 e.preventDefault(); msg.textContent='Memeriksa lisensi…';
 if(!API_BASE || API_BASE.includes('YOUR-SERVER-DOMAIN')) { msg.textContent='Server lisensi belum dikonfigurasi.'; return; }
 try{
   const r=await fetch(API_BASE+'/api/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:document.getElementById('licenseKey').value,deviceId,userAgent:navigator.userAgent})});
   const d=await r.json(); if(!r.ok) throw new Error(d.error||'Akses ditolak');
   localStorage.setItem('misterius_session',d.session); unlock();
 }catch(err){msg.textContent=err.message;}
});
// Periodic server re-check. A revoked device will be locked on the next check.
setInterval(async()=>{
 const session=localStorage.getItem('misterius_session'); if(!session) return;
 try{const r=await fetch(API_BASE+'/api/check',{headers:{Authorization:'Bearer '+session},cache:'no-store'}); if(!r.ok){localStorage.removeItem('misterius_session'); location.reload();}}catch(e){}
},60000);
check();
