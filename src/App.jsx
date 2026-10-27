import { useEffect, useMemo, useRef, useState } from 'react'
import { Award, BookOpen, Check, CheckCircle2, ChevronDown, ClipboardList, Download, FileText, Filter, LayoutDashboard, Lock, MessageCircle, MoreHorizontal, Plus, Trash2, UserPlus, Users, X } from 'lucide-react'

// ملحوظة: هذا الكود الكامل المحدث لملف App.jsx مع تفعيل زر الثلاث نقاط والتعديل والحذف بشكل سليم.

const gradeLabels = {
  1: 'الصف الأول الثانوي',
  2: 'الصف الثاني الثانوي',
  3: 'الصف الثالث الثانوي'
}

export default function App() {
  const [students, setStudents] = useState([
    { id: 'MM-1001', name: 'أحمد محمد علي', grade: '1', center: 'النور', points: 19, parentPhone: '01012345678' },
    { id: 'MM-1002', name: 'محمود أحمد حسن', grade: '2', center: 'النور', points: 14, parentPhone: '01098765432' }
  ]);
  
  const [sessions, setSessions] = useState([
    { id: 1, title: 'الحصة الأولى', grade: '1', center: 'النور', date: '2026-06-01', sheet: 'شيت 1', homework: 'حل الواجب' }
  ]);

  const [openMenu, setOpenMenu] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, []);

  const handleDeleteStudent = (studentId) => {
    if (confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
      setStudents(students.filter(s => s.id !== studentId));
      setOpenMenu(null);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
  };

  const sendWhatsApp = (student) => {
    const phone = String(student.parentPhone || '').replace(/[^0-9]/g, '');
    if (!phone) return;
    const message = `السلام عليكم ولي أمر الطالب/ة ${student.name}، هذا تقرير مختصر عن متابعة الطالب في مركز مستر محمد مارك.`;
    window.open(`https://wa.me/${phone.startsWith('20') ? phone : `20${phone.replace(/^0/, '')}`}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 dir-rtl text-right">
      <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">منصة مستر محمد مارك</h1>
          <p className="text-sm text-slate-400">لوحة التحكم وإدارة الطلاب</p>
        </div>
      </header>

      {/* قسم دليل الطلاب والجدول */}
      <section className="directory space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Users /> دليل الطلاب</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((s) => (
            <article key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative shadow-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  {s.name.slice(0, 1)}
                </div>

                {/* قائمة الثلاث نقاط الفعالة */}
                <div className="relative" ref={openMenu === s.id ? menuRef : null}>
                  <button
                    type="button"
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(openMenu === s.id ? null : s.id);
                    }}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {openMenu === s.id && (
                    <div className="absolute left-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-right">
                      <button
                        type="button"
                        onClick={() => { setOpenMenu(null); setEditingStudent(s); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors flex justify-between items-center"
                      >
                        <span>تعديل البيانات</span>
                        <span>✏️</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOpenMenu(null); sendWhatsApp(s); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors flex justify-between items-center"
                      >
                        <span>إرسال واتساب</span>
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOpenMenu(null); handleDeleteStudent(s.id); }}
                        className="w-full text-right px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors flex justify-between items-center"
                      >
                        <span>حذف الطالب</span>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{s.name}</h3>
              <p className="text-sm text-slate-400 mb-3">{s.id} · {gradeLabels[s.grade] || s.grade}</p>
              
              <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-800/80">
                <span className="text-slate-300">السنتر: {s.center}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1"><Award className="w-4 h-4" /> {s.points} نقطة</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* مودال التعديل */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">تعديل بيانات الطالب</h3>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">اسم الطالب</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">السنتر / المجموعة</label>
                <input
                  type="text"
                  value={editingStudent.center}
                  onChange={(e) => setEditingStudent({ ...editingStudent, center: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">رقم ولي الأمر</label>
                <input
                  type="text"
                  value={editingStudent.parentPhone || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
