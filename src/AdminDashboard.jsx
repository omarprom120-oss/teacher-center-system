import React, { useEffect, useState } from 'react'

// The database RPC verifies auth.uid(); this screen is not an authorization boundary.
export default function AdminDashboard({ client, onLogout }) {
  const [state, setState] = useState({ loading: true, data: null, error: false })
  useEffect(() => {
    let active = true
    client.rpc('admin_read_dashboard').then(({ data, error }) => {
      if (!active) return
      setState(error || !data || typeof data !== 'object' ? { loading: false, data: null, error: true } : { loading: false, data, error: false })
    }).catch(() => { if (active) setState({ loading: false, data: null, error: true }) })
    return () => { active = false }
  }, [client])
  const students = Array.isArray(state.data?.['mm-students']) ? state.data['mm-students'] : []
  const sessions = Array.isArray(state.data?.['mm-sessions']) ? state.data['mm-sessions'] : []
  const schedule = Array.isArray(state.data?.['mm-schedule']) ? state.data['mm-schedule'] : []
  const announcements = Array.isArray(state.data?.['mm-announcements']) ? state.data['mm-announcements'] : []
  return <>
    <h1 id="notice-title">لوحة المدير</h1>
    <p>عرض للقراءة فقط. إضافة البيانات وتعديلها غير متاحين بعد.</p>
    <button onClick={onLogout}>تسجيل الخروج</button>
    {state.loading && <p>جارٍ تحميل البيانات…</p>}
    {state.error && <p role="alert">تعذر تحميل البيانات. تحقق من الجلسة والاتصال وحاول مجددًا.</p>}
    {state.data && <>
      <h2>الطلاب ({students.length})</h2>
      <ul>{students.map((s, i) => <li key={s.id || i}>{s.name} · {s.id} · {s.grade} · {s.center}</li>)}</ul>
      <h2>الحصص والحضور ({sessions.length})</h2>
      <ul>{sessions.map((s, i) => <li key={s.id || i}><strong>{s.title}</strong> · {s.date}
        <ul>{Object.entries(s.records || {}).map(([id, record]) => <li key={id}>{id} · {record?.status} · {record?.score} / {s.max}</li>)}</ul>
      </li>)}</ul>
      <h2>الجدول ({schedule.length})</h2>
      <ul>{schedule.map((s, i) => <li key={s.id || i}>{[s.day, s.time, s.center, s.grade, s.subject].filter(Boolean).join(' · ')}</li>)}</ul>
      <h2>الإعلانات ({announcements.length})</h2>
      <ul>{announcements.map((a, i) => <li key={a.id || i}>{a.title} · {a.body}</li>)}</ul>
    </>}
  </>
}
