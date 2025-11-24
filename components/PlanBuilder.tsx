




import React, { useState, useEffect, useRef } from 'react';
import { WorkoutPlan, ExerciseTarget, ExerciseDefinition, NutritionMealTemplate, MuscleGroup, EquipmentType } from '../types';
import { EXERCISE_DATABASE, USER_ID } from '../constants';
import { Plus, Save, Trash2, Copy, Search, ChevronLeft, Info, Dumbbell, Check, X, Utensils, PenTool, Share2, FileText, Download, MessageCircle, Printer, Calendar, Lock, Edit, LayoutTemplate } from 'lucide-react';

interface Props {
  onSave: (plan: WorkoutPlan) => void;
  customExercises: ExerciseDefinition[];
  onAddCustomExercise: (ex: ExerciseDefinition) => void;
  onRemoveCustomExercise?: (exerciseId: string) => void;
  targetTraineeId?: string; // IF set, we are building for a specific trainee
  targetTraineeName?: string;
  initialPlan?: WorkoutPlan; // Logic to Load Existing Plan
  isReadOnly?: boolean; // Logic to restrict edits for Trainees with Coaches
}

const WEEKDAYS = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Abs', 'Cardio'];
const EQUIPMENT_TYPES: EquipmentType[] = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Smith Machine'];

const PlanBuilder: React.FC<Props> = ({ onSave, customExercises, onAddCustomExercise, onRemoveCustomExercise, targetTraineeId, targetTraineeName, initialPlan, isReadOnly }) => {
  // --- Mode State ---
  // 'SUMMARY' = Dashboard of the plan (View mode)
  // 'WIZARD' = Editing mode (The steps)
  const [mode, setMode] = useState<'SUMMARY' | 'WIZARD'>(initialPlan ? 'SUMMARY' : 'WIZARD');

  // --- Wizard State ---
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Added Step 4 for Export/Share

  // --- Step 1: Setup Data ---
  const [planName, setPlanName] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [includeNutrition, setIncludeNutrition] = useState(false);

  // --- Step 2: Builder Data ---
  const [days, setDays] = useState<{ id: string, name: string, targets: Partial<ExerciseTarget>[] }[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  
  // --- Step 3: Nutrition Data ---
  const [nutritionMeals, setNutritionMeals] = useState<NutritionMealTemplate[]>([]);
  const [newMealName, setNewMealName] = useState('');
  const [newMealDesc, setNewMealDesc] = useState('');

  // Search & Custom Exercise State
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingTargetIndex, setEditingTargetIndex] = useState<number | null>(null); 
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // New Exercise Form Data
  const [newExNameFa, setNewExNameFa] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Legs');
  const [newExEquip, setNewExEquip] = useState<EquipmentType>('Barbell');

  // Combine Default DB with Custom User Exercises
  const fullExerciseList = [...customExercises, ...EXERCISE_DATABASE];

  // --- INITIALIZATION: Load Existing Plan ---
  useEffect(() => {
      if (initialPlan) {
          setPlanName(initialPlan.name);
          setWeeks(initialPlan.weeksCount);
          
          const weekdayNames = initialPlan.days.map(d => d.name);
          setSelectedWeekdays(weekdayNames);
          
          // Map existing days
          const mappedDays = initialPlan.days.map(d => ({
              id: d.id,
              name: d.name,
              targets: d.targets.map(t => ({...t})) // Deep copy targets
          }));
          setDays(mappedDays);
          
          if (initialPlan.nutritionTemplate && initialPlan.nutritionTemplate.length > 0) {
              setIncludeNutrition(true);
              setNutritionMeals([...initialPlan.nutritionTemplate]);
          } else {
              setIncludeNutrition(false);
              setNutritionMeals([]);
          }
      }
  }, [initialPlan]);

  // --- Auto-Focus on Search Open ---
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  // --- Handlers Step 1 ---
  const toggleWeekday = (day: string) => {
    if (selectedWeekdays.includes(day)) {
      setSelectedWeekdays(selectedWeekdays.filter(d => d !== day));
    } else {
      const newDays = [...selectedWeekdays, day].sort((a, b) => WEEKDAYS.indexOf(a) - WEEKDAYS.indexOf(b));
      setSelectedWeekdays(newDays);
    }
  };

  const handleStep1Next = () => {
    if (!planName.trim()) {
      alert('لطفا نام برنامه را وارد کنید.');
      return;
    }
    if (selectedWeekdays.length === 0) {
      alert('لطفا حداقل یک روز تمرینی را انتخاب کنید.');
      return;
    }

    // Logic to Sync "Selected Weekdays" with "Days Object"
    // If a day is in selectedWeekdays but NOT in days, add it.
    // If a day is in days but NOT in selectedWeekdays, remove it.
    // Existing days should preserve their targets.
    
    const updatedDays = selectedWeekdays.map(dayName => {
        const existing = days.find(d => d.name === dayName);
        if (existing) return existing;
        return {
            id: `day_${Date.now()}_${Math.random()}`,
            name: dayName,
            targets: []
        };
    });
    
    setDays(updatedDays);
    setStep(2);
    setActiveDayIndex(0);
  };

  // --- Handlers Step 2 ---
  const handleStep2Next = () => {
      if (includeNutrition) {
          setStep(3);
      } else {
          handleFinalize();
      }
  };

  const openSearchForAdd = () => {
      setEditingTargetIndex(null);
      setSearchQuery('');
      setIsCreatingCustom(false);
      setShowSearch(true);
  };

  const openSearchForReplace = (index: number) => {
      setEditingTargetIndex(index);
      setSearchQuery('');
      setIsCreatingCustom(false);
      setShowSearch(true);
  };

  const selectExercise = (exercise: ExerciseDefinition) => {
    const updatedDays = [...days];
    
    if (editingTargetIndex !== null) {
        // Replace existing
        updatedDays[activeDayIndex].targets[editingTargetIndex] = {
            ...updatedDays[activeDayIndex].targets[editingTargetIndex],
            exerciseId: exercise.id,
        };
    } else {
        // Add New
        const newTarget: Partial<ExerciseTarget> = {
            id: `target_${Date.now()}_${Math.random()}`,
            exerciseId: exercise.id,
            sets: 3,
            reps: '10-12',
            restTime: '60',
            order: days[activeDayIndex].targets.length + 1,
            dayName: days[activeDayIndex].name,
            notes: ''
        };
        updatedDays[activeDayIndex].targets.push(newTarget);
    }

    setDays(updatedDays);
    setShowSearch(false);
    setSearchQuery('');
  };

  const startCustomCreation = () => {
      setNewExNameFa(searchQuery);
      setIsCreatingCustom(true);
  };

  const saveCustomExercise = () => {
      if (!newExNameFa) return;
      
      const newEx: ExerciseDefinition = {
          id: `custom_${Date.now()}`,
          nameEn: newExNameFa, // Fallback for EN
          nameFa: newExNameFa,
          muscleGroup: newExMuscle,
          equipment: newExEquip,
          mechanics: 'Isolation' // Default
      };

      onAddCustomExercise(newEx);
      selectExercise(newEx); // Auto-select after creating
      setIsCreatingCustom(false);
  };

  const removeTarget = (targetIndex: number) => {
    const updatedDays = [...days];
    updatedDays[activeDayIndex].targets.splice(targetIndex, 1);
    // Re-order
    updatedDays[activeDayIndex].targets.forEach((t, i) => t.order = i + 1);
    setDays(updatedDays);
  };

  const updateTarget = (targetIndex: number, field: keyof ExerciseTarget, value: any) => {
    const updatedDays = [...days];
    updatedDays[activeDayIndex].targets[targetIndex] = {
      ...updatedDays[activeDayIndex].targets[targetIndex],
      [field]: value
    };
    setDays(updatedDays);
  };

  const copyFromDay = (sourceDayName: string) => {
    const sourceDay = days.find(d => d.name === sourceDayName);
    if (!sourceDay) return;

    const confirmCopy = confirm(`آیا مطمئن هستید؟ حرکات روز "${sourceDayName}" جایگزین حرکات فعلی (${days[activeDayIndex].name}) خواهند شد.`);
    if (!confirmCopy) return;

    const updatedDays = [...days];
    // Deep copy targets with new IDs
    updatedDays[activeDayIndex].targets = sourceDay.targets.map(t => ({
        ...t,
        id: `target_${Date.now()}_${Math.random()}`,
        dayName: updatedDays[activeDayIndex].name
    }));

    setDays(updatedDays);
  };

  // --- Handlers Step 3 (Nutrition) ---
  const addMeal = () => {
      if (!newMealName.trim()) return;
      const meal: NutritionMealTemplate = {
          id: `meal_${Date.now()}`,
          mealName: newMealName,
          description: newMealDesc
      };
      setNutritionMeals([...nutritionMeals, meal]);
      setNewMealName('');
      setNewMealDesc('');
  };

  const removeMeal = (id: string) => {
      setNutritionMeals(nutritionMeals.filter(m => m.id !== id));
  };

  const handleFinalize = () => {
    const emptyDays = days.filter(d => d.targets.length === 0);
    if (emptyDays.length > 0) {
      const confirmSave = confirm(`روزهای (${emptyDays.map(d => d.name).join('، ')}) خالی هستند. آیا مایل به ذخیره هستید؟`);
      if (!confirmSave) return;
    }
    // Go to Overview/Export
    setStep(4);
  };

  const confirmAndSave = () => {
      const finalPlan: WorkoutPlan = {
        id: `plan_${Date.now()}`,
        userId: USER_ID, // The Creator (Coach)
        traineeId: targetTraineeId, // The Receiver (Trainee)
        name: planName,
        startDate: new Date().toISOString().split('T')[0],
        weeksCount: weeks,
        creatorId: USER_ID,
        isActive: true,
        nutritionTemplate: includeNutrition ? nutritionMeals : undefined,
        days: days.map(d => ({
          id: d.id,
          name: d.name,
          targets: d.targets as ExerciseTarget[]
        }))
      };
  
      onSave(finalPlan);
      // Switch to Summary Mode
      setMode('SUMMARY');
  }

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <html dir="rtl">
        <head>
          <title>برنامه تمرینی - ${planName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Vazirmatn', Tahoma, sans-serif; padding: 40px; color: #000; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 28px; }
            .meta { margin-top: 10px; font-size: 14px; display: flex; justify-content: space-between; }
            
            .section-title { background: #eee; padding: 8px 15px; font-weight: bold; margin-top: 30px; border-radius: 8px; border-right: 5px solid #333; font-size: 18px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            th { background-color: #f9f9f9; font-weight: bold; }
            
            .notes { font-size: 11px; color: #666; font-style: italic; }
            
            .nutrition-list { list-style: none; padding: 0; margin-top: 15px; }
            .nutrition-item { border: 1px solid #ddd; padding: 12px; margin-bottom: 8px; border-radius: 8px; display: flex; justify-content: space-between; }
            .nutrition-name { font-weight: bold; }
            
            @media print {
               button { display: none; }
               body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>برنامه تمرینی و تغذیه اختصاصی</h1>
            <div class="meta">
                <span>نام برنامه: <strong>${planName}</strong></span>
                <span>مدت دوره: <strong>${weeks} هفته</strong></span>
                <span>تاریخ چاپ: <strong>${new Date().toLocaleDateString('fa-IR')}</strong></span>
            </div>
          </div>

          ${days.map(day => `
             <div class="day-block">
                <div class="section-title">برنامه ${day.name}</div>
                ${day.targets.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th width="5%">#</th>
                                <th width="40%">نام حرکت</th>
                                <th width="10%">ست</th>
                                <th width="15%">تعداد / زمان</th>
                                <th width="15%">استراحت</th>
                                <th width="15%">توضیحات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${day.targets.map((t, i) => {
                                const ex = fullExerciseList.find(e => e.id === t.exerciseId);
                                const exName = ex ? (ex.nameFa || ex.nameEn) : t.exerciseId;
                                return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td><strong>${exName}</strong></td>
                                        <td>${t.sets}</td>
                                        <td>${t.reps}</td>
                                        <td>${t.restTime || '60s'}</td>
                                        <td class="notes">${t.notes || '-'}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                ` : '<p style="padding:10px; color:#666;">استراحت</p>'}
             </div>
          `).join('')}

          ${includeNutrition ? `
             <div style="page-break-before: always;"></div>
             <div class="section-title">برنامه تغذیه و مکمل</div>
             <ul class="nutrition-list">
                 ${nutritionMeals.map(meal => `
                    <li class="nutrition-item">
                        <span class="nutrition-name">${meal.mealName}</span>
                        <span>${meal.description}</span>
                    </li>
                 `).join('')}
             </ul>
          ` : ''}

          <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #999;">
             تولید شده توسط سیستم هوشمند فیت پرو
          </div>
          
          <script>
             window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredExercises = fullExerciseList.filter(ex => 
    ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ex.nameFa && ex.nameFa.includes(searchQuery))
  );

  // --- RENDER: SUMMARY VIEW ---
  if (mode === 'SUMMARY') {
      return (
          <div className="space-y-6 animate-fade-in pb-20">
               {/* Header */}
               <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex justify-between items-center shadow-lg">
                   <div>
                       <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                           <LayoutTemplate className="text-emerald-400" /> مدیریت برنامه
                       </h2>
                       <p className="text-slate-400 mt-1">نام طرح: <span className="text-white font-bold">{planName}</span> ({weeks} هفته)</p>
                   </div>
                   <div className="flex gap-3">
                       <button 
                          onClick={handleExportPDF}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                       >
                           <Printer size={18} /> دانلود PDF
                       </button>
                       {!isReadOnly && (
                           <button 
                              onClick={() => { setStep(1); setMode('WIZARD'); }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                           >
                               <Edit size={18} /> ویرایش کلی
                           </button>
                       )}
                   </div>
               </div>

               {/* Read Only Warning */}
               {isReadOnly && (
                   <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3">
                       <Lock className="text-blue-400" size={20} />
                       <p className="text-sm text-blue-200">
                           این برنامه توسط مربی شما تنظیم شده است. برای تغییرات با مربی خود تماس بگیرید.
                       </p>
                   </div>
               )}

               {/* Overview Content */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Workout Summary */}
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                       <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                           <h3 className="text-lg font-bold text-white flex items-center gap-2">
                               <Dumbbell className="text-orange-400" size={18} /> برنامه تمرین
                           </h3>
                           {!isReadOnly && (
                               <button onClick={() => { setStep(2); setMode('WIZARD'); }} className="text-xs text-emerald-400 hover:underline">ویرایش</button>
                           )}
                       </div>
                       <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                           {days.map(d => (
                               <div key={d.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                                   <span className="text-sm font-bold text-slate-200">{d.name}</span>
                                   <span className="text-xs text-slate-500">{d.targets.length} حرکت</span>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Nutrition Summary */}
                   <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                       <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                           <h3 className="text-lg font-bold text-white flex items-center gap-2">
                               <Utensils className="text-blue-400" size={18} /> برنامه تغذیه
                           </h3>
                           {!isReadOnly && (
                               <button onClick={() => { setStep(3); setMode('WIZARD'); }} className="text-xs text-emerald-400 hover:underline">ویرایش</button>
                           )}
                       </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                           {includeNutrition ? nutritionMeals.map(m => (
                               <div key={m.id} className="p-3 bg-slate-800 rounded-lg">
                                   <div className="text-sm font-bold text-slate-200">{m.mealName}</div>
                                   <div className="text-xs text-slate-500 truncate">{m.description}</div>
                               </div>
                           )) : <p className="text-slate-500 text-sm text-center py-4">برنامه تغذیه ندارد</p>}
                       </div>
                   </div>
               </div>
          </div>
      );
  }

  // --- RENDER: WIZARD MODE (Edit/Create) ---
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Coach Mode Banner */}
      {targetTraineeId && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex items-center gap-3 mb-4">
              <PenTool className="text-yellow-400" size={20} />
              <div>
                  <h3 className="text-white font-bold text-sm">حالت طراحی برنامه برای: <span className="text-yellow-400 text-lg">{targetTraineeName}</span></h3>
                  <p className="text-xs text-slate-400">این برنامه مستقیماً در پنل شاگرد ذخیره خواهد شد.</p>
              </div>
          </div>
      )}

      {/* Wizard Header */}
      <div className="flex items-center justify-center mb-6 select-none">
        <div className={`flex items-center gap-2 transition-colors ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600'}`}>1</div>
          <span className="font-bold text-sm hidden md:inline">تنظیمات</span>
        </div>
        <div className={`w-8 md:w-16 h-0.5 mx-2 transition-colors ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
        <div className={`flex items-center gap-2 transition-colors ${step >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600'}`}>2</div>
          <span className="font-bold text-sm hidden md:inline">طراحی</span>
        </div>
        {includeNutrition && (
            <>
                <div className={`w-8 md:w-16 h-0.5 mx-2 transition-colors ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                <div className={`flex items-center gap-2 transition-colors ${step >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 3 ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600'}`}>3</div>
                    <span className="font-bold text-sm hidden md:inline">تغذیه</span>
                </div>
            </>
        )}
         <div className={`w-8 md:w-16 h-0.5 mx-2 transition-colors ${step >= 4 ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
        <div className={`flex items-center gap-2 transition-colors ${step >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 4 ? 'border-emerald-400 bg-emerald-400/10' : 'border-slate-600'}`}>4</div>
          <span className="font-bold text-sm hidden md:inline">اشتراک</span>
        </div>
      </div>

      {/* STEP 1: SETUP SCREEN */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 text-emerald-400">
            <div className="flex items-center gap-3">
                <Info size={24} />
                <h2 className="text-xl font-bold text-white">مشخصات کلی دوره</h2>
            </div>
            {/* Back to Summary if Editing */}
            {initialPlan && (
                <button onClick={() => setMode('SUMMARY')} className="text-xs text-slate-500 hover:text-white">انصراف</button>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 mb-2 text-sm font-medium">نام برنامه</label>
              <input 
                type="text" 
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="مثلا: حجم خشک تابستان"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 mb-2 text-sm font-medium">مدت زمان (هفته)</label>
                <input 
                    type="number" 
                    value={weeks}
                    min={1}
                    max={52}
                    onChange={(e) => setWeeks(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-2 text-sm font-medium">برنامه تغذیه</label>
                <div 
                    onClick={() => setIncludeNutrition(!includeNutrition)}
                    className={`cursor-pointer h-[58px] w-full bg-slate-900 border ${includeNutrition ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-slate-600'} rounded-xl px-4 flex items-center justify-between transition-all`}
                >
                    <span className={`text-sm ${includeNutrition ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {includeNutrition ? 'فعال (مرحله ۳)' : 'غیرفعال'}
                    </span>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${includeNutrition ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${includeNutrition ? '-translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-3 text-sm font-medium">روزهای تمرین</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {WEEKDAYS.map(day => {
                    const isSelected = selectedWeekdays.includes(day);
                    return (
                        <button
                            key={day}
                            onClick={() => toggleWeekday(day)}
                            className={`p-3 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                            isSelected
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            {isSelected && <Check size={14} />}
                            {day}
                        </button>
                    );
                })}
              </div>
            </div>

            <button 
              onClick={handleStep1Next}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl mt-6 flex items-center justify-center gap-2 shadow-lg"
            >
              مرحله بعد <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SPREADSHEET BUILDER */}
      {step === 2 && (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
            
            {/* Header: Tabs & Copy Actions */}
            <div className="bg-slate-900 border-b border-slate-700">
                {/* Top Controls */}
                <div className="flex justify-between items-center p-2 border-b border-slate-800">
                     <button 
                         onClick={() => setStep(1)}
                         className="text-slate-400 hover:text-white text-xs px-3 py-1 flex items-center gap-1"
                    >
                        <ChevronLeft className="rotate-180" size={14} /> بازگشت
                    </button>
                    
                    {/* Smart Copy Button */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-emerald-500 px-3 py-1.5 rounded-lg transition-colors">
                            <Copy size={14} />
                            <span className="hidden md:inline">کپی از روز دیگر...</span>
                        </button>
                        {/* Dropdown for Copy */}
                        <div className="absolute left-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-2 z-20 hidden group-hover:block">
                            <p className="text-[10px] text-slate-500 mb-2 px-2">انتخاب روز مبدا:</p>
                            {days.filter(d => d.name !== days[activeDayIndex].name).map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => copyFromDay(d.name)}
                                    className="w-full text-right text-xs text-white hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-lg transition-colors flex justify-between"
                                >
                                    <span>{d.name}</span>
                                    <span className="text-slate-400 text-xs">{d.targets.length} حرکت</span>
                                </button>
                            ))}
                            {days.filter(d => d.name !== days[activeDayIndex].name).length === 0 && (
                                <div className="text-xs text-slate-500 px-2 py-1">روز دیگری وجود ندارد</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Scrollbar */}
                <div className="flex overflow-x-auto custom-scrollbar px-2 pt-2">
                    {days.map((day, idx) => (
                        <button
                            key={day.id}
                            onClick={() => setActiveDayIndex(idx)}
                            className={`px-6 py-3 whitespace-nowrap rounded-t-lg text-sm font-bold transition-all border-b-2 mx-1 ${
                                activeDayIndex === idx 
                                ? 'bg-slate-800 text-emerald-400 border-emerald-500' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                            }`}
                        >
                            {day.name}
                            <span className="mr-2 text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full text-slate-300">
                                {day.targets.length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Spreadsheet Table */}
            <div className="flex-1 overflow-y-auto bg-slate-800 relative">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-900/95 sticky top-0 z-10 text-slate-400 text-xs uppercase font-medium shadow-sm backdrop-blur-sm">
                        <tr>
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3 w-1/3">نام حرکت</th>
                            <th className="p-3 w-20 text-center">ست</th>
                            <th className="p-3 w-24 text-center">تکرار</th>
                            <th className="p-3 w-24 text-center">استراحت</th>
                            <th className="p-3">یادداشت</th>
                            <th className="p-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {days[activeDayIndex].targets.map((target, idx) => {
                            const exercise = fullExerciseList.find(e => e.id === target.exerciseId);
                            return (
                                <tr key={idx} className="group hover:bg-slate-700/20 transition-colors">
                                    <td className="p-2 text-center text-slate-500 font-mono text-xs">
                                        {idx + 1}
                                    </td>
                                    <td className="p-2">
                                        <button 
                                            onClick={() => openSearchForReplace(idx)}
                                            className="w-full text-right px-3 py-2 bg-slate-800/50 border border-transparent hover:border-emerald-500 rounded-lg transition-all flex flex-col items-start"
                                        >
                                            <span className="text-sm font-bold text-white">{exercise?.nameEn}</span>
                                            <span className="text-[10px] text-slate-400">{exercise?.nameFa || exercise?.muscleGroup}</span>
                                        </button>
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={target.sets}
                                            onChange={(e) => updateTarget(idx, 'sets', parseInt(e.target.value))}
                                            className="w-full bg-slate-900/50 border border-slate-700 hover:border-slate-500 focus:border-emerald-500 rounded-lg p-2 text-center text-white font-mono outline-none transition-colors"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={target.reps}
                                            onChange={(e) => updateTarget(idx, 'reps', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 hover:border-slate-500 focus:border-emerald-500 rounded-lg p-2 text-center text-white font-mono outline-none transition-colors"
                                        />
                                    </td>
                                    <td className="p-2 relative">
                                        <input 
                                            type="text" 
                                            value={target.restTime || ''}
                                            placeholder="60"
                                            onChange={(e) => updateTarget(idx, 'restTime', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 hover:border-slate-500 focus:border-emerald-500 rounded-lg p-2 text-center text-white font-mono outline-none transition-colors"
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={target.notes}
                                            onChange={(e) => updateTarget(idx, 'notes', e.target.value)}
                                            placeholder="توضیحات..."
                                            className="w-full bg-slate-900/50 border border-slate-700 hover:border-slate-500 focus:border-emerald-500 rounded-lg p-2 text-right text-white text-xs outline-none transition-colors"
                                        />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button 
                                            onClick={() => removeTarget(idx)}
                                            className="text-slate-600 hover:text-red-500 p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            title="حذف"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        
                        {/* Add Row Button */}
                        <tr>
                            <td colSpan={7} className="p-3">
                                <button 
                                    onClick={openSearchForAdd}
                                    className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                                >
                                    <Plus size={18} />
                                    افزودن حرکت جدید (اینتر)
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="h-20"></div> {/* Spacer for bottom FAB/Actions */}
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end">
                 <button 
                    onClick={handleStep2Next}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-transform hover:scale-105"
                >
                    {includeNutrition ? 'مرحله بعد (تغذیه)' : 'ذخیره و اشتراک‌گذاری'} <ChevronLeft className={includeNutrition ? 'block' : 'hidden'} size={20} />
                    {!includeNutrition && <Share2 size={20} />}
                </button>
            </div>
        </div>
      )}

      {/* STEP 3: NUTRITION TEMPLATE */}
      {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                      <div className="flex items-center gap-3 text-emerald-400">
                          <Utensils size={24} />
                          <h2 className="text-xl font-bold text-white">طراحی الگوی تغذیه</h2>
                      </div>
                      <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs">
                          <ChevronLeft className="rotate-180" size={14} /> بازگشت
                      </button>
                  </div>
                  
                  {/* Meal Adder */}
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input 
                            value={newMealName}
                            onChange={e => setNewMealName(e.target.value)}
                            placeholder="نام وعده (مثلا: صبحانه)"
                            className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                          />
                          <input 
                            value={newMealDesc}
                            onChange={e => setNewMealDesc(e.target.value)}
                            placeholder="اقلام غذایی (مثلا: ۵ تخم مرغ...)"
                            className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                          />
                      </div>
                      <button 
                        onClick={addMeal}
                        disabled={!newMealName}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                          <Plus size={18} /> افزودن وعده به لیست
                      </button>
                  </div>

                  {/* Meal List */}
                  <div className="space-y-3">
                      {nutritionMeals.length === 0 && (
                          <p className="text-center text-slate-500 py-8">هنوز وعده‌ای اضافه نشده است.</p>
                      )}
                      {nutritionMeals.map(meal => (
                          <div key={meal.id} className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center justify-between group hover:border-slate-500 transition-colors">
                              <div>
                                  <h4 className="text-white font-bold">{meal.mealName}</h4>
                                  <p className="text-sm text-slate-400">{meal.description}</p>
                              </div>
                              <button 
                                onClick={() => removeMeal(meal.id)}
                                className="text-slate-600 hover:text-red-400 p-2"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                      ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                      <button 
                        onClick={handleFinalize}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-transform hover:scale-105"
                      >
                          <Share2 size={20} /> ذخیره و اشتراک‌گذاری
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* STEP 4: EXPORT & SHARE */}
      {step === 4 && (
          <div className="max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl animate-scale-in">
             <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                 <Check size={48} className="text-white" />
             </div>
             
             <h2 className="text-2xl font-bold text-white mb-2">برنامه با موفقیت آماده شد!</h2>
             <p className="text-slate-400 mb-8">
                 برنامه «{planName}» {targetTraineeName ? `برای ${targetTraineeName}` : ''} آماده اشتراک‌گذاری است.
             </p>

             <div className="grid grid-cols-1 gap-4 mb-8">
                 <button 
                    onClick={handleExportPDF}
                    className="bg-slate-700 hover:bg-slate-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all group"
                 >
                     <FileText className="text-red-400 group-hover:scale-110 transition-transform" />
                     <span>دانلود فایل PDF استاندارد (نسخه چاپی)</span>
                 </button>

                 <button 
                    className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all group"
                 >
                     <MessageCircle className="fill-white group-hover:scale-110 transition-transform" />
                     <span>ارسال مستقیم به واتس‌اپ</span>
                 </button>
             </div>
             
             <div className="border-t border-slate-700 pt-6">
                 <button 
                    onClick={confirmAndSave}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl"
                 >
                     پایان و بازگشت به داشبورد
                 </button>
             </div>
          </div>
      )}

      {/* SMART SEARCH MODAL */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center pt-24 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-600 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl max-h-[70vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                    {isCreatingCustom 
                        ? 'تعریف حرکت جدید' 
                        : (editingTargetIndex !== null ? 'تغییر حرکت' : 'افزودن حرکت جدید')
                    }
                </h3>
                <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>

            {/* MODE: Search List */}
            {!isCreatingCustom && (
                <>
                <div className="p-4 bg-slate-800">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                        <input 
                        ref={searchInputRef}
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="نام حرکت را تایپ کنید (مثلا: پرس...)"
                        className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl pr-12 pl-4 py-4 text-white text-lg focus:border-emerald-500 outline-none shadow-inner transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {filteredExercises.length === 0 && searchQuery.length > 0 ? (
                         // Empty State with Create Action
                         <div className="p-6 text-center">
                            <p className="text-slate-500 mb-4">نتیجه‌ای یافت نشد.</p>
                            <button 
                                onClick={startCustomCreation}
                                className="w-full bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-900/50 transition-colors"
                            >
                                <PenTool size={18} />
                                ایجاد حرکت: "{searchQuery}"
                            </button>
                         </div>
                    ) : filteredExercises.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            حرکت مورد نظر را جستجو کنید.
                        </div>
                    ) : (
                        <>
                            {filteredExercises.map((ex, i) => {
                                const isCustom = customExercises.some(c => c.id === ex.id);
                                return (
                                <button
                                key={ex.id}
                                onClick={() => selectExercise(ex)}
                                className={`w-full flex items-center justify-between p-4 hover:bg-slate-800 rounded-xl text-right group border border-transparent hover:border-slate-600 transition-all mb-1 ${i === 0 ? 'bg-slate-800/50' : ''}`}
                                >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-900">
                                        <Dumbbell size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200 text-base group-hover:text-emerald-400">{ex.nameEn}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{ex.nameFa || ex.muscleGroup}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isCustom && (
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(window.confirm('حذف این حرکت سفارشی؟ این عملیات قابل بازگشت نیست.')) {
                                                    onRemoveCustomExercise?.(ex.id);
                                                }
                                            }}
                                            className="p-2 rounded-full hover:bg-red-900/50 text-slate-600 hover:text-red-400 transition-colors"
                                            title="حذف حرکت سفارشی"
                                        >
                                            <Trash2 size={16} />
                                        </div>
                                    )}
                                    <Plus size={20} className="text-slate-600 group-hover:text-emerald-500" />
                                </div>
                                </button>
                            )})}
                            
                            {/* Always show Create Custom at bottom if search is active */}
                            {searchQuery.length > 2 && (
                                <button 
                                    onClick={startCustomCreation}
                                    className="w-full mt-4 p-3 text-slate-500 text-xs border-t border-slate-800 hover:text-emerald-400 flex items-center justify-center gap-1"
                                >
                                    <Plus size={12} /> حرکت مورد نظر نیست؟ ساخت "{searchQuery}"
                                </button>
                            )}
                        </>
                    )}
                </div>
                </>
            )}

            {/* MODE: Create Custom Exercise */}
            {isCreatingCustom && (
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-slate-400 text-xs mb-1">نام حرکت (فارسی)</label>
                        <input 
                            type="text" 
                            value={newExNameFa}
                            onChange={e => setNewExNameFa(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs mb-1">گروه ماهیچه‌ای</label>
                            <select 
                                value={newExMuscle}
                                onChange={e => setNewExMuscle(e.target.value as MuscleGroup)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                            >
                                {MUSCLE_GROUPS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs mb-1">تجهیزات</label>
                            <select 
                                value={newExEquip}
                                onChange={e => setNewExEquip(e.target.value as EquipmentType)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                            >
                                {EQUIPMENT_TYPES.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            onClick={() => setIsCreatingCustom(false)}
                            className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-xl hover:bg-slate-700 transition-colors"
                        >
                            انصراف
                        </button>
                        <button 
                            onClick={saveCustomExercise}
                            disabled={!newExNameFa}
                            className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            ذخیره و افزودن
                        </button>
                    </div>
                </div>
            )}
            
            {!isCreatingCustom && (
                <div className="p-2 text-center text-[10px] text-slate-600 bg-slate-900 rounded-b-2xl">
                    از لیست بالا انتخاب کنید
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanBuilder;