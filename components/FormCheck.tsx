
import React, { useState } from 'react';
import { Upload, Video, Loader2, CheckCircle, Dumbbell, ChevronDown } from 'lucide-react';
import { analyzeFormVideo } from '../services/geminiService';

const MOVEMENT_TYPES = [
  { id: 'Squat', label: 'اسکوات (Squat)' },
  { id: 'Deadlift', label: 'ددلیفت (Deadlift)' },
  { id: 'Bench Press', label: 'پرس سینه (Bench Press)' },
  { id: 'Overhead Press', label: 'پرس سرشانه (Overhead Press)' },
  { id: 'Pull Up', label: 'بارفیکس (Pull Up)' },
  { id: 'Row', label: 'زیربغل (Row)' },
  { id: 'Other', label: 'سایر حرکات' }
];

const FormCheck: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [movementType, setMovementType] = useState('Squat');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis('');
    }
  };

  const handleAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    
    const prompt = `Act as an elite strength coach and biomechanics expert. Analyze the user's form performing the "${movementType}" exercise in the attached video.
    
    Please provide a structured analysis in Persian (Farsi) covering:
    1. **Technique Check**: Is the movement pattern correct for a ${movementType}?
    2. **Safety Errors**: Identify high-risk deviations (e.g., spinal flexion, knee valgus, improper path).
    3. **Efficiency**: Is the bar path vertical? Is tension maintained?
    4. **Corrections**: Give 2-3 specific, actionable cues to fix the issues.
    
    Format the output with clear headings and bullet points. Be encouraging but strict on safety.`;

    const result = await analyzeFormVideo(file, prompt);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
           <Video className="text-emerald-500" /> آنالیزور هوشمند فرم
        </h2>
        <p className="text-slate-400">ویدیوی حرکت خود را آپلود کنید تا هوش مصنوعی بیومکانیک آن را بررسی کند.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Area */}
          <div className="bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-emerald-500 transition-colors relative group">
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              id="video-upload"
            />
            <div className="bg-slate-900/50 p-4 rounded-full mb-4 group-hover:bg-emerald-500/20 transition-colors">
                {file ? <Video className="w-8 h-8 text-emerald-400" /> : <Upload className="w-8 h-8 text-slate-400" />}
            </div>
            <span className="text-lg font-medium text-white">
                {file ? file.name : "انتخاب ویدیو تمرین"}
            </span>
            <span className="text-xs text-slate-500 mt-2">حداکثر ۱۰۰ مگابایت (MP4/MOV)</span>
          </div>

          {/* Settings */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-center space-y-4">
             <div>
                 <label className="block text-sm text-slate-400 mb-2">نوع حرکت را انتخاب کنید:</label>
                 <div className="relative">
                     <select 
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white appearance-none outline-none focus:border-emerald-500 cursor-pointer"
                     >
                         {MOVEMENT_TYPES.map(type => (
                             <option key={type.id} value={type.id}>{type.label}</option>
                         ))}
                     </select>
                     <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                 </div>
             </div>

             <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-300">
                 <InfoIcon />
                 برای بهترین نتیجه، لطفاً ویدیو را از زاویه پهلو یا روبرو (بسته به حرکت) ضبط کنید تا تمام مفاصل درگیر دیده شوند.
             </div>

             {file && !analysis && (
                <button 
                  onClick={handleAnalysis}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-emerald-900/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <SparklesIcon />}
                  {loading ? 'در حال تحلیل فریم‌به‌فریم...' : `آنالیز ${movementType}`}
                </button>
             )}
          </div>
      </div>

      {analysis && (
        <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 animate-fade-in shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          <div className="flex items-center gap-2 mb-6 text-emerald-400">
            <CheckCircle size={24} />
            <h3 className="text-xl font-bold">گزارش تحلیل تکنیک</h3>
          </div>
          <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
            {analysis}
          </div>
          <div className="mt-6 flex justify-end">
              <button onClick={() => setAnalysis('')} className="text-sm text-slate-500 hover:text-white">آپلود ویدیوی جدید</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icons
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 mb-0.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

export default FormCheck;
    