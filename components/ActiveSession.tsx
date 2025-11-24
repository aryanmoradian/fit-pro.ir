
import React, { useState, useEffect } from 'react';
import { WorkoutPlan, WorkoutLog, ExerciseDefinition, TraineeData, VideoFeedbackLog } from '../types';
import { USER_ID } from '../constants';
import { CheckCircle, Circle, Clock, Save, TrendingUp, TrendingDown, Minus, Calendar, ChevronDown, Activity, Dumbbell, Scale, HeartPulse, X, ThumbsUp, Battery, Moon, AlertCircle, RefreshCw, Video, Upload, Loader2 } from 'lucide-react';
import { uploadWorkoutVideo, saveVideoFeedback } from '../services/userData';

interface Props {
  plan: WorkoutPlan;
  onFinish: () => void;
  exerciseDb: ExerciseDefinition[]; 
  traineeData?: TraineeData;
}

const ActiveSession: React.FC<Props> = ({ plan, onFinish, exerciseDb, traineeData }) => {
  // --- SAFETY GUARD: Check if plan exists ---
  if (!plan || !plan.days || plan.days.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-fade-in">
            <Activity size={48} className="mb-4 opacity-50"/>
            <p className="font-bold mb-2">برنامه تمرینی فعال یافت نشد.</p>
            <p className="text-sm mb-4">لطفاً از مربی خود بخواهید برنامه‌ای برای شما تنظیم کند.</p>
            <button onClick={onFinish} className="text-emerald-400 hover:underline">بازگشت به داشبورد</button>
        </div>
    );
  }

  // Use Trainee Data if available, otherwise empty
  const previousLogs = traineeData?.workoutLogs || [];

  // Wellness Modal State
  const [showWellness, setShowWellness] = useState(true); 
  const [wellnessData, setWellnessData] = useState({ sleep: 3, energy: 3, pain: 0, painArea: '' });
  const [wellnessSubmitted, setWellnessSubmitted] = useState(false);

  // Select Day
  const defaultDay = plan.days.find(d => d.name === 'دوشنبه') || plan.days[0];
  const [selectedDayId, setSelectedDayId] = useState<string>(defaultDay?.id || '');
  const currentDay = plan.days.find(d => d.id === selectedDayId) || defaultDay;
  
  // Local State
  const [sessionLogs, setSessionLogs] = useState<Record<string, WorkoutLog>>({});
  const [swappedExercises, setSwappedExercises] = useState<Record<string, string>>({}); 
  const [showSwapModal, setShowSwapModal] = useState<string | null>(null); 

  // Video Upload State
  const [uploadingExerciseId, setUploadingExerciseId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Lookup helpers
  const getExerciseName = (id: string) => exerciseDb.find(e => e.id === id)?.nameFa || exerciseDb.find(e => e.id === id)?.nameEn || id;
  const getExerciseTargetMuscle = (id: string) => exerciseDb.find(e => e.id === id)?.muscleGroup || '';

  // --- History & Logging ---
  const getHistoryLog = (targetId: string, setNumber: number) => {
    const filtered = previousLogs.filter(l => l.targetId === targetId && l.setNumber === setNumber);
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    return filtered[0] || null;
  };

  const updateLog = (targetId: string, setNumber: number, field: keyof WorkoutLog, value: any) => {
    const key = `${targetId}-${setNumber}`;
    const existingLog = sessionLogs[key] || {
        id: `new_${Date.now()}_${Math.random()}`,
        targetId,
        date: new Date().toISOString().split('T')[0],
        setNumber,
        reps: 0,
        weight: 0
    };

    setSessionLogs({
        ...sessionLogs,
        [key]: { ...existingLog, [field]: value }
    });
  };

  const getSessionLog = (targetId: string, setNumber: number) => sessionLogs[`${targetId}-${setNumber}`];
  const toggleComplete = (targetId: string, setNumber: number) => {
      if (!getSessionLog(targetId, setNumber)) updateLog(targetId, setNumber, 'weight', 0);
  };
  const isCompleted = (targetId: string, setNumber: number) => !!sessionLogs[`${targetId}-${setNumber}`];

  // --- Swap Logic ---
  const handleSwap = (targetId: string, newExerciseId: string) => {
      setSwappedExercises({ ...swappedExercises, [targetId]: newExerciseId });
      setShowSwapModal(null);
  };
  
  const getAlternatives = (targetExerciseId: string) => {
      const targetEx = exerciseDb.find(e => e.id === targetExerciseId);
      if(!targetEx) return [];
      return exerciseDb.filter(e => e.muscleGroup === targetEx.muscleGroup && e.id !== targetEx.id);
  };

  // --- Video Upload Logic ---
  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, targetId: string, exerciseName: string) => {
      if (!e.target.files || !e.target.files[0]) return;
      
      const file = e.target.files[0];
      setUploadingExerciseId(targetId);
      setIsUploading(true);

      try {
          const videoUrl = await uploadWorkoutVideo(USER_ID, file);
          const feedbackLog: VideoFeedbackLog = {
              id: `vfb_${Date.now()}`,
              workoutLogId: `log_session_${targetId}`,
              userId: USER_ID,
              exerciseName: exerciseName,
              videoUrl: videoUrl,
              uploadDate: new Date().toISOString(),
              comments: []
          };
          await saveVideoFeedback(USER_ID, feedbackLog);
          alert("ویدیو با موفقیت آپلود شد! مربی به زودی آن را بررسی می‌کند.");
      } catch (err) {
          console.error(err);
          alert("خطا در آپلود ویدیو. لطفا مجدد تلاش کنید.");
      } finally {
          setIsUploading(false);
          setUploadingExerciseId(null);
      }
  };

  // --- Progressive Overload Calculation ---
  const calculateStats = () => {
      let currentVolume = 0;
      let currentMaxWeight = 0;

      if (currentDay && currentDay.targets) {
        currentDay.targets.forEach(target => {
            for (let i = 1; i <= target.sets; i++) {
                const sLog = getSessionLog(target.id, i);
                if (sLog && sLog.weight > 0) {
                    currentVolume += (sLog.weight * sLog.reps);
                    if (sLog.weight > currentMaxWeight) currentMaxWeight = sLog.weight;
                }
            }
        });
      }
      return { currentVolume, currentMaxWeight };
  };

  const stats = calculateStats();

  const handleWellnessSubmit = () => {
      setWellnessSubmitted(true);
      setShowWellness(false);
      if (wellnessData.pain > 3 || wellnessData.sleep < 3) {
          alert("هشدار ریکاوری: با توجه به کیفیت پایین خواب یا درد مفاصل، سیستم پیشنهاد می‌کند امروز حجم تمرین را ۲۰٪ کاهش دهید.");
      }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 relative">
      
      {/* Wellness Modal */}
      {showWellness && !wellnessSubmitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <div className="text-center mb-6">
                      <HeartPulse className="text-blue-400 mx-auto mb-4" size={32} />
                      <h3 className="text-xl font-bold text-white">چکاپ آمادگی قبل تمرین</h3>
                  </div>
                  <div className="space-y-6">
                      <div>
                          <div className="flex justify-between text-sm mb-2 text-white"><span>کیفیت خواب</span><span>{wellnessData.sleep}/5</span></div>
                          <input type="range" min="1" max="5" value={wellnessData.sleep} onChange={(e) => setWellnessData({...wellnessData, sleep: parseInt(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg accent-emerald-500" />
                      </div>
                      <div>
                          <div className="flex justify-between text-sm mb-2 text-white"><span>درد مفاصل</span><span>{wellnessData.pain}/10</span></div>
                          <input type="range" min="0" max="10" value={wellnessData.pain} onChange={(e) => setWellnessData({...wellnessData, pain: parseInt(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg accent-red-500" />
                      </div>
                  </div>
                  <button onClick={handleWellnessSubmit} className="w-full mt-8 bg-emerald-600 text-white font-bold py-3 rounded-xl">ثبت و شروع تمرین</button>
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
            <div className="relative inline-block text-left mb-2">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                    <Calendar size={16} className="text-emerald-400"/>
                    <select value={selectedDayId} onChange={(e) => setSelectedDayId(e.target.value)} className="bg-transparent text-white font-bold outline-none appearance-none pr-6">
                        {plan.days.map(day => <option key={day.id} value={day.id} className="bg-slate-900 text-white">{day.name}</option>)}
                    </select>
                </div>
            </div>
            <h2 className="text-3xl font-bold text-white">{currentDay?.name || 'روز نامشخص'}</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
             <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                 <p className="text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1"><Scale size={10}/> حجم کل</p>
                 <p className="text-xl font-mono font-bold text-white">{stats.currentVolume.toLocaleString()} <span className="text-[10px] text-slate-500">kg</span></p>
             </div>
             <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                 <p className="text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1"><Activity size={10}/> رکورد</p>
                 <p className="text-xl font-mono font-bold text-white">{stats.currentMaxWeight} <span className="text-[10px] text-slate-500">kg</span></p>
             </div>
        </div>
      </div>

      {/* Workout List */}
      <div className="space-y-6">
        {currentDay?.targets.map((target, tIdx) => {
            const effectiveExerciseId = swappedExercises[target.id] || target.exerciseId;
            const isSwapped = !!swappedExercises[target.id];
            const exName = getExerciseName(effectiveExerciseId);

            return (
            <div key={target.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                <div className={`p-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-700/50 ${isSwapped ? 'bg-purple-900/20' : 'bg-slate-900/80'}`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-slate-700 text-white text-xs px-2 py-0.5 rounded-full font-mono">{tIdx + 1}</span>
                            <h3 className="text-lg font-bold text-white">
                                {exName}
                                {isSwapped && <span className="mr-2 text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">جایگزین شده</span>}
                            </h3>
                        </div>
                        <div className="flex gap-3 text-xs mt-1.5">
                            <span className="text-slate-500 bg-slate-800 px-1.5 rounded">{getExerciseTargetMuscle(effectiveExerciseId)}</span>
                            <span className="text-emerald-400 font-mono border border-emerald-500/20 px-1.5 rounded bg-emerald-500/5">هدف: {target.sets} ست x {target.reps} تکرار</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <label className="cursor-pointer text-slate-400 hover:text-blue-400 bg-slate-800 p-2 rounded-lg border border-slate-700 flex items-center gap-1 relative">
                            {isUploading && uploadingExerciseId === target.id ? (
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                            ) : (
                                <Video size={16} />
                            )}
                            <span className="text-xs hidden md:inline">ارسال فرم</span>
                            <input 
                                type="file" 
                                accept="video/*" 
                                className="hidden" 
                                onChange={(e) => handleVideoFileSelect(e, target.id, exName)}
                                disabled={isUploading}
                            />
                        </label>

                        <button 
                            onClick={() => setShowSwapModal(target.id)}
                            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg border border-slate-700" 
                            title="تعویض حرکت"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Sets Log */}
                <div className="p-2">
                    <div className="grid grid-cols-12 gap-2 mb-2 px-3 text-[10px] text-slate-500 uppercase font-bold text-center">
                        <div className="col-span-1">#</div>
                        <div className="col-span-3">سابقه</div>
                        <div className="col-span-3">کیلوگرم</div>
                        <div className="col-span-3">تکرار</div>
                        <div className="col-span-2">RPE</div>
                    </div>

                    {Array.from({ length: target.sets }).map((_, idx) => {
                        const setNum = idx + 1;
                        const sessionLog = getSessionLog(target.id, setNum);
                        const historyLog = getHistoryLog(target.id, setNum); 
                        const isDone = isCompleted(target.id, setNum);

                        let comparisonIcon = null;
                        if (sessionLog && historyLog) {
                            if (sessionLog.weight > historyLog.weight) comparisonIcon = <TrendingUp size={14} className="text-emerald-400" />;
                            else if (sessionLog.weight < historyLog.weight) comparisonIcon = <TrendingDown size={14} className="text-red-400" />;
                            else comparisonIcon = <Minus size={14} className="text-yellow-400" />;
                        }

                        return (
                            <div key={setNum} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg mb-1 transition-colors ${isDone ? 'bg-emerald-900/10 border border-emerald-500/30' : 'bg-transparent border border-transparent'}`}>
                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => toggleComplete(target.id, setNum)} className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all ${isDone ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{isDone ? <CheckCircle size={16} /> : setNum}</button>
                                </div>
                                <div className="col-span-3 flex flex-col items-center justify-center bg-slate-900/50 rounded py-1 border border-slate-800 relative overflow-hidden group">
                                    {historyLog ? <><span className="text-xs text-slate-300 font-mono font-bold">{historyLog.weight}</span><span className="text-[9px] text-slate-500">x{historyLog.reps}</span></> : <span className="text-[10px] text-slate-600">-</span>}
                                </div>
                                <div className="col-span-3 relative">
                                    <input type="number" value={sessionLog?.weight || ''} placeholder={historyLog?.weight.toString() || '-'} onChange={(e) => updateLog(target.id, setNum, 'weight', parseFloat(e.target.value))} className={`w-full bg-slate-900 border ${isDone ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-slate-700 text-white'} rounded px-1 py-2 text-center outline-none focus:border-emerald-500 font-mono text-sm transition-colors`} />
                                    {sessionLog && historyLog && <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-70">{comparisonIcon}</div>}
                                </div>
                                <div className="col-span-3 relative">
                                    <input type="number" value={sessionLog?.reps || ''} placeholder={target.reps.split('-')[0]} onChange={(e) => updateLog(target.id, setNum, 'reps', parseFloat(e.target.value))} className={`w-full bg-slate-900 border ${isDone ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-white'} rounded px-1 py-2 text-center outline-none focus:border-emerald-500 font-mono text-sm transition-colors`} />
                                </div>
                                <div className="col-span-2 relative">
                                     <input type="number" max={10} value={sessionLog?.rpe || ''} placeholder="RPE" onChange={(e) => updateLog(target.id, setNum, 'rpe', parseFloat(e.target.value))} className={`w-full bg-slate-900 border ${isDone ? 'border-emerald-500' : 'border-slate-700'} rounded px-1 py-2 text-center outline-none focus:border-emerald-500 font-mono text-sm text-yellow-400 placeholder-slate-700`} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            );
        })}
      </div>

      <button onClick={onFinish} className="fixed bottom-6 left-6 right-6 md:right-auto md:w-64 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-2xl flex items-center justify-center gap-2 z-20 border border-emerald-400/20">
        <Save size={20} /> ثبت و ذخیره جلسه
      </button>
    </div>
  );
};

export default ActiveSession;
