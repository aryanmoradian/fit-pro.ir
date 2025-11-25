import React, { useState, useEffect } from 'react';
import { AuthViewMode, UserRole } from '../types';
import { Activity, Mail, Lock, User, Upload, Crown, TrendingUp, Quote, Phone, Eye, EyeOff, CheckCircle, Info, Loader2, ArrowRight } from 'lucide-react';
import PredictiveWidget from './PredictiveWidget';
import { useAuth } from '../context/AuthContext';
import { uploadCertification } from '../services/userData';
import { supabase } from '../lib/supabaseClient'; // Needed only for manual updates like Cert upload if AuthContext doesn't cover it

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
      // AuthContext and App will handle redirection upon state change
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
          // 1. Sign Up - Critical: Pass Metadata for SQL Trigger to handle Profile Creation
          const { error } = await signUp(email.trim(), password, {
              full_name: name,
              phone: phoneNumber,
              role: role 
          });

          if (error) throw error;

          // We need to get the user ID to upload certs. Since signUp might not return session immediately if email confirmation is on,
          // we might need to handle this carefully. Assuming auto-confirm for now or that we can get user from response.
          // Note: AuthContext doesn't return the user object from signUp explicitly in the interface I defined, but supabase does.
          // Let's re-fetch user session if auto-login happened.
          
          // For Coach Certs: ideally this should be done after login. 
          // If the user is created but not logged in (verify email), we can't upload certs yet due to RLS.
          // We will prompt user to upload certs in profile if they are a coach and skipped this step due to verification flow.
          // However, if session IS active (no verification required), we proceed.
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && role === 'Coach' && certFile) {
              try {
                  const uploadedCertUrl = await uploadCertification(session.user.id, certFile);
                  // Update profile with bio and cert
                  await supabase.from('profiles').update({
                      bio: bio,
                      cert_url: uploadedCertUrl 
                  }).eq('id', session.user.id);
              } catch (uploadErr) {
                  console.error("Certificate upload failed but user created:", uploadErr);
              }
          } else if (!session && role === 'Coach') {
              // Email verification required case
              setVerificationSentTo(email);
              setView('VERIFY_EMAIL'); 
              return; // Exit early to show verification view
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="order-1 lg:order-2 flex flex-col justify-center space-y-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-center shadow-xl">
                <div className="absolute top-6 left-6 opacity-10">
                    <Quote size={48} className="text-white" />
                </div>
                
                <div className="transition-all duration-700 ease-in-out transform">
                    {activeCopyIndex === 0 ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="inline-block bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-2">برای ورزشکاران</div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                از حدس زدن دست بردارید؛ <span className="text-blue-400">رشد ماهیچه‌ها را تضمین کنید!</span>
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                                آیا ماه‌هاست که با نهایت تلاش تمرین می‌کنید اما ماهیچه‌هایتان رشد نمی‌کنند؟
                            </p>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-4">
                            <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-2">برای مربیان</div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                تخصص خود را مقیاس دهید: <span className="text-emerald-400">کنترل ۵۰ شاگرد، به آسانی یکی.</span>
                            </h2>
                            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                                پلتفرم ما به شما اجازه می‌دهد روند شکست یا موفقیت تمام شاگردان را در یک صفحه رصد کنید.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-2 mt-6">
                    <button onClick={() => setActiveCopyIndex(0)} className={`w-2 h-2 rounded-full transition-all ${activeCopyIndex === 0 ? 'bg-white w-6' : 'bg-slate-700'}`} />
                    <button onClick={() => setActiveCopyIndex(1)} className={`w-2 h-2 rounded-full transition-all ${activeCopyIndex === 1 ? 'bg-white w-6' : 'bg-slate-700'}`} />
                </div>
             </div>

             <PredictiveWidget />
        </div>

        <div className="order-2 lg:order-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col justify-center min-h-[600px]">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
            
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 border border-slate-700 shadow-lg">
                    <Activity className="text-emerald-400" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">فیت پرو</h1>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center flex flex-col items-center justify-center gap-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-right dir-rtl">
                        <Info size={16} className="shrink-0" /> <span>{error}</span>
                    </div>
                    
                    {isEmailDuplicate && (
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                             <button 
                                onClick={() => { setView('LOGIN'); setError(''); setIsEmailDuplicate(false); }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-red-900/20"
                             >
                                ورود به حساب
                             </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">ایمیل</label>
                    <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-4 text-white outline-none focus:border-emerald-500 transition-colors" placeholder="aryan@example.com"/>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">رمز عبور</label>
                    <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-10 text-white outline-none focus:border-emerald-500 transition-colors" 
                        placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                    </div>
                    <button type="button" onClick={() => { setView('FORGOT_PASSWORD'); setError(''); setResetSent(false); }} className="text-xs text-slate-500 hover:text-white mt-2 block text-left">رمز عبور را فراموش کرده‌اید؟</button>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ورود به پنل'}
                </button>
                
                <div className="relative flex items-center gap-2 mt-4 mb-4">
                     <div className="flex-1 h-px bg-slate-800"></div>
                     <span className="text-xs text-slate-500">یا</span>
                     <div className="flex-1 h-px bg-slate-800"></div>
                </div>
                <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    ورود با گوگل
                </button>

                <div className="text-center pt-6 border-t border-slate-800 mt-4">
                    <p className="text-slate-500 text-sm">حساب ندارید؟ <button type="button" onClick={() => { setView('SIGNUP_CREDENTIALS'); setError(''); }} className="text-blue-400 font-bold underline">ثبت‌نام رایگان</button></p>
                </div>
                </form>
            )}

            {view === 'SIGNUP_CREDENTIALS' && (
                <form onSubmit={handleStartSignup} className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">نام و نام خانوادگی</label>
                    <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-4 text-white outline-none focus:border-blue-500" required placeholder="آریان مرادیان"/>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">ایمیل</label>
                    <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => { setEmail(e.target.value); setIsEmailDuplicate(false); setError(''); }} 
                        className={`w-full bg-slate-950 border rounded-xl py-3.5 pr-10 pl-4 text-white outline-none focus:border-blue-500 transition-colors ${isEmailDuplicate ? 'border-red-500 focus:border-red-500 text-red-100' : 'border-slate-700'}`} 
                        required 
                        placeholder="aryan@example.com"
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">موبایل</label>
                    <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-4 text-white outline-none focus:border-blue-500 text-left" required placeholder="0912..."/>
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">رمز عبور</label>
                    <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-10 text-white outline-none focus:border-blue-500 transition-colors" 
                            required 
                            placeholder="حداقل ۸ کاراکتر"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={passStrength.score < 2 || !email || !name || !phoneNumber} 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    انتخاب نقش <ArrowRight size={20} className="rotate-180"/>
                </button>
                
                 <div className="relative flex items-center gap-2 mt-4 mb-4">
                     <div className="flex-1 h-px bg-slate-800"></div>
                     <span className="text-xs text-slate-500">یا</span>
                     <div className="flex-1 h-px bg-slate-800"></div>
                </div>
                <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                    ورود با گوگل
                </button>
                
                <button type="button" onClick={() => { setView('LOGIN'); setError(''); setIsEmailDuplicate(false); }} className="w-full text-slate-500 text-sm py-2 hover:text-white">بازگشت به ورود</button>
                </form>
            )}

            {view === 'SIGNUP_ROLE' && (
                <div className="space-y-4 animate-fade-in max-w-lg mx-auto w-full">
                    <div className="text-center mb-4 text-slate-400 text-sm">یکی از موارد زیر را انتخاب کنید:</div>
                    
                    <div onClick={() => !isLoading && handleRoleSelect('Coach')} className={`group bg-slate-950 border border-slate-800 hover:border-emerald-500 p-5 rounded-2xl cursor-pointer flex items-start gap-4 ${isLoading ? 'opacity-50' : ''}`}>
                        <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0 mt-1"><Crown size={24} /></div>
                        <div><h3 className="font-bold text-white text-lg">من مربی هستم</h3><p className="text-xs text-slate-400 mt-2">مدیریت شاگردان و تحلیل پیشرفت تیم.</p></div>
                    </div>
                    
                    <div onClick={() => !isLoading && handleRoleSelect('Trainee')} className={`group bg-slate-950 border border-slate-800 hover:border-blue-500 p-5 rounded-2xl cursor-pointer flex items-start gap-4 ${isLoading ? 'opacity-50' : ''}`}>
                        <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0 mt-1"><TrendingUp size={24} /></div>
                        <div><h3 className="font-bold text-white text-lg">من ورزشکار هستم</h3><p className="text-xs text-slate-400 mt-2">ردیابی تمرین و رشد عضلات.</p></div>
                    </div>

                    {isLoading && <div className="text-center text-emerald-400 flex justify-center items-center gap-2"><Loader2 className="animate-spin"/> در حال ساخت حساب کاربری...</div>}
                    
                    <button type="button" disabled={isLoading} onClick={() => setView('SIGNUP_CREDENTIALS')} className="w-full text-slate-500 text-sm py-2 hover:text-white">بازگشت</button>
                </div>
            )}

            {view === 'SIGNUP_COACH_VERIFICATION' && (
                <form onSubmit={handleCoachVerificationSubmit} className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                    <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl flex gap-3"><CheckCircle className="text-emerald-400 shrink-0" size={20}/><p className="text-xs text-emerald-200">مدارک شما توسط تیم فنی بررسی می‌شود.</p></div>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center cursor-pointer bg-slate-950 relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setCertFile(e.target.files?.[0] || null)}/><Upload className="mx-auto mb-2 text-slate-500"/><span className="text-sm text-slate-300 block">{certFile ? certFile.name : 'آپلود مدرک مربیگری'}</span></div>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white h-24 text-sm" placeholder="بیوگرافی و افتخارات..."/>
                    <div className="flex items-center gap-2"><div onClick={() => setAgreed(!agreed)} className={`w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>{agreed && <CheckCircle size={14} className="text-white"/>}</div><span className="text-xs text-slate-400">صحت مدارک را تأیید می‌کنم.</span></div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !agreed || !certFile}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ارسال مدارک و ثبت نام'}
                    </button>
                    
                     <button type="button" onClick={() => setView('SIGNUP_ROLE')} className="w-full text-slate-500 text-sm py-2 hover:text-white">بازگشت</button>
                </form>
            )}

            {view === 'VERIFY_EMAIL' && (
                <div className="text-center animate-fade-in py-10">
                     <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        <Mail size={32} className="text-blue-400" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">ایمیل خود را چک کنید</h3>
                     <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                        لینک تأیید حساب کاربری به آدرس <strong>{verificationSentTo}</strong> ارسال شد.
                     </p>
                     <button onClick={() => setView('LOGIN')} className="text-emerald-400 hover:underline text-sm">بازگشت به ورود</button>
                </div>
            )}
            
            {view === 'FORGOT_PASSWORD' && (
                 <form onSubmit={handleForgotPasswordRequest} className="space-y-5 animate-fade-in max-w-sm mx-auto w-full">
                     <div className="text-center mb-6">
                         <h3 className="text-lg font-bold text-white">بازیابی رمز عبور</h3>
                         <p className="text-xs text-slate-400 mt-1">لینک تغییر رمز به ایمیل شما ارسال خواهد شد.</p>
                     </div>

                     {resetSent ? (
                         <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl text-center">
                             <CheckCircle className="mx-auto mb-2 text-emerald-500" size={24}/>
                             <p className="text-sm text-white">لینک ارسال شد. ایمیل خود را چک کنید.</p>
                             <button type="button" onClick={() => setView('LOGIN')} className="mt-4 text-xs text-emerald-400 hover:underline">بازگشت به ورود</button>
                         </div>
                     ) : (
                         <>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1 mr-1 font-bold">ایمیل</label>
                                <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 pr-10 pl-4 text-white outline-none focus:border-blue-500 transition-colors" required placeholder="aryan@example.com"/>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-4 flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : 'ارسال لینک بازیابی'}
                            </button>
                            <button type="button" onClick={() => setView('LOGIN')} className="w-full text-slate-500 text-sm py-2 hover:text-white">بازگشت</button>
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
