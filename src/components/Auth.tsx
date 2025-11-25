import React, { useState, useEffect } from 'react';
import { AuthViewMode, UserRole } from '../types';
import { Activity, Mail, Lock, User, Upload, Crown, TrendingUp, Quote, Phone, Eye, EyeOff, CheckCircle, Info, Loader2, ArrowRight } from 'lucide-react';
import PredictiveWidget from './PredictiveWidget';
import { useAuth } from '../context/AuthContext';
import { uploadCertification } from '../services/userData';
import { supabase } from '../lib/supabaseClient';

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [view, setView] = useState<AuthViewMode>('LOGIN');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Verification State
  const [certFile, setCertFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  const [verificationSentTo, setVerificationSentTo] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [activeCopyIndex, setActiveCopyIndex] = useState(0);
  
  useEffect(() => {
      const interval = setInterval(() => {
          setActiveCopyIndex(prev => (prev === 0 ? 1 : 0));
      }, 6000);
      return () => clearInterval(interval);
  }, []);

  const getPasswordStrength = (pass: string) => {
      if (!pass) return { score: 0, label: '', color: 'bg-slate-700', textColor: 'text-slate-500' };
      const lengthValid = pass.length >= 8;
      const hasLetters = /[a-zA-Z]/.test(pass);
      const hasNumbers = /[0-9]/.test(pass);
      
      if (pass.length < 8) {
          return { score: 1, label: 'ضعیف (Weak)', color: 'bg-red-500', textColor: 'text-red-500' };
      }
      if (lengthValid && hasLetters && hasNumbers) {
          return { score: 3, label: 'قوی (Strong)', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
      }
      return { score: 2, label: 'متوسط (Medium)', color: 'bg-orange-500', textColor: 'text-orange-500' };
  };

  const passStrength = getPasswordStrength(password);
  
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin, 
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setError(err.message || "خطا در ورود با گوگل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) throw error;
    } catch (err: any) {
        console.error(err);
        setError(err.message === 'Invalid login credentials' ? "ایمیل یا رمز عبور اشتباه است." : err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (passStrength.score < 2) {
        setError("رمز عبور ضعیف است. لطفاً از ترکیب حروف و اعداد استفاده کنید.");
        return;
    }
    if (email && password && name && phoneNumber) {
        setView('SIGNUP_ROLE');
        setError('');
    }
  };

  const handleRoleSelect = async (role: UserRole) => {
    if (role === 'Coach') {
      setView('SIGNUP_COACH_VERIFICATION');
    } else {
      await executeSignup(role);
    }
  };

  const handleCoachVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    await executeSignup('Coach');
  };

  const executeSignup = async (role: UserRole) => {
      setError('');
      setIsEmailDuplicate(false);
      setIsLoading(true);
      try {
          const { error } = await signUp(email.trim(), password, {
              full_name: name,
              phone: phoneNumber,
              role: role 
          });

          if (error) throw error;
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && role === 'Coach' && certFile) {
              try {
                  const uploadedCertUrl = await uploadCertification(session.user.id, certFile);
                  await supabase.from('profiles').update({
                      bio: bio,
                      cert_url: uploadedCertUrl 
                  }).eq('id', session.user.id);
              } catch (uploadErr) {
                  console.error("Certificate upload failed but user created:", uploadErr);
              }
          } else if (!session && role === 'Coach') {
              setVerificationSentTo(email);
              setView('VERIFY_EMAIL'); 
              return; 
          }

      } catch (err: any) {
          console.error(err);
          if (err.message?.includes('already registered')) {
              setError("این ایمیل قبلاً ثبت شده است.");
              setIsEmailDuplicate(true);
              setView('SIGNUP_CREDENTIALS');
          } else {
              setError(err.message || "خطا در ثبت نام.");
          }
      } finally {
          setIsLoading(false);
      }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError("لطفا ایمیل خود را وارد کنید.");
          return;
      }
      setError('');
      setIsLoading(true);
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
              redirectTo: window.location.origin,
          });
          if (error) throw error;
          setResetSent(true);
      } catch (err: any) {
          console.error(err);
          setError(err.message || 'خطا در ارسال لینک بازیابی.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Side - Marketing / Widget */}
        <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative overflow-hidden min-h-[240px] flex flex-col justify-center shadow-2xl transition-all hover:border-slate-700">
                <div className="absolute top-6 left-6 opacity-5">
                    <Quote size={64} className="text-white" />
                </div>
                
                <div className="relative z-10 transition-all duration-700 ease-in-out transform">
                    {activeCopyIndex === 0 ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/20 mb-2">
                                <TrendingUp size={14} />
                                <span>برای ورزشکاران</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                از حدس زدن دست بردارید؛ <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">رشد ماهیچه‌ها را تضمین کنید!</span>
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-md">
                                آیا ماه‌هاست که با نهایت تلاش تمرین می‌کنید اما ماهیچه‌هایتان رشد نمی‌کنند؟ با داده‌های دقیق، مسیر را اصلاح کنید.
                            </p>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-4">
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 mb-2">
                                <Crown size={14} />
                                <span>برای مربیان</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                                تخصص خود را مقیاس دهید: <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">کنترل ۵۰ شاگرد، به آسانی یکی.</span>
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-md">
                                پلتفرم ما به شما اجازه می‌دهد روند شکست یا موفقیت تمام شاگردان را در یک داشبورد هوشمند رصد کنید.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-start gap-2 mt-8">
                    <button onClick={() => setActiveCopyIndex(0)} className={`h-1.5 rounded-full transition-all duration-300 ${activeCopyIndex === 0 ? 'bg-blue-500 w-8' : 'bg-slate-800 w-2'}`} />
                    <button onClick={() => setActiveCopyIndex(1)} className={`h-1.5 rounded-full transition-all duration-300 ${activeCopyIndex === 1 ? 'bg-emerald-500 w-8' : 'bg-slate-800 w-2'}`} />
                </div>
             </div>

             <PredictiveWidget />
        </div>

        {/* Right Side - Auth Form */}
        <div className="order-2 lg:order-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-center min-h-[600px] group">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
            
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-center relative z-10">
            
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-5 border border-slate-700/50 shadow-lg shadow-black/20">
                    <Activity className="text-emerald-400" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">ورود به فیت پرو</h1>
                <p className="text-slate-400 text-sm">پلتفرم حرفه‌ای برای مربیان و ورزشکاران</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center flex flex-col items-center justify-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-right dir-rtl">
                        <Info size={16} className="shrink-0" /> <span>{error}</span>
                    </div>
                    
                    {isEmailDuplicate && (
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                             <button 
                                onClick={() => { setView('LOGIN'); setError(''); setIsEmailDuplicate(false); }}
                                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors"
                             >
                                ورود به حساب
                             </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 mr-1">ایمیل</label>
                    <div className="relative group/input">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 placeholder:text-slate-600" 
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center mr-1">
                        <label className="block text-sm font-medium text-slate-300">رمز عبور</label>
                        <button type="button" onClick={() => { setView('FORGOT_PASSWORD'); setError(''); setResetSent(false); }} className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">فراموشی رمز؟</button>
                    </div>
                    <div className="relative group/input">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-12 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 placeholder:text-slate-600" 
                            placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ورود به پنل کاربری'}
                </button>
                
                <div className="relative flex items-center gap-4 my-6">
                     <div className="flex-1 h-px bg-slate-800"></div>
                     <span className="text-xs text-slate-500 font-medium uppercase">یا ادامه با</span>
                     <div className="flex-1 h-px bg-slate-800"></div>
                </div>
                
                <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    ورود با حساب گوگل
                </button>

                <div className="text-center pt-4">
                    <p className="text-slate-500 text-sm">حساب کاربری ندارید؟ <button type="button" onClick={() => { setView('SIGNUP_CREDENTIALS'); setError(''); }} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">ثبت‌نام رایگان</button></p>
                </div>
                </form>
            )}

            {view === 'SIGNUP_CREDENTIALS' && (
                <form onSubmit={handleStartSignup} className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 mr-1">نام و نام خانوادگی</label>
                    <div className="relative group/input">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={20} />
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600" 
                            required 
                            placeholder="علی محمدی"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 mr-1">ایمیل</label>
                    <div className="relative group/input">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={20} />
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => { setEmail(e.target.value); setIsEmailDuplicate(false); setError(''); }} 
                            className={`w-full bg-slate-950 border text-slate-200 rounded-xl py-4 pr-12 pl-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600 ${isEmailDuplicate ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-800'}`} 
                            required 
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 mr-1">شماره موبایل</label>
                    <div className="relative group/input">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={20} />
                        <input 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={e => setPhoneNumber(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600 text-left" 
                            required 
                            placeholder="0912..."
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300 mr-1">رمز عبور</label>
                    <div className="relative group/input">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600" 
                            required 
                            placeholder="حداقل ۸ کاراکتر"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div>
                    {/* Password Strength Indicator could go here if desired */}
                </div>

                <button 
                    type="submit" 
                    disabled={passStrength.score < 2 || !email || !name || !phoneNumber} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transform active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    مرحله بعد: انتخاب نقش <ArrowRight size={20} className="rotate-180"/>
                </button>
                
                <button type="button" onClick={() => { setView('LOGIN'); setError(''); setIsEmailDuplicate(false); }} className="w-full text-slate-500 text-sm py-3 hover:text-slate-300 transition-colors">بازگشت به ورود</button>
                </form>
            )}

            {view === 'SIGNUP_ROLE' && (
                <div className="space-y-6 animate-fade-in max-w-lg mx-auto w-full">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">انتخاب نقش کاربری</h3>
                        <p className="text-slate-400 text-sm">لطفاً نوع فعالیت خود را در فیت پرو مشخص کنید</p>
                    </div>
                    
                    <div onClick={() => !isLoading && handleRoleSelect('Coach')} className={`group bg-slate-950 border border-slate-800 hover:border-emerald-500 p-6 rounded-2xl cursor-pointer flex items-start gap-5 transition-all duration-300 ${isLoading ? 'opacity-50' : 'hover:shadow-lg hover:shadow-emerald-900/10'}`}>
                        <div className="bg-slate-900 p-4 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 border border-slate-800 group-hover:border-emerald-400"><Crown size={28} /></div>
                        <div>
                            <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">من مربی هستم</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">مدیریت حرفه‌ای شاگردان، طراحی برنامه و تحلیل پیشرفت تیم.</p>
                        </div>
                    </div>
                    
                    <div onClick={() => !isLoading && handleRoleSelect('Trainee')} className={`group bg-slate-950 border border-slate-800 hover:border-blue-500 p-6 rounded-2xl cursor-pointer flex items-start gap-5 transition-all duration-300 ${isLoading ? 'opacity-50' : 'hover:shadow-lg hover:shadow-blue-900/10'}`}>
                        <div className="bg-slate-900 p-4 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 border border-slate-800 group-hover:border-blue-400"><TrendingUp size={28} /></div>
                        <div>
                            <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">من ورزشکار هستم</h3>
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">دریافت برنامه، ردیابی تمرینات و مشاهده رشد عضلات.</p>
                        </div>
                    </div>

                    {isLoading && <div className="text-center text-emerald-400 flex justify-center items-center gap-2 py-4"><Loader2 className="animate-spin"/> در حال ساخت حساب کاربری...</div>}
                    
                    <button type="button" disabled={isLoading} onClick={() => setView('SIGNUP_CREDENTIALS')} className="w-full text-slate-500 text-sm py-3 hover:text-slate-300 transition-colors">بازگشت به مرحله قبل</button>
                </div>
            )}

            {view === 'SIGNUP_COACH_VERIFICATION' && (
                <form onSubmit={handleCoachVerificationSubmit} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                    <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-3 items-start">
                        <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={20}/>
                        <p className="text-sm text-emerald-100/80 leading-relaxed">جهت حفظ کیفیت، مدارک مربیگری شما توسط تیم فنی بررسی می‌شود.</p>
                    </div>
                    
                    <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/50 relative transition-all group">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setCertFile(e.target.files?.[0] || null)}/>
                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-slate-700 transition-colors">
                            <Upload className="text-slate-400 group-hover:text-white transition-colors" size={24}/>
                        </div>
                        <span className="text-sm font-medium text-slate-300 block">{certFile ? certFile.name : 'آپلود مدرک مربیگری'}</span>
                        <span className="text-xs text-slate-500 mt-1 block">PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300 mr-1">بیوگرافی کوتاه</label>
                        <textarea 
                            value={bio} 
                            onChange={e => setBio(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-4 h-28 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600 resize-none" 
                            placeholder="افتخارات، سابقه کار و تخصص خود را بنویسید..."
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setAgreed(!agreed)}>
                        <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-colors ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-slate-500'}`}>
                            {agreed && <CheckCircle size={16} className="text-white"/>}
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">صحت مدارک بارگذاری شده را تأیید می‌کنم.</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !agreed || !certFile}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ارسال مدارک و تکمیل ثبت‌نام'}
                    </button>
                    
                     <button type="button" onClick={() => setView('SIGNUP_ROLE')} className="w-full text-slate-500 text-sm py-3 hover:text-slate-300 transition-colors">بازگشت</button>
                </form>
            )}

            {view === 'VERIFY_EMAIL' && (
                <div className="text-center animate-fade-in py-12 px-4">
                     <div className="w-24 h-24 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30 shadow-xl shadow-blue-900/10">
                        <Mail size={40} className="text-blue-400" />
                     </div>
                     <h3 className="text-2xl font-bold text-white mb-4">ایمیل خود را چک کنید</h3>
                     <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                        لینک تأیید حساب کاربری به آدرس <strong className="text-blue-300">{verificationSentTo}</strong> ارسال شد. لطفاً صندوق ورودی (و اسپم) خود را بررسی کنید.
                     </p>
                     <button onClick={() => setView('LOGIN')} className="text-emerald-400 hover:text-emerald-300 hover:underline text-sm font-bold transition-colors">بازگشت به صفحه ورود</button>
                </div>
            )}
            
            {view === 'FORGOT_PASSWORD' && (
                 <form onSubmit={handleForgotPasswordRequest} className="space-y-6 animate-fade-in max-w-sm mx-auto w-full">
                     <div className="text-center mb-8">
                         <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                             <Lock size={28} className="text-slate-400"/>
                         </div>
                         <h3 className="text-xl font-bold text-white mb-2">بازیابی رمز عبور</h3>
                         <p className="text-sm text-slate-400">لینک تغییر رمز به ایمیل شما ارسال خواهد شد.</p>
                     </div>

                     {resetSent ? (
                         <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                             <CheckCircle className="mx-auto mb-3 text-emerald-500" size={32}/>
                             <p className="text-sm text-white font-medium mb-1">لینک ارسال شد</p>
                             <p className="text-xs text-slate-400 mb-4">لطفاً ایمیل خود را چک کنید.</p>
                             <button type="button" onClick={() => setView('LOGIN')} className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline">بازگشت به ورود</button>
                         </div>
                     ) : (
                         <>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-300 mr-1">ایمیل</label>
                                <div className="relative group/input">
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" size={20} />
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl py-4 pr-12 pl-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-600" 
                                        required 
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ارسال لینک بازیابی'}
                            </button>
                            <button type="button" onClick={() => setView('LOGIN')} className="w-full text-slate-500 text-sm py-3 hover:text-slate-300 transition-colors">بازگشت</button>
                         </>
                     )}
                 </form>
            )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;