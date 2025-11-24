import React, { useState } from 'react';
import { WorkoutPlan, ExerciseDefinition } from '../types';
import { EXERCISE_DATABASE } from '../constants';
import { Dumbbell, Clock, Save, AlertTriangle, TrendingUp, ChevronRight, BrainCircuit } from 'lucide-react';
import { generateWorkoutRoutine } from '../services/geminiService';

// NOTE: This component is largely superseded by ActiveSession.tsx but kept for "Free Workout" mode logic if needed later.
// Updated to not break build with new types.

interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

const WorkoutLogger: React.FC = () => {
  const [activeSession, setActiveSession] = useState<Record<string, SetLog[]>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedRoutine, setGeneratedRoutine] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getExerciseName = (id: string) => EXERCISE_DATABASE.find(e => e.id === id)?.nameEn || id;

  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof SetLog, value: number) => {
    const currentSets = activeSession[exerciseId] || [];
    const newSets = [...currentSets];
    if (!newSets[setIndex]) {
        newSets[setIndex] = { setNumber: setIndex + 1, weight: 0, reps: 0, completed: false };
    }
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    setActiveSession({ ...activeSession, [exerciseId]: newSets });
  };

  const handleAIWorkout = async () => {
      if(!aiPrompt) return;
      setIsGenerating(true);
      const routine = await generateWorkoutRoutine("Intermediate Bodybuilder", aiPrompt);
      setGeneratedRoutine(routine);
      setIsGenerating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
        {/* AI Generator Placeholder for Free Mode */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4 text-purple-400">
                <BrainCircuit size={20} />
                <h3 className="font-bold">AI Program Designer</h3>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="E.g. Create a Mike Mentzer style leg workout"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                />
                <button 
                    onClick={handleAIWorkout}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                    {isGenerating ? 'Designing...' : 'Generate'}
                </button>
            </div>
            {generatedRoutine && (
                <div className="mt-4 bg-slate-950 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap text-sm text-slate-300">
                    {generatedRoutine}
                </div>
            )}
        </div>
    </div>
  );
};

export default WorkoutLogger;