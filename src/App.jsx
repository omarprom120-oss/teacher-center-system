@@ -1,4 +1,4 @@
import { useEffect, useMemo, useState } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Award, BookOpen, Check, CheckCircle2, ChevronDown, ClipboardList, Download,
  FileText, Filter, LayoutDashboard, Lock, MessageCircle, MoreHorizontal,
@@ -81,7 +81,24 @@ export default function App() {

function Directory({ students, onDelete, onEdit, onAdd }) {
  const [openMenu, setOpenMenu] = useState(null)
  return <section className="directory"><div className="section-title"><div><div className="eyebrow"><Users /> قاعدة البيانات</div><h2>دليل الطلاب</h2><p>كل ملفات طلابك في مكان واحد.</p></div><button className="primary" onClick={onAdd}><UserPlus /> تسجيل طالب</button></div><div className="student-grid">{students.map((s) => <article className="directory-card" key={s.id}><div className="card-top"><div className="avatar large">{s.name.slice(0,1)}</div><div className="action-menu"><button type="button" className="more" aria-label={`إجراءات ${s.name}`} aria-expanded={openMenu === s.id} onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === s.id ? null : s.id) }}><MoreHorizontal /></button>{openMenu === s.id && <div className="action-popover" role="menu"><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); onEdit(s) }}>تعديل البيانات</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); window.alert(`تقرير الطالب: ${s.name}`) }}>عرض التقرير</button><button type="button" role="menuitem" className="delete-action" onClick={() => { setOpenMenu(null); onDelete(s.id) }}>حذف الطالب</button></div>}</div></div><h3>{s.name}</h3><p>{s.id} · {gradeLabels[s.grade]}</p><div className="card-meta"><span>{s.center}</span><b><Award /> {s.points}</b></div></article>)}</div></section>
  const menuRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenu(null)
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  const sendWhatsApp = (student) => {
    const phone = String(student.parentPhone || '').replace(/[^0-9]/g, '')
    if (!phone) return
    const message = `السلام عليكم ولي أمر الطالب/ة ${student.name}، هذا تقرير مختصر عن متابعة الطالب في مركز مستر محمد مارك.`
    window.open(`https://wa.me/${phone.startsWith('20') ? phone : `20${phone.replace(/^0/, '')}`}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  return <section className="directory"><div className="section-title"><div><div className="eyebrow"><Users /> قاعدة البيانات</div><h2>دليل الطلاب</h2><p>كل ملفات طلابك في مكان واحد.</p></div><button className="primary" onClick={onAdd}><UserPlus /> تسجيل طالب</button></div><div className="student-grid">{students.map((s) => <article className="directory-card" key={s.id}><div className="card-top"><div className="avatar large">{s.name.slice(0,1)}</div><div className="action-menu" ref={openMenu === s.id ? menuRef : null}><button type="button" className="more" aria-label={`إجراءات ${s.name}`} aria-expanded={openMenu === s.id} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setOpenMenu((current) => current === s.id ? null : s.id) }}><MoreHorizontal /></button>{openMenu === s.id && <div className="action-popover" role="menu" onPointerDown={(e) => e.stopPropagation()}><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); onEdit(s) }}>تعديل البيانات</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); sendWhatsApp(s) }}>إرسال واتساب</button><button type="button" role="menuitem" onClick={() => { setOpenMenu(null); window.alert(`تقرير الطالب: ${s.name}`) }}>عرض التقرير</button><button type="button" role="menuitem" className="delete-action" onClick={() => { setOpenMenu(null); onDelete(s.id) }}>حذف الطالب</button></div>}</div></div><h3>{s.name}</h3><p>{s.id} · {gradeLabels[s.grade]}</p><div className="card-meta"><span>{s.center}</span><b><Award /> {s.points}</b></div></article>)}</div></section>
}
function Sessions({ sessions, onAdd, onDelete }) { return <section className="directory"><div className="section-title"><div><div className="eyebrow"><FileText /> المحتوى ا��تعليمي</div><h2>الحصص والشيتات</h2><p>جهّز محتوى كل حصة وشاركه بسهولة.</p></div><button className="primary" onClick={onAdd}><Plus /> حصة جديدة</button></div><div className="session-grid">{sessions.map((s) => <article className="session-card" key={s.id}><div className="session-icon"><BookOpen /></div><div className="card-top"><span className="badge blue">{gradeLabels[s.grade]}</span><button className="danger" onClick={() => onDelete(s.id)}><Trash2 /></button></div><h3>{s.title}</h3><p>{s.date} · سنتر {s.center}</p><div className="resource"><FileText /> {s.sheet || 'لم يتم رفع شيت'} <Download /></div><div className="resource"><ClipboardList /> {s.homework || 'لا يوجد واجب'}</div></article>)}</div></section> }
function Leaderboard({ students }) { return <section className="directory"><div className="section-title"><div><div className="eyebrow"><Award /> التحفيز</div><h2>لوحة الأوائل</h2><p>كافئ التقدم وحافظ على حماس طلابك.</p></div></div><div className="leaderboard">{[...students].sort((a,b) => b.points-a.points).map((s, i) => <div className="leader" key={s.id}><span className={`rank r${i+1}`}>{i+1}</span><div className="avatar">{s.name.slice(0,1)}</div><strong>{s.name}<small>{s.id}</small></strong><b><Award /> {s.points} نقطة</b></div>)}</div></section> }
