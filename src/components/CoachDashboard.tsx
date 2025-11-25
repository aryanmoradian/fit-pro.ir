import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, ShieldAlert, MessageSquare, Eye, Lock, Crown, X, Activity, Filter, Loader2, UserPlus, Check, Copy, Clock, ArrowUpDown, ChevronDown, Send, Zap, Layers, CheckSquare, Square, RefreshCw, Briefcase, Info, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { UserProfile, TraineeSummary } from '../types';
import SubscriptionModal from './SubscriptionModal';
import { uploadCertification, updateCoachVerificationStatus, generateInviteCode, sendEmailNotification, fetchCoachTrainees } from '../services/userData';
import { supabase } from '../lib/supabaseClient'; 

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

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Data State
  const [trainees, setTrainees] = useState<TraineeSummary[]>([]); 
  const [isLoadingTrainees, setIsLoadingTrainees] = useState(true);

  useEffect(() => {
      if (userProfile?.id) {
          setIsLoadingTrainees(true);
          fetchCoachTrainees(userProfile.id)
            .then(data => setTrainees(data))
            .catch(err => console.error(err))
            .finally(() => setIsLoadingTrainees(false));
      }
  }, [userProfile?.id]);

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

  const handleGenerateCode = async () => {
    if (!userProfile?.id) return;
    setIsGeneratingCode(true);
    try {
        const newCode = await generateInviteCode(userProfile.id);
        alert(`کد دعوت جدید ساخته شد: ${newCode}`);
        window.location.reload(); 
    } catch (e) {
        alert("خطا در ساخت کد دعوت");
    } finally {
        setIsGeneratingCode(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !userProfile?.inviteCode) return;
    setIsSendingInvite(true);
    try {
        await sendEmailNotification('INVITE', { 
            email: inviteEmail, 
            coachName: userProfile.name, 
            code: userProfile.inviteCode 
        });
        alert(`دعوت‌نامه به ${inviteEmail} ارسال شد.`);
        setInviteEmail('');
        setShowInviteModal(false);
    } catch (e) {
        alert("خطا در ارسال ایمیل");
    } finally {
        setIsSendingInvite(false);
    }
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

  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [sortType, setSortType] = useState<SortType>('RISK');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<Set<string>>(new Set());
  const [isAssigningTemplate, setIsAssigningTemplate] = useState(false);

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
      else setShowInviteModal(true);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedTraineeIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedTraineeIds(newSet);
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
                    {isLoadingTrainees ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                        </div>
                    ) : filteredTrainees.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Users size={48} className="mx-auto mb-4 opacity-20"/>
                            <p>موردی با این فیلتر یافت نشد.</p>
                            <button onClick={() => setActiveFilter('ALL')} className="text-emerald-400 text-xs mt-2 flex items-center justify-center gap-1 mx-auto hover:underline">
                                <RefreshCw size={12}/> پاک کردن فیلترها
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {filteredTrainees.map(trainee => {
                                const risk = getRiskStatus(trainee);
                                const isSelected = selectedTraineeIds.has(trainee.id);
                                
                                return (
                                    <div key={trainee.id} className={`p-4 flex flex-col md:grid md:grid-cols-12 gap-4 items-center hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-blue-900/10' : ''}`}>
                                        {/* Checkbox */}
                                        <div className="md:col-span-1 text-center">
                                            <button onClick={() => toggleSelection(trainee.id)} className="text-slate-500 hover:text-white">
                                                {isSelected ? <CheckSquare size={20} className="text-blue-400"/> : <Square size={20}/>}
                                            </button>
                                        </div>

                                        {/* Profile Info */}
                                        <div className="md:col-span-3 flex items-center gap-3 w-full">
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                                                    {trainee.photoUrl ? <img src={trainee.photoUrl} className="w-full h-full object-cover" alt={trainee.name}/> : <Users size={20} className="text-slate-400 m-auto mt-2"/>}
                                                </div>
                                                {risk.level === 'RED' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 
                                                    className="font-bold text-white text-sm truncate cursor-pointer hover:text-emerald-400"
                                                    onClick={() => onViewTraineeDashboard?.(trainee)}
                                                >
                                                    {trainee.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 truncate">{trainee.planName}</p>
                                            </div>
                                        </div>

                                        {/* Risk Status */}
                                        <div className="md:col-span-2 w-full flex justify-between md:justify-center">
                                            <span className="md:hidden text-slate-500 text-xs">وضعیت:</span>
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${risk.bg} ${risk.color} ${risk.border}`}>
                                                <risk.icon size={12} />
                                                <span>{risk.label}</span>
                                            </div>
                                        </div>

                                        {/* Consistency Score */}
                                        <div className="md:col-span-2 w-full flex justify-between md:justify-center">
                                            <span className="md:hidden text-slate-500 text-xs">نظم:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className={`h-full ${trainee.consistencyScore > 75 ? 'bg-emerald-500' : trainee.consistencyScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${trainee.consistencyScore}%` }}></div>
                                                </div>
                                                <span className="text-xs font-mono font-bold text-slate-300">{trainee.consistencyScore}%</span>
                                            </div>
                                        </div>

                                        {/* Last Active */}
                                        <div className="md:col-span-2 w-full flex justify-between md:justify-center text-center">
                                            <span className="md:hidden text-slate-500 text-xs">آخرین فعالیت:</span>
                                            <span className="text-xs text-slate-400">{trainee.lastActive}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="md:col-span-2 flex gap-2 justify-end w-full">
                                            <button onClick={() => onSendMessage?.(trainee.id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title="پیام">
                                                <MessageSquare size={16}/>
                                            </button>
                                            <button onClick={() => handleQuickMotivation(trainee.name, trainee.id)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-yellow-400 transition-colors" title="انگیزه">
                                                <Zap size={16}/>
                                            </button>
                                            <button onClick={() => onViewTraineeDashboard?.(trainee)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="مشاهده پرونده">
                                                <Eye size={16}/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
              </>
          )}

          {activeTab === 'TEMPLATES' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="text-center py-12 text-slate-500">
                      <Briefcase size={48} className="mx-auto mb-4 opacity-20"/>
                      <p>بخش مدیریت قالب‌ها به زودی فعال می‌شود.</p>
                  </div>
              </div>
          )}
      </div>

      {/* Modals */}
      {/* Invite Modal */}
      {showInviteModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md relative">
                  <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><UserPlus className="text-emerald-500"/> دعوت شاگرد جدید</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-sm text-slate-400 block mb-2">ارسال دعوت‌نامه ایمیلی</label>
                          <div className="flex gap-2">
                              <input 
                                type="email" 
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                              />
                              <button 
                                onClick={handleSendInvite}
                                disabled={!inviteEmail || isSendingInvite}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-lg disabled:opacity-50"
                              >
                                  {isSendingInvite ? <Loader2 className="animate-spin"/> : <Send size={18}/>}
                              </button>
                          </div>
                      </div>

                      <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-slate-800"></div>
                          <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">یا اشتراک کد دعوت</span>
                          <div className="flex-grow border-t border-slate-800"></div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl text-center border border-slate-800 border-dashed">
                          <p className="text-xs text-slate-500 mb-2">کد اختصاصی شما</p>
                          <code className="text-2xl font-bold text-emerald-400 font-mono block mb-3">{userProfile?.inviteCode || '---'}</code>
                          <div className="flex gap-2 justify-center">
                              <button onClick={() => {navigator.clipboard.writeText(userProfile?.inviteCode || ''); alert('کپی شد!')}} className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                                  <Copy size={12}/> کپی
                              </button>
                              <button onClick={handleGenerateCode} disabled={isGeneratingCode} className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                                  {isGeneratingCode ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>} تغییر کد
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <SubscriptionModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)} 
        userProfile={userProfile!} 
      />
    </div>
  );
};