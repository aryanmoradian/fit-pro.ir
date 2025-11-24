
import { ExerciseDefinition, WorkoutPlan, UserProfile, WorkoutLog, ExerciseTarget, NutritionLog, TraineeSummary, WellnessLog, DirectMessage, WorkoutTemplate, CoachInsight } from "./types";

// Models
export const MODEL_CHAT = 'gemini-3-pro-preview'; 
export const MODEL_FAST = 'gemini-2.5-flash-lite-latest'; 
export const MODEL_THINKING = 'gemini-3-pro-preview'; 
export const MODEL_LIVE = 'gemini-2.5-flash-native-audio-preview-09-2025'; 
export const MODEL_VISION = 'gemini-3-pro-preview'; 
export const MODEL_SEARCH = 'gemini-2.5-flash'; 

// IDs
export const COACH_ID = '';
export const ATHLETE_ID = '';
export const SYSTEM_ID = 'system';
export const USER_ID = 'guest'; // Default init

// --- SECRET ADMIN CREDENTIALS ---
export const ADMIN_CONFIG = {
    SECRET_PATH: '/secure-admin-panel',
    USERNAME: 'admin_fitpro_master',
    PASSWORD: 'SecurePassword123!', 
    SUPER_ADMIN_UID: 'ORyDkCblRCgccwDZCaQmqEuKspw1' 
};

// --- 1. GUEST PROFILE (Initial State) ---
export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest',
  name: 'کاربر مهمان',
  role: 'Guest',
  age: 0,
  height: 0,
  gender: "Male" as any,
  joiningDate: new Date().toISOString().split('T')[0],
  experienceLevel: "Beginner",
  measurements: [],
  customExercises: []
};

// --- 2. COACH PROFILE (Clean) ---
export const MOCK_COACH_PROFILE: UserProfile = {
  id: '',
  name: "",
  role: 'Coach',
  subscriptionTier: 'Free', 
  subscriptionStatus: 'Active',
  age: 0,
  height: 0,
  targetWeightKg: 0,
  gender: "Male" as any,
  joiningDate: '',
  experienceLevel: "Advanced",
  measurements: [],
  settings: {
      autoCheckinEnabled: false,
      checkinDay: 'Friday',
      checkinTime: '20:00'
  },
  customExercises: [],
  verificationStatus: 'Pending',
  isActive: false,
  bio: '',
  certUrl: '',
  inviteCode: '', 
  pendingRequests: [] 
};

// --- PENDING COACHES (Clean) ---
export const MOCK_PENDING_COACHES: UserProfile[] = [];

// --- ACTIVE COACHES LIST (Clean) ---
export const MOCK_ACTIVE_COACHES: UserProfile[] = [];

// --- 3. ATHLETE PROFILE (Clean) ---
export const MOCK_ATHLETE_PROFILE: UserProfile = {
    id: '',
    name: "",
    role: 'Trainee',
    age: 0,
    height: 0,
    targetWeightKg: 0,
    gender: "Male" as any,
    joiningDate: '',
    experienceLevel: "Beginner",
    customExercises: [],
    coachConnectStatus: 'None', 
    measurements: []
};

// --- MOCK TRAINEES (Clean) ---
export const MOCK_TRAINEES: TraineeSummary[] = [];

// --- MOCK MESSAGES (Clean) ---
export const MOCK_MESSAGES: DirectMessage[] = [];

// --- MOCK WELLNESS LOGS (Clean) ---
export const MOCK_WELLNESS_LOGS: WellnessLog[] = [];

// --- PREMIUM TEMPLATES (Clean) ---
export const PREMIUM_TEMPLATES: WorkoutTemplate[] = [];

// --- Strength History for Charts (Clean) ---
export const MOCK_STRENGTH_HISTORY = [];

// --- Table 3: Exercise Database (Persian Reference - KEPT AS SYSTEM DATA) ---
export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // --- LEGS (100s) ---
  { id: 'sq_back_high', nameEn: 'Barbell Squat', nameFa: 'اسکوات هالتر', muscleGroup: 'Legs', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'dl_conv', nameEn: 'Conventional Deadlift', nameFa: 'ددلیفت کلاسیک', muscleGroup: 'Back', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'leg_press', nameEn: 'Leg Press', nameFa: 'پرس پا دستگاه', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Compound' }, 
  { id: 'rdl_bb', nameEn: 'Romanian Deadlift', nameFa: 'ددلیفت رومانیایی (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'leg_ext', nameEn: 'Leg Extension', nameFa: 'جلو پا ماشین', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation' }, 
  { id: 'leg_curl', nameEn: 'Leg Curl', nameFa: 'پشت پا ماشین', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation' }, 
  { id: 'calf_raise', nameEn: 'Standing Calf Raise', nameFa: 'ساق پا ایستاده', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation' }, 

  // --- CHEST (200s) ---
  { id: 'bp_flat_bb', nameEn: 'Flat Barbell Bench Press', nameFa: 'پرس سینه هالتر تخت', muscleGroup: 'Chest', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'bp_flat_db', nameEn: 'Flat Dumbbell Press', nameFa: 'پرس سینه دمبل تخت', muscleGroup: 'Chest', equipment: 'Dumbbell', mechanics: 'Compound' }, 
  { id: 'bp_inc_bb', nameEn: 'Incline Barbell Bench Press', nameFa: 'پرس بالا سینه هالتر', muscleGroup: 'Chest', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'bp_inc_db', nameEn: 'Incline Dumbbell Press', nameFa: 'پرس بالا سینه دمبل', muscleGroup: 'Chest', equipment: 'Dumbbell', mechanics: 'Compound' },
  { id: 'dips_weighted', nameEn: 'Chest Dips', nameFa: 'دیپ سینه', muscleGroup: 'Chest', equipment: 'Bodyweight', mechanics: 'Compound' }, 
  { id: 'chest_fly_cable', nameEn: 'Cable Crossover', nameFa: 'کراس اوور سیمکش', muscleGroup: 'Chest', equipment: 'Cable', mechanics: 'Isolation' }, 
  { id: 'pec_deck', nameEn: 'Pec Deck Machine', nameFa: 'دستگاه قفسه سینه (پروانه)', muscleGroup: 'Chest', equipment: 'Machine', mechanics: 'Isolation' },

  // --- BACK (300s) ---
  { id: 'pullup_weighted', nameEn: 'Pull Up', nameFa: 'بارفیکس', muscleGroup: 'Back', equipment: 'Bodyweight', mechanics: 'Compound' }, 
  { id: 'row_bb_bent', nameEn: 'Bent Over Barbell Row', nameFa: 'زیربغل هالتر خم', muscleGroup: 'Back', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'lat_pd_wide', nameEn: 'Lat Pulldown', nameFa: 'لت پول‌داون (زیربغل سیمکش)', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Compound' }, 
  { id: 't_bar_row', nameEn: 'T-Bar Row', nameFa: 'تی بار رو', muscleGroup: 'Back', equipment: 'Machine', mechanics: 'Compound' }, 
  { id: 'lat_pushdown_cable', nameEn: 'Straight-Arm Pulldown', nameFa: 'ددلیفت با سیمکش (پول‌داون)', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Isolation' }, 
  { id: 'row_seated_cable', nameEn: 'Seated Cable Row', nameFa: 'زیربغل قایقی', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Compound' },

  // --- SHOULDERS (400s) ---
  { id: 'ohp_bb_stand', nameEn: 'Overhead Press', nameFa: 'پرس سرشانه هالتر ایستاده', muscleGroup: 'Shoulders', equipment: 'Barbell', mechanics: 'Compound' }, 
  { id: 'ohp_db_seat', nameEn: 'Seated Dumbbell Press', nameFa: 'پرس سرشانه دمبل نشسته', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Compound' }, 
  { id: 'lat_raise_db', nameEn: 'Lateral Raise', nameFa: 'نشر جانب', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Isolation' }, 
  { id: 'rear_delt_fly', nameEn: 'Rear Delt Fly', nameFa: 'نشر خم (سرشانه پشتی)', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Isolation' }, 
  { id: 'face_pull', nameEn: 'Face Pull', nameFa: 'فیس پول', muscleGroup: 'Shoulders', equipment: 'Cable', mechanics: 'Isolation' },

  // --- ARMS (500s) ---
  { id: 'curl_bb_stand', nameEn: 'Barbell Curl', nameFa: 'جلوبازو هالتر ایستاده', muscleGroup: 'Biceps', equipment: 'Barbell', mechanics: 'Isolation' }, 
  { id: 'curl_db_hammer', nameEn: 'Hammer Curl', nameFa: 'جلوبازو دمبل چکشی', muscleGroup: 'Biceps', equipment: 'Dumbbell', mechanics: 'Isolation' }, 
  { id: 'curl_db_inc', nameEn: 'Incline Dumbbell Curl', nameFa: 'جلوبازو دمبل میز شیبدار', muscleGroup: 'Biceps', equipment: 'Dumbbell', mechanics: 'Isolation' },
  { id: 'tri_pushdown', nameEn: 'Triceps Pushdown', nameFa: 'پشت بازو سیمکش ایستاده', muscleGroup: 'Triceps', equipment: 'Cable', mechanics: 'Isolation' }, 
  { id: 'skull_crusher', nameEn: 'Skull Crusher', nameFa: 'پشت بازو هالتر خوابیده', muscleGroup: 'Triceps', equipment: 'Barbell', mechanics: 'Isolation' }, 

  // --- CORE (600s) ---
  { id: 'cable_crunch', nameEn: 'Cable Crunch', nameFa: 'کرانچ با وزنه (سیمکش)', muscleGroup: 'Abs', equipment: 'Cable', mechanics: 'Isolation' }, 
  { id: 'leg_raise_hanging', nameEn: 'Hanging Leg Raise', nameFa: 'بالا آوردن پا آویزان', muscleGroup: 'Abs', equipment: 'Bodyweight', mechanics: 'Isolation' }, 
  { id: 'hyperextension', nameEn: 'Hyperextension', nameFa: 'هیپرتنشن (فیله کمر)', muscleGroup: 'Back', equipment: 'Bodyweight', mechanics: 'Isolation' }, 
];

// --- Table 4 & 5: Default Plan (Clean) ---
export const MOCK_USER_PLAN: WorkoutPlan | null = null;

// --- Table 6: WorkoutLog (Clean) ---
export const MOCK_LOGS: WorkoutLog[] = [];

// --- Table 7: Nutrition Logs (Clean) ---
export const MOCK_NUTRITION_HISTORY: NutritionLog[] = [];

// --- MOCK INSIGHTS (Clean) ---
export const MOCK_COACH_INSIGHTS: CoachInsight[] = [];

// --- MOCK TEMPLATES (Clean) ---
export const MOCK_TEMPLATES: WorkoutPlan[] = [];
