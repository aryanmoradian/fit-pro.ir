import React, { useState } from 'react';
import { MOCK_TRAINEES } from '../constants';
import { CreditCard, CheckCircle, AlertTriangle, Send, FileText, Settings, Clock } from 'lucide-react';
import { CoachSettings } from '../types';
import { sendEmailNotification } from '../services/userData';

const BusinessTools: React.FC = () => {
  const trainees = MOCK_TRAINEES; // Empty now
  
  const [settings, setSettings] = useState<CoachSettings>({
      autoCheckinEnabled: true,
      checkinDay: 'جمعه',
      checkinTime: '20:00'
  });

  // Filter for Expirations
  const expiringTrainees = trainees.filter(t => t.paymentStatus === 'Expiring_Soon' || t.paymentStatus === 'Expired');

  const handleSendInvoice = async (name: string) => {
      // In a real app, we would pass the email from the trainee object
      await sendEmailNotification('INVOICE', { name });
      alert(`فاکتور تمدید برای ${name} ارسال شد.`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-emerald-500" /> مدیریت کسب‌وکار
                </h2>
                <p className="text-slate-400 mt-1">مدیریت پرداخت‌ها و اتوماسیون شاگردان</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Subscription Management */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-blue-400" /> وضعیت اشتراک‌ها
                </h3>
                
                {expiringTrainees.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-slate-900/30 rounded-xl">
                        <CheckCircle className="mx-auto mb-2 text-emerald-500" />
                        <p>موردی برای نمایش وجود ندارد.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expiringTrainees.map(t => (
                            <div key={t.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {t.paymentStatus === 'Expired' ? (
                                            <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                <AlertTriangle size={10} /> منقضی شده
                                            </span>
                                        ) : (
                                            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded flex items-center gap-1">
                                                <Clock size={10} /> انقضا نزدیک
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-500">تاریخ: {t.subscriptionExpiryDate}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSendInvoice(t.name)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                    <Send size={14} /> ارسال فاکتور
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Automation Settings */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-purple-400" /> اتوماسیون مربی
                </h3>
                
                <div className="space-y-6">
                    {/* Auto Check-in */}
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-white font-bold">چکاپ خودکار هفتگی</h4>
                                <p className="text-xs text-slate-400">ارسال فرم وضعیت (وزن، خواب، درد) برای همه شاگردان</p>
                            </div>
                            <div 
                                onClick={() => setSettings({...settings, autoCheckinEnabled: !settings.autoCheckinEnabled})}
                                className={`cursor-pointer w-12 h-6 rounded-full p-1 transition-colors ${settings.autoCheckinEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${settings.autoCheckinEnabled ? '-translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        {settings.autoCheckinEnabled && (
                            <div className="flex gap-4 animate-fade-in">
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">روز ارسال</label>
                                    <select 
                                        value={settings.checkinDay}
                                        onChange={(e) => setSettings({...settings, checkinDay: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white"
                                    >
                                        <option>پنج‌شنبه</option>
                                        <option>جمعه</option>
                                        <option>شنبه</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-slate-500 uppercase block mb-1">ساعت ارسال</label>
                                    <input 
                                        type="time"
                                        value={settings.checkinTime}
                                        onChange={(e) => setSettings({...settings, checkinTime: e.target.value})}
                                        className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-end">
                        <button className="text-emerald-400 text-sm font-bold hover:underline">ذخیره تنظیمات</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BusinessTools;