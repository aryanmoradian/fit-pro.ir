




import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Target, Info, Zap } from 'lucide-react';

interface Props {
  role: 'Coach' | 'Trainee';
  onComplete: () => void;
}

interface TourStep {
  title: string;
  description: string;
  targetId?: string; // ID of the element to highlight/point to
  icon?: React.ElementType;
}

const TRAINEE_STEPS: TourStep[] = [
  {
    title: 'خوش‌آمدید!',
    description: 'به داشبورد خود خوش آمدید! در اینجا هر چیزی که برای موفقیت نیاز دارید، وجود دارد.',
    icon: Zap
  },
  {
    title: 'ماژول ریکاوری',
    description: 'فراموش نکنید که چک‌این روزانهٔ سلامت و ریکاوری را تکمیل کنید. داده‌های خواب و انرژی، کیفیت تمرین شما را تضمین می‌کنند.',
    targetId: 'tour-wellness',
    icon: CheckCircle
  },
  {
    title: 'عملکرد روزانه',
    description: 'اینجا بخش عملکرد روزانه شماست. برای ثبت هر تمرین یا وعدهٔ غذایی، روی دکمهٔ تیک (Check) کلیک کنید.',
    targetId: 'tour-daily-perf',
    icon: Target
  },
  {
    title: 'ارتباط با مربی',
    description: 'از طریق آیکون پیام، می‌توانید مستقیماً با مربی خود در ارتباط باشید و سؤالات خود را بپرسید.',
    targetId: 'tour-chat-link', // Maps to Sidebar link
    icon: Info
  },
  {
    title: 'تحلیل عملکرد',
    description: 'در بخش تحلیل عملکرد، می‌توانید نمودارهای روند وزنی و رکوردهای شخصی خود را مشاهده کنید.',
    targetId: 'tour-analytics',
    icon: Zap
  }
];

const COACH_STEPS: TourStep[] = [
  {
    title: 'خوش‌آمدید مربی!',
    description: 'به داشبورد مدیریت خود خوش آمدید. ما ابزارهایی برای مدیریت کارآمد زمان شما فراهم کرده‌ایم.',
    icon: Zap
  },
  {
    title: 'هشدار ریسک',
    description: 'بخش هشدار ریسک و تحلیل عملکرد را بررسی کنید. شاگردانی که با رنگ قرمز مشخص شده‌اند، بیشترین نیاز به مداخلهٔ فوری را دارند.',
    targetId: 'tour-risk-section',
    icon: Info
  },
  {
    title: 'مدیریت گروهی',
    description: 'با استفاده از بخش مدیریت قالب‌ها، می‌توانید برنامه‌ها را گروهی بسازید و به چندین شاگرد به صورت هم‌زمان تخصیص دهید. این کار زمان شما را ذخیره می‌کند.',
    targetId: 'tour-templates-tab',
    icon: Target
  },
  {
    title: 'صندوق پیام',
    description: 'بخش Inbox مرکزی برای تمام ارتباطات شما با شاگردان است. ارتباطات را اینجا متمرکز نگه دارید.',
    targetId: 'tour-inbox-link', // Maps to sidebar
    icon: Info
  },
  {
    title: 'لیست شاگردان',
    description: 'برای مشاهدهٔ جزئیات یا تغییر برنامه، روی نام هر شاگرد در لیست کلیک کنید.',
    targetId: 'tour-trainee-list',
    icon: CheckCircle
  }
];

const OnboardingTour: React.FC<Props> = ({ role, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = role === 'Coach' ? COACH_STEPS : TRAINEE_STEPS;
  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const Icon = step.icon || Info;

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-scale-in">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800 w-full">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="p-8 text-center relative">
             {/* Icon Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/20 relative z-10 border border-slate-700">
                 <Icon size={32} className="text-emerald-400" />
             </div>

             <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
             <p className="text-slate-400 leading-relaxed mb-8 min-h-[80px]">
                 {step.description}
             </p>

             {/* Step Indicator */}
             <div className="flex justify-center gap-2 mb-8">
                 {steps.map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`}
                     />
                 ))}
             </div>

             {/* Controls */}
             <div className="flex items-center gap-3">
                 <button 
                    onClick={onComplete}
                    className="text-slate-500 hover:text-white px-4 py-3 text-sm font-bold"
                 >
                    رد کردن
                 </button>
                 <div className="flex-1"></div>
                 {currentStep > 0 && (
                     <button 
                        onClick={handlePrev}
                        className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                     >
                        <ChevronRight size={24} />
                     </button>
                 )}
                 <button 
                    onClick={handleNext}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-colors"
                 >
                    {currentStep === steps.length - 1 ? 'پایان تور' : 'ادامه'}
                    {currentStep < steps.length - 1 && <ChevronLeft size={20} />}
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;