
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_ACTIVE_COACHES } from '../constants';
import { Save, User, Ruler, Camera, Target, Link, Search, CheckCircle, Clock, Info } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onConnectRequest?: (inviteCode: string) => void; 
}

const Profile: React.FC<Props> = ({ profile, onUpdate, onConnectRequest }) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(() => {
    if (!profile.measurements || profile.measurements.length === 0) {
      return {
        ...profile,
        measurements: [{
          logId: `init_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weight: 0,
          bodyFat: 0,
          waist: 0,
          chest: 0,
          armRight: 0,
          armLeft: 0,
          thighRight: 0,
          thighLeft: 0
        }]
      };
    }
    return profile;
  });

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [connectMode, setConnectMode] = useState<'CODE' | 'SEARCH'>('CODE');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (field: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (index: number, field: string, value: number) => {
    const updatedMeasurements = [...localProfile.measurements];
    if (!updatedMeasurements[index]) return;
    updatedMeasurements[index] = { ...updatedMeasurements[index], [field]: value };
    setLocalProfile({ ...localProfile, measurements: updatedMeasurements });
  };

  const saveProfile = () => {
    onUpdate(localProfile);
    alert('پروفایل ذخیره شد');
  };
  
  const handleConnectSubmit = (code: string) => {
      if (onConnectRequest && code) {
          onConnectRequest(code);
      }
  };

  const currentStats = localProfile.measurements.length > 0 
    ? localProfile.measurements[localProfile.measurements.length - 1] 
    : { date: 'N/A', weight: 0, bodyFat: 0, waist: 0, chest: 0, armRight: 0, armLeft: 0, thighRight: 0, thighLeft: 0 };

  const filteredCoaches = MOCK_ACTIVE_COACHES.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">پرونده {profile.role === 'Coach' ? 'مربی' : 'ورزشکار'}</h2>
        <button 
          onClick={saveProfile}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Save size={18} />
          ذخیره تغییرات
        </button>
      </div>

      {/* Join Coach Section (Only for Trainees) */}
      {profile.role === 'Trainee' && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl">
              {/* Status Overlays */}
              {profile.coachConnectStatus === 'Connected' && (
                  <div className="absolute inset-0 bg-emerald-900/90 flex items-center justify-center z-10">
                      <div className="text-center">
                          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/40">
                              <CheckCircle size={32} className="text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white">متصل به تیم مربیگری</h3>
                          <p className="text-emerald-300 mt-2 font-medium">مربی شما: {profile.connectedCoachName || 'آریان مرادیان'}</p>
                          <p className="text-slate-400 text-sm mt-4 max-w-md mx-auto">
                              برنامه تمرینی و تغذیه شما اکنون توسط مربی مدیریت می‌شود.
                          </p>
                      </div>
                  </div>
              )}
              
              {profile.coachConnectStatus === 'Pending' && (
                  <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-10">
                      <div className="text-center animate-pulse">
                          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                              <Clock size={32} className="text-yellow-400" />
                          </div>
                          <h3 className="text-xl font-bold text-white">درخواست ارسال شد</h3>
                          <p className="text-yellow-400 mt-2">منتظر تأیید مربی باشید...</p>
                      </div>
                  </div>
              )}

              <h3 className="text-lg font-semibold text-blue-400 mb-6 flex items-center gap-2">
                  <Link size={20} /> استخدام مربی و اتصال اکانت
              </h3>

              <div className="flex gap-4 mb-6 border-b border-slate-700">
                  <button 
                    onClick={() => setConnectMode('CODE')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${connectMode === 'CODE' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      ورود کد دعوت
                  </button>
                  <button 
                    onClick={() => setConnectMode('SEARCH')}
                    className={`pb-2 px-4 text-sm font-bold transition-colors ${connectMode === 'SEARCH' ? 'text-white border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                      جستجوی مربی
                  </button>
              </div>

              {connectMode === 'CODE' ? (
                <div className="flex gap-4 items-end animate-fade-in">
                    <div className="flex-1">
                        <label className="block text-sm text-slate-400 mb-2">کد اختصاصی دریافتی از مربی</label>
                        <input 
                            type="text" 
                            value={inviteCodeInput}
                            onChange={(e) => setInviteCodeInput(e.target.value)}
                            placeholder="مثلا: ARYAN_PRO_88"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 tracking-widest font-mono text-left"
                        />
                    </div>
                    <button 
                        onClick={() => handleConnectSubmit(inviteCodeInput)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
                    >
                        ارسال درخواست
                    </button>
                </div>
              ) : (
                 <div className="space-y-4 animate-fade-in">
                     <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="نام مربی را جستجو کنید..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 pr-10 text-white outline-none focus:border-blue-500"
                        />
                     </div>
                     <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 border border-slate-700/50 rounded-lg p-2 bg-slate-900/30">
                         {filteredCoaches.length === 0 ? (
                             <div className="text-center text-slate-500 text-xs p-4">
                                {searchQuery ? 'مربی‌ای با این نام یافت نشد.' : 'لیست مربیان در حال حاضر خالی است.'}
                             </div>
                         ) : (
                             filteredCoaches.map(coach => (
                                 <div key={coach.id} className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 p-3 rounded-lg border border-slate-700/50 transition-colors group">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                                            {coach.name[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{coach.name}</h4>
                                            <p className="text-[10px] text-slate-400">{coach.experienceLevel} | {coach.bio ? (coach.bio.length > 30 ? coach.bio.substring(0,30)+'...' : coach.bio) : 'بدون بیوگرافی'}</p>
                                        </div>
                                     </div>
                                     <button 
                                        onClick={() => handleConnectSubmit(coach.inviteCode || '')}
                                        className="bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-blue-500/30"
                                     >
                                        درخواست
                                     </button>
                                 </div>
                             ))
                         )}
                     </div>
                 </div>
              )}
              
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                  <Info size={12} />
                  با اتصال به مربی، دسترسی نوشتن برنامه شخصی غیرفعال شده و تحت نظر مربی قرار می‌گیرید.
              </p>
          </div>
      )}

      {/* Basic Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <User size={20} /> اطلاعات پایه
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-1">نام و نام خانوادگی</label>
            <input 
              type="text" 
              value={localProfile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
           <div>
            <label className="block text-sm text-slate-400 mb-1">سن</label>
            <input 
              type="number" 
              value={localProfile.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
           <div>
            <label className="block text-sm text-slate-400 mb-1">قد (cm)</label>
            <input 
              type="number" 
              value={localProfile.height}
              onChange={(e) => handleChange('height', parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
        
        {/* Target Weight Row */}
        <div className="mt-4 pt-4 border-t border-slate-700">
             <div className="w-full md:w-1/3">
                <label className="block text-sm text-purple-400 mb-1 flex items-center gap-1"><Target size={14} /> وزن هدف (Target Weight)</label>
                <input 
                type="number" 
                value={localProfile.targetWeightKg || ''}
                onChange={(e) => handleChange('targetWeightKg', parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-purple-500/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
      </div>

      {/* Current Measurements */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
         <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <Ruler size={20} /> آخرین اندازه‌گیری‌ها (تاریخ: {currentStats.date})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
                <label className="block text-sm text-slate-400 mb-1">وزن (kg)</label>
                <input 
                type="number" 
                value={currentStats.weight || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'weight', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">چربی بدن (%)</label>
                <input 
                type="number" 
                value={currentStats.bodyFat || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'bodyFat', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">دور کمر (cm)</label>
                <input 
                type="number" 
                value={currentStats.waist || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'waist', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
             <div>
                <label className="block text-sm text-slate-400 mb-1">دور سینه (cm)</label>
                <input 
                type="number" 
                value={currentStats.chest || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'chest', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
            
            {/* Symmetry Inputs */}
            <div>
                <label className="block text-sm text-slate-400 mb-1">بازوی راست (cm)</label>
                <input 
                type="number" 
                value={currentStats.armRight || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'armRight', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg border-r-2 border-r-emerald-500"
                />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">بازوی چپ (cm)</label>
                <input 
                type="number" 
                value={currentStats.armLeft || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'armLeft', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">ران راست (cm)</label>
                <input 
                type="number" 
                value={currentStats.thighRight || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'thighRight', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg border-r-2 border-r-emerald-500"
                />
            </div>
            <div>
                <label className="block text-sm text-slate-400 mb-1">ران چپ (cm)</label>
                <input 
                type="number" 
                value={currentStats.thighLeft || ''}
                onChange={(e) => handleMeasurementChange(localProfile.measurements.length - 1, 'thighLeft', parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono text-lg"
                />
            </div>
        </div>
      </div>

      {/* Visual Progress Placeholders */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
         <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
          <Camera size={20} /> گالری تصاویر (برای مقایسه در داشبورد)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                    <Camera className="mb-2 group-hover:text-emerald-400" />
                    <span className="text-sm">آپلود زاویه {i}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
