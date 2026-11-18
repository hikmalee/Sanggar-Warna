import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* KONFIGURASI BACKEND:
   Isi SUPABASE_URL dan SUPABASE_ANON_KEY setelah membuat project Supabase.
   Jika kosong, aplikasi berjalan dalam mode demo menggunakan localStorage. */
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const state = { user:null, profile:null, role:"student", page:"dashboard", editing:null, demo:!supabase, rows:[] };

const navByRole = {
  student: [
    ["UTAMA", [["dashboard","🏡","Dashboard"],["courses","🎨","Kelas Saya"],["learning","📚","Pembelajaran"],["assignments","📝","Tugas & Proyek"],["schedule","🗓️","Jadwal"]]],
    ["KARYA & PELUANG", [["portfolio","🖼️","Portofolio"],["competition","🏆","Competition Hub"],["scholarship","🎓","Scholarship Hub"],["achievements","⭐","Pencapaian"]]],
    ["LAINNYA", [["reports","📈","Laporan Progres"],["help","💬","Pusat Bantuan"]]]
  ],
  parent: [
    ["PANTAU ANAK", [["dashboard","🏡","Dashboard Anak"],["schedule","🗓️","Jadwal & Kehadiran"],["reports","📈","Progres Belajar"],["portfolio","🖼️","Portofolio Anak"]]],
    ["INFORMASI", [["competition","🏆","Competition Hub"],["scholarship","🎓","Scholarship Hub"],["help","💬","Pusat Bantuan"]]]
  ],
  tutor: [
    ["PENGAJARAN", [["dashboard","🏡","Dashboard Tutor"],["courses","🎨","Kelas Diampu"],["learning","📚","Materi & Modul"],["assignments","📝","Tugas & Penilaian"],["schedule","🗓️","Jadwal Mengajar"]]],
    ["PENDAMPINGAN", [["portfolio","🖼️","Karya Siswa"],["reports","📈","Catatan Progres"],["help","💬","Pusat Bantuan"]]]
  ],
  admin: [
    ["OPERASIONAL", [["dashboard","🏡","Dashboard Admin"],["users","👥","Pengguna"],["courses","🎨","Manajemen Kelas"],["enrollments","📋","Pendaftaran"],["schedule","🗓️","Jadwal & Kehadiran"]]],
    ["PEMBELAJARAN", [["learning","📚","Materi & Modul"],["assignments","📝","Tugas & Pengumpulan"],["portfolio","🖼️","Moderasi Karya"]]],
    ["KONTEN & PELUANG", [["competition","🏆","Competition Hub"],["scholarship","🎓","Scholarship Hub"],["achievements","⭐","Pencapaian"],["reports","📈","Laporan & Analitik"],["help","💬","Pusat Bantuan"]]]
  ]
};

const config = {
  courses:{title:"Katalog Kelas",singular:"Kelas",table:"courses",icon:"🎨",desc:"Kelola program belajar seni Sanggar Warna.",fields:[
    ["title","Nama kelas","text",true],["category","Kategori","select",true,["Menggambar","Melukis","Digital Art","Kriya","Ilustrasi"]],["level","Tingkat","select",false,["Pemula","Menengah","Lanjutan"]],["age_group","Kelompok usia","text"],["description","Deskripsi","textarea"],["tutor_name","Nama tutor","text"],["duration","Durasi","text"],["schedule_text","Jadwal","text"],["mode","Metode","select",false,["Tatap muka","Daring","Hybrid"]],["price","Biaya (angka)","number"],["quota","Kuota","number"],["status","Status","select",false,["Dibuka","Segera dibuka","Penuh","Ditutup"]]]},
  enrollments:{title:"Pendaftaran Kelas",singular:"Pendaftaran",table:"enrollments",icon:"📋",desc:"Tinjau dan perbarui status pendaftaran peserta.",fields:[["student_name","Nama siswa","text",true],["parent_contact","Kontak wali","text"],["course_name","Kelas yang dipilih","text",true],["note","Catatan","textarea"],["status","Status","select",true,["Menunggu","Diterima","Perlu revisi","Ditolak","Daftar tunggu"]]]},
  learning:{title:"Materi & Modul",singular:"Materi",table:"materials",icon:"📚",desc:"Simpan materi belajar, referensi, dan instruksi kelas.",fields:[["title","Judul materi","text",true],["course_name","Nama kelas","text",true],["module","Modul/pertemuan","text"],["type","Jenis materi","select",false,["Teks","Video","PDF","Gambar","Tautan"]],["content_url","URL materi","url"],["description","Deskripsi/instruksi","textarea"],["status","Status","select",false,["Draft","Terbit"]]]},
  assignments:{title:"Tugas & Proyek",singular:"Tugas",table:"assignments",icon:"📝",desc:"Buat tugas dan kelola instruksi serta tenggat pengumpulan.",fields:[["title","Judul tugas","text",true],["course_name","Kelas","text",true],["description","Instruksi tugas","textarea"],["due_date","Tenggat","date"],["rubric","Kriteria penilaian","textarea"],["status","Status","select",false,["Aktif","Draft","Selesai"]]]},
  schedule:{title:"Jadwal & Kehadiran",singular:"Jadwal",table:"schedules",icon:"🗓️",desc:"Atur jadwal kelas dan informasi pertemuan.",fields:[["title","Nama kegiatan","text",true],["course_name","Kelas","text"],["tutor_name","Tutor","text"],["event_date","Tanggal","date",true],["event_time","Waktu","text"],["location","Lokasi/tautan","text"],["status","Status","select",false,["Terjadwal","Selesai","Dibatalkan"]]]},
  portfolio:{title:"Portofolio Digital",singular:"Karya",table:"portfolio_items",icon:"🖼️",desc:"Dokumentasikan karya siswa. Karya baru bersifat privat sampai disetujui.",fields:[["title","Judul karya","text",true],["student_name","Nama siswa","text"],["category","Kategori","select",false,["Menggambar","Melukis","Digital Art","Kriya","Lainnya"]],["media_url","URL gambar/berkas","url"],["description","Cerita karya","textarea"],["visibility","Visibilitas","select",false,["Pribadi","Terbatas","Publik"]],["moderation_status","Moderasi","select",false,["Menunggu","Disetujui","Ditolak"]]]},
  competition:{title:"Competition Hub",singular:"Kompetisi",table:"opportunities",icon:"🏆",desc:"Peluang lomba seni. Pastikan sumber dan tanggal verifikasi selalu diperbarui.",fields:[["title","Nama kompetisi","text",true],["organizer","Penyelenggara","text"],["category","Kategori","text"],["target","Sasaran peserta","text"],["requirements","Persyaratan","textarea"],["deadline","Tenggat pendaftaran","date"],["official_url","Tautan resmi","url"],["source","Sumber informasi","text"],["verified_at","Tanggal verifikasi","date"],["status","Status","select",false,["Dibuka","Segera ditutup","Ditutup","Perlu verifikasi"]]]},
  scholarship:{title:"Scholarship Hub",singular:"Beasiswa",table:"scholarships",icon:"🎓",desc:"Informasi beasiswa dan bantuan pendidikan yang telah diverifikasi.",fields:[["title","Nama program","text",true],["organizer","Penyelenggara","text"],["benefit","Manfaat beasiswa","textarea"],["target","Sasaran peserta","text"],["requirements","Persyaratan/dokumen","textarea"],["deadline","Tenggat","date"],["official_url","Tautan resmi","url"],["source","Sumber informasi","text"],["verified_at","Tanggal verifikasi","date"],["status","Status","select",false,["Dibuka","Segera ditutup","Ditutup","Perlu verifikasi"]]]},
  achievements:{title:"Pencapaian",singular:"Pencapaian",table:"achievements",icon:"⭐",desc:"Kelola lencana, milestone, dan penghargaan siswa.",fields:[["title","Nama pencapaian","text",true],["description","Deskripsi","textarea"],["criteria","Kriteria memperoleh","textarea"],["badge_icon","Ikon/emoji","text"],["status","Status","select",false,["Aktif","Nonaktif"]]]},
  reports:{title:"Laporan Perkembangan",singular:"Laporan",table:"progress_reports",icon:"📈",desc:"Catatan perkembangan dan rekomendasi pembelajaran.",fields:[["student_name","Nama siswa","text",true],["period","Periode laporan","text"],["attendance_summary","Ringkasan kehadiran","textarea"],["strengths","Kekuatan siswa","textarea"],["improvements","Hal yang dikembangkan","textarea"],["recommendations","Rekomendasi latihan","textarea"],["status","Status","select",false,["Draft","Diterbitkan"]]]},
  help:{title:"Pusat Bantuan",singular:"Tiket bantuan",table:"support_tickets",icon:"💬",desc:"Sampaikan kendala atau pertanyaan kepada pengelola.",fields:[["subject","Subjek","text",true],["category","Kategori","select",false,["Akun","Kelas","Pembelajaran","Pembayaran","Teknis","Lainnya"]],["message","Pesan","textarea",true],["status","Status","select",false,["Baru","Diproses","Menunggu balasan","Selesai"]]]},
  users:{title:"Manajemen Pengguna",singular:"Pengguna",table:"profiles",icon:"👥",desc:"Daftar pengguna aplikasi dan perannya. Pengaturan role sensitif dilakukan admin.",fields:[["full_name","Nama lengkap","text",true],["email","Email","email"],["role","Peran","select",true,["student","parent","tutor","admin"]],["status","Status","select",false,["Aktif","Nonaktif"]]]}
};

const demoSeed = {
  courses:[
    {id:"c1",title:"Petualangan Menggambar",category:"Menggambar",level:"Pemula",age_group:"7–12 tahun",description:"Belajar bentuk, garis, karakter, dan cerita visual.",tutor_name:"Kak Nara",duration:"8 pertemuan",schedule_text:"Sabtu 09.00",mode:"Tatap muka",price:250000,quota:12,status:"Dibuka"},
    {id:"c2",title:"Dunia Warna dan Lukis",category:"Melukis",level:"Pemula",age_group:"8–14 tahun",description:"Eksplorasi warna dan teknik melukis dasar.",tutor_name:"Kak Aira",duration:"6 pertemuan",schedule_text:"Minggu 10.00",mode:"Tatap muka",price:275000,quota:10,status:"Dibuka"},
    {id:"c3",title:"Digital Art Starter",category:"Digital Art",level:"Pemula",age_group:"10–16 tahun",description:"Mengenal ilustrasi digital dan proses kreatif.",tutor_name:"Kak Bima",duration:"8 pertemuan",schedule_text:"Rabu 15.30",mode:"Hybrid",price:300000,quota:10,status:"Segera dibuka"}
  ],
  enrollments:[{id:"e1",student_name:"Alya Putri",course_name:"Petualangan Menggambar",parent_contact:"wali@example.com",status:"Menunggu",note:"Data demonstrasi"}],
  materials:[{id:"m1",title:"Mengenal Bentuk Dasar",course_name:"Petualangan Menggambar",module:"Modul 1",type:"Teks",description:"Latihan menggambar lingkaran, persegi, dan segitiga.",status:"Terbit"}],
  assignments:[{id:"a1",title:"Buat Karakter Imajinasi",course_name:"Petualangan Menggambar",description:"Buat satu karakter dari gabungan bentuk dasar.",due_date:"2026-12-01",rubric:"Kreativitas, kerapian, dan cerita karakter.",status:"Aktif"}],
  schedules:[{id:"s1",title:"Pertemuan Menggambar Dasar",course_name:"Petualangan Menggambar",tutor_name:"Kak Nara",event_date:"2026-11-21",event_time:"09.00–10.30",location:"Studio Sanggar Warna",status:"Terjadwal"}],
  portfolio_items:[{id:"p1",title:"Kucing Penjelajah",student_name:"Alya Putri",category:"Menggambar",description:"Karya latihan bentuk dasar.",visibility:"Pribadi",moderation_status:"Menunggu"}],
  opportunities:[],scholarships:[],achievements:[{id:"b1",title:"Langkah Pertama",description:"Menyelesaikan modul pertama.",criteria:"Menyelesaikan satu modul.",badge_icon:"🌱",status:"Aktif"}],
  progress_reports:[],support_tickets:[],profiles:[]
};

function readDemo(table){const key="sw_"+table;let value=localStorage.getItem(key);if(value)return JSON.parse(value);const seed=demoSeed[table]||[];localStorage.setItem(key,JSON.stringify(seed));return seed}
async function hydrateRemoteData(){
  if(!supabase)return;
  const tables=[...Object.keys(config).map(k=>config[k].table)];
  for(const table of new Set(tables)){
    try{const {data,error}=await supabase.from(table).select("*").order("created_at",{ascending:false});if(!error&&data)localStorage.setItem("sw_"+table,JSON.stringify(data));}
    catch(e){console.warn("Tidak dapat memuat",table,e)}
  }
}
function writeDemo(table,rows){localStorage.setItem("sw_"+table,JSON.stringify(rows))}
function toast(message,error=false){const el=document.createElement("div");el.className="toast"+(error?" error":"");el.textContent=message;$("#toast-root").append(el);setTimeout(()=>el.remove(),3200)}
function escapeHTML(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function titleCase(v=""){return v.charAt(0).toUpperCase()+v.slice(1)}
function roleLabel(r){return ({student:"Siswa",parent:"Orang tua/wali",tutor:"Tutor",admin:"Admin"})[r]||r}
function showAuth(){ $("#auth-screen").classList.remove("hidden");$("#app-shell").classList.add("hidden") }
function showApp(){ $("#auth-screen").classList.add("hidden");$("#app-shell").classList.remove("hidden");renderNav();renderPage() }

async function signIn(email,password){
  if(!supabase){const role=localStorage.getItem("sw_demo_role")||"student";state.user={email};state.profile={full_name:email.split("@")[0],role};state.role=role;state.demo=true;showApp();return}
  const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
  state.user=data.user;await loadProfile();await hydrateRemoteData();state.demo=false;showApp()
}
async function signUp(form){
  const fd=new FormData(form);const name=fd.get("name"),email=fd.get("email"),password=fd.get("password"),role=fd.get("role");
  if(!supabase){state.user={email};state.profile={full_name:name,role};state.role=role;state.demo=true;showApp();toast("Akun demo dibuat.");return}
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,role}}});if(error)throw error;
  if(data.user){await supabase.from("profiles").upsert({id:data.user.id,full_name:name,email,role});}
  toast("Pendaftaran berhasil. Periksa email jika verifikasi diaktifkan.");state.user=data.user;state.profile={full_name:name,role};state.role=role;showApp()
}
async function loadProfile(){
  const {data,error}=await supabase.from("profiles").select("*").eq("id",state.user.id).single();
  if(error){state.profile={full_name:state.user.email,role:"student"};state.role="student";return}
  state.profile=data;state.role=data.role||"student"
}
async function logout(){if(supabase)await supabase.auth.signOut();state.user=null;state.profile=null;showAuth()}

function renderNav(){
  $("#side-name").textContent=state.profile?.full_name||"Kreator";$("#side-role").textContent=roleLabel(state.role);$("#side-avatar").textContent=(state.profile?.full_name||"S").charAt(0).toUpperCase();$("#top-avatar").textContent=$("#side-avatar").textContent;
  $("#mode-chip").textContent=state.demo?"DEMO MODE":"LIVE DATA";
  $("#main-nav").innerHTML=navByRole[state.role].map(group=>`<div class="nav-caption">${group[0]}</div>${group[1].map(([id,icon,label])=>`<button class="nav-link ${state.page===id?"active":""}" data-page="${id}"><span>${icon}</span>${label}</button>`).join("")}`).join("");
  $$("[data-page]").forEach(b=>b.addEventListener("click",()=>{state.page=b.dataset.page;renderNav();renderPage();$("#sidebar").classList.remove("open")}));
}
function pageHeader(title,desc,action=""){return `<div class="page-title-row"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`}
function dashboard(){
  const isAdmin=state.role==="admin",isTutor=state.role==="tutor",isParent=state.role==="parent";
  const cards=isAdmin?[["👥","Pengguna","—","purple"],["🎨","Kelas aktif",readDemo("courses").length,"yellow"],["📋","Pendaftaran",readDemo("enrollments").length,"pink"],["🖼️","Karya siswa",readDemo("portfolio_items").length,"mint"]]:
    isTutor?[["🎨","Kelas diampu","—","purple"],["👩‍🎨","Siswa","—","yellow"],["📝","Tugas aktif",readDemo("assignments").length,"pink"],["🗓️","Jadwal",readDemo("schedules").length,"mint"]]:
    isParent?[["🎨","Kelas anak","—","purple"],["🗓️","Jadwal dekat",readDemo("schedules").length,"yellow"],["⭐","Pencapaian",readDemo("achievements").length,"pink"],["🖼️","Karya anak",readDemo("portfolio_items").length,"mint"]]:
    [["🎨","Kelas tersedia",readDemo("courses").length,"purple"],["📝","Tugas aktif",readDemo("assignments").length,"yellow"],["🏆","Kompetisi",readDemo("opportunities").length,"pink"],["⭐","Pencapaian",readDemo("achievements").length,"mint"]];
  const courses=readDemo("courses");
  return `<div class="welcome-banner"><div><h1>Hai, ${escapeHTML(state.profile?.full_name||"Kreator")}! 🌈</h1><p>Siap menciptakan sesuatu yang luar biasa hari ini?</p></div><div class="banner-art">🎨</div></div>
  <div class="stats-grid">${cards.map(c=>`<div class="stat-card"><div class="stat-icon ${c[3]}">${c[0]}</div><div><small>${c[1]}</small><strong>${c[2]}</strong></div></div>`).join("")}</div>
  <div class="section-head"><div><h2>${isAdmin?"Ringkasan operasional":isTutor?"Aktivitas pengajaran":isParent?"Aktivitas anak":"Jelajahi kelas kreatif"}</h2><p>Ruang untuk belajar, mencoba, dan berkembang.</p></div><button class="btn soft" data-goto="courses">Lihat kelas →</button></div>
  <div class="course-strip">${courses.slice(0,3).map((c,i)=>`<div class="course-card p${i+1}"><div class="emoji">${["✏️","🖌️","🪄"][i%3]}</div><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.category)} • ${escapeHTML(c.level||"Semua tingkat")}</p><div class="progress"><span style="width:${[65,40,20][i]}%"></span></div><small>${escapeHTML(c.status||"Tersedia")}</small></div>`).join("")}</div>
  <div class="dashboard-grid"><div class="panel"><h3>🗓️ Jadwal mendatang</h3>${renderMiniList("schedules","event_date","title")}</div><div class="panel"><h3>✨ Aktivitas terbaru</h3><div class="empty-state"><b>🌱</b>Setiap langkah kecil adalah awal karya hebat.</div></div></div>`;
}
function renderMiniList(table,dateField,titleField){const rows=readDemo(table).slice(0,3);return rows.length?rows.map(r=>`<div class="mini-row" style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f2f0f7;font-size:12px"><strong>${escapeHTML(r[titleField]||"Aktivitas")}</strong><span class="muted">${escapeHTML(r[dateField]||"")}</span></div>`).join(""):`<div class="empty-state">Belum ada data.</div>`}
function renderCards(key){
 const rows=readDemo(key);const cfg=config[key];
 if(!rows.length)return `<div class="panel empty-state"><b>${cfg.icon}</b>Belum ada data. Tambahkan data pertama untuk mulai.</div>`;
 return `<div class="card-grid">${rows.map((r,i)=>`<article class="feature-card"><div class="feature-icon">${cfg.icon}</div><h3>${escapeHTML(r.title||r.full_name||r.student_name||"Data")}</h3><p>${escapeHTML(r.description||r.benefit||r.message||r.course_name||r.category||"Informasi Sanggar Warna")}</p><div class="card-bottom"><span class="pill">${escapeHTML(r.status||r.category||"Tersedia")}</span><button class="mini-btn" data-edit="${key}:${r.id}">Kelola</button></div></article>`).join("")}</div>`;
}
function renderTable(key,query=""){
 const cfg=config[key],rows=readDemo(key).filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
 if(!rows.length)return `<div class="panel empty-state"><b>${cfg.icon}</b>Data belum tersedia.</div>`;
 const keys=cfg.fields.slice(0,4).map(f=>f[0]);
 return `<div class="data-table-wrap"><table><thead><tr>${keys.map(k=>`<th>${escapeHTML(cfg.fields.find(f=>f[0]===k)?.[1]||k)}</th>`).join("")}<th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.map(r=>`<tr>${keys.map(k=>`<td>${escapeHTML(r[k]||"—")}</td>`).join("")}<td><span class="status ${["Diterima","Disetujui","Terbit","Aktif","Selesai","Dibuka"].includes(r.status)?"success":(["Ditolak","Ditutup"].includes(r.status)?"danger":"warning")}">${escapeHTML(r.status||"Tersedia")}</span></td><td><div class="row-actions"><button class="mini-btn" data-edit="${key}:${r.id}">Edit</button><button class="mini-btn delete" data-delete="${key}:${r.id}">Hapus</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function renderFeaturePage(key){
 const cfg=config[key];
 return `${pageHeader(cfg.title,cfg.desc,`<button class="btn primary" data-add="${key}">＋ Tambah ${cfg.singular}</button>`)}
 <div class="toolbar"><input class="search-box" id="table-search" placeholder="Cari ${cfg.singular.toLowerCase()}..."><select class="filter-select" id="view-mode"><option value="table">Tampilan tabel</option><option value="cards">Tampilan kartu</option></select></div>
 <div id="data-view">${renderTable(key)}</div>`;
}
function renderCourses(){
 if(state.role!=="student"&&state.role!=="parent")return renderFeaturePage("courses");
 const rows=readDemo("courses");
 return `${pageHeader("Jelajahi Kelas","Temukan kelas seni yang sesuai dengan minatmu.")}
 <div class="toolbar"><input class="search-box" id="course-search" placeholder="Cari kelas..."><select class="filter-select" id="course-category"><option value="">Semua kategori</option><option>Menggambar</option><option>Melukis</option><option>Digital Art</option><option>Kriya</option></select></div><div class="card-grid" id="course-cards">${rows.map((c,i)=>`<article class="feature-card"><div class="feature-icon">${["✏️","🖌️","🪄"][i%3]}</div><span class="pill">${escapeHTML(c.category)}</span><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p><p><b>Tutor:</b> ${escapeHTML(c.tutor_name||"Informasi menyusul")}<br><b>Jadwal:</b> ${escapeHTML(c.schedule_text||"Hubungi admin")}</p><div class="card-bottom"><strong>Rp ${Number(c.price||0).toLocaleString("id-ID")}</strong><button class="btn primary" data-enroll="${c.id}">Daftar</button></div></article>`).join("")}</div>`;
}
function renderPage(){
 const names={dashboard:"Dashboard",courses:"Kelas",enrollments:"Pendaftaran",learning:"Pembelajaran",assignments:"Tugas",schedule:"Jadwal",portfolio:"Portofolio",competition:"Competition Hub",scholarship:"Scholarship Hub",achievements:"Pencapaian",reports:"Laporan",help:"Pusat Bantuan",users:"Pengguna"};
 $("#page-name").textContent=names[state.page]||"Dashboard";
 const html=state.page==="dashboard"?dashboard():state.page==="courses"?renderCourses():config[state.page]?renderFeaturePage(state.page):dashboard();
 $("#page-content").innerHTML=html;
 bindPageActions();
}
function bindPageActions(){
 $$("[data-add]").forEach(b=>b.addEventListener("click",()=>openForm(b.dataset.add)));
 $$("[data-edit]").forEach(b=>b.addEventListener("click",()=>{const [key,id]=b.dataset.edit.split(":");const row=readDemo(key).find(x=>x.id===id);openForm(key,row)}));
 $$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{const [key,id]=b.dataset.delete.split(":");if(confirm("Hapus data ini?"))removeRow(key,id)}));
 $$("[data-goto]").forEach(b=>b.addEventListener("click",()=>{state.page=b.dataset.goto;renderNav();renderPage()}));
 $$("[data-enroll]").forEach(b=>b.addEventListener("click",()=>{const course=readDemo("courses").find(x=>x.id===b.dataset.enroll);openForm("enrollments",{course_name:course.title,student_name:state.profile?.full_name||"",status:"Menunggu"})}));
 const search=$("#table-search");if(search)search.addEventListener("input",()=>{$("#data-view").innerHTML=$("#view-mode").value==="cards"?renderCards(state.page):renderTable(state.page,search.value);bindPageActions()});
 const view=$("#view-mode");if(view)view.addEventListener("change",()=>{$("#data-view").innerHTML=view.value==="cards"?renderCards(state.page):renderTable(state.page,$("#table-search").value);bindPageActions()});
 const cs=$("#course-search"),cc=$("#course-category");if(cs||cc){const update=()=>{const q=(cs?.value||"").toLowerCase(),cat=cc?.value||"";const rows=readDemo("courses").filter(x=>(x.title+" "+x.description).toLowerCase().includes(q)&&(!cat||x.category===cat));$("#course-cards").innerHTML=rows.map(c=>`<article class="feature-card"><div class="feature-icon">🎨</div><span class="pill">${escapeHTML(c.category)}</span><h3>${escapeHTML(c.title)}</h3><p>${escapeHTML(c.description)}</p><div class="card-bottom"><strong>Rp ${Number(c.price||0).toLocaleString("id-ID")}</strong><button class="btn primary" data-enroll="${c.id}">Daftar</button></div></article>`).join("");bindPageActions()};cs?.addEventListener("input",update);cc?.addEventListener("change",update)}
}
function openForm(key,row=null){
 const cfg=config[key];state.editing={key,id:row?.id||null};$("#modal-title").textContent=(row?"Edit ":"Tambah ")+cfg.singular;
 $("#modal-fields").innerHTML=cfg.fields.map(([name,label,type,required,options])=>{
  const value=row?.[name]??"";let input="";
  if(type==="select")input=`<select name="${name}" ${required?"required":""}>${(options||[]).map(o=>`<option ${value===o?"selected":""}>${escapeHTML(o)}</option>`).join("")}</select>`;
  else if(type==="textarea")input=`<textarea name="${name}" ${required?"required":""}>${escapeHTML(value)}</textarea>`;
  else input=`<input name="${name}" type="${type}" value="${escapeHTML(value)}" ${required?"required":""}>`;
  return `<label class="${type==="textarea"?"full":""}">${label}${required?" *":""}${input}</label>`;
 }).join("");
 $("#modal").showModal();
}
async function saveRow(key,id,data){
 if(supabase){
  const payload={...data,created_by:state.user.id};
  const result=id?await supabase.from(config[key].table).update(data).eq("id",id):await supabase.from(config[key].table).insert(payload);
  if(result.error)throw result.error;
  const cached=readDemo(config[key].table);if(id){const i=cached.findIndex(x=>x.id===id);if(i>=0)cached[i]={...cached[i],...data}}else cached.unshift({...data,created_at:new Date().toISOString()});writeDemo(config[key].table,cached);
 }else{
  const rows=readDemo(key);if(id){const i=rows.findIndex(x=>x.id===id);if(i>=0)rows[i]={...rows[i],...data}}else rows.unshift({id:crypto.randomUUID(),...data,created_at:new Date().toISOString()});writeDemo(key,rows);
 }
}
async function removeRow(key,id){
 try{if(supabase){const {error}=await supabase.from(config[key].table).delete().eq("id",id);if(error)throw error;writeDemo(config[key].table,readDemo(config[key].table).filter(x=>x.id!==id))}else writeDemo(key,readDemo(key).filter(x=>x.id!==id));toast("Data berhasil dihapus.");renderPage()}catch(e){toast(e.message,true)}
}
async function loadTable(key){
 if(!supabase)return readDemo(key);
 const {data,error}=await supabase.from(config[key].table).select("*").order("created_at",{ascending:false});if(error)throw error;return data||[]
}
function bindGlobal(){
 $("#modal-close").onclick=$("#modal-cancel").onclick=()=>$("#modal").close();
 $("#modal-form").addEventListener("submit",async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget).entries());try{await saveRow(state.editing.key,state.editing.id,data);$("#modal").close();toast("Data berhasil disimpan.");renderPage()}catch(err){toast(err.message||"Gagal menyimpan data.",true)}});
 $("#login-form").addEventListener("submit",async e=>{e.preventDefault();try{const fd=new FormData(e.currentTarget);await signIn(fd.get("email"),fd.get("password"))}catch(err){toast(err.message,true)}});
 $("#register-form").addEventListener("submit",async e=>{e.preventDefault();try{await signUp(e.currentTarget)}catch(err){toast(err.message,true)}});
 $$("[data-auth-tab]").forEach(b=>b.addEventListener("click",()=>{$$("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===b));$("#login-form").classList.toggle("hidden",b.dataset.authTab!=="login");$("#register-form").classList.toggle("hidden",b.dataset.authTab!=="register")}));
 $("#demo-login").onclick=()=>{state.user={email:"demo@sanggarwarna.id"};state.profile={full_name:"Kreator Demo",role:"student"};state.role="student";state.demo=true;localStorage.setItem("sw_demo_role","student");showApp();toast("Selamat datang di mode demo!")};
 $("#logout-button").onclick=logout;
 $("#mobile-menu").onclick=()=>$("#sidebar").classList.toggle("open");
 $("#settings-button").onclick=()=>{if(!state.demo){toast("Pengaturan akun live dikelola oleh admin.");return}const roles=["student","parent","tutor","admin"];const choice=prompt("Mode demo: pilih role student, parent, tutor, atau admin",state.role);if(roles.includes(choice)){state.role=choice;state.profile.role=choice;renderNav();renderPage()}};
 $("#notification-button").onclick=()=>toast("Belum ada notifikasi baru.");
 $("#forgot-password").onclick=async()=>{const email=prompt("Masukkan email akun:");if(!email)return;if(!supabase){toast("Mode demo: fitur reset kata sandi memerlukan Supabase.");return}const {error}=await supabase.auth.resetPasswordForEmail(email);toast(error?error.message:"Tautan reset dikirim jika email terdaftar.",!!error)};
}
bindGlobal();

if(supabase){
 supabase.auth.getSession().then(async({data})=>{if(data.session){state.user=data.session.user;await loadProfile();await hydrateRemoteData();state.demo=false;showApp()}else showAuth()});
 supabase.auth.onAuthStateChange(async(_event,session)=>{if(session){state.user=session.user;await loadProfile();await hydrateRemoteData();state.demo=false;showApp()}});
}else showAuth();
