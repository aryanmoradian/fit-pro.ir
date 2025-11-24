
import React from 'react';
import { UserRole } from '../types';
import { Dumbbell, Briefcase, CheckCircle, ArrowRight, Crown, Activity } from 'lucide-react';

interface Props {
    onSelectRole: (role: 'Coach' | 'Trainee') => void;
}

const Welcome: React.FC<Props> = ({ onSelectRole }) => {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl">
            <div className="max-w-4xl w-full space-y-12">
                
                {/* Hero Text */}
                <div className="text-center space-y-4 animate-fade-in">
                    <div className="inline-flex items-center gap-3 bg-emerald-900/20 border border-emerald-500/30 px-4 py-2 rounded-full">
                        <Activity className="text-emerald-400" size={20} />
                        <span className="text-emerald-400 font-bold text-sm tracking-wide">علم، تخصص، نتایج پایدار</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                        به <span className="text-emerald-500">فیت پرو</span> خوش آمدید
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        پلتفرم تخصصی برای مربیان حرفه‌ای و ورزشکارانی که به دنبال علم، داده و نتیجه واقعی هستند.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
                    
                    {/* COACH CARD */}
                    <div 
                        onClick={() => onSelectRole('Coach')}
                        className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1"
                    >
                        <div className="absolute top-6 left-6 bg-slate-800 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <Briefcase size={32} />
                        </div>
                        <div className="mt-12 space-y-4">
                            <h3 className="text-3xl font-bold text-white">من مربی هستم</h3>
                            <p className="text-slate-400 leading-relaxed">
                                شاگردان خود را مدیریت کنید، برنامه تمرینی و تغذیه طراحی کنید و با هوش مصنوعی، پیشرفت تیم خود را رصد کنید.
                            </p>
                            <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span>مدیریت نامحدود شاگردان</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span>تحلیلگر هوشمند پیشرفت (AI)</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span>اتوماسیون مالی و چکاپ</span>
                                </li>
                            </ul>
                            <div className="pt-6 flex items-center text-emerald-400 font-bold gap-2 group-hover:gap-4 transition-all">
                                ورود به پنل مربیگری <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>

                    {/* ATHLETE CARD */}
                    <div 
                        onClick={() => onSelectRole('Trainee')}
                        className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1"
                    >
                         <div className="absolute top-6 left-6 bg-slate-800 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Dumbbell size={32} />
                        </div>
                        <div className="mt-12 space-y-4">
                            <h3 className="text-3xl font-bold text-white">من ورزشکار هستم</h3>
                            <p className="text-slate-400 leading-relaxed">
                                برنامه شخصی خود را بسازید، تمرینات را ثبت کنید و با نمودارهای پیشرفته، رشد ماهیچه‌های خود را ببینید.
                            </p>
                             <ul className="space-y-3 pt-4">
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>دفترچه ثبت رکورد دیجیتال</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>آنالیز تقارن و رشد بدن</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-300">
                                    <CheckCircle size={16} className="text-blue-500" />
                                    <span>قابلیت اتصال به مربی</span>
                                </li>
                            </ul>
                            <div className="pt-6 flex items-center text-blue-400 font-bold gap-2 group-hover:gap-4 transition-all">
                                شروع تمرین <ArrowRight size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-500 text-sm">
                    © ۱۴۰۳ فیت پرو. تمامی حقوق محفوظ است.
                </p>
            </div>
        </div>
    );
};

export default Welcome;
