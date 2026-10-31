import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { signInAdmin, verifiedAdmin } from './adminAuth.js'
import AdminDashboard from './AdminDashboard.jsx'
import './security-notice.css'

// The dashboard is read-only until secure editing is implemented.
// Publishable keys identify a project; they are not credentials or authorization.
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_xSHOop6CGqgyaasZ3mK5hA_0HXv98kO'
const supabase = key ? createClient('https://mmgitoaoolcodpvwqvzq.supabase.co', key) : null

export default function App() {
  const [adminRoute, setAdminRoute] = useState(() => typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#/admin')
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [publicData, setPublicData] = useState(null)
  const [publicError, setPublicError] = useState(false)

  useEffect(() => {
    const updateRoute = () => setAdminRoute(window.location.hash.toLowerCase() === '#/admin')
    window.addEventListener('hashchange', updateRoute)
    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  useEffect(() => {
    if (!supabase) { setStatus('unconfigured'); return }
    let mounted = true
    verifiedAdmin(supabase.auth).then(ok => { if (mounted) setStatus(ok ? 'verified' : 'signed-out') })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) setStatus('signed-out')
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (adminRoute || !supabase) return
    let mounted = true
    supabase.rpc('get_public_portal').then(({ data, error }) => {
      if (!mounted) return
      if (error || !data || !Array.isArray(data.schedule) || !Array.isArray(data.announcements)) {
        setPublicError(true)
      } else { setPublicData(data); setPublicError(false) }
    }).catch(() => { if (mounted) setPublicError(true) })
    return () => { mounted = false }
  }, [adminRoute])

  async function login(event) {
    event.preventDefault()
    setError('')
    setStatus('checking')
    try {
      const ok = await signInAdmin(supabase.auth, password)
      setStatus(ok ? 'verified' : 'signed-out')
      if (!ok) setError('تعذر تسجيل الدخول. تحقق من البيانات أو حاول لاحقًا.')
    } catch {
      setStatus('signed-out')
      setError('تعذر تسجيل الدخول. تحقق من الاتصال وحاول لاحقًا.')
    } finally { setPassword('') }
  }

  async function logout() {
    try { await supabase.auth.signOut() } finally { setStatus('signed-out') }
  }

  return <main className="security-notice" dir="rtl"><section aria-labelledby="notice-title">
    <p className="notice-label">Teacher Center OS</p>
    {adminRoute ? <>
      {status !== 'verified' && <h1 id="notice-title">دخول المدير</h1>}
      {status === 'unconfigured' && <p role="alert">لم يتم إعداد مفتاح Supabase العام للمنصة بعد.</p>}
      {status === 'checking' && <p>جارٍ التحقق من الجلسة…</p>}
      {status === 'signed-out' && <form onSubmit={login}>
        <label htmlFor="admin-password">كلمة مرور حساب المدير</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">تسجيل الدخول</button>
        {error && <p role="alert">{error}</p>}
      </form>}
      {status === 'verified' && <AdminDashboard client={supabase} onLogout={logout} />}
    </> : <><h1 id="notice-title">بوابة الطلاب</h1><p>الجدول والإعلانات العامة</p>
      {publicError && <p role="alert">تعذر تحميل البيانات العامة، يرجى المحاولة لاحقًا.</p>}
      {!publicData && !publicError && <p>جارٍ تحميل البيانات…</p>}
      {publicData && <>
        <h2>جدول الحصص</h2>
        {publicData.schedule.length ? <ul>{publicData.schedule.map((slot, i) => <li key={slot.id || i}>{[slot.day, slot.time, slot.center, slot.grade, slot.subject].filter(Boolean).join(' · ')}</li>)}</ul> : <p>لا يوجد جدول معلن.</p>}
        <h2>الإعلانات</h2>
        {publicData.announcements.length ? <ul>{publicData.announcements.map((item, i) => <li key={item.id || i}><strong>{item.title}</strong><p>{item.body}</p></li>)}</ul> : <p>لا توجد إعلانات حاليًا.</p>}
      </>}
      <p>الدرجات والحضور غير متاحين حاليًا لحماية خصوصيتك.</p><a href="#/admin">دخول المدير</a></>}

  </section></main>
}
