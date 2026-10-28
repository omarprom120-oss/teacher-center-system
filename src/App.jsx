import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Award, BookOpen, Check, CheckCircle2, ChevronDown, ClipboardList, Download,
  Edit3, FileText, Filter, LayoutDashboard, Lock, MessageCircle, MoreHorizontal,
  Plus, Search, Settings2, Sparkles, Trash2, UserPlus, Users, XCircle,
} from 'lucide-react'

const seedStudents = [
  { id: 'MM-1001', name: 'أحمد محمد علي', grade: '3sec', center: 'النور', phone: '01012345678', parentPhone: '01098765432', points: 155 },
  { id: 'MM-1002', name: 'محمود أحمد حسن', grade: '3sec', center: 'النور', phone: '01123456789', parentPhone: '01187654321', points: 120 },
  { id: 'MM-1003', name: 'مريم محمود إبراهيم', grade: '2sec', center: 'التفوق', phone: '01234567890', parentPhone: '01276543210', points: 180 },
  { id: 'MM-1004', name: 'يوسف خالد سمير', grade: '1sec', center: 'الصفوة', phone: '01555555555', parentPhone: '01544444444', points: 95 },
]
const seedSessions = [{ id: 'S-101', title: 'الباب الأول: شرح القوانين والمسائل', grade: '3sec', center: 'النور', date: '28 أكتوبر 2026', max: 20, sheet: 'ملخص الباب الأول.pdf', homework: 'حل تدريبات كتاب الامتحان ص 15–20', records: { 'MM-1001': { status: 'present', score: 19, homework: true }, 'MM-1002': { status: 'late', score: 14, homework: false } } }]
const gradeLabels = { '1sec': 'أولى ثانوي', '2sec': 'تانية ثانوي', '3sec': 'تالتة ثانوي' }
const statusLabels = { present: 'حاضر', late: 'متأخر', absent: 'غائب' }

function useStored(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch {
      return fallback
    }
  })

  const update = (nextValue) => {
    setValue((currentValue) => {
      const resolvedValue = typeof nextValue === 'function' ? nextValue(currentValue) : nextValue
      try {
        localStorage.setItem(key, JSON.stringify(resolvedValue))
      } catch {
        // Keep the in-memory update working if browser storage is unavailable.
      }
      return resolvedValue
    })
  }

  return [value, update]
}

export default function App() {
  const getModeFromHash = () => window.location.hash.toLowerCase() === '#/student' ? 'student' : 'admin'
  const [mode, setMode] = useState(getModeFromHash)
  const [tab, setTab] = useState('attendance')

  // Menu State & Ref for dropdowns
  const [openMenu, setOpenMenu] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick, true)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick, true)
  }, [])

  useEffect(() => {
    const syncRoute = () => setMode(getModeFromHash())
    window.addEventListener('hashchange', syncRoute)
    syncRoute()
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const navigate = (path) => {
    const nextHash = path === '/student' ? '#/student' : '#/admin'
    if (window.location.hash !== nextHash) window.location.hash = nextHash
    setMode(path === '/student' ? 'student' : 'admin')
  }

  const [students, setStudents] = useStored('mm-students', seedStudents)
  const [sessions, setSessions] = useStored('mm-sessions', seedSessions)
  const [sessionId, setSessionId] = useState(seedSessions[0].id)
  const [grade, setGrade] = useState('3sec')
  const [query, setQuery] = useState('')
  const [showStudent, setShowStudent] = useState(false)
  const [showSession, setShowSession] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [portalInput, setPortalInput] = useState('')
  const [portalStudent, setPortalStudent] = useState(null)
  const [portalError, setPortalError] = useState('')
  const [studentForm, setStudentForm] = useState({ name: '', phone: '', parentPhone: '', grade: '3sec', center: 'النور' })
  const [sessionForm, setSessionForm] = useState({ title: '', grade: '3sec', center: 'النور', sheet: '', homework: '' })
  
  const current = sessions.find((item) => item.id === sessionId) || sessions[0]
  const filtered = useMemo(() => students.filter((s) => s.grade === grade && (!query || `${s.name} ${s.id} ${s.phone}`.includes(query))), [students, grade, query])

  const recordFor = (id) => current?.records?.[id] || { status: 'present', score: 0, homework: false }
  
  const updateRecord = (id, patch) => {
    const old = recordFor(id)
    const nextRecord = { ...old, ...patch }
    const nextRecords = { ...(current.records || {}), [id]: nextRecord }
    setSessions(sessions.map((s) => s.id === current.id ? { ...s, records: nextRecords } : s))
    if (patch.status && patch.status !== old.status) setStudents(students.map((s) => s.id === id ? { ...s, points: Math.max(0, s.points + (patch.status === 'present' ? 10 : patch.status === 'late' ? 5 : 0) - (old.status === 'present' ? 10 : old.status === 'late' ? 5 : 0)) } : s))
  }

  const addStudent = (e) => { e.preventDefault(); if (!studentForm.name || !studentForm.parentPhone) return; setStudents([{ ...studentForm, id: `MM-${1000 + students.length + 1}`, points: 50 }, ...students]); setStudentForm({ name: '', phone: '', parentPhone: '', grade: '3sec', center: 'النور' }); setShowStudent(false) }
  const addSession = (e) => { e.preventDefault(); if (!sessionForm.title) return; const item = { ...sessionForm, id: `S-${Date.now()}`, date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }), max: 20, records: {} }; setSessions([item, ...sessions]); setSessionId(item.id); setSessionForm({ title: '', grade: '3sec', center: 'النور', sheet: '', homework: '' }); setShowSession(false) }
  
  const whatsapp = (student) => { 
    const record = recordFor(student.id); 
    const rawPhone = String(student.parentPhone || '').replace(/[^0-9]/g, ''); 
    const phone = rawPhone.startsWith('20') ? rawPhone : `20${rawPhone.replace(/^0/, '')}`; 
    const msg = `السلام عليكم ولي أمر الطالب/ة: ${student.name} (كود: ${student.id})\nتقرير حصة الإنجليزي مع مستر محمد مارك: ${current.title}\n📌 حالة الحضور: ${statusLabels[record.status]}\n📝 درجة الكويز: ${record.score} / ${current.max}\n📚 الواجب المنزلي: ${record.homework ? 'تم التسليم' : 'لم يتم التسليم'}\n⭐ نقاط التميز الحالية: ${student.points}\nمع تحيات تيم مستر محمد مارك 🎓`; 
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    setOpenMenu(null);
  }

  const deleteStudentHandler = (id) => {
    setOpenMenu(null)
    if (window.confirm('حذف هذا الطالب؟ لا يمكن التراجع عن العملية.')) {
      setStudents((currentStudents) => currentStudents.filter((student) => student.id !== id))
    }
  }

  const login = (e) => {
    e.preventDefault()
    const value = portalInput.trim()
    const normalizedPhone = value.replace(/[^0-9]/g, '')
    const found = value ? students.find((s) => s.id.toLowerCase() === value.toLowerCase() || String(s.phone || '').replace(/[^0-9]/g, '') === normalizedPhone || String(s.parentPhone || '').replace(/[^0-9]/g, '') === normalizedPhone) : null
    setPortalStudent(found || null)
    setPortalError(found ? '' : '❌ خطأ: هذا الرقم أو الكود غير مسجل في النظام، برعايتك تأكد من البيانات أو تواصل مع الدعم.')
  }

  return <div className="app-shell" dir="rtl">
    <header className="topbar"><div className="brand"><div className="brand-mark"><BookOpen /></div><div><h1>Mr. Mohammed Marc</h1><p>English Department <span>•</span> Teacher Center OS</p></div></div><div className="route-label"><span className="route-pill">{mode === 'admin' ? 'مساحة المدرس' : 'بوابة الطالب'}</span></div><div className="top-actions"><span className="live-dot">مباشر</span><button className="icon-btn"><Settings2 /></button></div></header>
    <a className="floating-whatsapp" href="https://wa.me/201097223288" target="_blank" rel="noreferrer" aria-label="تواصل واتساب"><MessageCircle /><span>تواصل واتساب</span></a>
    {mode === 'admin' ? <main className="page"><section className="hero"><div><div className="eyebrow"><Sparkles /> مساحة المدرس</div><h2>أهلاً يا مستر محمد،<br /><em>خلّي كل طالب في الصورة.</em></h2><p>إدارة الحضور، الحصص، والطلاب من مكان واحد.</p></div><div className="hero-stats"><div><strong>{students.length}</strong><span>إجمالي الطلاب</span></div><div><strong>{sessions.length}</strong><span>حصص نشطة</span></div><div><strong>92%</strong><span>متوسط الحضور</span></div></div></section>
      <nav className="tabs">{[['attendance', ClipboardList, 'الحضور اليومي'], ['students', Users, 'دليل الطلاب'], ['sessions', FileText, 'الحصص والشيتات'], ['leaderboard', Award, 'لوحة الأوائل']].map(([key, Icon, label]) => <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}><Icon />{label}<span>{key === 'students' ? students.length : key === 'sessions' ? sessions.length : ''}</span></button>)}</nav>
      {tab === 'attendance' && <><section className="toolbar"><div className="control"><label>الحصة المفعلة</label><select value={sessionId} onChange={(e) => setSessionId(e.target.value)}>{sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div><div className="control"><label>الصف الدراسي</label><select value={grade} onChange={(e) => setGrade(e.target.value)}><option value="1sec">أولى ثانوي</option><option value="2sec">تانية ثانوي</option><option value="3sec">تالتة ثانوي</option></select></div><div className="search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الكود..." /></div><button className="primary" onClick={() => setShowSession(true)}><Plus /> حصة جديدة</button><button className="secondary" onClick={() => setShowStudent(true)}><UserPlus /> طالب جديد</button></section><section className="session-banner"><div><span className="badge blue">{current.center} · {gradeLabels[current.grade]}</span><h3>{current.title}</h3><p>{current.date} <i /> الدرجة الكلية: <b>{current.max}</b></p></div><div className="files"><span><FileText /> {current.sheet || 'لا يوجد شيت'}</span><span><ClipboardList /> {current.homework || 'لا يوجد واجب'}</span></div></section><section className="table-card"><div className="table-head"><div><h3>تسجيل الحضور والدرجات</h3><p>{filtered.length} طلاب في هذه المجموعة</p></div><div className="legend"><span><i className="green" /> حاضر</span><span><i className="yellow" /> متأخر</span><span><i className="red" /> غائب</span></div></div><div className="table-wrap"><table><thead><tr><th>الطالب</th><th>الحضور</th><th>الاختبار <small>/ {current.max}</small></th><th>الواجب</th><th>تواصل</th><th>الإجراءات</th></tr></thead><tbody>{filtered.map((student) => { const record = recordFor(student.id); return <tr key={student.id}><td><div className="student-cell"><div className="avatar">{student.name.slice(0, 1)}</div><div><strong>{student.name}</strong><small>{student.id} · {student.center}</small></div></div></td><td><div className="status-pills">{['present', 'late', 'absent'].map((status) => <button key={status} className={record.status === status ? status : ''} onClick={() => updateRecord(student.id, { status })}>{statusLabels[status]}</button>)}</div></td><td><div className="score"><input type="number" min="0" max={current.max} value={record.score} onChange={(e) => updateRecord(student.id, { score: Number(e.target.value) })} /><span>/ {current.max}</span></div></td><td><button className={`homework ${record.homework ? 'done' : ''}`} onClick={() => updateRecord(student.id, { homework: !record.homework })}>{record.homework ? <Check /> : <XCircle />}{record.homework ? 'تم التسليم' : 'لم يسلم'}</button></td><td><button className="wa" onClick={() => whatsapp(student)}><MessageCircle /> واتساب</button></td><td><div className="action-menu" ref={openMenu === student.id ? menuRef : null}><button type="button" className="more" aria-label={`إجراءات ${student.name}`} aria-expanded={openMenu === student.id} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setOpenMenu((current) => current === student.id ? null : student.id) }}><MoreHorizontal /></button>{openMenu === student.id && <div className="action-popover" role="menu" onPointerDown={(e) => e.stopPropagation()}><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); setEditingStudent(student) }}>تعديل البيانات</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); whatsapp(student) }}>إرسال واتساب</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); window.alert(`تقرير الطالب: ${student.name}`) }}>عرض التقرير</button><button type="button" role="menuitem" className="delete-action" onClick={() => deleteStudentHandler(student.id)}>حذف الطالب</button></div>}</div></td></tr>})}</tbody></table></div></section></>}
      {tab === 'students' && <Directory students={students} onDelete={deleteStudentHandler} onEdit={setEditingStudent} onAdd={() => setShowStudent(true)} openMenu={openMenu} setOpenMenu={setOpenMenu} menuRef={menuRef} />}
      {tab === 'sessions' && <Sessions sessions={sessions} onAdd={() => setShowSession(true)} onDelete={(id) => setSessions(sessions.filter((s) => s.id !== id))} />}
      {tab === 'leaderboard' && <Leaderboard students={students} />}
    </main> : <StudentPortal input={portalInput} setInput={(value) => { setPortalInput(value); if (portalError) setPortalError('') }} login={login} student={portalStudent} error={portalError} sessions={sessions} />}
    {showStudent && <Modal title="إضافة طالب جديد" onClose={() => setShowStudent(false)}><form onSubmit={addStudent} className="form-grid">{[['name','اسم الطالب الثلاثي'],['phone','رقم الطالب'],['parentPhone','رقم ولي الأمر']].map(([key, label]) => <label key={key}>{label}<input required={key !== 'phone'} value={studentForm[key]} onChange={(e) => setStudentForm({ ...studentForm, [key]: e.target.value })} /></label>)}<label>الصف<select value={studentForm.grade} onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}><option value="1sec">أولى ثانوي</option><option value="2sec">تانية ثانوي</option><option value="3sec">تالتة ثانوي</option></select></label><label>السنتر<input value={studentForm.center} onChange={(e) => setStudentForm({ ...studentForm, center: e.target.value })} /></label><button className="primary full" type="submit">حفظ الطالب</button></form></Modal>}
    {editingStudent && <Modal title="تعديل بيانات الطالب" onClose={() => setEditingStudent(null)}><form onSubmit={(e) => { e.preventDefault(); setStudents((currentStudents) => currentStudents.map((student) => student.id === editingStudent.id ? { ...student, ...editingStudent } : student)); setOpenMenu(null); setEditingStudent(null) }} className="form-grid">{[['name','اسم الطالب الثلاثي'],['phone','رقم الطالب'],['parentPhone','رقم ولي الأمر'],['center','السنتر']].map(([key, label]) => <label key={key}>{label}<input required={key !== 'phone'} value={editingStudent[key] || ''} onChange={(e) => setEditingStudent({ ...editingStudent, [key]: e.target.value })} /></label>)}<label>الصف<select value={editingStudent.grade} onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}><option value="1sec">أولى ثانوي</option><option value="2sec">تانية ثانوي</option><option value="3sec">تالتة ثانوي</option></select></label><button className="primary full" type="submit">حفظ التعديلات</button></form></Modal>}
    {showSession && <Modal title="إنشاء حصة جديدة" onClose={() => setShowSession(false)}><form onSubmit={addSession} className="form-grid"><label className="wide">عنوان الحصة<input required value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} /></label><label>الصف<select value={sessionForm.grade} onChange={(e) => setSessionForm({ ...sessionForm, grade: e.target.value })}><option value="1sec">أولى ثانوي</option><option value="2sec">تانية ثانوي</option><option value="3sec">تالتة ثانوي</option></select></label><label>السنتر<input value={sessionForm.center} onChange={(e) => setSessionForm({ ...sessionForm, center: e.target.value })} /></label><label className="wide">اسم الشيت<input value={sessionForm.sheet} onChange={(e) => setSessionForm({ ...sessionForm, sheet: e.target.value })} placeholder="PDF أو رابط الملف" /></label><label className="wide">الواجب المطلوب<input value={sessionForm.homework} onChange={(e) => setSessionForm({ ...sessionForm, homework: e.target.value })} /></label><button className="primary full" type="submit">إنشاء الحصة</button></form></Modal>}
  </div>
}

function Directory({ students, onDelete, onEdit, onAdd, openMenu, setOpenMenu, menuRef }) {
  const sendWhatsApp = (student) => {
    const phone = String(student.parentPhone || '').replace(/[^0-9]/g, '')
    if (!phone) return
    const message = `السلام عليكم ولي أمر الطالب/ة ${student.name}، هذا تقرير مختصر عن متابعة الطالب في مركز مستر محمد مارك.`
    window.open(`https://wa.me/${phone.startsWith('20') ? phone : `20${phone.replace(/^0/, '')}`}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return <section className="directory"><div className="section-title"><div><div className="eyebrow"><Users /> قاعدة البيانات</div><h2>دليل الطلاب</h2><p>كل ملفات طلابك في مكان واحد.</p></div><button className="primary" onClick={onAdd}><UserPlus /> تسجيل طالب</button></div><div className="student-grid">{students.map((s) => <article className="directory-card" key={s.id}><div className="card-top"><div className="avatar large">{s.name.slice(0,1)}</div><div className="action-menu" ref={openMenu === s.id ? menuRef : null}><button type="button" className="more" aria-label={`إجراءات ${s.name}`} aria-expanded={openMenu === s.id} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setOpenMenu((current) => current === s.id ? null : s.id) }}><MoreHorizontal /></button>{openMenu === s.id && <div className="action-popover" role="menu" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); onEdit(s) }}>تعديل البيانات</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); sendWhatsApp(s) }}>إرسال واتساب</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); window.alert(`تقرير الطالب: ${s.name}`) }}>عرض التقرير</button><button type="button" role="menuitem" className="delete-action" onClick={() => { setOpenMenu(null); onDelete(s.id) }}>حذف الطالب</button></div>}</div></div><h3>{s.name}</h3><p>{s.id} · {gradeLabels[s.grade]}</p><div className="card-meta"><span>{s.center}</span><b><Award /> {s.points}</b></div></article>)}</div></section>
}
function Sessions({ sessions, onAdd, onDelete }) { return <section className="directory"><div className="section-title"><div><div className="eyebrow"><FileText /> المحتوى التعليمي</div><h2>الحصص والشيتات</h2><p>جهّز محتوى كل حصة وشاركه بسهولة.</p></div><button className="primary" onClick={onAdd}><Plus /> حصة جديدة</button></div><div className="session-grid">{sessions.map((s) => <article className="session-card" key={s.id}><div className="session-icon"><BookOpen /></div><div className="card-top"><span className="badge blue">{gradeLabels[s.grade]}</span><button className="danger" onClick={() => onDelete(s.id)}><Trash2 /></button></div><h3>{s.title}</h3><p>{s.date} · سنتر {s.center}</p><div className="resource"><FileText /> {s.sheet || 'لم يتم رفع شيت'} <Download /></div><div className="resource"><ClipboardList /> {s.homework || 'لا يوجد واجب'}</div></article>)}</div></section> }
function Leaderboard({ students }) { return <section className="directory"><div className="section-title"><div><div className="eyebrow"><Award /> التحفيز</div><h2>لوحة الأوائل</h2><p>كافئ التقدم وحافظ على حماس طلابك.</p></div></div><div className="leaderboard">{[...students].sort((a,b) => b.points-a.points).map((s, i) => <div className="leader" key={s.id}><span className={`rank r${i+1}`}>{i+1}</span><div className="avatar">{s.name.slice(0,1)}</div><strong>{s.name}<small>{s.id}</small></strong><b><Award /> {s.points} نقطة</b></div>)}</div></section> }
function StudentPortal({ input, setInput, login, student, error, sessions }) { return <main className="portal page"><div className="portal-glow" /><section className="portal-hero"><div className="brand-mark"><BookOpen /></div><div className="eyebrow"><Sparkles /> بوابة الطالب</div><h2>كل تقدّمك،<br /><em>في مكان واحد.</em></h2><p>تابع حضورك ودرجاتك وملفات الحصص مع Mr. Mohammed Marc.</p></section>{!student ? <form className="login-card" onSubmit={login}><div className="login-icon"><Lock /></div><h3>دخول الطالب</h3><p>اكتب الكود الخاص بك أو رقم الهاتف للوصول إلى ملفك.</p>{error && <div className="login-error" role="alert">{error}</div>}<label>الكود أو رقم الهاتف<input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="MM-1001" /></label><button className="primary full">دخول إلى ملفي <ChevronDown /></button><small>للتجربة: MM-1001</small></form> : <section className="profile-card"><div className="profile-head"><div className="avatar huge">{student.name.slice(0,1)}</div><div><span className="badge green">طالب نشط</span><h3>{student.name}</h3><p>{student.id} · {gradeLabels[student.grade]} · سنتر {student.center}</p></div><div className="points"><Award /><strong>{student.points}</strong><span>نقطة</span></div></div><div className="profile-stats"><div><strong>96%</strong><span>نسبة الحضور</span></div><div><strong>18.5</strong><span>متوسط الاختبارات</span></div><div><strong>{sessions.length}</strong><span>الحصص المسجلة</span></div></div><h4>آخر الحصص والملفات</h4>{sessions.filter((s) => s.grade === student.grade).map((s) => <div className="portal-session" key={s.id}><div className="session-icon"><FileText /></div><div><strong>{s.title}</strong><span>{s.date} · {s.sheet || 'لا يوجد ملف'}</span></div>{s.sheet && s.sheet.startsWith('http') ? <a className="download" href={s.sheet} target="_blank" rel="noreferrer"><Download /> تحميل</a> : <span className="download disabled"><Download /> غير متاح</span>}</div>)}</section>}</main> }
function Modal({ title, onClose, children }) { return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h3>{title}</h3><button onClick={onClose}>×</button></div>{children}</div></div> }
