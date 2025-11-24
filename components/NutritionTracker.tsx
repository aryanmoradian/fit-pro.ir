
import React, { useState, useEffect } from 'react';
import { NutritionLog, WorkoutPlan, DailyNutritionStats } from '../types';
import { USER_ID } from '../constants';
import { Save, CheckSquare, Square, Utensils, Plus, Info, Droplet, Wheat, Zap, Beef, Milk, Activity } from 'lucide-react';

interface Props {
    plan?: WorkoutPlan;
}

const NutritionTracker: React.FC<Props> = ({ plan }) => {
  // Meal Checklist State
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- Advanced Fueling State ---
  const [dailyStats, setDailyStats] = useState<DailyNutritionStats>({
      id: `stats_${new Date().toISOString().split('T')[0]}`,
      userId: USER_ID,
      date: new Date().toISOString().split('T')[0],
      waterIntake: 0,
      fiberIntake: 0,
      totalProtein: 180, // Target Default
      supplementProtein: 0,
      supplements: [
          { name: 'کراتین (5g)', taken: false, time: 'بعد تمرین' },
          { name: 'کافئین (200mg)', taken: false, time: 'قبل تمرین' },
          { name: 'مولتی ویتامین', taken: false, time: 'صبح' }
      ]
  });

  // Initialize logs from plan template
  useEffect(() => {
      if (plan && plan.nutritionTemplate && plan.nutritionTemplate.length > 0) {
          // Convert template to logs
          const templateLogs: NutritionLog[] = plan.nutritionTemplate.map(tpl => ({
              id: `log_${tpl.id}_${new Date().toISOString().split('T')[0]}`,
              userId: USER_ID,
              date: new Date().toISOString().split('T')[0],
              mealName: tpl.mealName,
              description: tpl.description,
              isCompleted: false
          }));
          setLogs(templateLogs);
      } else {
          setLogs([]);
      }
  }, [plan]);

  const toggleComplete = (id: string) => {
    setLogs(logs.map(l => l.id === id ? { ...l, isCompleted: !l.isCompleted } : l));
  };

  const updateDescription = (id: string, text: string) => {
    setLogs(logs.map(l => l.id === id ? { ...l, description: text } : l));
  };

  // --- Fueling Handlers ---
  const addWater = () => setDailyStats(prev => ({ ...prev, waterIntake: prev.waterIntake + 0.25 }));
  const removeWater = () => setDailyStats(prev => ({ ...prev, waterIntake: Math.max(0, prev.waterIntake - 0.25) }));
  
  const toggleSupplement = (name: string) => {
      setDailyStats(prev => ({
          ...prev,
          supplements: prev.supplements.map(s => s.name === name ? { ...s, taken: !s.taken } : s)
      }));
  };

  const completedCount = logs.length > 0 ? logs.filter(l => l.isCompleted).length : 0;
  const adherence = logs.length > 0 ? Math.round((completedCount / logs.length) * 100) : 0;
  
  // Protein Calculation
  const wholeFoodProtein = Math.max(0, dailyStats.totalProtein - dailyStats.supplementProtein);
  const wholeFoodPct = dailyStats.totalProtein > 0 ? Math.round((wholeFoodProtein / dailyStats.totalProtein) * 100) : 0;

  if (!plan) {
      return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-fade-in">
              <Utensils size={48} className="mb-4 opacity-50"/>
              <p>برنامه تغذیه‌ای برای شما ثبت نشده است.</p>
              <p className="text-xs mt-2">لطفاً برای دریافت برنامه با مربی خود تماس بگیرید.</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Utensils className="text-emerald-500" /> سوخت‌رسانی ماهیچه
            </h2>
            {plan && <p className="text-xs text-slate-500 mt-1">بر اساس طرح: {plan.name}</p>}
        </div>
        <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-emerald-400 hover:text-emerald-300 underline"
        >
            {isEditing ? 'اتمام ویرایش' : 'ویرایش برنامه غذایی'}
        </button>
      </div>

      {/* --- MODULE 1: PROTEIN SOURCE ANALYSIS (Quality Check) --- */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity size={20} className="text-blue-400"/> کیفیت پروتئین
              </h3>
              <div className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">هدف: {dailyStats.totalProtein}g</div>
          </div>

          {/* Inputs for Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
                 <label className="text-[10px] text-slate-500 uppercase block mb-1">پروتئین کل (گرم)</label>
                 <input 
                    type="number" 
                    value={dailyStats.totalProtein}
                    onChange={(e) => setDailyStats({...dailyStats, totalProtein: parseInt(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-sm"
                 />
             </div>
             <div>
                 <label className="text-[10px] text-purple-400 uppercase block mb-1">از مکمل/پودر (گرم)</label>
                 <input 
                    type="number" 
                    value={dailyStats.supplementProtein}
                    onChange={(e) => setDailyStats({...dailyStats, supplementProtein: parseInt(e.target.value)})}
                    className="w-full bg-slate-900 border border-purple-500/30 rounded p-2 text-white font-mono text-sm focus:border-purple-500 outline-none"
                 />
             </div>
          </div>

          {/* Analysis Bar */}
          <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-950 transition-all duration-500" 
                style={{ width: `${wholeFoodPct}%` }}
              >
                  {wholeFoodPct > 15 && <span>غذای کامل ({wholeFoodPct}%)</span>}
              </div>
              <div 
                className="h-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-purple-100 transition-all duration-500" 
                style={{ width: `${100 - wholeFoodPct}%` }}
              >
                  {(100 - wholeFoodPct) > 15 && <span>مکمل</span>}
              </div>
          </div>

          <div className="flex justify-between mt-3 text-xs">
              <div className="flex items-center gap-1 text-emerald-400">
                  <Beef size={14}/> <span>{wholeFoodProtein}g منابع طبیعی (مرغ، گوشت، تخم مرغ)</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                  <Milk size={14}/> <span>{dailyStats.supplementProtein}g منابع فرآوری (وی، بار)</span>
              </div>
          </div>
      </div>

      {/* --- MODULE 2: HYDRATION & MICROS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hydration */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Droplet size={20} className="text-cyan-400"/> هیدراتاسیون
              </h3>
              <div className="flex items-center justify-center gap-6">
                  <button onClick={removeWater} className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center text-xl font-bold">-</button>
                  <div className="text-center">
                      <span className="text-4xl font-bold text-cyan-400">{dailyStats.waterIntake}</span>
                      <p className="text-xs text-slate-500 uppercase mt-1">لیتر آب</p>
                  </div>
                  <button onClick={addWater} className="w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-cyan-900/50">+</button>
              </div>
              
              {/* Water Visualizer */}
              <div className="flex justify-center gap-1 mt-6 flex-wrap">
                  {Array.from({ length: Math.ceil(dailyStats.waterIntake * 4) }).map((_, i) => (
                      <Droplet key={i} size={12} className="text-cyan-400 fill-cyan-400" />
                  ))}
                  {Array.from({ length: Math.max(0, 12 - Math.ceil(dailyStats.waterIntake * 4)) }).map((_, i) => (
                      <Droplet key={`empty_${i}`} size={12} className="text-slate-700" />
                  ))}
              </div>
          </div>

          {/* Supplements & Fiber */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Zap size={20} className="text-yellow-400"/> مکمل و فیبر
              </h3>
              
              {/* Supplements Checklist */}
              <div className="space-y-2 mb-6">
                  {dailyStats.supplements.map((supp, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleSupplement(supp.name)}
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${supp.taken ? 'bg-yellow-500 border-yellow-500 text-slate-900' : 'border-slate-500 text-transparent'}`}
                              >
                                  <CheckSquare size={14} />
                              </button>
                              <span className={`text-sm ${supp.taken ? 'text-white' : 'text-slate-400'}`}>{supp.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{supp.time}</span>
                      </div>
                  ))}
              </div>

              {/* Fiber Input */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                      <Wheat size={16}/> فیبر (سلامت گوارش)
                  </div>
                  <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={dailyStats.fiberIntake}
                        onChange={(e) => setDailyStats({...dailyStats, fiberIntake: parseInt(e.target.value)})}
                        className="w-16 bg-slate-900 border border-slate-600 rounded p-1 text-center text-white text-sm"
                      />
                      <span className="text-xs text-slate-500">گرم</span>
                  </div>
              </div>
          </div>
      </div>

      {/* --- MODULE 3: MEAL CHECKLIST (Original) --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white mt-8 mb-2 border-b border-slate-700 pb-2">لیست وعده‌های غذایی</h3>
        {logs.map(log => (
            <div key={log.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 transition-all hover:border-slate-600">
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button 
                        onClick={() => toggleComplete(log.id)}
                        className={`mt-1 flex-shrink-0 transition-colors ${log.isCompleted ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-500'}`}
                    >
                        {log.isCompleted ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>

                    <div className="flex-1">
                        <h4 className={`font-bold text-lg ${log.isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {log.mealName}
                        </h4>
                        
                        {isEditing ? (
                            <input 
                                value={log.description}
                                onChange={(e) => updateDescription(log.id, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 mt-2 text-white text-sm"
                            />
                        ) : (
                            <p className={`text-sm mt-1 ${log.isCompleted ? 'text-slate-600' : 'text-slate-300'}`}>
                                {log.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        ))}
        
        {logs.length === 0 && (
            <div className="text-center p-8 bg-slate-800/50 rounded-xl border border-dashed border-slate-700 text-slate-500">
                <Info className="mx-auto mb-2" />
                <p>برنامه غذایی برای این طرح تعریف نشده است.</p>
            </div>
        )}
      </div>

      {/* Adherence Footer */}
      <div className="fixed bottom-0 left-0 right-0 md:right-64 bg-slate-900/90 backdrop-blur border-t border-slate-800 p-4 flex justify-between items-center z-10">
           <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold">
                   {adherence}%
               </div>
               <div className="flex flex-col">
                   <span className="text-xs text-slate-400">امتیاز تغذیه امروز</span>
                   <span className="text-sm text-white font-bold">{adherence >= 80 ? 'سوخت‌رسانی عالی!' : 'نیاز به تلاش بیشتر'}</span>
               </div>
           </div>
           <button 
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
             onClick={() => alert('گزارش تغذیه امروز ذخیره شد.')}
           >
               <Save size={16} /> ذخیره
           </button>
      </div>
    </div>
  );
};

export default NutritionTracker;
