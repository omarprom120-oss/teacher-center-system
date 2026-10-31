import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Award, Bell, BookOpen, CalendarDays, Check, CheckCircle2, ChevronDown, ClipboardList, Download,
  Edit3, FileText, Filter, LayoutDashboard, Lock, MessageCircle, MoreHorizontal, Moon, Sun,
  PlayCircle, Plus, Search, Settings2, Sparkles, Trash2, UserPlus, Users, XCircle,
} from 'lucide-react'

// 🔑 بيانات سوبابيز الخاصة بك للمزامنة السحابية الفورية
const SUPABASE_URL = 'https://mmgitoaoolcodpvwqvzq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_xSHOop6CGqgyaasZ3mK5hA_0HXv98kO'

const initialStudents = [
  { id: 'MM-1001', name: 'أحمد محمد علي', grade: '3sec', center: 'النور', phone: '01012345678', parentPhone: '01098765432', points: 155 },
  { id: 'MM-1002', name: 'محمود أحمد حسن', grade: '3sec', center: 'النور', phone: '01123456789', parentPhone: '01187654321', points: 120 },
  { id: 'MM-1003', name: 'مريم محمود إبراهيم', grade: '2sec', center: 'التفوق', phone: '01234567890', parentPhone: '01276543210', points: 180 },
  { id: 'MM-1004', name: 'يوسف خالد سمير', grade: '1sec', center: 'الصفوة', phone: '01555555555', parentPhone: '01544444444', points: 95 },
  { id: 'MM-1005', name: 'عمر محمد', grade: '3sec', center: 'النور', phone: '01097223288', parentPhone: '01097223288', points: 200 },
]

const initialSessions = [{ id: 'S-101', title: 'الباب الأول: شرح القوانين والمسائل', grade: '3sec', center: 'النور', date: '28 أكتوبر 2026', max: 20, sheet: 'ملخص الباب الأول.pdf', homework: 'حل تدريبات كتاب الامتحان ص 15–20', records: { 'MM-1001': { status: 'present', score: 19, homework: true }, 'MM-1002': { status: 'late', score: 14, homework: false } } }]
const gradeLabels = { '1sec': 'أولى ثانوي', '2sec': 'تانية ثانوي', '3sec': 'تالتة ثانوي' }
const statusLabels = { present: 'حاضر', late: 'متأخر', absent: 'غائب' }

// هوك مزامن مع سوبابيز سحابياً لتحديث البيانات على كل الأجهزة فوراً بدون فقدان
function useSupabaseState(key, fallback) {
  const [value, setValue] = useState(fallback)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!SUPABASE_URL.includes('http')) {
      setLoaded(true)
      return
    }
    fetch(`${SUPABASE_URL}/rest/v1/kv_store?key=eq.${key}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0 && data[0].value !== undefined) {
          setValue(data[0].value)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [key])

  const update = (nextValue) => {
    const resolved = typeof nextValue === 'function' ? nextValue(value) : nextValue
    setValue(resolved)

    if (SUPABASE_URL.includes('http')) {
      fetch(`${SUPABASE_URL}/rest/v1/kv_store?on_conflict=key`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key, value: resolved })
      }).catch(err => console.error('Sync error:', err))
    }
  }

  return [value, update, loaded]
}

export default function App() {
  const getModeFromHash = () => window.location.hash.toLowerCase() === '#/admin' ? 'admin' : 'student'
  const [mode, setMode] = useState(getModeFromHash)
  const [tab, setTab] = useState('attendance')
  const [isDarkMode, setIsDarkMode] = useStoredTheme('MM-theme-dark', true)
  const [announcements, setAnnouncements] = useSupabaseState('mm-announcements', [{ id: 'A-1', title: 'مراجعة شاملة قبل الامتحان', body: 'مراجعة الباب الأول يوم السبت القادم في سنتر النور.', type: 'مراجعة' }])

  const [openMenu, setOpenMenu] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

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

  function useStoredTheme(key, fallback) {
    const [val, setVal] = useState(() => {
      try { const s = localStorage.getItem(key); return s !== null ? JSON.parse(s) : fallback } catch { return fallback }
    })
    const updateVal = (v) => {
      const next = typeof v === 'function' ? v(val) : v
      setVal(next)
      try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
    }
    return [val, updateVal]
  }

  const toggleTheme = () => setIsDarkMode((prev) => !prev)

  const [students, setStudents] = useSupabaseState('mm-students', initialStudents)
  const [sessions, setSessions] = useSupabaseState('mm-sessions', initialSessions)
  const [schedule, setSchedule] = useSupabaseState('mm-schedule', [
    { id: 'T-1', day: 'السبت', center: 'النور', grade: '3sec', subject: 'English', time: '05:00 م' },
    { id: 'T-2', day: 'الأحد', center: 'الأمل', grade: '2sec', subject: 'English', time: '07:00 م' },
    { id: 'T-3', day: 'الثلاثاء', center: 'النور', grade: '1sec', subject: 'English', time: '05:00 م' },
  ])

  const [sessionId, setSessionId] = useState(initialSessions[0].id)
  const [grade, setGrade] = useState('3sec')
  const [query, setQuery] = useState('')
  const [showStudent, setShowStudent] = useState(false)
  const [showSession, setShowSession] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [portalInput, setPortalInput] = useState('')
  const [portalStudent, setPortalStudent] = useState(null)
  const [portalError, setPortalError] = useState('')
  const [studentForm, setStudentForm] = useState({ name: '', phone: '', parentPhone: '', grade: '3sec', center: 'النور' })
  const [sessionForm, setSessionForm] = useState({ title: '', grade: '3sec', center: 'النور', sheet: '', homework: '', video: '', max: 20 })
  const [announcementForm, setAnnouncementForm] = useState({ title: '', body: '', type: 'تنبيه' })
  const [scheduleForm, setScheduleForm] = useState({ day: 'السبت', center: 'النور', grade: '3sec', subject: 'English', time: '05:00 م' })
  const [editingSchedule, setEditingSchedule] = useState(null)
  
  const current = sessions.find((item) => item.id === sessionId) || sessions[0]
  const filtered = useMemo(() => students.filter((s) => s.grade === grade && (!query || `${s.name} ${s.id} ${s.phone}`.includes(query))), [students, grade, query])

  const recordFor = (id) => current?.records?.[id] || { status: 'present', score: 0, homework: false }
  
  const updateRecord = (id, patch) => {
    const old = recordFor(id)
    const nextRecord = { ...old, ...patch }
    const nextRecords = { ...(current.records || {}), [id]: nextRecord }
    setSessions(sessions.map((s) => s.id === current.id ? { ...s, records: nextRecords } : s))
    if (patch.status && patch.status !== old.status) {
      setStudents(students.map((s) => s.id === id ? { ...s, points: Math.max(0, s.points + (patch.status === 'present' ? 10 : patch.status === 'late' ? 5 : 0) - (old.status === 'present' ? 10 : old.status === 'late' ? 5 : 0)) } : s))
    }
  }

  const addStudent = (e) => { 
    e.preventDefault(); 
    if (!studentForm.name || !studentForm.parentPhone) return; 
    const newId = `MM-${1000 + students.length + 1}`;
    const newItem = { ...studentForm, id: newId, points: 50 };
    setStudents([newItem, ...students]); 
    setStudentForm({ name: '', phone: '', parentPhone: '', grade: '3sec', center: 'النور' }); 
    setShowStudent(false);
    window.alert(`تم تسجيل الطالب بنجاح! كود الطالب هو: ${newId}`);
  }

  const addSession = (e) => { 
    e.preventDefault(); 
    if (!sessionForm.title) return; 
    const item = { ...sessionForm, id: `S-${Date.now()}`, date: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }), max: Number(sessionForm.max) || 20, records: {} }; 
    setSessions([item, ...sessions]); 
    setSessionId(item.id); 
    setSessionForm({ title: '', grade: '3sec', center: 'النور', sheet: '', homework: '', video: '', max: 20 }); 
    setShowSession(false) 
  }

  const addAnnouncement = (e) => { 
    e.preventDefault(); 
    if (!announcementForm.title || !announcementForm.body) return; 
    setAnnouncements([{ ...announcementForm, id: `A-${Date.now()}` }, ...announcements]); 
    setAnnouncementForm({ title: '', body: '', type: 'تنبيه' }) 
  }

  const saveSchedule = (e) => {
    e.preventDefault()
    if (!scheduleForm.center || !scheduleForm.time) return
    const item = { ...scheduleForm, id: editingSchedule?.id || `T-${Date.now()}` }
    setSchedule((items) => editingSchedule ? items.map((slot) => slot.id === editingSchedule.id ? item : slot) : [...items, item])
    setScheduleForm({ day: 'السبت', center: 'النور', grade: '3sec', subject: 'English', time: '05:00 م' })
    setEditingSchedule(null)
  }

  const saveSession = (e) => {
    e.preventDefault()
    if (!editingSession?.title) return
    setSessions((currentSessions) => currentSessions.map((session) => session.id === editingSession.id ? { ...session, ...editingSession, max: Number(editingSession.max) || 20 } : session))
    setEditingSession(null)
  }
  
  const whatsapp = (student) => { 
    const record = recordFor(student.id); 
    const rawPhone = String(student.parentPhone || '').replace(/[^0-9]/g, ''); 
    const phone = rawPhone.startsWith('20') ? rawPhone : `20${rawPhone.replace(/^0/, '')}`; 
    const msg = `السلام عليكم ولي أمر الطالب/ة: ${student.name} (كود: ${student.id})\nتقرير حصة الإنجليزي مع مستر محمد مارك: ${current.title}\n📌 حالة ال��ضور: ${statusLabels[record.status]}\n📝 درجة الكويز: ${record.score} / ${current.max}\n📚 الواجب المنزلي: ${record.homework ? 'تم التسليم' : 'لم يتم التسليم'}\n⭐ نقاط التميز الحالية: ${student.points}\nمع تحيات تيم مستر محمد مارك 🎓`; 
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
    const value = portalInput.trim().toLowerCase()
    const normalizedPhone = value.replace(/[^0-9]/g, '')
    
    const found = students.find((s) => {
      const sId = String(s.id || '').trim().toLowerCase()
      const sPhone = String(s.phone || '').replace(/[^0-9]/g, '')
      const sParent = String(s.parentPhone || '').replace(/[^0-9]/g, '')
      return sId === value || (normalizedPhone && (sPhone === normalizedPhone || sParent === normalizedPhone))
    })

    if (found) {
      setPortalStudent(found)
      setPortalError('')
    } else {
      setPortalStudent(null)
      setPortalError('❌ خطأ: هذا الرقم أو الكود غير مسجل في النظام، تأكد من البيانات أو تواصل مع مستر محمد.')
    }
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'dark-mode' : 'light-mode'}`} dir="rtl">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><BookOpen /></div>
          <div>
            <h1>Mr. Mohammed Marc</h1>
            <p>English Department <span>❖❖❖</span> Teacher Center OS</p>
          </div>
        </div>
        
        <div className="top-actions">
          <button className="icon-btn theme-toggle" onClick={toggleTheme} title="تغيير الثيم">
            {isDarkMode ? <Sun className="icon-sun" /> : <Moon className="icon-moon" />}
          </button>
          <span className="live-dot">مباشر سحابي</span>
        </div>
      </header>

      <a className="floating-whatsapp" href="https://wa.me/201097223288" target="_blank" rel="noreferrer" aria-label="تواصل واتساب">
        <svg className="whatsapp-logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <circle cx="16" cy="16" r="15" fill="currentColor" />
          <path fill="#128C7E" d="M23.2 8.8a10.3 10.3 0 0 0-16.1 12L6 25.7l5.1-1.1a10.3 10.3 0 0 0 12.1-15.8Zm-7.1 14.1c-1.6 0-3.1-.4-4.5-1.2l-.3-.2-3 .7.8-2.9-.2-.3a8.4 8.4 0 1 1 7.2 3.9Zm4.6-6.3c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1a6.8 6.8 0 0 1-2-1.2 7.7 7.7 0 0 1-1.4-1.7c-.1-.2 0-.3.1-.4l.4-.5.2-.4c.1-.1 0-.3 0-.4l-.6-1.5c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.6.3a2.4 2.4 0 0 0-.8 1.8c0 1.1.8 2.2 1 2.4.1.2 1.6 2.5 3.9 3.5 2.3 1 2.3.7 2.7.7.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1-.1-.1-.2-.1-.4-.2Z" />
        </svg>
        <span>تواصل واتساب</span>
      </a>

      {mode === 'admin' ? (
        <main className="page">
          <section className="hero">
            <div>
              <div className="eyebrow"><Sparkles /> مساحة المدرس</div>
              <h2>أهلاً يا مستر محمد،<br /><em>كل أجهزتك متحدثة أونلاين.</em></h2>
              <p>إدارة الحضور، الحصص، والطلاب متزامنة تماماً.</p>
            </div>
            <div className="hero-stats">
              <div><strong>{students.length}</strong><span>إجمالي الطلاب</span></div>
              <div><strong>{sessions.length}</strong><span>حصص نشطة</span></div>
              <div><strong>92%</strong><span>متوسط الحضور</span></div>
            </div>
          </section>

          <nav className="tabs">
            {[
              ['attendance', ClipboardList, 'الحضور اليومي'],
              ['students', Users, 'دليل الطلاب'],
              ['sessions', FileText, 'الحصص والشيتات'],
              ['schedule', CalendarDays, 'جدول الحصص'],
              ['announcements', Bell, 'الإشعارات'],
              ['leaderboard', Award, 'لوحة الأوائل']
            ].map(([key, Icon, label]) => (
              <button key={key} className={tab === key ? 'selected' : ''} onClick={() => setTab(key)}>
                <Icon />
                <span>{label}</span>
                {['students', 'sessions', 'announcements'].includes(key) && (
                  <span className="count-badge">
                    {key === 'students' ? students.length : key === 'sessions' ? sessions.length : announcements.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {tab === 'attendance' && (
            <>
              <section className="toolbar">
                <div className="control">
                  <label>الحصة المفعلة</label>
                  <select className="dark-styled-input" value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                    {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="control">
                  <label>الصف الدراسي</label>
                  <select className="dark-styled-input" value={grade} onChange={(e) => setGrade(e.target.value)}>
                    <option value="1sec">أولى ثانوي</option>
                    <option value="2sec">تانية ثانوي</option>
                    <option value="3sec">تالتة ثانوي</option>
                  </select>
                </div>
                <div className="search">
                  <Search />
                  <input className="dark-styled-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الكود..." />
                </div>
                <button className="primary" onClick={() => setShowSession(true)}><Plus /> حصة جديدة</button>
                <button className="secondary" onClick={() => setShowStudent(true)}><UserPlus /> طالب جديد</button>
              </section>

              <section className="session-banner">
                <div>
                  <span className="badge blue">{current.center} · {gradeLabels[current.grade]}</span>
                  <h3>{current.title}</h3>
                  <p>{current.date} · الدرجة الكلية: <b>{current.max}</b></p>
                </div>
                <div className="files">
                  <span><FileText /> {current.sheet || 'لا يوجد شيت'}</span>
                  <span><ClipboardList /> {current.homework || 'لا يوجد واجب'}</span>
                </div>
              </section>

              <section className="table-card">
                <div className="table-head">
                  <div>
                    <h3>تسجيل الحضور والدرجات</h3>
                    <p>{filtered.length} طلاب في هذه المجموعة</p>
                  </div>
                  <div className="legend">
                    <span><i className="green" /> حاضر</span>
                    <span><i className="yellow" /> متأخر</span>
                    <span><i className="red" /> غائب</span>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>الطالب</th>
                        <th>الحضور</th>
                        <th>الاختبار <small>/ {current.max}</small></th>
                        <th>الواجب</th>
                        <th>تواصل</th>
                        <th>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student) => {
                        const record = recordFor(student.id);
                        return (
                          <tr key={student.id}>
                            <td>
                              <div className="student-cell">
                                <div className="avatar">{student.name.slice(0, 1)}</div>
                                <div>
                                  <strong>{student.name}</strong>
                                  <small>{student.id} · {student.center}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="status-pills">
                                {['present', 'late', 'absent'].map((status) => (
                                  <button
                                    key={status}
                                    className={record.status === status ? status : ''}
                                    onClick={() => updateRecord(student.id, { status })}
                                  >
                                    {statusLabels[status]}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div className="score">
                                <input
                                  type="number"
                                  className="dark-styled-input score-input"
                                  min="0"
                                  max={current.max}
                                  value={record.score}
                                  onChange={(e) => updateRecord(student.id, { score: Number(e.target.value) })}
                                />
                                <span>/ {current.max}</span>
                              </div>
                            </td>
                            <td>
                              <button
                                className={`homework ${record.homework ? 'done' : ''}`}
                                onClick={() => updateRecord(student.id, { homework: !record.homework })}
                              >
                                {record.homework ? <Check /> : <XCircle />}
                                {record.homework ? 'تم التسليم' : 'لم يسلم'}
                              </button>
                            </td>
                            <td>
                              <button className="wa" onClick={() => whatsapp(student)}><MessageCircle /> واتساب</button>
                            </td>
                            <td>
                              <div className="action-menu" ref={openMenu === student.id ? menuRef : null}>
                                <button
                                  type="button"
                                  className="more"
                                  aria-label={`إجراءات ${student.name}`}
                                  aria-expanded={openMenu === student.id}
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => { e.stopPropagation(); setOpenMenu((current) => current === student.id ? null : student.id) }}
                                >
                                  <MoreHorizontal />
                                </button>
                                {openMenu === student.id && (
                                  <div className="action-popover" role="menu" onPointerDown={(e) => e.stopPropagation()}>
                                    <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); setEditingStudent(student) }}>تعديل البيانات</button>
                                    <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); whatsapp(student) }}>إرسال واتساب</button>
                                    <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); window.alert(`تقرير الطالب: ${student.name}`) }}>عرض التقرير</button>
                                    <button type="button" role="menuitem" className="delete-action" onClick={() => deleteStudentHandler(student.id)}>حذف الطالب</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {tab === 'students' && <Directory students={students} onDelete={deleteStudentHandler} onEdit={setEditingStudent} onAdd={() => setShowStudent(true)} openMenu={openMenu} setOpenMenu={setOpenMenu} menuRef={menuRef} />}
          {tab === 'sessions' && <Sessions sessions={sessions} onAdd={() => setShowSession(true)} onEdit={setEditingSession} onDelete={(id) => setSessions((currentSessions) => currentSessions.filter((s) => s.id !== id))} />}
          {tab === 'schedule' && <Schedule schedule={schedule} form={scheduleForm} setForm={setScheduleForm} editing={editingSchedule} setEditing={setEditingSchedule} onSubmit={saveSchedule} onDelete={(id) => setSchedule((items) => items.filter((slot) => slot.id !== id))} />}
          {tab === 'announcements' && <Announcements announcements={announcements} form={announcementForm} setForm={setAnnouncementForm} onSubmit={addAnnouncement} onDelete={(id) => setAnnouncements((items) => items.filter((item) => item.id !== id))} />}
          {tab === 'leaderboard' && <Leaderboard students={students} />}
        </main>
      ) : (
        <StudentPortal
          input={portalInput}
          setInput={(value) => { setPortalInput(value); if (portalError) setPortalError('') }}
          login={login}
          student={portalStudent}
          error={portalError}
          sessions={sessions}
          schedule={schedule}
          announcements={announcements}
          onLogout={() => { setPortalStudent(null); setPortalInput('') }}
        />
      )}

      {showStudent && (
        <Modal title="إضافة طالب جديد" onClose={() => setShowStudent(false)}>
          <form onSubmit={addStudent} className="form-grid">
            {[
              ['name', 'اسم الطالب الثلاثي'],
              ['phone', 'رقم الطالب'],
              ['parentPhone', 'رقم ولي الأمر']
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  className="dark-styled-input"
                  required={key !== 'phone'}
                  value={studentForm[key]}
                  onChange={(e) => setStudentForm({ ...studentForm, [key]: e.target.value })}
                  placeholder={key === 'name' ? 'مثال: محمد أحمد' : '010xxxxxxxx'}
                />
              </label>
            ))}
            <label>الصف
              <select className="dark-styled-input" value={studentForm.grade} onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}>
                <option value="1sec">أولى ثانوي</option>
                <option value="2sec">تانية ثانوي</option>
                <option value="3sec">تالتة ثانوي</option>
              </select>
            </label>
            <label>السنتر
              <input className="dark-styled-input" value={studentForm.center} onChange={(e) => setStudentForm({ ...studentForm, center: e.target.value })} />
            </label>
            <button className="primary full" type="submit">حفظ الطالب وتوليد الكود</button>
          </form>
        </Modal>
      )}

      {editingStudent && (
        <Modal title="تعديل بيانات الطالب" onClose={() => setEditingStudent(null)}>
          <form onSubmit={(e) => {
            e.preventDefault();
            setStudents((currentStudents) => currentStudents.map((student) => student.id === editingStudent.id ? { ...student, ...editingStudent } : student));
            setOpenMenu(null);
            setEditingStudent(null);
          }} className="form-grid">
            {[
              ['name', 'اسم الطالب الثلاثي'],
              ['phone', 'رقم الطالب'],
              ['parentPhone', 'رقم ولي الأمر'],
              ['center', 'السنتر']
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  className="dark-styled-input"
                  required={key !== 'phone'}
                  value={editingStudent[key] || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, [key]: e.target.value })}
                />
              </label>
            ))}
            <label>الصف
              <select className="dark-styled-input" value={editingStudent.grade} onChange={(e) => setEditingStudent({ ...editingStudent, grade: e.target.value })}>
                <option value="1sec">أولى ثانوي</option>
                <option value="2sec">تانية ثانوي</option>
                <option value="3sec">تالتة ثانوي</option>
              </select>
            </label>
            <button className="primary full" type="submit">حفظ التعديلات</button>
          </form>
        </Modal>
      )}

      {showSession && (
        <Modal title="إنشاء حصة جديدة" onClose={() => setShowSession(false)}>
          <form onSubmit={addSession} className="form-grid">
            <label className="wide">عنوان الحصة
              <input className="dark-styled-input" required value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
            </label>
            <label>الصف
              <select className="dark-styled-input" value={sessionForm.grade} onChange={(e) => setSessionForm({ ...sessionForm, grade: e.target.value })}>
                <option value="1sec">أولى ثانوي</option>
                <option value="2sec">تانية ثانوي</option>
                <option value="3sec">تالتة ثانوي</option>
              </select>
            </label>
            <label>السنتر
              <input className="dark-styled-input" value={sessionForm.center} onChange={(e) => setSessionForm({ ...sessionForm, center: e.target.value })} />
            </label>
            <label>الدرجة الكلية
              <input className="dark-styled-input" type="number" min="1" value={sessionForm.max} onChange={(e) => setSessionForm({ ...sessionForm, max: e.target.value })} />
            </label>
            <label className="wide">اسم الشيت أو الرابط
              <input className="dark-styled-input" value={sessionForm.sheet} onChange={(e) => setSessionForm({ ...sessionForm, sheet: e.target.value })} placeholder="PDF أو رابط الملف" />
            </label>
            <label className="wide">الواجب المطلوب
              <input className="dark-styled-input" value={sessionForm.homework} onChange={(e) => setSessionForm({ ...sessionForm, homework: e.target.value })} />
            </label>
            <label className="wide">رابط الفيديو أو تسجيل الحصة
              <input className="dark-styled-input" type="url" value={sessionForm.video} onChange={(e) => setSessionForm({ ...sessionForm, video: e.target.value })} placeholder="https://..." />
            </label>
            <button className="primary full" type="submit">إنشاء الحصة</button>
          </form>
        </Modal>
      )}

      {editingSession && (
        <Modal title="تعديل بيانات الحصة" onClose={() => setEditingSession(null)}>
          <form onSubmit={saveSession} className="form-grid">
            <label className="wide">عنوان الحصة
              <input className="dark-styled-input" required value={editingSession.title || ''} onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })} />
            </label>
            <label>الصف
              <select className="dark-styled-input" value={editingSession.grade || '3sec'} onChange={(e) => setEditingSession({ ...editingSession, grade: e.target.value })}>
                <option value="1sec">أولى ثانوي</option>
                <option value="2sec">تانية ثانوي</option>
                <option value="3sec">تالتة ثانوي</option>
              </select>
            </label>
            <label>السنتر
              <input className="dark-styled-input" value={editingSession.center || ''} onChange={(e) => setEditingSession({ ...editingSession, center: e.target.value })} />
            </label>
            <label>الدرجة الكلية
              <input className="dark-styled-input" type="number" min="1" value={editingSession.max ?? 20} onChange={(e) => setEditingSession({ ...editingSession, max: e.target.value })} />
            </label>
            <label className="wide">اسم الشيت أو الرابط
              <input className="dark-styled-input" value={editingSession.sheet || ''} onChange={(e) => setEditingSession({ ...editingSession, sheet: e.target.value })} placeholder="اتركه فارغاً لإزالة الشيت" />
            </label>
            <label className="wide">الواجب المطلوب
              <input className="dark-styled-input" value={editingSession.homework || ''} onChange={(e) => setEditingSession({ ...editingSession, homework: e.target.value })} />
            </label>
            <label className="wide">رابط الفيديو أو تسجيل الحصة
              <input className="dark-styled-input" type="url" value={editingSession.video || ''} onChange={(e) => setEditingSession({ ...editingSession, video: e.target.value })} placeholder="https://..." />
            </label>
            <button className="primary full" type="submit">حفظ التعديلات</button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Directory({ students, onDelete, onEdit, onAdd, openMenu, setOpenMenu, menuRef }) {
  const sendWhatsApp = (student) => {
    const phone = String(student.parentPhone || '').replace(/[^0-9]/g, '')
    if (!phone) return
    const message = `السلام عليكم ولي أمر الطالب/ة ${student.name} (كود الطالب: ${student.id})، هذا تقرير مختصر عن متابعة الطالب في مركز مستر محمد مارك.`
    window.open(`https://wa.me/${phone.startsWith('20') ? phone : `20${phone.replace(/^0/, '')}`}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="directory">
      <div className="section-title">
        <div>
          <div className="eyebrow"><Users /> قاعدة البيانات</div>
          <h2>دليل الطلاب</h2>
          <p>كل ملفات طلابك في مكان واحد مع الكود الخاص بكل طالب.</p>
        </div>
        <button className="primary" onClick={onAdd}><UserPlus /> تسجيل طالب</button>
      </div>
      <div className="student-grid">
        {students.map((s) => (
          <article className="directory-card" key={s.id}>
            <div className="card-top">
              <div className="avatar large">{s.name.slice(0, 1)}</div>
              <div className="action-menu" ref={openMenu === s.id ? menuRef : null}>
                <button
                  type="button"
                  className="more"
                  aria-label={`إجراءات ${s.name}`}
                  aria-expanded={openMenu === s.id}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setOpenMenu((current) => current === s.id ? null : s.id) }}
                >
                  <MoreHorizontal />
                </button>
                {openMenu === s.id && (
                  <div className="action-popover" role="menu" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                    <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); onEdit(s) }}>تعديل البيانات</button>
                    <button type="button" role="menuitem" onClick={() => { setOpenMenu(null); sendWhatsApp(s) }}>إرسال واتساب</button>
                    <button type="button" role="menuitem" className="delete-action" onClick={() => { setOpenMenu(null); onDelete(s.id) }}>حذف الطالب</button>
                  </div>
                )}
              </div>
            </div>
            <h3>{s.name}</h3>
            <p><b>الكود: {s.id}</b> · {gradeLabels[s.grade]}</p>
            <div className="card-meta">
              <span>{s.center}</span>
              <b><Award /> {s.points}</b>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Sessions({ sessions, onAdd, onEdit, onDelete }) {
  return (
    <section className="directory">
      <div className="section-title">
        <div>
          <div className="eyebrow"><FileText /> المحتوى التعليمي</div>
          <h2>الحصص والشيتات</h2>
          <p>جهّز محتوى كل حصة وشاركه بسهولة.</p>
        </div>
        <button className="primary" onClick={onAdd}><Plus /> حصة جديدة</button>
      </div>
      <div className="session-grid">
        {sessions.map((s) => (
          <article className="session-card" key={s.id}>
            <div className="session-icon"><BookOpen /></div>
            <div className="card-top">
              <span className="badge blue">{gradeLabels[s.grade]}</span>
              <div className="session-actions">
                <button type="button" className="icon-action" aria-label="تعديل الحصة" onClick={() => onEdit({ ...s })}><Edit3 /></button>
                <button type="button" className="danger" aria-label="حذف الحصة" onClick={() => onDelete(s.id)}><Trash2 /></button>
              </div>
            </div>
            <h3>{s.title}</h3>
            <p>{s.date} · سنتر {s.center}</p>
            <div className="resource"><FileText /> {s.sheet || 'لم يتم رفع شيت'} {s.sheet && <Download />}</div>
            <div className="resource"><ClipboardList /> {s.homework || 'لا يوجد واجب'}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Schedule({ schedule, form, setForm, editing, setEditing, onSubmit, onDelete }) {
  const days = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
  const update = (key, value) => setForm({ ...form, [key]: value })
  return (
    <section className="directory">
      <div className="section-title">
        <div>
          <div className="eyebrow"><CalendarDays /> التخطيط الأسبوعي</div>
          <h2>جدول الحصص الأسبوعي</h2>
          <p>أضف وعدّل مواعيد المجموعات، وستظهر فوراً للطلاب حسب الصف.</p>
        </div>
      </div>
      <form className="schedule-editor" onSubmit={onSubmit}>
        <select className="dark-styled-input" aria-label="اليوم" value={form.day} onChange={(e) => update('day', e.target.value)}>
          {days.map((day) => <option key={day}>{day}</option>)}
        </select>
        <input className="dark-styled-input" aria-label="اسم السنتر" value={form.center} onChange={(e) => update('center', e.target.value)} placeholder="اسم السنتر" />
        <select className="dark-styled-input" aria-label="الصف الدراسي" value={form.grade} onChange={(e) => update('grade', e.target.value)}>
          <option value="1sec">أولى ثانوي</option>
          <option value="2sec">تانية ثانوي</option>
          <option value="3sec">تالتة ثانوي</option>
        </select>
        <input className="dark-styled-input" aria-label="المادة" value={form.subject} onChange={(e) => update('subject', e.target.value)} placeholder="المادة" />
        <input className="dark-styled-input" aria-label="ميعاد الحصة" value={form.time} onChange={(e) => update('time', e.target.value)} placeholder="05:00 م" />
        <button className="primary" type="submit"><Plus /> {editing ? 'حفظ التعديل' : 'إضافة للجدول'}</button>
        {editing && (
          <button className="secondary" type="button" onClick={() => { setEditing(null); setForm({ day: 'السبت', center: 'النور', grade: '3sec', subject: 'English', time: '05:00 م' }) }}>إلغاء</button>
        )}
      </form>
      <div className="schedule-grid">
        {days.map((day) => (
          <article className="schedule-day" key={day}>
            <h3>{day}</h3>
            {schedule.filter((slot) => slot.day === day).map((slot) => (
              <div className="schedule-slot" key={slot.id}>
                <span>{slot.time}</span>
                <strong>{slot.center}</strong>
                <small>{slot.subject} · {gradeLabels[slot.grade]}</small>
                <div className="schedule-actions">
                  <button type="button" onClick={() => { setEditing({ ...slot }); setForm({ ...slot }) }}>تعديل</button>
                  <button type="button" onClick={() => onDelete(slot.id)}>حذف</button>
                </div>
              </div>
            ))}
            {!schedule.some((slot) => slot.day === day) && (
              <div className="schedule-slot muted"><small>لا توجد حصة مسجلة</small></div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function Announcements({ announcements, form, setForm, onSubmit, onDelete }) {
  return (
    <section className="directory">
      <div className="section-title">
        <div>
          <div className="eyebrow"><Bell /> التواصل</div>
          <h2>الإشعارات والتنبيهات</h2>
          <p>انشر تنبيهات تظهر فوراً في بوابة الطالب.</p>
        </div>
      </div>
      <form className="announcement-form" onSubmit={onSubmit}>
        <input className="dark-styled-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الإعلان" />
        <input className="dark-styled-input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="اكتب تفاصيل الإعلان" />
        <button className="primary" type="submit"><Plus /> نشر الإعلان</button>
      </form>
      <div className="announcement-list">
        {announcements.map((item) => (
          <article className="announcement-card" key={item.id}>
            <div className="announcement-icon"><Bell /></div>
            <div>
              <span className="badge blue">{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
            <button className="danger" onClick={() => onDelete(item.id)}><Trash2 /></button>
          </article>
        ))}
      </div>
    </section>
  )
}

function Leaderboard({ students }) {
  return (
    <section className="directory">
      <div className="section-title">
        <div>
          <div className="eyebrow"><Award /> التحفيز</div>
          <h2>لوحة الأوائل</h2>
          <p>كافئ التقدم وحافظ على حماس طلابك.</p>
        </div>
      </div>
      <div className="leaderboard">
        {[...students].sort((a, b) => b.points - a.points).map((s, i) => (
          <div className="leader" key={s.id}>
            <span className={`rank r${i + 1}`}>{i + 1}</span>
            <div className="avatar">{s.name.slice(0, 1)}</div>
            <strong>{s.name}<small>{s.id}</small></strong>
            <b><Award /> {s.points} نقطة</b>
          </div>
        ))}
      </div>
    </section>
  )
}

function StudentPortal({ input, setInput, login, student, error, sessions, schedule, announcements, onLogout }) {
  return (
    <main className="portal page portal-mobile-fix">
      <div className="portal-glow" />
      
      {!student ? (
        <div className="portal-login-wrapper">
          <section className="portal-hero">
            <div className="brand-mark"><BookOpen /></div>
            <div className="eyebrow"><Sparkles /> بوابة الطالب</div>
            <h2>كل تقدّمك،<br /><em>في مكان واحد.</em></h2>
            <p>تابع حضورك ودرجاتك وملفات الحصص مع Mr. Mohammed Marc.</p>
          </section>

          <form className="login-card" onSubmit={login}>
            <div className="login-icon"><Lock /></div>
            <h3>دخول الطالب</h3>
            <p>اكتب الكود الخاص بك (مثل MM-1005) أو رقم الهاتف للوصول إلى ملفك.</p>
            {error && <div className="login-error" role="alert">{error}</div>}
            <label>الكود أو رقم الهاتف
              <input className="dark-styled-input" autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="MM-1001 أو رقم الهاتف" />
            </label>
            <button className="primary full">دخول إلى ملفي <ChevronDown /></button>
            <div className="portal-hints">
              <small>للتجربة السريعة: استخدم الكود <b>MM-1001</b> أو <b>MM-1005</b></small>
            </div>
          </form>
        </div>
      ) : (
        <section className="profile-card mobile-full-profile">
          <div className="profile-top-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span className="badge green">طالب نشط</span>
            <button className="secondary" onClick={onLogout} style={{ padding: '4px 10px', fontSize: '11px' }}>تسجيل الخروج</button>
          </div>
          <div className="profile-head">
            <div className="avatar huge">{student.name.slice(0, 1)}</div>
            <div>
              <h3>{student.name}</h3>
              <p>{student.id} · {gradeLabels[student.grade]} · سنتر {student.center}</p>
            </div>
            <div className="points">
              <Award />
              <strong>{student.points}</strong>
              <span>نقطة</span>
            </div>
          </div>
          <div className="profile-stats">
            <div><strong>96%</strong><span>نسبة الحضور</span></div>
            <div><strong>18.5</strong><span>متوسط الاختبارات</span></div>
            <div><strong>{sessions.length}</strong><span>الحصص المسجلة</span></div>
          </div>
          <div className="portal-schedule">
            <h4><CalendarDays /> جدول حصصي الأسبوعي</h4>
            {schedule.filter((slot) => slot.grade === student.grade).length ? (
              schedule.filter((slot) => slot.grade === student.grade).map((slot) => (
                <div className="portal-schedule-row" key={slot.id}>
                  <strong>{slot.day}</strong>
                  <span>{slot.time}</span>
                  <span>{slot.center} · {slot.subject}</span>
                </div>
              ))
            ) : (
              <p>لا توجد مواعيد مسجلة لصفك حالياً.</p>
            )}
          </div>
          {announcements.length > 0 && (
            <div className="portal-announcements">
              <h4><Bell /> الإشعارات</h4>
              {announcements.slice(0, 2).map((item) => (
                <div key={item.id}>
                  <b>{item.title}</b>
                  <span>{item.body}</span>
                </div>
              ))}
            </div>
          )}
          <h4>آخر الحصص والملفات</h4>
          {sessions.filter((s) => s.grade === student.grade).map((s) => (
            <div className="portal-session" key={s.id}>
              <div className="session-icon">{s.video ? <PlayCircle /> : <FileText />}</div>
              <div>
                <strong>{s.title}</strong>
                <span>{s.date} · {s.sheet || 'لا يوجد ملف'}</span>
              </div>
              <div className="portal-actions">
                {s.video && <a className="download" href={s.video} target="_blank" rel="noreferrer"><PlayCircle /> مشاهدة</a>}
                {s.sheet && s.sheet.startsWith('http') ? (
                  <a className="download" href={s.sheet} target="_blank" rel="noreferrer"><Download /> تحميل</a>
                ) : (
                  <span className="download disabled"><Download /> غير متاح</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
