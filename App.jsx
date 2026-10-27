import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, CheckCircle2, Clock, XCircle, Send, Award, BookOpen, 
  Search, FileText, Download, ShieldCheck, MessageSquare, Plus, Trash2, 
  ExternalLink, Sparkles, Filter, Lock, Unlock, Check, Eye, UserCheck, Phone, RefreshCw, MoreHorizontal, Edit3
} from 'lucide-react';

const INITIAL_STUDENTS = [
  { id: 'ST-1001', name: 'أحمد محمد علي', grade: '3sec', center: 'سنتر النور - الأحد 6م', phone: '01012345678', parentPhone: '01098765432', points: 155 },
  { id: 'ST-1002', name: 'محمود أحمد حسن', grade: '3sec', center: 'سنتر النور - الأحد 6م', phone: '01123456789', parentPhone: '01187654321', points: 120 },
  { id: 'ST-1003', name: 'مريم محمود إبراهيم', grade: '2sec', center: 'سنتر التفوق - الإثنين 4ع', phone: '01234567890', parentPhone: '01276543210', points: 180 }
];

const INITIAL_SESSIONS = [
  {
    id: 'SESS-101',
    title: 'الحصة الأولى - شرح الباب الأول والفيزياء الحديثة',
    grade: '3sec',
    center: 'سنتر النور - الأحد 6م',
    date: '2026-10-28',
    maxExamScore: 20,
    sheetName: 'شيت ملخص القانون والمسائل.pdf',
    homeworkName: 'حل تمارين كتاب الامتحان ص 15-20',
    attendanceRecords: {
      'ST-1001': { status: 'present', examScore: 19, homeworkDone: true },
      'ST-1002': { status: 'late', examScore: 14, homeworkDone: false }
    }
  }
];

export default function App() {
  const [appMode, setAppMode] = useState('admin'); // 'admin' | 'student-portal'
  const [adminTab, setAdminTab] = useState('attendance'); // 'attendance', 'students', 'sessions', 'leaderboard'

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('teacher_students_v4');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('teacher_sessions_v4');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  useEffect(() => {
    localStorage.setItem('teacher_students_v4', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('teacher_sessions_v4', JSON.stringify(sessions));
  }, [sessions]);

  const [currentSessionId, setCurrentSessionId] = useState(sessions[0]?.id || '');
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  const [filterGrade, setFilterGrade] = useState('3sec');
  const [filterCenter, setFilterCenter] = useState('سنتر النور - الأحد 6م');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown menu state & ref for action buttons
  const [openMenu, setOpenMenu] = useState(null);
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

  // modals
  const [newStudent, setNewStudent] = useState({ name: '', grade: '3sec', center: 'سنتر النور - الأحد 6م', phone: '', parentPhone: '' });
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [newSessionData, setNewSessionData] = useState({ title: '', grade: '3sec', center: 'سنتر النور - الأحد 6م', maxExamScore: 20, sheetName: '', homeworkName: '' });
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);

  // Portal State
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [loggedInStudent, setLoggedInStudent] = useState(null);

  const generateStudentCode = () => `ST-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.parentPhone) {
      alert('يرجى كتابة اسم الطالب ورقم ولي الأمر');
      return;
    }
    const created = {
      ...newStudent,
      id: generateStudentCode(),
      points: 50
    };
    setStudents([created, ...students]);
    setNewStudent({ name: '', grade: '3sec', center: 'سنتر النور - الأحد 6م', phone: '', parentPhone: '' });
    setShowAddStudentModal(false);
    alert(`تم حفظ الطالب بنجاح! الكود الخاص به: ${created.id}`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب نهائياً؟')) {
      setStudents(students.filter(s => s.id !== id));
      setOpenMenu(null);
    }
  };

  const handleAddSessionSubmit = (e) => {
    e.preventDefault();
    if (!newSessionData.title) return;
    const createdSession = {
      id: `SESS-${Math.floor(100 + Math.random() * 900)}`,
      ...newSessionData,
      date: new Date().toISOString().split('T')[0],
      attendanceRecords: {}
    };
    setSessions([createdSession, ...sessions]);
    setCurrentSessionId(createdSession.id);
    setNewSessionData({ title: '', grade: '3sec', center: 'سنتر النور - الأحد 6م', maxExamScore: 20, sheetName: '', homeworkName: '' });
    setShowAddSessionModal(false);
    alert('تم إضافة الحصة والشيتات بنجاح!');
  };

  const updateAttendanceRecord = (studentId, field, value) => {
    if (!currentSession) return;
    const updatedRecords = { ...(currentSession.attendanceRecords || {}) };
    if (!updatedRecords[studentId]) {
      updatedRecords[studentId] = { status: 'present', examScore: 0, homeworkDone: true };
    }
    updatedRecords[studentId][field] = value;

    if (field === 'status' && value === 'present') {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, points: s.points + 10 } : s));
    }

    setSessions(sessions.map(s => s.id === currentSession.id ? { ...s, attendanceRecords: updatedRecords } : s));
  };

  const sendWhatsappToParent = (student) => {
    const record = currentSession?.attendanceRecords?.[student.id] || { status: 'present', examScore: 0, homeworkDone: true };
    const phone = student.parentPhone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.startsWith('0') ? `2${phone}` : phone;

    let statusText = 'حاضر 🟢';
    if (record.status === 'late') statusText = 'متأخر 🟡';
    if (record.status === 'absent') statusText = 'غائب 🔴';

    const message = `السلام عليكم ورحمة الله وبركاته 🌹
تقرير الطالب: *${student.name}* (الكود: ${student.id})
حصة: *${currentSession.title}*

📌 حالة الحضور: *${statusText}*
📝 درجة الامتحان: *${record.examScore || 0} / ${currentSession.maxExamScore}*
📚 تسليم الواجب: *${record.homeworkDone ? 'تم التسليم ✅' : 'لم يسلم ❌'}*
⭐ إجمالي نقاط الطالب: *${student.points} نقطة*

شكرًا لمتابعتكم معنا! 🙏`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    setOpenMenu(null);
  };

  const handlePortalLogin = (e) => {
    e.preventDefault();
    const cleanKey = studentSearchInput.trim().toUpperCase();
    const found = students.find(s => s.id.toUpperCase() === cleanKey || s.phone === cleanKey || s.parentPhone === cleanKey);
    if (found) {
      setLoggedInStudent(found);
    } else {
      alert('لم نجد طالباً بهذا الكود أو الرقم المسجل!');
    }
  };

  const filteredStudents = students.filter(s => {
    const matchGrade = s.grade === filterGrade;
    const matchCenter = s.center === filterCenter;
    const matchQuery = !searchQuery || s.name.includes(searchQuery) || s.id.includes(searchQuery) || s.phone.includes(searchQuery);
    return matchGrade && matchCenter && matchQuery;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white">منصة الأستاذ لإدارة السنتر والطلاب</h1>
              <p className="text-xs text-slate-400">نظام إدارة حصص السنتر والواتساب البسيط المتكامل</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAppMode('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${appMode === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>لوحة الأدمن (المدرس)</span>
            </button>
            <button
              onClick={() => setAppMode('student-portal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${appMode === 'student-portal' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>رابط استعلام الطالب</span>
            </button>
          </div>
        </div>
      </header>

      {/* ADMIN MODE */}
      {appMode === 'admin' && (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setAdminTab('attendance')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تسجيل الحضور والتأخير</span>
            </button>
            <button
              onClick={() => setAdminTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>دليل الطلاب ({students.length})</span>
            </button>
            <button
              onClick={() => setAdminTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'sessions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-4 h-4" />
              <span>إدارة الحصص والشيتات ({sessions.length})</span>
            </button>
            <button
              onClick={() => setAdminTab('leaderboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'leaderboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>لوحة الأوائل والنقاط</span>
            </button>
          </div>

          {/* ATTENDANCE TAB */}
          {adminTab === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">الحصة المفعلة:</label>
                    <select
                      value={currentSessionId}
                      onChange={(e) => setCurrentSessionId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 font-bold outline-none"
                    >
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.title} ({s.center})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">تصفية الصف:</label>
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="1sec">الصف الأول الثانوي</option>
                      <option value="2sec">الصف الثاني الثانوي</option>
                      <option value="3sec">الصف الثالث الثانوي</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">البحث السريع:</label>
                    <input
                      type="text"
                      placeholder="اسم الطالب أو الكود..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddSessionModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>حصة جديدة</span>
                  </button>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>تسجيل طالب</span>
                  </button>
                </div>
              </div>

              {currentSession && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {currentSession.center}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-2">{currentSession.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">الدرجة الكلية للامتحان: <span className="text-amber-400 font-bold">{currentSession.maxExamScore} درجة</span></p>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                    <div>📄 شيت الحصة: <strong className="text-blue-400">{currentSession.sheetName || 'لا يوجد'}</strong></div>
                    <div>📚 الواجب المطلوب: <strong className="text-amber-400">{currentSession.homeworkName || 'لا يوجد'}</strong></div>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-800/90 text-slate-400 text-xs uppercase border-b border-slate-700">
                      <tr>
                        <th className="p-4">الكود</th>
                        <th className="p-4">اسم الطالب</th>
                        <th className="p-4">تسجيل الحضور</th>
                        <th className="p-4">درجة الامتحان</th>
                        <th className="p-4">الواجب</th>
                        <th className="p-4 text-center">الإجراءات (...)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-10 text-slate-500">
                            لا يوجد طلاب مطابقون للفحص الحالي.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map(student => {
                          const record = currentSession?.attendanceRecords?.[student.id] || { status: 'present', examScore: 0, homeworkDone: true };

                          return (
                            <tr key={student.id} className="hover:bg-slate-800/80 transition-colors">
                              <td className="p-4 font-mono font-bold text-blue-400">{student.id}</td>
                              <td className="p-4 font-bold text-white">
                                {student.name}
                                <div className="text-xs font-normal text-slate-400">⭐ {student.points} نقطة</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => updateAttendanceRecord(student.id, 'status', 'present')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${record.status === 'present' ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-slate-900 text-slate-400'}`}
                                  >
                                    حاضر
                                  </button>
                                  <button
                                    onClick={() => updateAttendanceRecord(student.id, 'status', 'late')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${record.status === 'late' ? 'bg-amber-600 text-white ring-2 ring-amber-400' : 'bg-slate-900 text-slate-400'}`}
                                  >
                                    متأخر
                                  </button>
                                  <button
                                    onClick={() => updateAttendanceRecord(student.id, 'status', 'absent')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${record.status === 'absent' ? 'bg-rose-600 text-white ring-2 ring-rose-400' : 'bg-slate-900 text-slate-400'}`}
                                  >
                                    غائب
                                  </button>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max={currentSession?.maxExamScore || 20}
                                    value={record.examScore ?? ''}
                                    onChange={(e) => updateAttendanceRecord(student.id, 'examScore', parseInt(e.target.value) || 0)}
                                    className="w-16 bg-slate-900 border border-slate-700 text-center text-amber-400 font-bold rounded-lg py-1 px-2 text-sm outline-none"
                                  />
                                  <span className="text-xs text-slate-500">/ {currentSession?.maxExamScore || 20}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={record.homeworkDone !== false}
                                    onChange={(e) => updateAttendanceRecord(student.id, 'homeworkDone', e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                                </label>
                              </td>
                              <td className="p-4 text-center relative">
                                <div className="relative inline-block" ref={openMenu === student.id ? menuRef : null}>
                                  <button
                                    type="button"
                                    className="p-2 hover:bg-slate-700/60 rounded-xl text-slate-300 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenu(openMenu === student.id ? null : student.id);
                                    }}
                                  >
                                    <MoreHorizontal className="w-5 h-5" />
                                  </button>

                                  {openMenu === student.id && (
                                    <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-right py-1">
                                      <button
                                        type="button"
                                        onClick={() => { setOpenMenu(null); setEditingStudent(student); }}
                                        className="w-full text-right px-4 py-2.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-between"
                                      >
                                        <span>تعديل البيانات</span>
                                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => sendWhatsappToParent(student)}
                                        className="w-full text-right px-4 py-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center justify-between"
                                      >
                                        <span>إرسال واتساب</span>
                                        <Send className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStudent(student.id)}
                                        className="w-full text-right px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center justify-between"
                                      >
                                        <span>حذف الطالب</span>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS MANAGEMENT TAB */}
          {adminTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <div>
                  <h2 className="text-base font-bold text-white">إدارة دليل الطلاب المركزية</h2>
                  <p className="text-xs text-slate-400">إضافة، حذف، وتغيير بيانات وأرقام أولياء الأمور</p>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>طالب جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => (
                  <div key={student.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-md space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{student.id}</span>
                        <h3 className="text-base font-bold text-white mt-1">{student.name}</h3>
                        <p className="text-xs text-slate-400">{student.center}</p>
                      </div>
                      
                      {/* Dropdown in student cards */}
                      <div className="relative" ref={openMenu === student.id ? menuRef : null}>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-slate-700/60 rounded-xl text-slate-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === student.id ? null : student.id);
                          }}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {openMenu === student.id && (
                          <div className="absolute left-0 mt-2 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-right py-1">
                            <button
                              type="button"
                              onClick={() => { setOpenMenu(null); setEditingStudent(student); }}
                              className="w-full text-right px-4 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                            >
                              <span>تعديل البيانات</span>
                              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => sendWhatsappToParent(student)}
                              className="w-full text-right px-4 py-2 text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-between"
                            >
                              <span>رسالة واتساب</span>
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(student.id)}
                              className="w-full text-right px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center justify-between"
                            >
                              <span>حذف الطالب</span>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300 pt-2 border-t border-slate-700">
                      <div>هاتف الطالب: <span className="font-mono font-semibold">{student.phone || 'غير مسجل'}</span></div>
                      <div>هاتف ولي الأمر: <span className="font-mono font-semibold text-emerald-400">{student.parentPhone}</span></div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <span className="text-amber-400 font-bold text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">⭐ {student.points} نقطة</span>
                      <button
                        onClick={() => sendWhatsappToParent(student)}
                        className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        مراسلة ولي الأمر
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SESSIONS & SHEETS TAB */}
          {adminTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <div>
                  <h2 className="text-base font-bold text-white">إدارة الحصص والمحتوى</h2>
                  <p className="text-xs text-slate-400">رفع الشيتات والواجبات المنزلية واختبارات الحصص</p>
                </div>
                <button
                  onClick={() => setShowAddSessionModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حصة جديدة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map(s => (
                  <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-slate-400 font-mono">{s.date}</span>
                        <h3 className="text-base font-bold text-white mt-1">{s.title}</h3>
                        <p className="text-xs text-blue-400">{s.center}</p>
                      </div>
                      <span className="text-xs bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl text-amber-400 font-bold">الدرجة: {s.maxExamScore}</span>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>📄 شيت الشرح والتدريبات:</span>
                        <span className="font-semibold text-blue-400">{s.sheetName || 'لم يرفع'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>📚 الواجب المنزلي:</span>
                        <span className="font-semibold text-amber-400">{s.homeworkName || 'لم يحدد'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {adminTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800 border border-amber-500/20 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  ترتيب الأوائل والطلاب الأكثر التزاماً
                </h2>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl divide-y divide-slate-700">
                {[...students].sort((a,b) => b.points - a.points).map((st, idx) => (
                  <div key={st.id} className="p-4 flex items-center justify-between hover:bg-slate-800/80">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs ${idx === 0 ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{st.name}</h4>
                        <span className="text-xs text-slate-400">{st.center} | كود: {st.id}</span>
                      </div>
                    </div>

                    <span className="text-amber-400 font-extrabold text-sm">⭐ {st.points} نقطة</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      )}

      {/* STUDENT PORTAL MODE */}
      {appMode === 'student-portal' && (
        <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 flex flex-col justify-center">
          {!loggedInStudent ? (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">بوابة استعلام الطالب والنتائج</h2>
                <p className="text-xs text-slate-400 mt-1">اكتب كود الطالب الخاص بك أو رقم تليفونك لمشاهدة شيتاتك وحضورك ودرجاتك</p>
              </div>

              <form onSubmit={handlePortalLogin} className="space-y-4 max-w-sm mx-auto">
                <input
                  type="text"
                  placeholder="أدخل كود الطالب (مثال ST-1001) أو رقم التليفون..."
                  value={studentSearchInput}
                  onChange={(e) => setStudentSearchInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-center text-sm rounded-xl py-3 px-4 outline-none focus:border-emerald-500 font-bold"
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg"
                >
                  دخول واستعلام
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-start justify-between border-b border-slate-700/60 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">{loggedInStudent.id}</span>
                  <h2 className="text-xl font-bold text-white mt-2">{loggedInStudent.name}</h2>
                  <p className="text-xs text-slate-400">{loggedInStudent.center}</p>
                </div>
                <div className="text-left">
                  <div className="text-amber-400 font-extrabold text-base">⭐ {loggedInStudent.points} نقطة</div>
                  <button
                    onClick={() => setLoggedInStudent(null)}
                    className="text-xs text-slate-400 hover:text-white mt-2 underline"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>

              {/* Sessions records for student */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200">سجل الحصص والشيتات والدرجات:</h3>
                {sessions.map(s => {
                  const rec = s.attendanceRecords?.[loggedInStudent.id] || { status: 'لم تسجل بعد', examScore: '-', homeworkDone: false };
                  return (
                    <div key={s.id} className="bg-slate-900/80 border border-slate-700/70 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white text-sm">{s.title}</h4>
                          <span className="text-xs text-slate-400">{s.date}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : rec.status === 'late' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                          {rec.status === 'present' ? 'حاضر ✅' : rec.status === 'late' ? 'متأخر 🟡' : 'غائب 🔴'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                        <div>درجة الامتحان: <strong className="text-amber-400">{rec.examScore} / {s.maxExamScore}</strong></div>
                        <div>الواجب المنزلي: <strong className={rec.homeworkDone ? 'text-emerald-400' : 'text-rose-400'}>{rec.homeworkDone ? 'تم التسليم' : 'لم يسلم'}</strong></div>
                      </div>

                      {s.sheetName && (
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">📄 شيت الحصة:</span>
                          <span className="text-blue-400 font-bold flex items-center gap-1 cursor-pointer hover:underline">
                            <Download className="w-3.5 h-3.5" />
                            تحميل {s.sheetName}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      {/* MODAL: ADD STUDENT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">تسجيل طالب جديد بالسنتر</h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">اسم الطالب الثلاثي:</label>
                <input
                  type="text"
                  required
                  placeholder="أحمد محمد علي"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">الصف الدراسي:</label>
                <select
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                >
                  <option value="1sec">الصف الأول الثانوي</option>
                  <option value="2sec">الصف الثاني الثانوي</option>
                  <option value="3sec">الصف الثالث الثانوي</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">المجموعة والسنتر:</label>
                <input
                  type="text"
                  value={newStudent.center}
                  onChange={(e) => setNewStudent({ ...newStudent, center: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">رقم تليفون الطالب (اختياري):</label>
                <input
                  type="text"
                  placeholder="01012345678"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">رقم ولي الأمر (للإشعارات والواتساب):</label>
                <input
                  type="text"
                  required
                  placeholder="01098765432"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  حفظ الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STUDENT */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">تعديل بيانات الطالب</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">اسم الطالب:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">المجموعة والسنتر:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.center}
                  onChange={(e) => setEditingStudent({ ...editingStudent, center: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">رقم ولي الأمر:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.parentPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SESSION */}
      {showAddSessionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">إضافة حصة وشيت جديد</h3>
            <form onSubmit={handleAddSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">عنوان الحصة / الدرس:</label>
                <input
                  type="text"
                  required
                  placeholder="الحصة الثانية - مراجعة الباب الثاني"
                  value={newSessionData.title}
                  onChange={(e) => setNewSessionData({ ...newSessionData, title: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">الدرجة النهائية للامتحان:</label>
                <input
                  type="number"
                  value={newSessionData.maxExamScore}
                  onChange={(e) => setNewSessionData({ ...newSessionData, maxExamScore: parseInt(e.target.value) || 20 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">اسم ملف الشيت (PDF):</label>
                <input
                  type="text"
                  placeholder="شيت الأسئلة والحلول.pdf"
                  value={newSessionData.sheetName}
                  onChange={(e) => setNewSessionData({ ...newSessionData, sheetName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">الواجب المطلوب تسليمه:</label>
                <input
                  type="text"
                  placeholder="حل مسائل ص 30 إلى 35"
                  value={newSessionData.homeworkName}
                  onChange={(e) => setNewSessionData({ ...newSessionData, homeworkName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSessionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl"
                >
                  إنشاء الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
