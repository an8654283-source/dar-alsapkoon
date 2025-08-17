// كامل الكود بعد التعديلات، مُصحح وخالٍ من تكرار مستمع DOMContentLoaded
const STORAGE_KEY = 'users';
const PRODUCTS = [
  { id: 1, name: 'كتاب تفسير صغير', price: 10 },
  { id: 2, name: 'كراسة فاخرة', price: 15 },
  { id: 3, name: 'قلم حبر', price: 5 }
];

// مساعدات
function safeGetUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { students: [], teachers: [] }; }
function saveUsers(u) { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }
function roleIsTeacher() { return sessionStorage.getItem('role') === 'teacher'; }
function roleIsStudent() { return sessionStorage.getItem('role') === 'student'; }

// collection of short wisdoms/hadiths/poems about knowledge to show on login
const KNOWLEDGE_QUOTES = [
  'من طلب العلم كان عبداً زاهداً في الدنيا، ملكاً في الآخرة. — قول مأثور',
  'طلب العلم فريضة على كل مسلم، فاعمل بما تعلمت وعلّم من حولك.',
  'الحكمة ضالة المؤمن، فحيث وجدها فهو أحق بها.',
  'العلم نور، والجهل ظلام؛ فاجعل نورك مضيئًا للآخرين.',
  'من علّم الناس الخير سُجل له أجرُه كلما انتفع به الناس.'
];

function showRandomKnowledgeQuote(){
  try{
    const idx = Math.floor(Math.random() * KNOWLEDGE_QUOTES.length);
    const txt = KNOWLEDGE_QUOTES[idx];
    if (document.getElementById('quoteModal')) return;
    const modal = document.createElement('div'); modal.id = 'quoteModal'; modal.className = 'modal';
    modal.style.zIndex = 1200;
    const box = document.createElement('div'); box.className = 'modal-content';
    box.style.maxWidth = '520px'; box.style.textAlign = 'center';
    box.innerHTML = `<h3>حكمَة اليوم</h3><p style="line-height:1.6">${escapeHtml(txt)}</p><div style="display:flex;justify-content:center;margin-top:12px"><button class="main-btn" onclick="(function(){document.getElementById('quoteModal').remove();})();">أغلق</button></div>`;
    modal.appendChild(box);
    document.body.appendChild(modal);
  }catch(e){console.warn('quote modal error', e)}
}

// عرض "حول"
function showAbout() {
  const about = document.getElementById('about');
  if (!about) return;
  about.style.display = (about.style.display === 'none' || about.style.display === '') ? 'block' : 'none';
  about.scrollIntoView({ behavior: 'smooth' });
}

// أقسام الشيخ
function showSection(section) {
  document.querySelectorAll('.section-content').forEach(sec => sec.style.display = 'none');
  const target = document.getElementById('section-' + section);
  if (target) target.style.display = 'block';
}
function toggleSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}

// تسجيل الدخول
function login() {
  const phone = document.getElementById('phone')?.value.trim();
  const code = document.getElementById('code')?.value.trim();
  const errorEl = document.getElementById('error');
  if (errorEl) errorEl.textContent = '';

  if (!/^01\d{9}$/.test(phone)) {
    if (errorEl) errorEl.textContent = 'رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 11 رقم.';
  const container = document.querySelector('.login-container');
  if (container){ container.classList.add('shake'); setTimeout(()=>container.classList.remove('shake'),600); }
    return;
  }

  let users = safeGetUsers();

  // دخول الشيخ (الكود مخفي)
  if (code === '20111988555') {
    let teacher = users.teachers.find(t => t.phone === phone);
    if (!teacher) {
      const name = prompt('أدخل اسم الشيخ:') || 'الشيخ';
      teacher = { phone, name, img: '' };
      users.teachers.push(teacher);
      saveUsers(users);
    }
    sessionStorage.setItem('role', 'teacher');
    sessionStorage.setItem('phone', phone);
    location.href = 'teacher.html';
    return;
  }

  // دخول الطالب
  const student = users.students.find(s => s.phone === phone);
  if (student) {
    sessionStorage.setItem('role', 'student');
    sessionStorage.setItem('phone', phone);
    location.href = 'student.html';
  } else {
    if (errorEl) errorEl.textContent = 'رقم الهاتف غير مسجل.';
  const container = document.querySelector('.login-container');
  if (container){ container.classList.add('shake'); setTimeout(()=>container.classList.remove('shake'),600); }
  }
}

// يطلب من المستخدم إدخال كود الشيخ بطريقة مخفية
function enterTeacherCode(){
  const userCode = prompt('أدخل كود الشيخ (سيبقى مخفياً):');
  if (!userCode) return;
  // ضع القيمة في الحقل المخفي ثم حاول تسجيل الدخول
  const codeInput = document.getElementById('code');
  if (codeInput) codeInput.value = userCode.trim();
  login();
}

// تحقق سريع من رقم الهاتف أثناء الإدخال
function validatePhone(){
  const phone = document.getElementById('phone')?.value || '';
  const status = document.getElementById('phoneStatus');
  if (!status) return;
  if (/^01\d{9}$/.test(phone)){
    status.textContent = '✓';
    status.style.color = 'green';
  } else {
    status.textContent = '';
  }
}

// صفحة الطالب
function loadStudentPage() {
  const phone = sessionStorage.getItem('phone');
  if (!phone) { location.href = 'login.html'; return; }
  const users = safeGetUsers();
  const student = users.students.find(s => s.phone === phone);
  if (!student) { alert('الطالب غير موجود.'); location.href = 'login.html'; return; }
  const welcomeEl = document.getElementById('welcomeStudent');
  if (welcomeEl) welcomeEl.textContent = `مرحباً، ${student.name || student.phone}`;
  const topPoints = document.getElementById('studentPointsTop'); if (topPoints) topPoints.textContent = student.points || 0;
  showTab('subjects');
}

// تبويبات الطالب
function showTab(tabName) {
  const content = document.getElementById('content');
  if (!content) return;
  content.innerHTML = '';

  const phone = sessionStorage.getItem('phone');
  const users = safeGetUsers();
  const student = users.students.find(s => s.phone === phone);
  if (!student) { content.innerHTML = '<p>خطأ في تحميل بيانات الطالب.</p>'; return; }

  if (tabName === 'subjects') {
    // compute most frequent grade from records when rendering
    const modeGrade = computeModeGrade(student.records || []) || student.avgGrade || 'جيد';
    content.innerHTML = `
      <h2>المواد</h2>
      <ul>
        <li>القرآن: عدد الصفحات التي حفظتها: ${student.pagesRead || 0}</li>
        <li>متوسط التقدير: ${modeGrade}</li>
        <li>الحديث: <button class="main-btn" onclick="renderStudentHadiths()">عرض الأحاديث</button></li>
        <li>السيرة: <button class="main-btn" onclick="renderStudentAudios()">عرض التسجيلات</button></li>
      </ul>
      <div id="studentHadiths"></div>
      <div id="studentAudios"></div>
    `;
  } else if (tabName === 'leaders') {
    content.innerHTML = `<h2>الأوائل</h2><div id="leadersList"></div>`;
    renderLeadersForStudent();
  } else if (tabName === 'assignments') {
    // load assignments created by the teacher
    const allAssign = JSON.parse(localStorage.getItem('assignments')) || [];
    // filter by assignTo === 'all' or matches student.phone
    const myAssign = allAssign.filter(a => a.assignTo === 'all' || a.assignTo === student.phone);
    if (!myAssign.length) {
      content.innerHTML = `<h2>الواجبات</h2><p class="muted">لا توجد واجبات مخصصة لك حالياً.</p>`;
    } else {
      content.innerHTML = `<h2>الواجبات</h2><ul>${myAssign.map(a => `<li><strong>${escapeHtml(a.title)}</strong> — صفحات: ${a.pages} — أحاديث: ${a.hadiths} — الموعد: ${a.due || 'غير محدد'}</li>`).join('')}</ul>`;
    }
  } else if (tabName === 'store') {
    // show teacher-added products first, then fallback PRODUCTS
    const storeProducts = JSON.parse(localStorage.getItem('storeProducts')) || [];
    let listHtml = '<h2>المتجر</h2><ul>';
    if (storeProducts.length) {
      storeProducts.forEach(p => {
        listHtml += `<li>${p.img?`<img src="${p.img}" style="max-width:40px;border-radius:6px;margin-inline-end:8px">`:''}<b>${escapeHtml(p.name)}</b> - ${p.price} نقطة <button onclick="buyStoreProduct(${p.id})">شراء</button></li>`;
      });
    }
    // fallback built-in products
    listHtml += `${PRODUCTS.map(p => `<li><b>${p.name}</b> - ${p.price} نقطة <button onclick="buyProduct(${p.id})">شراء</button></li>`).join('')}`;
    listHtml += `</ul><p>رصيدك الحالي: <span id="studentPoints">${student.points || 0}</span> نقطة</p>`;
    content.innerHTML = listHtml;
  } else if (tabName === 'settings') {
    content.innerHTML = `
      <h2>الإعدادات</h2>
      <p>الاسم: ${student.name || ''}</p>
      <p>الفئة: ${student.category || ''}</p>
      <p>رقم الهاتف: ${student.phone}</p>
      ${student.img ? `<img id="student-settings-img" src="${student.img}" alt="صورة الطالب">` : ''}
      <input type="file" id="studentImgEdit" accept="image/*">
      <button onclick="updateStudentImg()">تغيير الصورة</button>
    `;
  } else if (tabName === 'records') {
    content.innerHTML = `<h2>سجل التسميع</h2>
      <ul>${(student.records || []).map(r => `<li><b>الصفحة:</b> ${r.pageNumber || '-'} &nbsp; <b>صفحات:</b> ${r.pages} &nbsp; <b>تقدير:</b> ${r.grade} &nbsp; <b>تاريخ:</b> ${r.date} ${r.text ? '<div>'+escapeHtml(r.text)+'</div>' : ''}</li>`).join('')}</ul>
      <p class="muted">لا يمكنك إضافة أو حذف التسميع من هنا. إدارة السجل متاحة للشيخ فقط.</p>
    `;
  }
}

// تحديث صورة الطالب
function updateStudentImg() {
  const input = document.getElementById('studentImgEdit');
  if (!input || !input.files.length) return alert('اختر صورة');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const users = safeGetUsers();
    const phone = sessionStorage.getItem('phone');
    const student = users.students.find(s => s.phone === phone);
    if (!student) return alert('الطالب غير موجود');
    student.img = e.target.result;
    saveUsers(users);
    showTab('settings');
  };
  reader.readAsDataURL(file);
}

// عرض أحاديث/pdf للطالب
function renderStudentHadiths() {
  let hadiths = JSON.parse(localStorage.getItem('hadiths')) || [];
  let pdfs = JSON.parse(localStorage.getItem('pdfs')) || [];
  const container = document.getElementById('studentHadiths');
  if (!container) return;
  container.innerHTML = `<button class="main-btn" onclick="toggleStudentMaterials()">إخفاء/إظهار الأحاديث وملفات PDF</button>
    <div id="studentMaterials">
      <ul id="studentHadithList">${hadiths.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>
      <div id="studentPdfList"></div>
    </div>
  `;
  // render PDFs as blob URLs to improve opening reliability
  const pdfWrap = document.getElementById('studentPdfList');
  if (pdfWrap && pdfs.length) {
    const ul = document.createElement('ul');
    pdfs.forEach((p) => {
      const li = document.createElement('li');
      try {
        const blob = dataURLtoBlob(p.data);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.download = p.name || 'file.pdf';
        a.textContent = p.name || 'PDF';
        li.appendChild(a);
      } catch (e) {
        const a = document.createElement('a');
        a.href = p.data;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = p.name || 'PDF';
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    pdfWrap.appendChild(ul);
  }
}

function toggleStudentMaterials(){
  const wrapper = document.getElementById('studentMaterials');
  if (!wrapper) return;
  wrapper.style.display = (wrapper.style.display === 'none' || wrapper.style.display === '') ? 'block' : 'none';
}
function renderStudentAudios() {
  const container = document.getElementById('studentAudios');
  if (!container) return;
  container.innerHTML = `<button class="main-btn" onclick="toggleSection('studentAudioList')">إخفاء/إظهار التسجيلات</button>
    <div id="studentAudioList"></div>
  `;
  const listWrap = document.getElementById('studentAudioList');
  // load audio files saved in IndexedDB (supports large files)
  getAllAudiosFromDB().then(audios => {
    if (!audios || !audios.length) {
      listWrap.innerHTML = '<p class="muted">لا توجد تسجيلات متاحة.</p>';
      return;
    }
    const ul = document.createElement('ul');
    audios.forEach(a => {
      const li = document.createElement('li');
      try {
        const url = URL.createObjectURL(a.blob);
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = url;
        li.appendChild(audioEl);
        const txt = document.createTextNode(' ' + (a.name || 'ملف صوتي'));
        li.appendChild(txt);
      } catch (e) {
        // fallback: show name only
        li.textContent = a.name || 'ملف صوتي (غير قابل للعرض)';
      }
      ul.appendChild(li);
    });
    listWrap.appendChild(ul);
  }).catch(err => {
    console.error('خطأ عند جلب التسجيلات للطالب', err);
    listWrap.innerHTML = '<p class="muted">حدث خطأ في تحميل التسجيلات.</p>';
  });
}

// إضافة طالب (الشيخ)
function addStudent() {
  const name = document.getElementById('newStudentName').value.trim();
  const category = document.getElementById('newStudentCategory').value.trim();
  const phone = document.getElementById('newStudentPhone').value.trim();
  const imgInput = document.getElementById('newStudentImg');
  if (imgInput && imgInput.files.length) {
    const reader = new FileReader();
    reader.onload = function(e) { saveStudent(name, category, phone, e.target.result); };
    reader.readAsDataURL(imgInput.files[0]);
  } else {
    saveStudent(name, category, phone, '');
  }
}
function saveStudent(name, category, phone, imgData) {
  if (!name || !category || !/^01\d{9}$/.test(phone)) { alert('تأكد من إدخال البيانات بشكل صحيح'); return; }
  let users = safeGetUsers();
  if (!users.students) users.students = [];
  if (users.students.find(s => s.phone === phone)) { alert('هذا الرقم مسجل بالفعل.'); return; }
  users.students.push({
    name, category, phone, img: imgData || '', pagesRead: 0, avgGrade: 'جيد',
    assignments: { pagesPerWeek: 0, hadithPerWeek: 0 }, records: [], points: 0
  });
  saveUsers(users);
  document.getElementById('newStudentName').value = '';
  document.getElementById('newStudentCategory').value = '';
  document.getElementById('newStudentPhone').value = '';
  if (document.getElementById('newStudentImg')) document.getElementById('newStudentImg').value = '';
  loadStudentsList();
}

// قائمة الطلاب (الشيخ)
function loadStudentsList() {
  let users = safeGetUsers();
  const listEl = document.getElementById('studentsList');
  if (!listEl) return;
  listEl.innerHTML = '';
  users.students.forEach((s, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<div style="display:flex;align-items:center;">
        ${s.img ? `<img src="${s.img}" style="max-width:48px;border-radius:8px;margin-inline-start:12px;">` : ''}
        <div>
          <div><strong>${s.name}</strong></div>
          <div class="muted">الفئة: ${s.category} - ${s.phone}</div>
        </div>
      </div>`;
    const rightWrap = document.createElement('div');
    const infoBtn = document.createElement('button');
    infoBtn.textContent = 'عرض صفحات';
    infoBtn.onclick = () => alert(`عدد الصفحات المحفوظة للطالب ${s.name}: ${s.pagesRead || 0}`);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'حذف';
    delBtn.onclick = () => {
  if (!confirm('هل أنت متأكد من حذف الطالب؟')) return;
  // انقل الطالب إلى قائمة المحذوفات بدل الحذف النهائي
  const removed = users.students.splice(idx, 1)[0];
  saveUsers(users);
  // حفظ في deletedStudents
  let deleted = JSON.parse(localStorage.getItem('deletedStudents')) || [];
  removed.deletedAt = new Date().toLocaleString('ar-EG');
  deleted.unshift(removed);
  localStorage.setItem('deletedStudents', JSON.stringify(deleted));
  loadStudentsList();
  // حدث قائمة المحذوفات في المودال إن كانت مفتوحة
  loadDeletedStudentsInModal();
    };
    rightWrap.appendChild(infoBtn);
    rightWrap.appendChild(delBtn);
    li.appendChild(rightWrap);
    listEl.appendChild(li);
  });
}

/* Modal controls for adding student */
function openAddStudentModal(){
  document.getElementById('addStudentModal').style.display = 'flex';
  // load archived/deleted students view
  loadDeletedStudentsInModal();
}
function closeAddStudentModal(){
  document.getElementById('addStudentModal').style.display = 'none';
}

// Render deleted students inside the add-student modal with restore and purge actions
function loadDeletedStudentsInModal() {
  const container = document.getElementById('deletedList');
  if (!container) return;
  const deleted = JSON.parse(localStorage.getItem('deletedStudents') || '[]');
  if (!deleted.length) {
    container.innerHTML = '<p style="opacity:.8">لا توجد محذوفات</p>';
    return;
  }
  container.innerHTML = '';
  deleted.forEach((stu, idx) => {
    const div = document.createElement('div');
    div.className = 'deleted-item';
    div.style = 'display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-radius:6px;margin-bottom:6px;background:var(--card-bg, #fff3);';
    const left = document.createElement('div');
    left.innerHTML = `<strong>${escapeHtml(stu.name || '')}</strong><div style="font-size:12px;opacity:.8">${escapeHtml(stu.phone||'')}</div>`;
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '6px';
    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'cta';
    restoreBtn.textContent = 'استعادة';
    restoreBtn.onclick = () => restoreDeletedStudent(idx);
    const delBtn = document.createElement('button');
    delBtn.className = 'main-btn';
    delBtn.textContent = 'حذف نهائي';
    delBtn.onclick = () => purgeDeletedStudent(idx);
    actions.appendChild(restoreBtn);
    actions.appendChild(delBtn);
    div.appendChild(left);
    div.appendChild(actions);
    container.appendChild(div);
  });
}

function restoreDeletedStudent(index) {
  const deleted = JSON.parse(localStorage.getItem('deletedStudents') || '[]');
  if (!deleted[index]) return;
  const restored = deleted.splice(index, 1)[0];
  const users = safeGetUsers();
  users.students = users.students || [];
  // avoid duplicates by phone
  if (!users.students.find(s => s.phone === restored.phone)) {
    users.students.push(restored);
  }
  localStorage.setItem('deletedStudents', JSON.stringify(deleted));
  saveUsers(users);
  loadStudentsList();
  loadDeletedStudentsInModal();
}

function purgeDeletedStudent(index) {
  const deleted = JSON.parse(localStorage.getItem('deletedStudents') || '[]');
  if (!deleted[index]) return;
  if (!confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟ لا يمكن التراجع.')) return;
  deleted.splice(index, 1);
  localStorage.setItem('deletedStudents', JSON.stringify(deleted));
  loadDeletedStudentsInModal();
}

function purgeDeletedStudents() {
  if (!confirm('هل تريد حذف جميع المحذوفات نهائياً؟')) return;
  localStorage.setItem('deletedStudents', JSON.stringify([]));
  loadDeletedStudentsInModal();
}

// small helper to escape text in inserted HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"'`]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '`': '&#96;'
    })[s];
  });
}

function saveStudentFromModal(){
  const name = document.getElementById('modalStudentName').value.trim();
  const category = document.getElementById('modalStudentCategory').value.trim();
  const phone = document.getElementById('modalStudentPhone').value.trim();
  const imgInput = document.getElementById('modalStudentImg');
  if (!name || !category || !/^01\d{9}$/.test(phone)) return alert('تأكد من إدخال اسم وفئة ورقم هاتف صحيح');
  if (imgInput && imgInput.files.length){
    const reader = new FileReader();
    reader.onload = function(e){ saveStudent(name, category, phone, e.target.result); closeAddStudentModal(); updateTeacherStats(); };
    reader.readAsDataURL(imgInput.files[0]);
  } else { saveStudent(name, category, phone, ''); closeAddStudentModal(); updateTeacherStats(); }
}

function liveSearchStudents(q){
  const listEl = document.getElementById('studentsList');
  const users = safeGetUsers();
  const results = users.students.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q));
  if (!listEl) return;
  listEl.innerHTML = '';
  results.forEach((s, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<div style="display:flex;align-items:center;">${s.img?`<img src="${s.img}" style="max-width:48px;border-radius:8px;margin-inline-start:12px">`:''}
      <div><strong>${s.name}</strong><div class="muted">${s.category} - ${s.phone}</div></div></div>`;
    listEl.appendChild(li);
  });
}

function updateTeacherStats(){
  const users = safeGetUsers();
  const students = users.students || [];
  document.getElementById('statStudents').textContent = students.length;
  const pages = students.reduce((s,a)=> s + (a.pagesRead||0), 0);
  document.getElementById('statPages').textContent = pages;
  const leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  document.getElementById('statTopLeader').textContent = leaders[0] ? leaders[0].name : '—';
}

// update stats on load of teacher page
if (location.pathname.endsWith('teacher.html')){
  document.addEventListener('DOMContentLoaded', ()=>{ updateTeacherStats(); loadStudentsList(); loadLeaders(); loadStoreProducts(); loadAudios(); });
}

// Attach ripple handlers to teacher nav buttons
function initTeacherNavInteractions(){
  const navBtns = document.querySelectorAll('.teacher-container nav .main-btn');
  navBtns.forEach(btn=>{
    btn.addEventListener('click', function(e){
      // ripple
      const circle = document.createElement('span');
      circle.className = 'ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size/2) + 'px';
      circle.style.top = (e.clientY - rect.top - size/2) + 'px';
      btn.appendChild(circle);
      setTimeout(()=> circle.remove(), 650);
      // transient active
      btn.classList.add('active');
      setTimeout(()=>btn.classList.remove('active'), 600);
    });
  });
}

if (location.pathname.endsWith('teacher.html')){
  document.addEventListener('DOMContentLoaded', ()=>{ initTeacherNavInteractions(); loadStoreProducts(); });
}

// الأوائل (عرض وادارة)
function loadLeaders() {
  const listEl = document.getElementById('leadersList');
  if (!listEl) return;
  listEl.innerHTML = '';
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  leaders.sort((a, b) => (b.points || 0) - (a.points || 0));

  const container = document.createElement('div');
  container.className = 'leaders-container';

  const podium = document.createElement('div');
  podium.className = 'podium';
  for (let i = 0; i < 3; i++) {
    const person = leaders[i];
    const item = document.createElement('div');
    item.className = 'podium-item podium-' + (i + 1);
    item.innerHTML = `
      <div class="avatar">${person ? (person.img ? `<img src="${person.img}" alt="${person.name}">` : `<span class="avatar-placeholder"></span>`) : `<span class="avatar-placeholder"></span>`}</div>
      <div class="name">${person ? person.name : '—'}</div>
      <div class="badge">${person && person.points ? person.points+' نقطة' : 'لا يوجد نقطة'}</div>
      <div class="place">${i+1}</div>
  ${roleIsTeacher() && person ? `<div class="rank-actions"><button onclick="incrementLeaderPointsByIndex(${i})" title="زيادة نقطة">+ نقطة</button><button onclick="deleteLeader(${i})" title="حذف">حذف</button></div>` : ''}
    `;
    podium.appendChild(item);
  }
  container.appendChild(podium);

  const listWrap = document.createElement('div');
  listWrap.className = 'rank-list';
  leaders.slice(3).forEach((l, idx) => {
    const rank = 4 + idx;
    const li = document.createElement('div');
    li.className = 'rank-item';
    li.innerHTML = `
      <div class="rank-num">${rank}</div>
      <div class="rank-info">
        <div class="rank-name">${l.name}</div>
        <div class="rank-sub">
          <span class="rank-percent">0.00%</span>
          <span class="rank-points">${l.points ? l.points+' نقطة' : 'لا يوجد نقطة'}</span>
        </div>
      </div>
      <div class="rank-avatar">${l.img ? `<img src="${l.img}" alt="${l.name}">` : `<span class="avatar-placeholder small"></span>`}</div>
      <div class="rank-actions">
        <button onclick="incrementLeaderPointsByIndex(${idx + 3})" title="زيادة نقطة">+ نقطة</button>
        <button onclick="deleteLeader(${idx + 3})" title="حذف">حذف</button>
      </div>
    `;
    listWrap.appendChild(li);
  });

  container.appendChild(listWrap);
  listEl.appendChild(container);
}

function addLeader() {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const name = document.getElementById('leaderName').value.trim();
  const points = parseInt(document.getElementById('leaderPoints').value) || 0;
  if (!name) return alert('أدخل اسم الطالب.');
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  const existing = leaders.find(l => l.name === name);
  if (existing) {
    // إذا الاسم موجود، عدّل النقاط بدلاً من الإضافة
    existing.points = (existing.points || 0) + points;
  } else {
    leaders.push({ name, points, img: '' });
  }
  localStorage.setItem('leaders', JSON.stringify(leaders));
  document.getElementById('leaderName').value = '';
  document.getElementById('leaderPoints').value = '';
  loadLeaders();
}

function incrementLeaderPoints(name) {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  const idx = leaders.findIndex(x => x.name === name);
  if (idx === -1) return;
  leaders[idx].points = (leaders[idx].points || 0) + 1;
  localStorage.setItem('leaders', JSON.stringify(leaders));
  loadLeaders();
}
// Increment by index (more reliable for buttons)
function incrementLeaderPointsByIndex(index) {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  if (index < 0 || index >= leaders.length) return;
  leaders[index].points = (leaders[index].points || 0) + 1;
  localStorage.setItem('leaders', JSON.stringify(leaders));
  // try to find the student corresponding to this leader and add the same point
  const users = safeGetUsers();
  const leader = leaders[index];
  let student = null;
  if (leader.phone) student = users.students.find(s => s.phone === leader.phone);
  if (!student && leader.name) student = users.students.find(s => s.name === leader.name);
  if (student) {
    student.points = (student.points || 0) + 1;
    saveUsers(users);
    syncStudentPointsToLeaders(student);
  }
  loadLeaders();
}
function deleteLeader(index) {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  if (index < 0 || index >= leaders.length) return;
  if (!confirm('هل تريد حذف هذا من الأوائل؟')) return;
  leaders.splice(index, 1);
  localStorage.setItem('leaders', JSON.stringify(leaders));
  loadLeaders();
}

// عرض الأوائل للطالب (نفس الشكل بدون أزرار)
function renderLeadersForStudent() {
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  // enrich leaders entries with student images if available
  const users = safeGetUsers();
  leaders = leaders.map(l => {
    const copy = Object.assign({}, l);
    // try phone match, then name match
    if ((!copy.img || copy.img === '') && copy.phone) {
      const s = (users.students || []).find(st => st.phone === copy.phone);
      if (s && s.img) copy.img = s.img;
    }
    if ((!copy.img || copy.img === '') && copy.name) {
      const s2 = (users.students || []).find(st => st.name === copy.name);
      if (s2 && s2.img) copy.img = s2.img;
    }
    return copy;
  });
  leaders.sort((a,b) => (b.points||0)-(a.points||0));
  const container = document.createElement('div');
  container.className = 'leaders-container student-view';

  // try to detect current student (phone preferred, then name)
  const currentPhone = sessionStorage.getItem('phone') || null;
  const currentName = sessionStorage.getItem('name') || null;
  let rankIndex = -1;
  if (currentPhone) rankIndex = leaders.findIndex(l => l.phone && l.phone === currentPhone);
  if (rankIndex === -1 && currentName) rankIndex = leaders.findIndex(l => l.name && l.name === currentName);
  const rankNumber = rankIndex >= 0 ? rankIndex + 1 : null;

  // show the student's rank badge if found
  if (rankNumber) {
    const rankBadge = document.createElement('div');
    rankBadge.className = 'your-rank-badge';
    rankBadge.textContent = `ترتيبك: #${rankNumber}`;
    container.appendChild(rankBadge);
  }

  const podium = document.createElement('div');
  podium.className = 'podium';
  for (let i = 0; i < 3; i++) {
    const person = leaders[i];
    const item = document.createElement('div');
    item.className = 'podium-item podium-' + (i + 1);
    if (rankIndex === i) item.classList.add('your-rank-entry');
    item.innerHTML = `
      <div class="avatar">${person ? (person.img ? `<img src="${person.img}" alt="${person.name}">` : `<span class="avatar-placeholder"></span>`) : `<span class="avatar-placeholder"></span>`}</div>
      <div class="name">${person ? person.name : '—'}</div>
      <div class="badge">${person && person.points ? person.points+' نقطة' : 'لا يوجد نقطة'}</div>
      <div class="place">${i+1}</div>
    `;
    podium.appendChild(item);
  }
  container.appendChild(podium);

  const listWrap = document.createElement('div');
  listWrap.className = 'rank-list';
  leaders.slice(3).forEach((l, idx) => {
    const rank = 4 + idx;
    const actualIndex = 3 + idx; // index in full leaders array
    const li = document.createElement('div');
    li.className = 'rank-item';
    if (actualIndex === rankIndex) li.classList.add('your-rank-entry');
    li.innerHTML = `
      <div class="rank-num">${rank}</div>
      <div class="rank-info">
        <div class="rank-name">${l.name}</div>
        <div class="rank-sub">
          <span class="rank-percent">0.00%</span>
          <span class="rank-points">${l.points ? l.points+' نقطة' : 'لا يوجد نقطة'}</span>
        </div>
      </div>
      <div class="rank-avatar">${l.img ? `<img src="${l.img}" alt="${l.name}">` : `<span class="avatar-placeholder small"></span>`}</div>
    `;
    listWrap.appendChild(li);
  });
  container.appendChild(listWrap);

  const listEl = document.getElementById('leadersList');
  if (!listEl) return;
  listEl.innerHTML = '';
  listEl.appendChild(container);
}

// أحاديث
function addHadith() {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const hadith = document.getElementById('newHadith').value.trim();
  if (!hadith) return alert('أدخل نص الحديث');
  let hadiths = JSON.parse(localStorage.getItem('hadiths')) || [];
  hadiths.push(hadith);
  localStorage.setItem('hadiths', JSON.stringify(hadiths));
  document.getElementById('newHadith').value = '';
  loadHadiths();
}
function loadHadiths() {
  const listEl = document.getElementById('hadithList');
  if (!listEl) return;
  listEl.innerHTML = '';
  let hadiths = JSON.parse(localStorage.getItem('hadiths')) || [];
  hadiths.forEach((h, i) => {
    const li = document.createElement('li');
    const txt = document.createElement('span');
    txt.textContent = h;
    txt.style.cursor = 'pointer';
    txt.onclick = () => alert(h);
    const delBtn = document.createElement('button');
    delBtn.textContent = 'حذف';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
      if (confirm('حذف الحديث؟')) {
        hadiths.splice(i, 1);
        localStorage.setItem('hadiths', JSON.stringify(hadiths));
        loadHadiths();
      }
    };
    li.appendChild(txt);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

// PDF
function uploadPDF() {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const input = document.getElementById('pdfUpload');
  if (!input || !input.files.length) return alert('اختر ملف PDF');
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    let pdfs = JSON.parse(localStorage.getItem('pdfs')) || [];
    pdfs.push({ name: file.name, data: e.target.result });
    localStorage.setItem('pdfs', JSON.stringify(pdfs));
    loadPDFs();
  };
  reader.readAsDataURL(file);
  input.value = '';
}
function loadPDFs() {
  const listEl = document.getElementById('pdfList');
  if (!listEl) return;
  listEl.innerHTML = '';
  let pdfs = JSON.parse(localStorage.getItem('pdfs')) || [];
  pdfs.forEach((p, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    // try to convert stored data URL to a Blob URL for more reliable opening
    try {
      const blob = dataURLtoBlob(p.data);
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = p.name || 'file.pdf';
    } catch (e) {
      a.href = p.data;
    }
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = p.name || 'PDF';
    const delBtn = document.createElement('button');
    delBtn.textContent = 'حذف';
    delBtn.onclick = () => {
      if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
      if (confirm('حذف الملف؟')) {
        pdfs.splice(i, 1);
        localStorage.setItem('pdfs', JSON.stringify(pdfs));
        loadPDFs();
      }
    };
    li.appendChild(a);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

// helper: convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  if (!dataurl || !dataurl.includes(',')) throw new Error('غير صالح dataURL');
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

// Audio
function uploadAudio() {
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const input = document.getElementById('audioUpload');
  if (!input || !input.files.length) return alert('اختر ملف صوتي');
  const file = input.files[0];
  // Save large audio files to IndexedDB (safer for big files than localStorage)
  saveAudioToDB(file).then(()=>{
    input.value = '';
    loadAudios();
  }).catch(err=>{
    console.error('خطأ عند حفظ الملف في IndexedDB', err);
    alert('حدث خطأ أثناء رفع الملف. تأكد من مساحة المتصفح أو جرب ملف أصغر.');
  });
}
function loadAudios() {
  const listEl = document.getElementById('audioList');
  if (!listEl) return;
  listEl.innerHTML = '';
  getAllAudiosFromDB().then(audios => {
    if (!audios || !audios.length) return;
    audios.forEach((a) => {
      const li = document.createElement('li');
      const url = URL.createObjectURL(a.blob);
      const audioEl = document.createElement('audio');
      audioEl.controls = true;
      audioEl.src = url;
      const meta = document.createTextNode(' (' + (a.name || 'audio') + ') ');
      const delBtn = document.createElement('button');
      delBtn.textContent = 'حذف';
      delBtn.onclick = () => {
        if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
        if (!confirm('حذف التسجيل؟')) return;
        deleteAudioFromDB(a.id).then(()=>{
          loadAudios();
        });
      };
      li.appendChild(audioEl);
      li.appendChild(meta);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }).catch(err=>{ console.error('خطأ تحميل الأصوات من DB', err); listEl.innerHTML = '<p>خطأ في تحميل التسجيلات</p>'; });
}

/* IndexedDB helpers for audio storage (supports large files) */
function openMediaDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('dar_media_db', 1);
    req.onupgradeneeded = function(e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('audios')) {
        const store = db.createObjectStore('audios', { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name', { unique: false });
      }
    };
    req.onsuccess = function(e) { resolve(e.target.result); };
    req.onerror = function(e) { reject(e.target.error); };
  });
}

function saveAudioToDB(file) {
  return new Promise((resolve, reject) => {
    openMediaDB().then(db => {
      const tx = db.transaction('audios', 'readwrite');
      const store = tx.objectStore('audios');
      const item = { name: file.name, blob: file, date: new Date().toLocaleString('ar-EG') };
      const req = store.add(item);
      req.onsuccess = () => { resolve(); };
      req.onerror = (e) => { reject(e.target.error); };
    }).catch(reject);
  });
}

function getAllAudiosFromDB() {
  return new Promise((resolve, reject) => {
    openMediaDB().then(db => {
      const tx = db.transaction('audios', 'readonly');
      const store = tx.objectStore('audios');
      const req = store.getAll();
      req.onsuccess = (e) => { resolve(e.target.result || []); };
      req.onerror = (e) => { reject(e.target.error); };
    }).catch(reject);
  });
}

function deleteAudioFromDB(id) {
  return new Promise((resolve, reject) => {
    openMediaDB().then(db => {
      const tx = db.transaction('audios', 'readwrite');
      const store = tx.objectStore('audios');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    }).catch(reject);
  });
}

// سجل التسميع (الشيخ يدير، الطالب عرض فقط)
function loadStudentsRecordsList() {
  const users = safeGetUsers();
  const listEl = document.getElementById('studentsRecordsList');
  if (!listEl) return;
  listEl.innerHTML = '';
  users.students.forEach(s => {
    const li = document.createElement('li');
    // header with clickable name to toggle records
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const left = document.createElement('div');
    left.style.flex = '1';
    const nameEl = document.createElement('b');
    nameEl.textContent = s.name;
    nameEl.style.cursor = 'pointer';
    nameEl.title = 'اضغط لعرض/إخفاء سجل التسميع';
    left.appendChild(nameEl);

    const toggleIcon = document.createElement('span');
    toggleIcon.textContent = ' ▾';
    toggleIcon.style.opacity = '0.7';
    nameEl.appendChild(toggleIcon);

    const rightControls = document.createElement('div');
    rightControls.style.minWidth = '260px';
    rightControls.style.display = 'flex';
    rightControls.style.flexDirection = 'column';
    rightControls.style.gap = '6px';
    rightControls.innerHTML = `
      <input type="number" placeholder="رقم الصفحة" id="pageNumberInput_${s.phone}" min="1" value="1">
      <input type="number" placeholder="عدد الصفحات" id="pagesInput_${s.phone}" min="1" value="1">
      <select id="gradeInput_${s.phone}">
        <option>ممتاز</option><option>جيد جدا</option><option>جيد</option><option>تعاد</option>
      </select>
      <button onclick="addRecord('${s.phone}')">إضافة تسميع</button>
    `;

    header.appendChild(left);
    header.appendChild(rightControls);

    // details (records list) hidden by default
    const details = document.createElement('div');
    details.style.display = 'none';
    details.style.marginTop = '8px';
    const recs = s.records || [];
    if (!recs.length) {
      details.innerHTML = '<p class="muted">لا توجد تسميعات لهذا الطالب.</p>';
    } else {
      const ul = document.createElement('ul');
      recs.forEach((r, idx) => {
        const recLi = document.createElement('li');
        recLi.innerHTML = `الصفحة: ${r.pageNumber} | ${r.pages} صفحات | ${r.grade} | ${r.date} ${r.text ? ' - '+escapeHtml(r.text) : ''} <button onclick="deleteRecord('${s.phone}',${idx})">حذف</button>`;
        ul.appendChild(recLi);
      });
      details.appendChild(ul);
    }

    // toggle handler
    nameEl.addEventListener('click', () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    // assemble
    li.appendChild(header);
    li.appendChild(details);
    listEl.appendChild(li);
  });
}

function addRecord(phone) {
  if (!roleIsTeacher()) return alert('لا يمكنك إضافة تسميع. هذه الوظيفة للشيخ فقط.');
  const pageNumberEl = document.getElementById('pageNumberInput_' + phone);
  const pagesEl = document.getElementById('pagesInput_' + phone);
  const gradeEl = document.getElementById('gradeInput_' + phone);
  if (!pageNumberEl || !pagesEl || !gradeEl) return alert('خطأ في واجهة الإدخال.');
  const pageNumber = parseInt(pageNumberEl.value) || 1;
  const pages = parseInt(pagesEl.value) || 1;
  const text = '';
  const grade = gradeEl.value || 'جيد';
  // النص الآن اختياري/فارغ لأن الحقول تطلب عدد الصفحات مباشرة
  const users = safeGetUsers();
  const student = users.students.find(s => s.phone === phone);
  if (!student) return alert('الطالب غير موجود.');
  if (!student.records) student.records = [];
  const date = new Date().toLocaleDateString('ar-EG');
  student.records.push({ text, pages, pageNumber, grade, date });
  // compute and store points for this record
  const awarded = pointsForGrade(grade) || 0;
  student.records[student.records.length - 1].points = awarded;
  student.pagesRead = (student.pagesRead || 0) + pages;
  // update average grade to the most frequent grade in records
  student.avgGrade = computeModeGrade(student.records) || grade;
  student.points = (student.points || 0) + awarded;
  // sync student points into leaders and save
  syncStudentPointsToLeaders(student);
  saveUsers(users);
  // clear inputs
  if (pageNumberEl) pageNumberEl.value = '1';
  pagesEl.value = '1'; gradeEl.selectedIndex = 0;
  loadStudentsRecordsList();
  loadStudentsList();
}

// helper: compute points awarded for a grade
function pointsForGrade(grade) {
  if (!grade) return 0;
  grade = grade.toString().trim();
  if (grade === 'ممتاز') return 3;
  if (grade === 'جيد جدا') return 2;
  if (grade === 'جيد') return 1;
  if (grade === 'تعاد') return -1; // penalty
  return 0;
}

// sync a student's points into the leaders array (by phone then name)
function syncStudentPointsToLeaders(student) {
  if (!student) return;
  let leaders = JSON.parse(localStorage.getItem('leaders')) || [];
  // try to find existing leader entry by phone, then name
  let idx = leaders.findIndex(l => l.phone && student.phone && l.phone === student.phone);
  if (idx === -1) idx = leaders.findIndex(l => l.name && student.name && l.name === student.name);
  if (idx === -1) {
    // create leader entry reflecting student's points
    leaders.push({ name: student.name || student.phone, points: student.points || 0, img: student.img || '', phone: student.phone || '' });
  } else {
    leaders[idx].points = student.points || 0;
    leaders[idx].img = student.img || leaders[idx].img || '';
    leaders[idx].phone = student.phone || leaders[idx].phone || '';
  }
  localStorage.setItem('leaders', JSON.stringify(leaders));
}

// compute the most frequent grade (mode) from student's records
function computeModeGrade(records){
  if (!records || !records.length) return null;
  const freq = {};
  let maxCount = 0, mode = null;
  records.forEach(r => {
    const g = (r.grade || '').toString();
    if (!g) return;
    freq[g] = (freq[g] || 0) + 1;
    if (freq[g] > maxCount) { maxCount = freq[g]; mode = g; }
  });
  return mode;
}


function deleteRecord(phone, idx) {
  if (!roleIsTeacher()) return alert('لا يمكنك حذف التسميع. هذه الوظيفة للشيخ فقط.');
  const users = safeGetUsers();
  const student = users.students.find(s => s.phone === phone);
  if (!student || !student.records) return;
  if (!confirm('هل تريد حذف هذا التسميع؟')) return;
  // قبل الحذف: قلل من إجمالي صفحات الحفظ بمقدار صفحات هذا التسميع
  const rec = student.records[idx];
  const removedPages = rec && rec.pages ? parseInt(rec.pages) : 0;
  // remove and deduct pages and points
  const removedPoints = rec && (rec.points || 0) ? parseInt(rec.points) : 0;
  student.records.splice(idx, 1);
  student.pagesRead = Math.max(0, (student.pagesRead || 0) - removedPages);
  student.points = Math.max(0, (student.points || 0) - removedPoints);
  // sync leaders after deduction
  syncStudentPointsToLeaders(student);
  saveUsers(users);
  // تحديث القوائم بعد الحذف
  loadStudentsRecordsList();
  loadStudentsList();
}

// دوال الطالب المعطلة
function studentAddRecord() { alert('لا يمكنك إضافة تسميع من هنا. تواصل مع الشيخ.'); }
function studentDeleteRecord() { alert('لا يمكنك حذف التسميع من هنا. تواصل مع الشيخ.'); }

// المتجر
function buyProduct(productId) {
  if (!roleIsStudent()) return alert('هذه الخاصية للطالب فقط.');
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return alert('المنتج غير موجود.');
  const users = safeGetUsers();
  const phone = sessionStorage.getItem('phone');
  const student = users.students.find(s => s.phone === phone);
  if (!student) return alert('الطالب غير موجود.');
  if ((student.points || 0) < product.price) { alert('رصيدك من النقاط غير كافٍ.'); return; }
  student.points = (student.points || 0) - product.price;
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = { studentName: student.name, phone: student.phone, product: product.name, date: new Date().toLocaleString('ar-EG') };
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  saveUsers(users);
  const pointsEl = document.getElementById('studentPoints');
  if (pointsEl) pointsEl.textContent = student.points;
  const topEl = document.getElementById('studentPointsTop'); if (topEl) topEl.textContent = student.points;
  // sync leaders after spending points
  syncStudentPointsToLeaders(student);
  alert(`تم الشراء بنجاح\nالطالب: ${student.name}\nرقم: ${student.phone}\nالمنتج: ${product.name}`);
}

function buyStoreProduct(productId) {
  if (!roleIsStudent()) return alert('هذه الخاصية للطالب فقط.');
  const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
  const product = products.find(p => p.id === productId);
  if (!product) return alert('المنتج غير موجود.');
  const users = safeGetUsers();
  const phone = sessionStorage.getItem('phone');
  const student = users.students.find(s => s.phone === phone);
  if (!student) return alert('الطالب غير موجود.');
  if ((student.points || 0) < product.price) { alert('رصيدك من النقاط غير كافٍ.'); return; }
  student.points = (student.points || 0) - product.price;
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = { studentName: student.name, phone: student.phone, product: product.name, date: new Date().toLocaleString('ar-EG') };
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  saveUsers(users);
  const pointsEl = document.getElementById('studentPoints');
  if (pointsEl) pointsEl.textContent = student.points;
  const topEl = document.getElementById('studentPointsTop'); if (topEl) topEl.textContent = student.points;
  // sync leaders after spending
  syncStudentPointsToLeaders(student);
  alert(`تم الشراء بنجاح\nالطالب: ${student.name}\nرقم: ${student.phone}\nالمنتج: ${product.name}`);
}

function loadOrdersList() {
  const listEl = document.getElementById('ordersList');
  if (!listEl) return;
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  listEl.innerHTML = orders.map(o => `<li>${o.date} - ${o.studentName} (${o.phone}) اشترى: ${o.product}</li>`).join('');
}

// Store product management (شيخ يضيف منتجات)
function openAddProductModal(){
  document.getElementById('addProductModal').style.display = 'flex';
}
function closeAddProductModal(){
  document.getElementById('addProductModal').style.display = 'none';
}

// Assignments management (شيخ)
function openAddAssignmentModal(){
  // populate student select
  const sel = document.getElementById('assignmentAssignTo');
  if (sel) {
    sel.innerHTML = '<option value="all">لكل الطلاب</option>';
    const users = safeGetUsers();
    (users.students || []).forEach(s => {
      const opt = document.createElement('option'); opt.value = s.phone; opt.textContent = s.name + ' - ' + s.phone; sel.appendChild(opt);
    });
  }
  document.getElementById('addAssignmentModal').style.display = 'flex';
}
function closeAddAssignmentModal(){ document.getElementById('addAssignmentModal').style.display = 'none'; }

function saveAssignmentFromModal(){
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const title = document.getElementById('assignmentTitle').value.trim();
  const pages = parseInt(document.getElementById('assignmentPages').value) || 0;
  const hadiths = parseInt(document.getElementById('assignmentHadiths').value) || 0;
  const due = document.getElementById('assignmentDue').value || '';
  const assignTo = document.getElementById('assignmentAssignTo').value || 'all';
  if (!title) return alert('أدخل عنوان الواجب');
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  const a = { id: Date.now(), title, pages, hadiths, due, assignTo, createdAt: new Date().toLocaleString('ar-EG') };
  assignments.unshift(a);
  localStorage.setItem('assignments', JSON.stringify(assignments));
  closeAddAssignmentModal();
  loadAssignmentsList();
}

function loadAssignmentsList(){
  const listEl = document.getElementById('assignmentsList'); if (!listEl) return;
  const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  if (!assignments.length) { listEl.innerHTML = '<p class="muted">لا توجد واجبات بعد.</p>'; return; }
  listEl.innerHTML = '';
  assignments.forEach(a=>{
    const li = document.createElement('li');
    li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><strong>${escapeHtml(a.title)}</strong><div class="muted">صفحات: ${a.pages} - أحاديث: ${a.hadiths} - لل: ${a.assignTo==='all' ? 'كل الطلاب' : a.assignTo} - الموعد: ${a.due || 'غير محدد'}</div></div>
      <div><button onclick="deleteAssignment(${a.id})">حذف</button></div>
    </div>`;
    listEl.appendChild(li);
  });
}

function deleteAssignment(id){
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  if (!confirm('حذف الواجب؟')) return;
  let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
  assignments = assignments.filter(a=>a.id !== id);
  localStorage.setItem('assignments', JSON.stringify(assignments));
  loadAssignmentsList();
}

function saveProductFromModal(){
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const name = document.getElementById('productName').value.trim();
  const price = parseInt(document.getElementById('productPrice').value) || 0;
  const imgInput = document.getElementById('productImg');
  if (!name) return alert('أدخل اسم المنتج');
  if (imgInput && imgInput.files.length){
    const reader = new FileReader();
    reader.onload = function(e){ saveProduct(name, price, e.target.result); closeAddProductModal(); };
    reader.readAsDataURL(imgInput.files[0]);
  } else { saveProduct(name, price, ''); closeAddProductModal(); }
}

function saveProduct(name, price, imgData){
  // support edit mode via hidden field
  const editId = document.getElementById('productEditId')?.value;
  let products = JSON.parse(localStorage.getItem('storeProducts')) || [];
  if (editId) {
    products = products.map(p => p.id == editId ? ({ id: p.id, name, price, img: imgData || p.img }) : p);
  } else {
    products.push({ id: Date.now(), name, price, img: imgData });
  }
  localStorage.setItem('storeProducts', JSON.stringify(products));
  // clear edit id
  if (document.getElementById('productEditId')) document.getElementById('productEditId').value = '';
  loadStoreProducts();
}

function loadStoreProducts(){
  // called in teacher and student views to render available products
  const listEl = document.getElementById('storeList');
  const ordersEl = document.getElementById('ordersList');
  const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
  if (listEl) {
    listEl.innerHTML = '';
    products.forEach(p => {
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.alignItems='center'; li.style.gap='8px';
      if (p.img) { const img = document.createElement('img'); img.src = p.img; img.style.maxWidth='48px'; img.style.borderRadius='6px'; li.appendChild(img); }
      const info = document.createElement('div'); info.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div class="muted">${p.price} نقطة</div>`;
      // if teacher, show Edit + Delete, else show Buy
      if (roleIsTeacher()){
        const editBtn = document.createElement('button'); editBtn.textContent = 'تعديل'; editBtn.className='main-btn'; editBtn.onclick = ()=> editProduct(p.id);
        const delBtn = document.createElement('button'); delBtn.textContent = 'حذف'; delBtn.className='main-btn'; delBtn.onclick = ()=>{ if(confirm('حذف المنتج؟')){ removeProduct(p.id); } };
        li.appendChild(info); li.appendChild(editBtn); li.appendChild(delBtn);
      } else {
        const buyBtn = document.createElement('button'); buyBtn.textContent = 'شراء'; buyBtn.onclick = ()=> buyStoreProduct(p.id);
        li.appendChild(info); li.appendChild(buyBtn);
      }
      listEl.appendChild(li);
    });
  }
  if (ordersEl) {
    // leave orders list as-is; products for ordering appear in student store
  }
}

function editProduct(id){
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  const products = JSON.parse(localStorage.getItem('storeProducts')) || [];
  const p = products.find(x=>x.id===id);
  if (!p) return alert('المنتج غير موجود');
  // open modal and fill fields
  document.getElementById('productName').value = p.name;
  document.getElementById('productPrice').value = p.price;
  // store edit id in a hidden input
  let hid = document.getElementById('productEditId');
  if (!hid){ hid = document.createElement('input'); hid.type='hidden'; hid.id='productEditId'; document.getElementById('addProductModal').querySelector('.modal-content').appendChild(hid); }
  hid.value = p.id;
  document.getElementById('addProductModal').style.display = 'flex';
}

function removeProduct(id){
  let products = JSON.parse(localStorage.getItem('storeProducts')) || [];
  products = products.filter(p=>p.id !== id);
  localStorage.setItem('storeProducts', JSON.stringify(products));
  loadStoreProducts();
}

// Purge entire store (products + orders) — restricted to teacher
function purgeStoreProducts(){
  if (!roleIsTeacher()) return alert('هذه الوظيفة للشيخ فقط.');
  if (!confirm('سيتم حذف كل منتجات المتجر والطلبات نهائياً. هل تريد المتابعة؟')) return;
  localStorage.removeItem('storeProducts');
  localStorage.removeItem('orders');
  loadStoreProducts();
  loadOrdersList();
  alert('تم مسح محتويات المتجر والطلبات.');
}

// إعدادات الشيخ
function updateTeacherSettings() {
  const name = document.getElementById('teacherNameEdit').value.trim();
  const phone = document.getElementById('teacherPhoneEdit').value.trim();
  const imgInput = document.getElementById('teacherImgEdit');
  let users = safeGetUsers();
  const myPhone = sessionStorage.getItem('phone');
  const teacher = users.teachers.find(t => t.phone === myPhone);
  if (!teacher) return alert('لم يتم العثور على حساب الشيخ');
  if (name) teacher.name = name;
  if (/^01\d{9}$/.test(phone)) { teacher.phone = phone; sessionStorage.setItem('phone', phone); }
  if (imgInput && imgInput.files.length) {
    const reader = new FileReader();
    reader.onload = function(e) {
      teacher.img = e.target.result;
      saveUsers(users);
      showTeacherImg();
      alert('تم حفظ التغييرات');
    };
    reader.readAsDataURL(imgInput.files[0]);
  } else {
    saveUsers(users);
    showTeacherImg();
    alert('تم حفظ التغييرات');
  }
}
function showTeacherImg() {
  let users = safeGetUsers();
  const myPhone = sessionStorage.getItem('phone');
  const teacher = users.teachers.find(t => t.phone === myPhone);
  const preview = document.getElementById('teacherImgPreview');
  if (teacher && teacher.img && preview) preview.innerHTML = `<img src="${teacher.img}" alt="صورة الشيخ">`;
  else if (preview) preview.innerHTML = '';
}

// show large interactive preview of the logo when small logo is clicked
function showLogoPreview(){
  // avoid duplicate overlay
  if (document.getElementById('logoPreviewOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'logoPreviewOverlay';
  const img = document.createElement('img');
  img.src = '../لوجو.jpg';
  img.alt = 'لوجو دار السابقون';
  overlay.appendChild(img);
  overlay.onclick = () => overlay.remove();
  document.body.appendChild(overlay);
}

// تحميل أولي واحد
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('welcomeStudent')) { loadStudentPage(); showRandomKnowledgeQuote(); }
  if (document.getElementById('welcomeTeacher')) {
    showSection('students');
    loadStudentsList();
    loadLeaders();
    loadHadiths();
    loadPDFs();
  loadAudios();
  loadStoreProducts();
    showTeacherImg();
    loadStudentsRecordsList();
    loadOrdersList();
    showRandomKnowledgeQuote();
  }
});

// Credits modal handlers
function showCreditsModal(){
  const m = document.getElementById('creditsModal');
  if (!m) return;
  m.style.display = 'flex';
}
function closeCreditsModal(){
  const m = document.getElementById('creditsModal');
  if (!m) return;
  m.style.display = 'none';
}

// Auto-refresh controller: refresh UI data periodically without full page reload
let autoRefreshIntervalId = null;
function startAutoRefresh(seconds = 30){
  stopAutoRefresh();
  // run immediately once
  doAutoRefresh();
  autoRefreshIntervalId = setInterval(doAutoRefresh, Math.max(5, seconds) * 1000);
}
function stopAutoRefresh(){
  if (autoRefreshIntervalId){ clearInterval(autoRefreshIntervalId); autoRefreshIntervalId = null; }
}

function doAutoRefresh(){
  try{
    // teacher view refreshes many lists
    if (document.getElementById('welcomeTeacher')){
      updateTeacherStats();
      loadStudentsList();
      loadLeaders();
      loadHadiths();
      loadPDFs();
      loadAudios();
      loadStoreProducts();
      showTeacherImg();
      loadStudentsRecordsList();
      loadOrdersList();
    }
    // student view refreshes their personal data and available materials
    if (document.getElementById('welcomeStudent')){
      // refresh student page data and visible tabs WITHOUT causing a redirect
      const phone = sessionStorage.getItem('phone');
      if (phone) {
        // update welcome text and visible materials only
        try {
          const users = safeGetUsers();
          const student = users.students.find(s => s.phone === phone);
          const welcomeEl = document.getElementById('welcomeStudent');
          if (welcomeEl && student) welcomeEl.textContent = `مرحباً، ${student.name || student.phone}`;
        } catch (e) { console.warn('auto-refresh: failed updating welcome text', e); }
        // refresh hadiths/audios if those DOM areas are present
        const hadithEl = document.getElementById('studentHadiths'); if (hadithEl) renderStudentHadiths();
        const audioEl = document.getElementById('studentAudios'); if (audioEl) renderStudentAudios();
        // store content refresh can be triggered if store tab is visible; we keep it passive here
        const storeEl = document.getElementById('content'); if (storeEl && storeEl.innerHTML.includes('المتجر')) { /* optional refresh logic */ }
      } else {
        // skip student refresh if no active session to avoid navigating away from current page
        console.warn('auto-refresh: no student session found — skipping student UI refresh to avoid redirect');
      }
    }
  } catch (e){ console.error('auto-refresh failed', e); }
}

// stop the interval on unload to avoid stray timers
window.addEventListener('beforeunload', () => { stopAutoRefresh(); });

// start auto-refresh on initial load (30 seconds)
startAutoRefresh(30);