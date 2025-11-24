
import React, { useState } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

const PredictiveWidget: React.FC = () => {
  const [squat, setSquat] = useState(80);
  const [consistency, setConsistency] = useState(50);

  // --- LOGIC ENGINE ---
  // Scenario 1: Guessing (Typical Gym Goer)
  // Base gain is low (5% of max), consistency helps slightly.
  const guessingGain = Math.round((squat * 0.05) + ((consistency / 100) * 5));

  // Scenario 2: FitPro (Data Driven)
  // Base gain is higher (15% of max) due to Progressive Overload tracking.
  const optimizedGain = Math.round((squat * 0.25) + ((consistency / 100) * 15));

  const difference = optimizedGain - guessingGain;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
      
      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
          <TrendingUp className="text-emerald-400" size={24} />
          <span>متر پیشرفت پیش‌بینی‌شده</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">تفاوت ۶ ماه تمرین با و بدون داده</p>
      </div>

      {/* Inputs Section */}
      <div className="space-y-6 relative z-10">
        {/* Input 1: Squat */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-2 px-1">
            <span>رکورد فعلی اسکوات</span>
            <span className="text-white font-mono font-bold bg-slate-700 px-2 py-0.5 rounded">{squat} kg</span>
          </div>
          <input 
            type="range" 
            min="40" max="180" step="5"
            value={squat} 
            onChange={(e) => setSquat(parseInt(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
          />
        </div>

        {/* Input 2: Consistency */}
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-2 px-1">
            <span>میزان نظم هفتگی شما</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded ${consistency < 50 ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
              {consistency}%
            </span>
          </div>
          <input 
            type="range" 
            min="10" max="100" step="5"
            value={consistency} 
            onChange={(e) => setConsistency(parseInt(e.target.value))}
            className={`w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer transition-all ${consistency < 50 ? 'accent-red-500 hover:accent-red-400' : 'accent-emerald-500 hover:accent-emerald-400'}`}
          />
        </div>
      </div>

      {/* Visualization (The Bars) */}
      <div className="flex items-end gap-6 h-40 mt-6 px-2 relative z-10">
        
        {/* Bar 1: Guessing */}
        <div className="flex-1 flex flex-col justify-end group">
          <div className="text-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400">
             مسیر فعلی
          </div>
          <div className="w-full bg-slate-700/50 border-t border-x border-slate-600 rounded-t-lg relative transition-all duration-700 flex items-end justify-center hover:bg-slate-700/80"
               style={{ height: `${Math.max(15, (guessingGain / 50) * 100)}%` }}>
            <span className="text-slate-300 font-bold text-lg mb-2">+{guessingGain}</span>
          </div>
          <div className="text-center mt-2 text-xs text-slate-500 font-medium">بدون ردیابی</div>
        </div>

        {/* Bar 2: FitPro */}
        <div className="flex-1 flex flex-col justify-end relative group">
           {/* Floating Badge */}
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/40 whitespace-nowrap animate-bounce">
               {difference}kg+ بیشتر
           </div>

          <div className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg relative transition-all duration-700 flex items-end justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]"
               style={{ height: `${Math.max(15, (optimizedGain / 50) * 100)}%` }}>
             <span className="text-white font-extrabold text-2xl mb-2 drop-shadow-md">+{optimizedGain}</span>
          </div>
          <div className="text-center mt-2 text-xs text-emerald-400 font-bold">با فیت پرو</div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-center">
         <p className="text-xs text-slate-300 leading-relaxed">
            <AlertCircle size={12} className="inline-block text-yellow-500 ml-1 mb-0.5"/>
            آیا حاضرید <span className="text-white font-bold border-b border-yellow-500">{difference} کیلوگرم ماهیچه خالص</span> را فقط بخاطر نداشتن ابزار دقیق از دست بدهید؟
         </p>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
    </div>
  );
};

export default PredictiveWidget;
