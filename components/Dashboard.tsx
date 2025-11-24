
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, WorkoutPlan, WellnessLog, TraineeData, WorkoutLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Scale, CheckCircle, Dumbbell, ArrowUpRight, ArrowDownRight, Divide, Camera, Utensils, Calendar, Play, CheckSquare, Square, Moon, Zap, HeartPulse, Droplet, Info, Trophy, AlertTriangle, Circle, Target } from 'lucide-react';
import { EXERCISE_DATABASE } from '../constants';
import { saveUserData } from '../services/userData';

interface Props {
  profile: UserProfile;
  plan?: WorkoutPlan;
  onStartWorkout?: () => void;
  onHireCoach?: () => void;
  traineeData?: TraineeData;
}

const Dashboard: React.FC<Props> = ({ profile, plan, onStartWorkout, onHireCoach, traineeData }) => {
  // --- SAFETY GUARD ---
  if (!profile || (!profile.measurements || profile.measurements.length === 0) && (!traineeData || !traineeData.workoutLogs.length)) {
      // Allow rendering even without measurements, but show minimal view
  }
  
  // Use Trainee Data if available, otherwise empty
  const workoutLogs = traineeData?.workoutLogs || [];
  const nutritionLogs = traineeData?.nutritionLogs || [];
  const wellnessLogs = traineeData?.wellnessLogs || [];

  // Measurements Logic
  const data = profile.measurements || [];
  const current = data.length > 0 ? data[data.length - 1] : { weight: 0, bodyFat: 0, armRight: 0, armLeft: 0, thighRight: 0, thighLeft: 0 };
  const start = data.length > 0 ? data[0] : current;
  const previous = data.length > 1 ? data[data.length - 2] : current;

  // Weight Calculation
  const targetWeight = profile.targetWeightKg || 0;
  const currentWeight = current.weight || 0;
  const startWeight = start.weight || currentWeight;
  const weightDiff = currentWeight - (previous.weight || currentWeight);
  const weightDiffFromTarget = targetWeight - currentWeight;
  
  // Progress Percent
  let progressPercent = 0;
  if (targetWeight && startWeight !== targetWeight) {
     const totalChange = targetWeight - startWeight;
     const currentChange = currentWeight - startWeight;
     progressPercent = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
  }

  // --- DATE & DAY LOGIC ---
  const getPersianDayName = () => {
      const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      const d = new Date();
      return days[d.getDay()];
  };
  const currentDayName = getPersianDayName();
  const currentDateString = new Date().toLocaleDateString('fa-IR'); 
  // Find today's scheduled workout in the plan
  const todayWorkout = plan?.days.find(d => d.name === currentDayName);

  // --- WELLNESS CHECK-IN STATE ---
  const [todayWellness, setTodayWellness] = useState<WellnessLog | null>(null);
  const [wellnessForm, setWellnessForm] = useState({
    sleepDuration: '',
    sorenessLevel: 1,
    energyMood: 'Medium' as 'High' | 'Medium' | 'Low',
    notes: ''
  });

  const getSorenessMeta = (level: number) => {
    if (level <= 3) return { color: 'text-emerald-400', label: 'خفیف', accent: '#34d399' };
    if (level <= 6) return { color: 'text-yellow-400', label: 'متوسط', accent: '#facc15' };
    if (level <= 8) return { color: 'text-orange-500', label: 'زیاد', accent: '#f97316' };
    return { color: 'text-rose-500', label: 'شدید', accent: '#f43f5e' };
  };
  const sorenessMeta = getSorenessMeta(wellnessForm.sorenessLevel);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = wellnessLogs.find(l => l.date === today);
    if (existingLog) {
        setTodayWellness(existingLog);
    }
  }, [profile.id, wellnessLogs]);

  const handleWellnessSubmit = async () => {
      const today = new Date().toISOString().split('T')[0];
      const newLog: WellnessLog = {
          id: `wl_${Date.now()}`,
          userId: profile.id,
          date: today,
          sleepDuration: parseFloat(wellnessForm.sleepDuration) || 0,
          sorenessLevel: wellnessForm.sorenessLevel,
          energyMood: wellnessForm.energyMood,
          notes: wellnessForm.notes
      };
      
      setTodayWellness(newLog);
      
      if (profile.id && profile.role !== 'Guest') {
          try {
              const updatedLogs = [...wellnessLogs, newLog];
              await saveUserData(profile.id, { wellnessLogs: updatedLogs });
          } catch (error) {
              console.error("Error saving wellness log:", error);
              alert("خطا در ذخیره وضعیت ریکاوری.");
          }
      }
  };

  // --- NUTRITION CHECKLIST STATE ---
  const [nutritionChecklist, setNutritionChecklist] = useState<{id: string, completed: boolean}[]>([]);
  
  useEffect(() => {
      if (plan?.nutritionTemplate) {
          setNutritionChecklist(plan.nutritionTemplate.map(meal => ({ id: meal.id, completed: false })));
      } else {
          setNutritionChecklist([]);
      }
  }, [plan]);

  const toggleMeal = (id: string) => {
      setNutritionChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const totalMeals = nutritionChecklist.length;
  const completedMeals = nutritionChecklist.filter(i => i.completed).length;
  
  // Workout Logs existence
  const todayDate = new Date().toISOString().split('T')[0];
  const hasLogsForToday = workoutLogs.some(l => l.date === todayDate);

  // Consistency Score Logic
  const uniqueTrainingDates = new Set(workoutLogs.map(l => l.date));
  const actualTrainingDays = uniqueTrainingDates.size; 
  const daysPerWeek = plan ? plan.days.length : 3; 
  const plannedTrainingDays = daysPerWeek * 4; 
  const trainingScoreRaw = plannedTrainingDays > 0 ? (actualTrainingDays / plannedTrainingDays) * 100 : 0;
  const trainingScore = Math.min(100, Math.round(trainingScoreRaw)); 

  // Overall Score
  const overallConsistency = trainingScore; // Simplified for clean state

  // Symmetry
  const armDiff = Math.abs((current.armRight || 0) - (current.armLeft || 0)).toFixed(1);

  // Mock Volume Data Generator for Empty State Handling
  // If logs exist, we should build real volume data. If not, return empty or flat line.
  const generateVolumeData = () => {
      if (workoutLogs.length === 0) return [];
      // Simplified mock generator if real logic isn't fully implemented
      return [];
  };
  const volumeData = generateVolumeData();

  // --- WEEKLY PROGRESS CALC ---
  const calculateWeeklyProgress = () => {
      if (!plan) return { total: 0, completed: 0, percent: 0 };

      // 1. Total Planned Sets for one week
      let totalSets = 0;
      plan.days.forEach(day => {
          day.targets.forEach(t => {
              totalSets += t.sets;
          });
      });

      if (totalSets === 0) return { total: 0, completed: 0, percent: 0 };

      // 2. Completed Sets this week (Saturday Start)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun, ... 6=Sat
      // Shift to make Sat=0, Sun=1... Fri=6
      const daysSinceSaturday = (dayOfWeek + 1) % 7;
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysSinceSaturday);
      startOfWeek.setHours(0,0,0,0);

      const completedSets = workoutLogs.filter(l => {
          const [y, m, d] = l.date.split('-').map(Number);
          const logDate = new Date(y, m - 1, d);
          logDate.setHours(0,0,0,0);
          return logDate.getTime() >= startOfWeek.getTime();
      }).length;

      const percent = Math.min(100, Math.round((completedSets / totalSets) * 100));
      
      return { total: totalSets, completed: completedSets, percent };
  };

  const weeklyStats = calculateWeeklyProgress();

  // --- CALCULATE PERSONAL RECORDS (PRs) ---
  const personalRecords = useMemo(() => {
    if (!workoutLogs.length) return [];

    // Map Target IDs to Exercise Names using current Plan
    // Note: Only works for exercises present in the current plan
    const targetMap = new Map<string, string>();
    if (plan) {
        plan.days.forEach(day => {
            day.targets.forEach(target => {
                const ex = EXERCISE_DATABASE.find(e => e.id === target.exerciseId);
                const name = ex ? (ex.nameFa || ex.nameEn) : target.exerciseId;
                targetMap.set(target.id, name);
            });
        });
    }

    const prMap = new Map<string, { weight: number, reps: number, date: string, name: string }>();

    workoutLogs.forEach(log => {
        // Try to find name from plan, fallback to generic if not found (for now just skip if not in plan to be safe)
        const name = targetMap.get(log.targetId);
        if (!name) return;

        const currentPR = prMap.get(name);
        if (!currentPR || log.weight > currentPR.weight) {
            prMap.set(name, {
                weight: log.weight,
                reps: log.reps,
                date: log.date,
                name: name
            });
        }
    });

    return Array.from(prMap.values()).sort((a, b) => b.weight - a.weight);
  }, [workoutLogs, plan]);

  return (
    <div className="space-y-6 animate-fade-in pb-20 relative">
      
      {/* 1. WELCOME & DAILY STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            درود، {profile.name} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-slate-400 mt-1">بیایید امروز را با قدرت شروع کنیم.</p>
        </div>
        
        {/* Consistency Badge */}
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full">
           <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-400 font-bold uppercase">امتیاز نظم (۳۰ روز)</span>
               <span className={`text-xl font-bold ${overallConsistency >= 80 ? 'text-emerald-400' : overallConsistency >= 50 ? 'text-yellow-400' : 'text-slate-500'}`}>
                   {overallConsistency}%
               </span>
           </div>
           <div className="h-10 w-10 rounded-full border-4 border-slate-700 flex items-center justify-center">
               <Activity size={20} className={overallConsistency >= 80 ? 'text-emerald-400' : overallConsistency >= 50 ? 'text-yellow-400' : 'text-slate-500'} />
           </div>
        </div>
      </div>

      {/* NEW: WEEKLY PROGRESS BAR */}
      {plan && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                      <Target size={24} />
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-white">وضعیت تمرینی هفته جاری</span>
                          <span className="text-xs text-slate-400 font-mono">{weeklyStats.completed} / {weeklyStats.total} ست</span>
                      </div>
                      <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                            style={{ width: `${weeklyStats.percent}%` }}
                          ></div>
                      </div>
                  </div>
                  <div className="text-2xl font-bold text-white font-mono min-w-[3rem] text-center">{weeklyStats.percent}%</div>
              </div>
          </div>
      )}

      {/* 2. WELLNESS CHECK-IN MODULE (Priority 1) */}
      <div id="tour-wellness" className="bg-gradient-to-br from-slate-800 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HeartPulse className="text-blue-400" /> وضعیت ریکاوری امروز
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">داده‌های شما هوش مصنوعی را برای تنظیم فشار تمرین راهنمایی می‌کند.</p>
              </div>
              {todayWellness ? (
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> ثبت شده
                  </span>
              ) : (
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      منتظر ورودی
                  </span>
              )}
          </div>

          {todayWellness ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-700">
                      <Moon className="mx-auto text-blue-400 mb-1" size={20} />
                      <div className="text-lg font-bold text-white">{todayWellness.sleepDuration}h</div>
                      <div className="text-[10px] text-slate-500">خواب دیشب</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                      <Zap className="mx-auto text-yellow-400 mb-1" size={20} />
                      <div className="text-lg font-bold text-white">{todayWellness.energyMood === 'High' ? 'بالا' : todayWellness.energyMood === 'Medium' ? 'متوسط' : 'پایین'}</div>
                      <div className="text-[10px] text-slate-500">سطح انرژی</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                      <Activity className="mx-auto text-rose-400 mb-1" size={20} />
                      <div className="text-lg font-bold text-white">{todayWellness.sorenessLevel}/10</div>
                      <div className="text-[10px] text-slate-500">درد عضلانی</div>
                  </div>
              </div>
          ) : (
              <div className="space-y-4">
                  {/* Sleep Slider */}
                  <div>
                      <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-300">ساعت خواب دیشب</span>
                          <span className="text-blue-400 font-bold">{wellnessForm.sleepDuration || 0} ساعت</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="12" step="0.5" 
                        value={wellnessForm.sleepDuration} 
                        onChange={(e) => setWellnessForm({...wellnessForm, sleepDuration: e.target.value})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                  </div>

                  {/* Soreness Slider */}
                  <div>
                      <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-300">میزان کوفتگی بدن (Soreness)</span>
                          <span className={`font-bold ${sorenessMeta.color}`}>{wellnessForm.sorenessLevel}/10 ({sorenessMeta.label})</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500">بدون درد</span>
                          <input 
                            type="range" 
                            min="1" max="10" step="1" 
                            value={wellnessForm.sorenessLevel} 
                            onChange={(e) => setWellnessForm({...wellnessForm, sorenessLevel: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                          />
                          <span className="text-slate-500">شدید</span>
                      </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                      {['High', 'Medium', 'Low'].map((mood) => (
                          <button 
                            key={mood}
                            onClick={() => setWellnessForm({...wellnessForm, energyMood: mood as any})}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${wellnessForm.energyMood === mood ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                          >
                              {mood === 'High' ? 'انرژی بالا 🚀' : mood === 'Medium' ? 'معمولی 😐' : 'خسته 😴'}
                          </button>
                      ))}
                  </div>

                  <button 
                    onClick={handleWellnessSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-900/20"
                  >
                      ثبت وضعیت و شروع روز
                  </button>
              </div>
          )}
      </div>

      {/* 3. TODAY'S PLAN & PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Today's Workout */}
          <div id="tour-daily-perf" className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                      <Dumbbell className="text-emerald-500" /> برنامه امروز
                      <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                        <Calendar size={12} /> {currentDateString}
                      </span>
                  </h3>
                  {plan && todayWorkout ? (
                      <span className="text-xs bg-slate-800 text-white px-3 py-1 rounded-full border border-slate-700">{todayWorkout.name}</span>
                  ) : (
                      <span className="text-xs bg-slate-800 text-slate-500 px-3 py-1 rounded-full">فاقد برنامه</span>
                  )}
              </div>

              {!plan ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                      <AlertTriangle size={40} className="text-yellow-500 mb-4 opacity-80"/>
                      <p className="text-white font-bold mb-2">شما هنوز برنامه‌ای دریافت نکرده‌اید. لطفاً با مربی خود تماس بگیرید.</p>
                      <button onClick={onHireCoach} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
                          اتصال به مربی
                      </button>
                  </div>
              ) : todayWorkout ? (
                  <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-3 mb-6">
                          {todayWorkout.targets.slice(0, 3).map((t, i) => (
                              <div key={i} className="flex items-center justify-between bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 font-bold text-xs">
                                          {i + 1}
                                      </div>
                                      <div>
                                          <div className="text-sm font-bold text-white">
                                              {EXERCISE_DATABASE.find(e => e.id === t.exerciseId)?.nameFa || t.exerciseId}
                                          </div>
                                          <div className="text-[10px] text-slate-500">{t.sets} ست x {t.reps} تکرار</div>
                                      </div>
                                  </div>
                                  {hasLogsForToday ? <CheckCircle size={18} className="text-emerald-500"/> : <Circle size={18} className="text-slate-600"/>}
                              </div>
                          ))}
                          {todayWorkout.targets.length > 3 && (
                              <p className="text-center text-xs text-slate-500">+ {todayWorkout.targets.length - 3} حرکت دیگر</p>
                          )}
                      </div>

                      {hasLogsForToday ? (
                          <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-xl text-center">
                              <p className="text-emerald-400 font-bold text-sm">تمرین امروز تکمیل شد! خسته نباشید.</p>
                          </div>
                      ) : (
                          <button 
                            onClick={onStartWorkout}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-900/30"
                          >
                              <Play size={18} fill="currentColor" /> شروع تمرین
                          </button>
                      )}
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
                      <Moon size={40} className="mb-3 opacity-50"/>
                      <p>امروز روز استراحت است.</p>
                      <p className="text-xs mt-1">روی ریکاوری و تغذیه تمرکز کنید.</p>
                  </div>
              )}
          </div>

          {/* Nutrition Checklist (Mini) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-white flex items-center gap-2">
                      <Utensils className="text-orange-500" /> تغذیه
                  </h3>
                  <span className="text-xs font-mono text-slate-500">{completedMeals}/{totalMeals}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[200px] mb-4">
                  {nutritionChecklist.length > 0 ? nutritionChecklist.map((item, idx) => {
                       const mealName = plan?.nutritionTemplate?.find(m => m.id === item.id)?.mealName || 'وعده';
                       return (
                          <div 
                            key={item.id} 
                            onClick={() => toggleMeal(item.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${item.completed ? 'bg-emerald-900/10 border-emerald-500/30 opacity-60' : 'bg-slate-800 border-slate-700 hover:border-orange-500/50'}`}
                          >
                              {item.completed ? <CheckSquare size={18} className="text-emerald-500"/> : <Square size={18} className="text-slate-600"/>}
                              <span className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{mealName}</span>
                          </div>
                       );
                  }) : (
                      <div className="text-center py-8 text-slate-500 text-xs">
                          <p>برنامه تغذیه ندارید.</p>
                      </div>
                  )}
              </div>
              
              {/* Hydration Mini-Tracker */}
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs text-blue-300 flex items-center gap-1"><Droplet size={12}/> آب (لیتر)</span>
                  <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`w-2 h-6 rounded-full bg-slate-700`}></div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* 4. METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Weight & Goal */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Scale size={18} /></div>
                  {weightDiff !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${weightDiff < 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {Math.abs(weightDiff)}kg {weightDiff < 0 ? <ArrowDownRight size={10}/> : <ArrowUpRight size={10}/>}
                      </span>
                  )}
              </div>
              <div className="flex items-baseline gap-2">
                   <div className="text-2xl font-bold text-white">{current.weight || 0} <span className="text-sm text-slate-500 font-normal">kg</span></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">وزن فعلی</div>
          </div>

           {/* Body Fat */}
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Activity size={18} /></div>
              </div>
              <div className="text-2xl font-bold text-white">{current.bodyFat || '-'} <span className="text-sm text-slate-500 font-normal">%</span></div>
              <div className="text-xs text-slate-500 mt-1">چربی بدن</div>
          </div>

           {/* Symmetry Score */}
           <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Divide size={18} /></div>
                  {parseFloat(armDiff) > 1 && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">عدم تقارن</span>}
              </div>
              <div className="text-2xl font-bold text-white">{armDiff} <span className="text-sm text-slate-500 font-normal">cm</span></div>
              <div className="text-xs text-slate-500 mt-1">اختلاف سایز بازوها</div>
          </div>

          {/* Progress Photos */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                      <div className="p-2 bg-slate-800/80 backdrop-blur rounded-lg text-white"><Camera size={18} /></div>
                  </div>
                  <div>
                      <div className="text-lg font-bold text-white">گالری تصاویر</div>
                      <div className="text-xs text-slate-300 flex items-center gap-1">مشاهده و مقایسه</div>
                  </div>
              </div>
          </div>
      </div>

      {/* 5. ANALYTICS CHART */}
      <div id="tour-analytics" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volume Trend Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-center min-h-[300px]">
              {volumeData.length === 0 ? (
                  <div className="text-center text-slate-500">
                      <TrendingUp size={48} className="mx-auto mb-4 opacity-20"/>
                      <p>داده‌ای برای نمایش وجود ندارد. اولین تمرین خود را ثبت کنید.</p>
                  </div>
              ) : (
                  <div className="w-full h-full">
                       {/* Render Charts Here if data exists */}
                  </div>
              )}
          </div>

          {/* Strength Records (PRs) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col">
               <h3 className="font-bold text-white flex items-center gap-2 mb-4 shrink-0">
                  <Trophy className="text-yellow-400" /> رکوردهای شخصی (PR)
              </h3>
              
              {personalRecords.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                    <p className="text-sm">داده‌ای ثبت نشده است.</p>
                    <p className="text-xs mt-1">اولین تمرین خود را ثبت کنید تا رکوردها محاسبه شوند.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                    {personalRecords.map((pr, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>
                                    {idx === 0 ? '🥇' : idx + 1}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">{pr.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-mono">{pr.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-emerald-400 font-mono">{pr.weight} <span className="text-xs font-sans text-emerald-600">kg</span></div>
                                <div className="text-[10px] text-slate-500">{pr.reps} تکرار</div>
                            </div>
                        </div>
                    ))}
                </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
