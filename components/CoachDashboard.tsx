
import React, { useState } from 'react';
import { MOCK_TEMPLATES } from '../constants';
import { Users, AlertTriangle, TrendingUp, ShieldAlert, MessageSquare, Eye, Lock, Crown, X, Activity, PenTool, Filter, Utensils, Sparkles, Loader2, UserPlus, Check, Copy, Clock, ArrowUpDown, ChevronDown, Send, Zap, Layers, CheckSquare, Square, ArrowRight, Briefcase, Sliders, Trash2, ArrowUp, ArrowDown, Info, Upload } from 'lucide-react';
import { UserProfile, TraineeSummary, WorkoutPlan } from '../types';
import { generateWeeklyReport } from '../services/geminiService';
import SubscriptionModal from './SubscriptionModal';
import { uploadCertification, updateCoachVerificationStatus } from '../services/userData';
import { supabase } from '../supabaseConfig'; 

interface Props {
    userProfile?: UserProfile;
    onSelectTraineeForPlan?: (trainee: TraineeSummary) => void;
    onViewTraineeDashboard?: (trainee: TraineeSummary) => void;
    onHandleRequest?: (requestId: string, action: 'APPROVE' | 'REJECT') => void;
    onSendMessage?: (traineeId: string) => void;
}

type FilterType = 'ALL' | 'STALLED' | 'BAD_NUTRITION' | 'ASYMMETRY' | 'HIGH_RISK';
type SortType = 'NAME' | 'CONSISTENCY' | 'RISK';
type SortOrder = 'ASC' | 'DESC';
type TabType = 'OVERVIEW' | 'TEMPLATES';

export const CoachDashboard: React.FC<Props> = ({ userProfile, onSelectTraineeForPlan, onViewTraineeDashboard, onHandleRequest, onSendMessage }) => {
  const [reUploadFile, setReUploadFile] = useState<File | null>(null);
  const [isReUploading, setIsReUploading] = useState(false);

  const handleReUpload = async () => {
      if (!reUploadFile || !userProfile || !userProfile.id) return;
      setIsReUploading(true);
      try {
          await uploadCertification(userProfile.id, reUploadFile);
          await updateCoachVerificationStatus(userProfile.id, 'Pending');
          alert("مدارک مجدداً ارسال شد و در صف بررسی قرار گرفت.");
          window.location.reload(); 
      } catch (e) {
          console.error(e);
          alert("خطا در آپلود. لطفا مجدد تلاش کنید.");
      } finally {
          setIsReUploading(false);
      }
  };

  const handleQuickMotivation = (traineeName: string, traineeId: string) => {
      const msg = "Keep up the great work! 💪 (عالی داری پیش میری!)";
      alert(`پیام انگیزشی برای ${traineeName} ارسال شد:\n"${msg}"`);
  };

  if (userProfile?.role === 'Coach' && userProfile.verificationStatus !== 'Verified') {
      const isRejected = userProfile.verificationStatus === 'Rejected';
      return (
          <div className="w-full flex items-center justify-center p-6 min-h-[60vh]">
                <div className={`border rounded-3xl p-12 max-w-lg text-center shadow-2xl animate-scale-in ${isRejected ? 'bg-red-900/10 border-red-500/30' : 'bg-slate-900 border-yellow-500/30'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isRejected ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                        {isRejected ? <X className="text-red-500" size={40} /> : <Clock className="text-yellow-400" size={40} />}
                    </div>
                    
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {isRejected ? 'مدارک شما تأیید نشد' : 'حساب شما در انتظار تأیید است'}
                    </h1>
                    
                    <p className="text-slate-400 leading-relaxed mb-8">
                        {isRejected 
                            ? 'متأسفانه مدارک ارسالی شما توسط تیم فنی رد شد. لطفاً مدرک معتبر مربیگری خود را مجدداً بارگذاری کنید.'
                            : `مربی گرامی، ${userProfile.name}، مدارک ارسالی شما توسط تیم فنی در حال بررسی است. این فرآیند معمولاً کمتر از ۲۴ ساعت زمان می‌برد.`
                        }
                    </p>

                    {isRejected && (
                        <div className="mb-8 space-y-4">
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer bg-slate-950 relative hover:border-emerald-500 transition-colors">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setReUploadFile(e.target.files?.[0] || null)}
                                />
                                <Upload className="mx-auto mb-2 text-slate-500"/>
                                <span className="text-sm text-slate-300 block">
                                    {reUploadFile ? reUploadFile.name : 'آپلود مجدد مدرک'}
                                </span>
                            </div>
                            <button 
                                onClick={handleReUpload}
                                disabled={!reUploadFile || isReUploading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isReUploading ? <Loader2 className="animate-spin"/> : 'ارسال مجدد برای بررسی'}
                            </button>
                        </div>
                    )}
                    
                    {!isRejected && (
                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-8">
                             <Info size={14} />
                             <span>دسترسی به پنل پس از تأیید فعال می‌شود.</span>
                        </div>
                    )}

                    <button 
                        onClick={() => supabase.auth.signOut()}
                        className="text-sm text-slate-500 hover:text-white underline"
                    >
                        خروج از حساب
                    </button>
                </div>
          </div>
      );
  }

  const [trainees, setTrainees] = useState<TraineeSummary[]>([]); 
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [sortType, setSortType] = useState<SortType>('RISK');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [templates, setTemplates] = useState<WorkoutPlan[]>([]);
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<{name: string, text: string} | null>(null);
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<Set<string>>(new Set());
  const [isAssigningTemplate, setIsAssigningTemplate] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [bulkStep, setBulkStep] = useState<'TEMPLATE' | 'ADJUST'>('TEMPLATE');
  const [bulkAdjustments, setBulkAdjustments] = useState<Record<string, { calories: string, intensity: string }>>({});

  const isPremium = userProfile?.subscriptionTier === 'Premium';
  const traineeLimit = isPremium ? 9999 : 5;
  const currentCount = trainees.length;
  const isLimitReached = currentCount >= traineeLimit;
  const progressPercent = traineeLimit > 0 ? Math.min(100, (currentCount / traineeLimit) * 100) : 0;
  const showExpiryWarning = userProfile?.subscriptionTier === 'Premium' && userProfile?.subscriptionStatus === 'Active'; 
  const pendingRequests = userProfile?.pendingRequests || [];

  const getRiskStatus = (t: TraineeSummary) => {
      const adherence = t.consistencyScore;
      const sleep = t.sleepAverage !== undefined ? t.sleepAverage : 7; 
      const soreness = t.sorenessLevel !== undefined ? t.sorenessLevel : 0;

      if (adherence < 50 || sleep < 5 || soreness >= 7) {
          return { level: 'RED', label: 'هشدار ریسک', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: ShieldAlert };
      }
      if (adherence < 75) {
          return { level: 'YELLOW', label: 'نیاز به توجه', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: AlertTriangle };
      }
      return { level: 'GREEN', label: 'وضعیت ایمن', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Activity };
  };

  const filteredTrainees = trainees.filter(t => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'STALLED') return t.volumeTrend === 'Flat' || t.volumeTrend === 'Down';
      if (activeFilter === 'BAD_NUTRITION') return (t.nutritionAdherence || 0) < 70;
      if (activeFilter === 'ASYMMETRY') return (t.asymmetryMax || 0) > 0.8;
      if (activeFilter === 'HIGH_RISK') return getRiskStatus(t).level === 'RED';
      return true;
  });

  const sortedTrainees = [...filteredTrainees].sort((a, b) => {
      let comparison = 0;
      switch (sortType) {
          case 'NAME':
              comparison = a.name.localeCompare(b.name, 'fa');
              break;
          case 'CONSISTENCY':
              comparison = a.consistencyScore - b.consistencyScore;
              break;
          case 'RISK':
              const getWeight = (t: TraineeSummary) => {
                  const r = getRiskStatus(t);
                  return r.level === 'RED' ? 3 : r.level === 'YELLOW' ? 2 : 1;
              };
              comparison = getWeight(a) - getWeight(b);
              break;
      }
      return sortOrder === 'ASC' ? comparison : -comparison;
  });

  const handleAddTrainee = () => {
      if (isLimitReached) setShowPaywall(true);
      else alert("از شاگرد بخواهید کد دعوت شما را در پروفایل خود وارد کند.");
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("آیا از حذف این قالب اطمینان دارید؟ این عملیات قابل بازگشت نیست.")) {
        setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleGenerateReport = async (trainee: TraineeSummary) => {
      if (!isPremium) { setShowPaywall(true); return; }
      setGeneratingReportId(trainee.id);
      const report = await generateWeeklyReport(trainee.name, trainee);
      setReportResult({ name: trainee.name, text: report });
      setGeneratingReportId(null);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedTraineeIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedTraineeIds(newSet);
  };

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const initialAdjustments: Record<string, { calories: string, intensity: string }> = {};
    selectedTraineeIds.forEach(id => {
        initialAdjustments[id] = { calories: '2500', intensity: '100' };
    });
    setBulkAdjustments(initialAdjustments);
    setBulkStep('ADJUST');
  };

  const handleAdjustmentChange = (id: string, field: 'calories' | 'intensity', value: string) => {
    setBulkAdjustments(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleBulkFinalize = () => {
    const template = templates.find(t => t.id === selectedTemplateId);
    if(template) {
        alert(`برنامه "${template.name}" به ${selectedTraineeIds.size} شاگرد با تنظیمات اختصاصی اعمال شد.`);
        closeBulkModal();
    }
  };

  const closeBulkModal = () => {
    setIsAssigningTemplate(false);
    setBulkStep('TEMPLATE');
    setSelectedTemplateId(null);
    setSelectedTraineeIds(new Set());
    setBulkAdjustments({});
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 relative">
      
      {showExpiryWarning && (
          <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-xl flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2 text-orange-400 text-sm font-bold">
                  <Clock size={18} />
                  <span>هشدار: اشتراک ویژه شما در ۷ روز آینده منقضی می‌شود.</span>
              </div>
              <button onClick={() => setShowPaywall(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                  تمدید اشتراک
              </button>
          </div>
      )}

      <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="text-emerald-500" size={32}/>
                    مرکز فرماندهی مربی
                    {isPremium && <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded flex items-center gap-1"><Crown size={12}/> ویژه</span>}
                </h2>
                <p className="text-slate-400 mt-1">مدیریت متمرکز وضعیت شاگردان با دستیار هوشمند</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-lg">
                    <span className="text-xs text-slate-400">کد دعوت:</span>
                    <code className="text-emerald-400 font-mono font-bold">{userProfile?.inviteCode || '---'}</code>
                    <button onClick={() => {navigator.clipboard.writeText(userProfile?.inviteCode || ''); alert('کپی شد!')}} className="text-slate-500 hover:text-white"><Copy size={14}/></button>
                </div>
                
                <button 
                    onClick={handleAddTrainee}
                    className={`px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${
                        isLimitReached 
                        ? 'bg-slate-800 border border-yellow-500/50 text-yellow-400 hover:bg-slate-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                >
                    {isLimitReached ? <Lock size={16} /> : <UserPlus size={16} />} 
                    {isLimitReached ? 'ارتقا برای افزودن' : 'دعوت شاگرد'}
                </button>
            </div>
          </div>

          {!isPremium && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                      <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-300 font-bold">ظرفیت شاگردان رایگان</span>
                          <span className={`${isLimitReached ? 'text-red-400' : 'text-emerald-400'}`}>{currentCount} / {traineeLimit}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                      </div>
                  </div>
                  <button onClick={() => setShowPaywall(true)} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap">
                      <Crown size={14}/> ارتقا به ویژه (نامحدود)
                  </button>
              </div>
          )}

          {pendingRequests.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg text-white animate-pulse">
                          <UserPlus size={20} />
                      </div>
                      <div>
                          <h4 className="font-bold text-white">{pendingRequests.length} درخواست جدید</h4>
                          <p className="text-xs text-blue-300">شاگردان جدید با کد دعوت شما منتظر تأیید هستند.</p>
                      </div>
                  </div>
                  <div className="flex gap-2">
                     {pendingRequests.map(req => (
                         <div key={req.id} className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-3">
                             <span className="text-sm font-bold text-white">{req.traineeName}</span>
                             <div className="flex gap-1">
                                 <button 
                                    onClick={() => onHandleRequest?.(req.id, 'APPROVE')}
                                    className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500 hover:text-white"
                                 >
                                     <Check size={16}/>
                                 </button>
                                 <button 
                                    onClick={() => onHandleRequest?.(req.id, 'REJECT')}
                                    className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500 hover:text-white"
                                 >
                                     <X size={16}/>
                                 </button>
                             </div>
                         </div>
                     ))}
                  </div>
              </div>
          )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex gap-2 bg-slate-900 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'OVERVIEW' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  لیست شاگردان
              </button>
              <button 
                onClick={() => setActiveTab('TEMPLATES')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'TEMPLATES' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
              >
                  قالب‌های برنامه
              </button>
          </div>

          {activeTab === 'OVERVIEW' && (
              <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0">
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      <Filter size={14} className="text-slate-500"/>
                      <select 
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                        className="bg-transparent text-xs text-white outline-none appearance-none cursor-pointer min-w-[100px]"
                      >
                          <option value="ALL">همه شاگردان</option>
                          <option value="HIGH_RISK">🔴 ریسک بالا</option>
                          <option value="STALLED">⚠️ استپ کرده</option>
                          <option value="BAD_NUTRITION">🍔 تغذیه ضعیف</option>
                          <option value="ASYMMETRY">📐 عدم تقارن</option>
                      </select>
                      <ChevronDown size={12} className="text-slate-500"/>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                      <ArrowUpDown size={14} className="text-slate-500"/>
                      <select 
                        value={sortType}
                        onChange={(e) => setSortType(e.target.value as SortType)}
                        className="bg-transparent text-xs text-white outline-none appearance-none cursor-pointer min-w-[80px]"
                      >
                          <option value="RISK">اولیت ریسک</option>
                          <option value="CONSISTENCY">نظم تمرین</option>
                          <option value="NAME">نام</option>
                      </select>
                  </div>
                  
                  <button 
                     onClick={() => setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC')}
                     className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                  >
                      {sortOrder === 'ASC' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                  </button>
              </div>
          )}
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'OVERVIEW' && (
              <>
                {selectedTraineeIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3 flex items-center gap-4 z-30 animate-slide-up">
                        <span className="text-sm font-bold text-white bg-slate-800 px-3 py-1 rounded-lg">{selectedTraineeIds.size} انتخاب شده</span>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <button 
                            onClick={() => setIsAssigningTemplate(true)}
                            className="flex items-center gap-2 text-sm text-white hover:text-emerald-400 transition-colors"
                        >
                            <Layers size={16} /> تخصیص برنامه گروهی
                        </button>
                        <button className="flex items-center gap-2 text-sm text-white hover:text-blue-400 transition-colors">
                            <MessageSquare size={16} /> پیام گروهی
                        </button>
                        <div className="h-6 w-px bg-slate-700"></div>
                        <button onClick={() => setSelectedTraineeIds(new Set())} className="text-slate-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-500 uppercase border-b border-slate-800">
                    <div className="col-span-1 text-center">
                         <button onClick={() => {
                             if(selectedTraineeIds.size === filteredTrainees.length) setSelectedTraineeIds(new Set());
                             else setSelectedTraineeIds(new Set(filteredTrainees.map(t => t.id)));
                         }}>
                             {selectedTraineeIds.size === filteredTrainees.length && filteredTrainees.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>}
                         </button>
                    </div>
                    <div className="col-span-3">مشخصات شاگرد</div>
                    <div className="col-span-2 text-center">وضعیت ریسک</div>
                    <div className="col-span-2 text-center">امتیاز نظم</div>
                    <div className="col-span-2 text-center">آخرین فعالیت</div>
                    <div className="col-span-2 text-center">عملیات</div>
                </div>

                <div className="space-y-3 mt-3">
                    {filteredTrainees.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-20"/>
                            <p>موردی با این فیلتر یافت نشد.</p>
                            <button onClick={() => setActiveFilter('ALL')} className="text-emerald-400 text-sm mt-2 hover:underline">پاک کردن فیلترها</button>
                        </div>
                    ) : (
                        filteredTrainees.map(trainee => {
                            const risk = getRiskStatus(trainee);
                            const isSelected = selectedTraineeIds.has(trainee.id);

                            return (
                                <div 
                                    key={trainee.id} 
                                    className={`bg-slate-900 border rounded-xl transition-all hover:bg-slate-800/50 ${isSelected ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-800'}`}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                                        <div className="col-span-1 text-center hidden md:block">
                                            <button onClick={() => toggleSelection(trainee.id)} className={`text-slate-400 hover:text-white ${isSelected ? 'text-emerald-500' : ''}`}>
                                                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                            </button>
                                        </div>

                                        <div className="col-span-12 md:col-span-3 flex items-center gap-3" onClick={() => toggleSelection(trainee.id)}>
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700">
                                                    {trainee.photoUrl ? <img src={trainee.photoUrl} className="w-full h-full object-cover"/> : <span className="font-bold text-slate-500">{trainee.name[0]}</span>}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{trainee.name}</h4>
                                                <p className="text-xs text-slate-500">{trainee.planName || 'بدون برنامه'}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-6 md:col-span-2 flex justify-center">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${risk.bg} border ${risk.border}`}>
                                                <risk.icon size={14} className={risk.color} />
                                                <span className={`text-xs font-bold ${risk.color}`}>{risk.label}</span>
                                            </div>
                                        </div>

                                        <div className="col-span-6 md:col-span-2 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-lg font-bold font-mono text-white">{trainee.consistencyScore}%</span>
                                                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                                                    <div className={`h-full ${trainee.consistencyScore > 80 ? 'bg-emerald-500' : trainee.consistencyScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${trainee.consistencyScore}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-6 md:col-span-2 text-center text-xs text-slate-400">
                                            {trainee.lastActive}
                                        </div>

                                        <div className="col-span-6 md:col-span-2 flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleQuickMotivation(trainee.name, trainee.id)}
                                                className="p-2 bg-slate-800 hover:bg-yellow-900/20 text-yellow-500 rounded-lg transition-colors group" 
                                                title="ارسال انرژی (Keep up the great work!)"
                                            >
                                                <Zap size={16} className="group-hover:fill-yellow-500 transition-all" />
                                            </button>
                                            <button 
                                                onClick={() => onSendMessage?.(trainee.id)}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors" 
                                                title="پیام"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onViewTraineeDashboard?.(trainee)}
                                                className="p-2 bg-slate-800 hover:bg-blue-900/30 text-blue-400 rounded-lg transition-colors" 
                                                title="مشاهده داشبورد"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onSelectTraineeForPlan?.(trainee)}
                                                className="p-2 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors" 
                                                title="طراحی برنامه"
                                            >
                                                <PenTool size={16} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleGenerateReport(trainee)}
                                                className="p-2 bg-purple-900/20 hover:bg-purple-900/40 text-purple-400 border border-purple-500/30 rounded-lg transition-colors relative" 
                                                title="گزارش هوشمند"
                                            >
                                                {generatingReportId === trainee.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {(trainee.injuryRiskScore && trainee.injuryRiskScore > 50) && (
                                        <div className="px-4 pb-3 pt-0">
                                            <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-2 flex items-center gap-2 text-xs text-red-300">
                                                <AlertTriangle size={12} />
                                                <span>هشدار سیستم: احتمال آسیب‌دیدگی بالا ({trainee.injuryRiskScore}%) - استراحت پیشنهاد می‌شود.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
              </>
          )}

          {activeTab === 'TEMPLATES' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div 
                    onClick={() => onSelectTraineeForPlan?.({ id: 'template', name: 'قالب جدید' } as any)}
                    className="border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-emerald-500 hover:bg-slate-900/50 transition-all group min-h-[200px]"
                  >
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <PenTool size={24} />
                      </div>
                      <h3 className="text-white font-bold">ساخت قالب جدید</h3>
                      <p className="text-xs text-slate-500 mt-2 text-center">برنامه‌های پرکاربرد را ذخیره کنید.</p>
                  </div>

                  {MOCK_TEMPLATES.map(tpl => (
                      <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-emerald-500/50 transition-all">
                          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"><Briefcase size={14}/></button>
                              <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1.5 bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg"><Trash2 size={14}/></button>
                          </div>
                          
                          <div className="flex justify-between items-start mb-4">
                              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg">
                                  <Layers size={24} />
                              </div>
                              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400">{(tpl as any).daysCount} روز در هفته</span>
                          </div>
                          
                          <h3 className="font-bold text-white text-lg mb-1">{tpl.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-4">{tpl.description}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                               <span className={`text-xs font-bold px-2 py-0.5 rounded ${(tpl as any).difficulty === 'Advanced' ? 'bg-red-900/20 text-red-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
                                   {(tpl as any).difficulty === 'Advanced' ? 'پیشرفته' : 'متوسط'}
                               </span>
                               <button className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1">
                                   استفاده <ArrowRight size={12} />
                               </button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      <SubscriptionModal 
         isOpen={showPaywall} 
         onClose={() => setShowPaywall(false)} 
         userProfile={userProfile || {} as UserProfile}
      />

      {reportResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full p-6 relative">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Sparkles className="text-purple-400" size={20} />
                          گزارش هوشمند: {reportResult.name}
                      </h3>
                      <button onClick={() => setReportResult(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap border border-slate-800 max-h-[60vh] overflow-y-auto">
                      {reportResult.text}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                      <button onClick={() => {navigator.clipboard.writeText(reportResult.text); alert('کپی شد!')}} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">کپی متن</button>
                      <button onClick={() => setReportResult(null)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 font-bold">بستن</button>
                  </div>
              </div>
          </div>
      )}

      {isAssigningTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-bold text-white">تخصیص برنامه گروهی</h3>
                          <p className="text-xs text-slate-400">برای {selectedTraineeIds.size} شاگرد انتخاب شده</p>
                      </div>
                      <button onClick={closeBulkModal}><X className="text-slate-500 hover:text-white" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                      {bulkStep === 'TEMPLATE' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {MOCK_TEMPLATES.map(tpl => (
                                  <div 
                                    key={tpl.id} 
                                    onClick={() => handleTemplateSelect(tpl.id)}
                                    className="bg-slate-800 border border-slate-700 hover:border-emerald-500 p-4 rounded-xl cursor-pointer transition-all group"
                                  >
                                      <h4 className="font-bold text-white group-hover:text-emerald-400">{tpl.name}</h4>
                                      <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
                                      <div className="mt-3 flex gap-2">
                                          <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded">{(tpl as any).daysCount} روزه</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {bulkStep === 'ADJUST' && (
                          <div className="space-y-4">
                              <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg flex items-center gap-2 text-sm text-blue-300">
                                  <Info size={16} />
                                  <span>قالب انتخاب شده: <strong>{MOCK_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}</strong></span>
                              </div>
                              
                              <div className="space-y-2">
                                  <p className="text-sm text-slate-400">تنظیم متغیرهای شخصی برای هر شاگرد:</p>
                                  {Array.from(selectedTraineeIds).map((id) => {
                                      const traineeName = trainees.find(t => t.id === id)?.name || id;
                                      return (
                                          <div key={id as string} className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                                              <span className="text-sm font-bold text-white w-32 truncate">{traineeName}</span>
                                              <div className="flex items-center gap-2 flex-1">
                                                  <Utensils size={14} className="text-slate-500"/>
                                                  <input 
                                                    type="text" 
                                                    placeholder="کالری (2500)" 
                                                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full outline-none focus:border-emerald-500"
                                                    onChange={(e) => handleAdjustmentChange(id as string, 'calories', e.target.value)}
                                                  />
                                              </div>
                                              <div className="flex items-center gap-2 flex-1">
                                                  <Sliders size={14} className="text-slate-500"/>
                                                  <input 
                                                    type="text" 
                                                    placeholder="شدت % (100)" 
                                                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white w-full outline-none focus:border-emerald-500"
                                                    onChange={(e) => handleAdjustmentChange(id as string, 'intensity', e.target.value)}
                                                  />
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-4 border-t border-slate-800 flex justify-between">
                      {bulkStep === 'ADJUST' ? (
                          <>
                            <button onClick={() => setBulkStep('TEMPLATE')} className="text-slate-400 hover:text-white text-sm px-4 py-2">بازگشت</button>
                            <button onClick={handleBulkFinalize} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg">اعمال برنامه</button>
                          </>
                      ) : (
                          <div className="ml-auto"></div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
