import React, { useState, useEffect } from 'react';
import { MOCK_PENDING_COACHES, MOCK_TRAINEES, MOCK_ACTIVE_COACHES, ADMIN_CONFIG } from '../constants';
import { ShieldCheck, Lock, User, CheckCircle, XCircle, CreditCard, Users, Activity, LogOut, FileText, Filter, Crown, ArrowUp, ArrowDown, AlertTriangle, RefreshCw, Search, Eye, Database, Loader2, Info, ExternalLink, DollarSign, Hash, Clipboard, Calendar } from 'lucide-react';
import { UserProfile, PaymentRequest } from '../types';
import { supabase } from '../supabaseConfig'; 
import { fetchTransactions, processPayment, fetchPendingCoaches, updateCoachVerificationStatus } from '../services/userData';

const SuperAdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- Data State ---
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'SUBSCRIPTIONS' | 'PAYMENTS' | 'USER_SEARCH'>('VERIFICATION');
  const [pendingCoaches, setPendingCoaches] = useState<UserProfile[]>([]);
  const [activeCoaches, setActiveCoaches] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<PaymentRequest[]>([]);
  const [subFilter, setSubFilter] = useState<'ALL' | 'PREMIUM' | 'FREE' | 'EXPIRED'>('ALL');

  // --- Payment Filter State ---
  const [txStatusFilter, setTxStatusFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [txDateSort, setTxDateSort] = useState<'DESC' | 'ASC'>('DESC');

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // --- RBAC & AUTH ---
  const checkAdminRole = async (user: any) => {
      // For Supabase, user roles can be in user_metadata or a separate table.
      // Assuming a simplistic check for this demo or meta data.
      if (user.id === ADMIN_CONFIG.SUPER_ADMIN_UID || user.email === 'admin@fitpro.ir') {
          setIsAuthenticated(true);
          loadAdminData();
      } else {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setError("دسترسی غیرمجاز: شما مدیر ارشد نیستید.");
      }
  };

  const loadAdminData = async () => {
      try {
        const coaches = await fetchPendingCoaches();
        setPendingCoaches(coaches);
        
        const allTx = await fetchTransactions();
        setTransactions(allTx);
      } catch (err) {
        console.error("Error loading admin data:", err);
      }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password
          });
          
          if (error) throw error;
          if (data.user) {
              await checkAdminRole(data.user);
          }
      } catch (err: any) {
          console.error(err);
          setError(err.message === 'Invalid login credentials' ? "نام کاربری یا رمز عبور اشتباه است." : err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail('');
      setPassword('');
  };

  useEffect(() => {
      const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
              checkAdminRole(session.user);
          }
      };
      checkSession();
  }, []);


  // --- VERIFICATION ACTIONS ---
  const handleVerifyCoach = async (coachId: string, action: 'VERIFY' | 'REJECT') => {
      if (!confirm(`آیا از ${action === 'VERIFY' ? 'تأیید' : 'رد'} این مربی اطمینان دارید؟`)) return;

      try {
          const status = action === 'VERIFY' ? 'Verified' : 'Rejected';
          await updateCoachVerificationStatus(coachId, status);
          
          alert(`درخواست مربی ${action === 'VERIFY' ? 'تأیید' : 'رد'} شد.`);
          
          // Update local state
          setPendingCoaches(prev => prev.filter(c => c.id !== coachId));
          
          if (action === 'VERIFY') {
              const coach = pendingCoaches.find(c => c.id === coachId);
              if (coach) {
                  setActiveCoaches(prev => [...prev, { ...coach, verificationStatus: 'Verified', isActive: true, subscriptionTier: 'Free', subscriptionStatus: 'Active' }]);
              }
          }
      } catch (err) {
          console.error(err);
          alert("خطا در بروزرسانی وضعیت.");
      }
  };

  const handleActivatePremium = (coachId: string) => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const expiryString = expiryDate.toLocaleDateString('fa-IR');

      setActiveCoaches(prev => prev.map(c => c.id === coachId ? {
          ...c,
          subscriptionTier: 'Premium',
          subscriptionStatus: 'Active',
          subscriptionExpiryDate: expiryString
      } : c));
      alert("اشتراک ویژه برای مربی فعال شد. (۳۰ روز اعتبار)");
  };

  const handleDowngrade = (coachId: string) => {
      if(confirm('آیا از تنزل اشتراک مربی به رایگان اطمینان دارید؟')) {
          setActiveCoaches(prev => prev.map(c => c.id === coachId ? {
              ...c,
              subscriptionTier: 'Free',
              subscriptionStatus: 'Active',
              subscriptionExpiryDate: undefined
          } : c));
      }
  };

  // --- PAYMENT PROCESSING ---
  const handleProcessPayment = async (req: PaymentRequest, action: 'Approved' | 'Rejected') => {
      if (!confirm(`آیا از ${action === 'Approved' ? 'تأیید' : 'رد'} این پرداخت اطمینان دارید؟`)) return;
      
      try {
          await processPayment(req.id, req.userId, action, req.months);
          setTransactions(prev => prev.map(p => p.id === req.id ? { ...p, status: action } : p));
          alert(`پرداخت ${action === 'Approved' ? 'تأیید' : 'رد'} شد.`);
      } catch (err) {
          alert("خطا در پردازش.");
      }
  };

  // --- PAYMENT FILTER LOGIC ---
  const filteredTransactions = transactions
    .filter(t => txStatusFilter === 'ALL' || t.status === txStatusFilter)
    .sort((a, b) => {
        const dateA = new Date(a.requestDate).getTime();
        const dateB = new Date(b.requestDate).getTime();
        return txDateSort === 'DESC' ? dateB - dateA : dateA - dateB;
    });

  // --- FILTER LOGIC ---
  const filteredCoaches = activeCoaches.filter(c => {
      if (subFilter === 'ALL') return true;
      if (subFilter === 'PREMIUM') return c.subscriptionTier === 'Premium' && c.subscriptionStatus === 'Active';
      if (subFilter === 'FREE') return c.subscriptionTier === 'Free';
      if (subFilter === 'EXPIRED') return c.subscriptionStatus === 'Expired';
      return true;
  });

  // --- SEARCH LOGIC ---
  const allUsers = [
      ...activeCoaches.map(c => ({ ...c, type: 'Coach' })),
      ...[]
  ];
  
  const searchResults = searchQuery.length > 1 
    ? allUsers.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (u as any).email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // --- STATS CALCULATION ---
  const activeSubscriptions = activeCoaches.filter(c => c.subscriptionTier === 'Premium' && c.subscriptionStatus === 'Active').length;
  const revenue = activeSubscriptions * 290000; 

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-red-900/20 text-center">
                  <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                      <Lock size={32} className="text-red-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">پنل مدیریت ارشد</h1>
                  <p className="text-slate-500 text-sm mb-8">دسترسی محدود به دامنه secure-admin.ir</p>
                  
                  {error && (
                      <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm animate-fade-in text-right">
                          <div className="flex items-start gap-2">
                              <AlertTriangle size={16} className="shrink-0 mt-1"/>
                              <span className="leading-relaxed">{error}</span>
                          </div>
                      </div>
                  )}
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                      <input 
                        type="email" 
                        placeholder="ایمیل مدیر" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors text-left dir-ltr"
                        required
                      />
                      <input 
                        type="password" 
                        placeholder="رمز عبور" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors text-left dir-ltr"
                        required
                      />
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {loading ? <Loader2 className="animate-spin" size={20}/> : 'ورود ایمن'}
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6" dir="rtl">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
                <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-900/30">
                    <ShieldCheck size={32} className="text-white"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">مرکز فرماندهی فیت پرو</h1>
                    <p className="text-red-400 text-xs font-mono mt-1">SUPER ADMIN ACCESS GRANTED</p>
                </div>
            </div>
            <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 hover:border-red-500 transition-colors"
            >
                <LogOut size={18} /> خروج
            </button>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">تراکنش‌های در انتظار</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold text-white">{transactions.filter(t => t.status === 'Pending').length}</h3>
                        <span className="text-yellow-400 text-sm flex items-center gap-1 mb-1"><Info size={14}/> نیاز به بررسی</span>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">درآمد ماهانه (فعال)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold text-emerald-400">{revenue.toLocaleString()}</h3>
                        <span className="text-slate-500 text-sm mb-1">تومان</span>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">درخواست‌های مربیگری</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-4xl font-bold text-yellow-400">{pendingCoaches.length}</h3>
                        <span className="text-slate-500 text-sm mb-1">منتظر تأیید</span>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <div className="flex gap-4 border-b border-slate-800 pb-1 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('PAYMENTS')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'PAYMENTS' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    تراکنش‌های مالی ({transactions.length})
                </button>
                <button 
                    onClick={() => setActiveTab('VERIFICATION')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'VERIFICATION' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    صف تأیید هویت ({pendingCoaches.length})
                </button>
                <button 
                    onClick={() => setActiveTab('SUBSCRIPTIONS')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'SUBSCRIPTIONS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    مدیریت اشتراک‌ها ({activeCoaches.length})
                </button>
                <button 
                    onClick={() => setActiveTab('USER_SEARCH')}
                    className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 whitespace-nowrap ${activeTab === 'USER_SEARCH' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-white'}`}
                >
                    جستجوی سراسری کاربران
                </button>
            </div>

            {/* TAB CONTENT: PAYMENTS */}
            {activeTab === 'PAYMENTS' && (
                <div className="space-y-6">
                    {/* Filtering Toolbar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-500" />
                            <span className="text-sm text-slate-300 font-bold">فیلتر وضعیت:</span>
                            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                {['Pending', 'Approved', 'Rejected', 'ALL'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setTxStatusFilter(status as any)}
                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${txStatusFilter === status ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {status === 'ALL' ? 'همه' : status === 'Pending' ? 'در انتظار' : status === 'Approved' ? 'تأیید شده' : 'رد شده'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:mr-auto">
                            <Calendar size={16} className="text-slate-500" />
                            <span className="text-sm text-slate-300 font-bold">مرتب‌سازی تاریخ:</span>
                            <button 
                                onClick={() => setTxDateSort(prev => prev === 'DESC' ? 'ASC' : 'DESC')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white hover:border-emerald-500 transition-colors"
                            >
                                {txDateSort === 'DESC' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                {txDateSort === 'DESC' ? 'جدیدترین اول' : 'قدیمی‌ترین اول'}
                            </button>
                        </div>
                    </div>

                     {filteredTransactions.length === 0 ? (
                         <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500">
                             <CreditCard size={48} className="mx-auto mb-4 opacity-20"/>
                             <p>تراکنشی با فیلترهای انتخاب شده یافت نشد.</p>
                             <button onClick={loadAdminData} className="text-emerald-400 text-xs mt-2 flex items-center justify-center gap-1 mx-auto hover:underline"><RefreshCw size={12}/> بروزرسانی لیست</button>
                         </div>
                     ) : (
                         <div className="grid grid-cols-1 gap-6">
                             {filteredTransactions.map(req => (
                                 <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-fade-in">
                                     {/* Transaction Info Card */}
                                     <div className="w-full md:w-1/3 bg-slate-950 rounded-xl p-5 border border-slate-700">
                                         <div className="flex items-center gap-2 text-emerald-400 mb-4">
                                             <Hash size={20} />
                                             <span className="font-bold">اطلاعات تراکنش</span>
                                         </div>
                                         
                                         <div className="space-y-3">
                                             <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 break-all">
                                                 <p className="text-[10px] text-slate-500 uppercase mb-1">Transaction Hash (TxID)</p>
                                                 <code className="text-xs font-mono text-white">{req.txId}</code>
                                             </div>
                                             
                                             <a 
                                                href={`https://tronscan.org/#/transaction/${req.txId}`}
                                                target="_blank"
                                                rel="noreferrer" 
                                                className="flex items-center justify-center gap-2 w-full bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors border border-blue-500/30"
                                             >
                                                 <ExternalLink size={14} /> بررسی در TronScan
                                             </a>
                                             
                                             <div className="text-[10px] text-slate-500 text-center">
                                                 تاریخ درخواست: {new Date(req.requestDate).toLocaleDateString('fa-IR')}
                                             </div>
                                         </div>
                                     </div>

                                     <div className="flex-1">
                                          <div className="flex justify-between items-start mb-4">
                                              <div>
                                                  <h3 className="text-xl font-bold text-white">{req.userName}</h3>
                                                  <p className="text-xs text-slate-500">UID: {req.userId}</p>
                                              </div>
                                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                  req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                  req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                  'bg-red-500/20 text-red-400 border-red-500/30'
                                              }`}>
                                                  {req.status === 'Pending' ? 'در انتظار بررسی' : req.status === 'Approved' ? 'تأیید شده' : 'رد شده'}
                                              </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                              <div>
                                                  <p className="text-[10px] text-slate-500 uppercase">مبلغ دلاری</p>
                                                  <p className="text-white font-mono font-bold flex items-center gap-1"><DollarSign size={14} className="text-emerald-500"/> {req.amountUSD}</p>
                                              </div>
                                              <div>
                                                  <p className="text-[10px] text-slate-500 uppercase">مدت زمان</p>
                                                  <p className="text-white font-bold">{req.months} ماه</p>
                                              </div>
                                              <div>
                                                  <p className="text-[10px] text-slate-500 uppercase">معادل ریالی (تقریبی)</p>
                                                  <p className="text-emerald-400 font-mono text-sm">{req.amountIRR.toLocaleString()} IRR</p>
                                              </div>
                                              <div>
                                                  <p className="text-[10px] text-slate-500 uppercase">شبکه</p>
                                                  <p className="text-purple-400 font-bold">{req.network || 'TRC20'}</p>
                                              </div>
                                          </div>

                                          {req.status === 'Pending' ? (
                                              <div className="flex gap-3">
                                                  <button 
                                                    onClick={() => handleProcessPayment(req, 'Approved')}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                                  >
                                                      <CheckCircle size={18}/> تأیید و فعال‌سازی
                                                  </button>
                                                  <button 
                                                    onClick={() => handleProcessPayment(req, 'Rejected')}
                                                    className="flex-1 bg-slate-800 hover:bg-red-900/50 text-red-400 border border-slate-700 hover:border-red-500/50 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                                                  >
                                                      <XCircle size={18}/> رد درخواست
                                                  </button>
                                              </div>
                                          ) : (
                                              <div className="text-center p-3 bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-500 text-sm">
                                                  این تراکنش قبلاً پردازش شده است.
                                              </div>
                                          )}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            )}

            {/* TAB CONTENT: VERIFICATION QUEUE */}
            {activeTab === 'VERIFICATION' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    {pendingCoaches.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500 opacity-50"/>
                            <p>هیچ درخواست تأیید نشده‌ای وجود ندارد.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {pendingCoaches.map(coach => (
                                <div key={coach.id} className="p-6 flex flex-col md:flex-row items-start gap-6 hover:bg-slate-800/30 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{coach.name}</h4>
                                                <p className="text-sm text-slate-400 mt-1">ایمیل: {(coach as any).email}</p>
                                                <p className="text-sm text-slate-400">موبایل: {(coach as any).phoneNumber}</p>
                                            </div>
                                            <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">
                                                در انتظار تأیید
                                            </span>
                                        </div>
                                        
                                        {/* Bio */}
                                        <div className="mt-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                            <p className="text-xs text-slate-500 mb-1">بیوگرافی:</p>
                                            <p className="text-sm text-slate-300">{coach.bio}</p>
                                        </div>

                                        {/* Cert Document */}
                                        {coach.certUrl && (
                                            <div className="mt-4">
                                                <p className="text-xs text-slate-500 mb-2">مدرک بارگذاری شده:</p>
                                                <div className="relative group max-w-sm rounded-xl overflow-hidden border border-slate-700">
                                                    {/* Basic Image Preview or File Link */}
                                                    {/* Check extension or just render as img for simplicity in this mock */}
                                                    <img src={coach.certUrl} alt="Certificate" className="w-full h-48 object-cover" />
                                                    <a 
                                                        href={coach.certUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm gap-2"
                                                    >
                                                        <ExternalLink size={16}/> مشاهده اندازه کامل
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 min-w-[160px]">
                                        <button 
                                            onClick={() => handleVerifyCoach(coach.id, 'VERIFY')}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                                        >
                                            <CheckCircle size={18}/> تأیید و فعال‌سازی
                                        </button>
                                        <button 
                                            onClick={() => handleVerifyCoach(coach.id, 'REJECT')}
                                            className="bg-slate-800 hover:bg-red-900/50 text-red-400 border border-slate-700 hover:border-red-500/50 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <XCircle size={18}/> رد درخواست
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: SUBSCRIPTION MANAGEMENT */}
            {activeTab === 'SUBSCRIPTIONS' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right min-w-[600px]">
                            <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                                <tr>
                                    <th className="p-4">نام مربی</th>
                                    <th className="p-4">نوع اشتراک</th>
                                    <th className="p-4">تاریخ انقضا</th>
                                    <th className="p-4">وضعیت</th>
                                    <th className="p-4 text-center">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredCoaches.map(coach => (
                                    <tr key={coach.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{coach.name}</div>
                                            <div className="text-xs text-slate-500">{(coach as any).email}</div>
                                        </td>
                                        <td className="p-4">
                                            {coach.subscriptionTier === 'Premium' ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20">
                                                    <Crown size={12}/> ویژه (Premium)
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded">رایگان (Free)</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-slate-300">
                                            {coach.subscriptionExpiryDate || '---'}
                                        </td>
                                        <td className="p-4">
                                            {coach.subscriptionStatus === 'Active' && <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle size={12}/> فعال</span>}
                                            {coach.subscriptionStatus === 'Expired' && <span className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle size={12}/> منقضی</span>}
                                            {!coach.subscriptionStatus && <span className="text-slate-500 text-xs">-</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {coach.subscriptionTier !== 'Premium' || coach.subscriptionStatus === 'Expired' ? (
                                                    <button 
                                                        onClick={() => handleActivatePremium(coach.id)}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                        title="فعال‌سازی ۳۰ روزه"
                                                    >
                                                        <ArrowUp size={14}/> ارتقا
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleDowngrade(coach.id)}
                                                            className="bg-slate-800 hover:bg-red-900/20 text-red-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                                            title="لغو اشتراک ویژه"
                                                        >
                                                            <ArrowDown size={14}/> تنزل
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredCoaches.length === 0 && (
                            <div className="p-8 text-center text-slate-500">موردی یافت نشد.</div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: GLOBAL USER SEARCH */}
            {activeTab === 'USER_SEARCH' && (
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Database size={20} className="text-blue-400"/> دسترسی به پایگاه داده کاربران
                        </h3>
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="نام، ایمیل یا شناسه کاربر را وارد کنید..." 
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pr-12 pl-4 text-white outline-none focus:border-blue-500 text-lg transition-colors"
                            />
                        </div>
                    </div>

                    {/* Results */}
                    {searchQuery.length > 1 && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-slate-800">
                                <h4 className="text-sm font-bold text-slate-400">نتایج جستجو ({searchResults.length})</h4>
                            </div>
                            {searchResults.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">کاربری یافت نشد.</div>
                            ) : (
                                <div className="divide-y divide-slate-800">
                                    {searchResults.map((user: any) => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'Coach' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                                                    {user.role === 'Coach' ? 'C' : 'T'}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-white">{user.name}</h5>
                                                    <p className="text-xs text-slate-500">{user.email || `ID: ${user.id}`}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedUser(user)}
                                                className="bg-slate-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                            >
                                                <Eye size={16}/> مشاهده پرونده
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default SuperAdminDashboard;