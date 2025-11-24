
import React, { useState, useEffect } from 'react';
import { Phone, Mail, Send, MessageCircle, Globe, Heart, CalendarDays } from 'lucide-react';

const Footer: React.FC = () => {
  // --- Commitment Counter Logic ---
  // Assuming project start date: Jan 1, 2024
  const [daysActive, setDaysActive] = useState(0);

  useEffect(() => {
    const startDate = new Date('2024-01-01');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDaysActive(diffDays);
  }, []);

  return (
    <footer id="contact-footer" className="bg-slate-950 border-t border-slate-800 pt-12 pb-8 mt-auto relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Top Section: Links & Contact --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Brand & Value Prop */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white">
              فیت پرو <span className="block text-xs font-medium text-emerald-400 mt-1">علم، تخصص، نتایج پایدار</span>
            </h3>
            <p className="text-slate-400 text-sm leading-7 text-justify border-l-2 border-slate-800 pl-4">
              <strong className="text-white block mb-1">مرکز فرماندهی هوشمند رشد ماهیچه‌ها.</strong>
              اکوسیستم ما، حدس و گمان را از بدنسازی حذف می‌کند. ما مدیریت دقیق برنامه تمرینی و تغذیه را با هوش مصنوعی محاسبه‌گر فرمول بدن شما (مکمل فیت پرو) و تأمین تخصصی مکمل‌های اورجینال (مکمل پرو) ادغام کرده‌ایم. فیت پرو تمام ابزارهای لازم را برای تضمین مسیر قهرمانی و شکستن مرزهای رشد شما، بر اساس داده‌های علمی، زیر یک چتر واحد فراهم می‌کند.
            </p>
            <a href="https://fit-pro.ir" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-500 text-sm font-bold hover:text-emerald-400 transition-colors bg-emerald-900/10 px-4 py-2 rounded-lg border border-emerald-500/10 hover:border-emerald-500/30">
                <Globe size={16}/> ورود به اکوسیستم فیت پرو
            </a>
          </div>

          {/* Column 2: Support Channels */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b-2 border-slate-800 pb-3 inline-block">
              کانال‌های ارتباطی
            </h3>
            <div className="space-y-4">
              <a href="tel:09981749697" className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg">
                    <Phone size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 group-hover:text-slate-300">پشتیبانی تلفنی (مستقیم)</span>
                    <span dir="ltr" className="text-lg text-white font-mono font-bold">0998 174 9697</span>
                </div>
              </a>
              
              <div className="grid grid-cols-2 gap-3">
                <a href="https://wa.me/9981749697" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white py-3 rounded-xl transition-all text-xs font-bold shadow-lg shadow-emerald-900/10">
                    <MessageCircle size={18} /> واتس‌اپ
                </a>
                <a href="https://t.me/mokamelfitpro_support" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#229ED9]/10 border border-[#229ED9]/20 hover:bg-[#229ED9] text-[#229ED9] hover:text-white py-3 rounded-xl transition-all text-xs font-bold shadow-lg shadow-blue-900/10">
                    <Send size={18} /> تلگرام
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Official Emails */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b-2 border-slate-800 pb-3 inline-block">
              مکاتبات رسمی
            </h3>
            <div className="space-y-3">
              {[
                  'info@mokamelfitpro.ir',
                  'info@mokamelpro.ir',
                  'info@fit-pro.ir'
              ].map((email, idx) => (
                <a key={idx} href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-900 group border border-transparent hover:border-slate-800">
                    <div className="p-1.5 bg-slate-800 rounded text-slate-500 group-hover:text-emerald-400 transition-colors">
                        <Mail size={14} />
                    </div>
                    <span className="font-mono tracking-wide">{email}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Section: The Platform Heartbeat --- */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Copyright Text */}
            <p className="text-slate-500 text-xs text-center md:text-right">
                © 2025/2026 تمامی حقوق برای اکوسیستم <span className="text-emerald-500 font-bold">فیت پرو</span> محفوظ است.
            </p>

            {/* The Signature Widget */}
            <div className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-2xl p-1.5 flex items-center shadow-xl transition-all duration-300 cursor-default">
                
                {/* Tagline */}
                <div className="px-3 hidden sm:block">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">توسعه متعهدانه</span>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block"></div>

                {/* Developer Info */}
                <div className="flex items-center gap-2 px-3">
                    <span className="text-xs text-slate-500">طراحی با</span>
                    <div className="relative w-4 h-4 flex items-center justify-center">
                        <Heart size={14} className="text-rose-500 fill-rose-500 animate-pulse relative z-10" />
                        <div className="absolute inset-0 bg-rose-500 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                    </div>
                    <span className="text-xs text-slate-500">
                        توسط <span className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">آریان مرادیان</span>
                    </span>
                </div>

                {/* Live Counter */}
                <div className="ml-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2 group-hover:border-blue-500/30 transition-colors">
                    <CalendarDays size={12} className="text-blue-500" />
                    <span className="text-xs font-mono font-bold text-blue-400">{daysActive}</span>
                    <span className="text-[10px] text-slate-500">روز فعالیت</span>
                </div>

            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
