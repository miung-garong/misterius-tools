const express=require('express'); const cors=require('cors'); const fs=require('fs'); const path=require('path'); const crypto=require('crypto');
const app=express(); app.use(cors()); app.use(express.json());
const DB=path.join(__dirname,'data','licenses.json');
function hash(x){return crypto.createHash('sha256').update(x).digest('hex')}
function load(){if(!fs.existsSync(DB)){const initial={passwordHash:hash(process.env.INITIAL_LICENSE||'individualisme'),devices:{}};fs.writeFileSync(DB,JSON.stringify(initial,null,2));}return JSON.parse(fs.readFileSync(DB));}
function save(d){fs.writeFileSync(DB,JSON.stringify(d,null,2));}
function admin(req,res,next){if(req.headers['x-admin-key']!== (process.env.ADMIN_KEY||'change-this-admin-key')) return res.status(401).json({error:'Admin unauthorized'});next()}
function token(device){return crypto.createHmac('sha256',process.env.SESSION_SECRET||'change-this-secret').update(device).digest('hex')}
app.get('/api/health',(req,res)=>res.json({ok:true,service:'Misterius Tools License Server'}));
app.post('/api/activate',(req,res)=>{const {key,deviceId,userAgent=''}=req.body||{};if(!key||!deviceId)return res.status(400).json({error:'Data tidak lengkap'});const db=load();if(hash(key)!==db.passwordHash)return res.status(403).json({error:'Password/license salah'});const now=new Date().toISOString();db.devices[deviceId]={...(db.devices[deviceId]||{}),deviceId,firstSeen:db.devices[deviceId]?.firstSeen||now,lastSeen:now,userAgent,active:true};save(db);res.json({session:token(deviceId),deviceId})});
app.get('/api/check',(req,res)=>{const t=(req.headers.authorization||'').replace('Bearer ','');const db=load();const dev=Object.keys(db.devices).find(id=>token(id)===t);if(!dev||!db.devices[dev].active)return res.status(403).json({error:'Device dinonaktifkan'});db.devices[dev].lastSeen=new Date().toISOString();save(db);res.json({ok:true})});
app.get('/api/admin/devices',admin,(req,res)=>{const db=load();res.json({count:Object.keys(db.devices).length,devices:Object.values(db.devices)});});
app.post('/api/admin/device/:id/toggle',admin,(req,res)=>{const db=load();if(!db.devices[req.params.id])return res.status(404).json({error:'Device tidak ditemukan'});db.devices[req.params.id].active=!!req.body.active;save(db);res.json(db.devices[req.params.id]);});
app.post('/api/admin/password',admin,(req,res)=>{if(!req.body.password||req.body.password.length<6)return res.status(400).json({error:'Password minimal 6 karakter'});const db=load();db.passwordHash=hash(req.body.password);save(db);res.json({ok:true});});
app.listen(process.env.PORT||3000,()=>console.log('Misterius Tools server running'));
