import React, { useState } from 'react';
import { generateNutritionPlan } from '../services/geminiService';
import { BrainCircuit, Utensils, Loader2 } from 'lucide-react';

const Nutrition: React.FC = () => {
  const [goal, setGoal] = useState('Muscle Gain (Hypertrophy)');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Using hardcoded profile for demo, in real app pass from context
    const userContext = "Male, 88kg, 180cm, 25 years old, Intermediate lifter.";
    const result = await generateNutritionPlan(userContext, goal);
    setPlan(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Nutrition Lab</h2>
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 border border-purple-400/30 px-2 py-1 rounded">
          <BrainCircuit size={14} />
          <span>THINKING MODE: ON (Budget: 32k Tokens)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
             <label className="block text-slate-400 mb-2 text-sm">Current Goal</label>
             <select 
               value={goal}
               onChange={(e) => setGoal(e.target.value)}
               className="w-full bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
             >
               <option>Muscle Gain (Hypertrophy)</option>
               <option>Fat Loss (Cutting)</option>
               <option>Maintenance (Recomp)</option>
               <option>Strength Peaking</option>
             </select>

             <button 
               onClick={handleGenerate}
               disabled={loading}
               className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
             >
               {loading ? <Loader2 className="animate-spin" /> : <Utensils />}
               Generate Plan
             </button>
           </div>
           
           <div className="bg-slate-900/50 p-4 rounded-lg text-sm text-slate-500">
             <p>This module uses Gemini 3 Pro's "Thinking" capability to calculate precise macros based on metabolic rate and activity level.</p>
           </div>
        </div>

        <div className="md:col-span-2">
          {plan ? (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[600px] overflow-y-auto">
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {plan}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-[600px] flex flex-col items-center justify-center text-slate-500">
              <BrainCircuit size={48} className="mb-4 opacity-20" />
              <p>Select a goal and generate your meal plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
