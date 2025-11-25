
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

// --- Table 3: Exercise Database (Expanded Reference) ---
export const EXERCISE_DATABASE: ExerciseDefinition[] = [
  // --- LEGS (100s) ---
  { id: 'sq_back_high', nameEn: 'Barbell Squat', nameFa: 'اسکوات هالتر', muscleGroup: 'Legs', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Squat', secondaryMuscles: ['Glutes', 'Lower Back'] }, 
  { id: 'dl_conv', nameEn: 'Conventional Deadlift', nameFa: 'ددلیفت کلاسیک', muscleGroup: 'Back', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Hip Hinge', secondaryMuscles: ['Hamstrings', 'Glutes', 'Forearms'] }, 
  { id: 'leg_press', nameEn: 'Leg Press', nameFa: 'پرس پا دستگاه', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Compound', movementPattern: 'Squat', secondaryMuscles: ['Glutes'] }, 
  { id: 'rdl_bb', nameEn: 'Romanian Deadlift', nameFa: 'ددلیفت رومانیایی (RDL)', muscleGroup: 'Legs', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Hip Hinge', secondaryMuscles: ['Glutes', 'Lower Back'] }, 
  { id: 'leg_ext', nameEn: 'Leg Extension', nameFa: 'جلو پا ماشین', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation', movementPattern: 'Extension' }, 
  { id: 'leg_curl', nameEn: 'Leg Curl', nameFa: 'پشت پا ماشین', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation', movementPattern: 'Flexion' }, 
  { id: 'calf_raise', nameEn: 'Standing Calf Raise', nameFa: 'ساق پا ایستاده', muscleGroup: 'Legs', equipment: 'Machine', mechanics: 'Isolation', movementPattern: 'Plantar Flexion' }, 
  
  // New Legs
  { 
    id: 'squat_goblet', 
    nameEn: 'Goblet Squat', 
    nameFa: 'گابلت اسکوات', 
    muscleGroup: 'Legs', 
    equipment: 'Dumbbell', 
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Squat',
    instructions: ['Hold DB close to chest', 'Keep chest up', 'Squat until elbows touch knees'],
    safetyNotes: 'Keep spine neutral.'
  },
  { 
    id: 'squat_bulgarian', 
    nameEn: 'Bulgarian Split Squat', 
    nameFa: 'اسکوات بلغاری', 
    muscleGroup: 'Legs', 
    equipment: 'Dumbbell', 
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Squat (Unilateral)',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    instructions: ['Rear foot on bench', 'Lower hips straight down', 'Drive through front heel'],
    safetyNotes: 'Balance is key; start light.'
  },
  { 
    id: 'hip_thrust_bb', 
    nameEn: 'Barbell Hip Thrust', 
    nameFa: 'هیپ تراست هالتر', 
    muscleGroup: 'Legs', 
    equipment: 'Barbell', 
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Hip Hinge',
    secondaryMuscles: ['Glutes', 'Hamstrings'],
    instructions: ['Upper back on bench', 'Bar on hips', 'Drive hips up', 'Squeeze glutes at top'],
    safetyNotes: 'Use padding for hips.'
  },
  { 
    id: 'lunge_walking', 
    nameEn: 'Walking Lunge', 
    nameFa: 'لانگز راه رفتنی', 
    muscleGroup: 'Legs', 
    equipment: 'Bodyweight', 
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Lunge'
  },
  {
    id: 'sq_front_bb',
    nameEn: 'Front Squat',
    nameFa: 'اسکوات هالتر از جلو',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Advanced',
    movementPattern: 'Squat',
    secondaryMuscles: ['Core', 'Upper Back', 'Glutes'],
    instructions: ['Rest bar on front delts', 'Keep elbows high', 'Squat deep while keeping torso upright'],
    safetyNotes: 'Requires good wrist and shoulder mobility.'
  },
  {
    id: 'sq_hack_machine',
    nameEn: 'Hack Squat',
    nameFa: 'هاک اسکوات دستگاه',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Squat',
    secondaryMuscles: ['Glutes'],
    instructions: ['Place back against pad', 'Feet shoulder-width apart', 'Lower until knees act 90 degrees', 'Push up through heels']
  },
  {
    id: 'glute_bridge_bw',
    nameEn: 'Glute Bridge',
    nameFa: 'پل باسن (Glute Bridge)',
    muscleGroup: 'Legs',
    equipment: 'Bodyweight',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Hip Hinge',
    primaryMuscles: ['Glutes'],
    secondaryMuscles: ['Hamstrings'],
    instructions: ['Lie on back with knees bent', 'Lift hips until body forms a straight line', 'Squeeze glutes at top']
  },
  {
    id: 'good_morning_bb',
    nameEn: 'Good Morning',
    nameFa: 'سلام ژاپنی (Good Morning)',
    muscleGroup: 'Legs',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Advanced',
    movementPattern: 'Hip Hinge',
    primaryMuscles: ['Hamstrings'],
    secondaryMuscles: ['Lower Back', 'Glutes'],
    instructions: ['Bar on upper back', 'Hinge at hips keeping legs slightly bent', 'Lower torso until parallel to floor', 'Return to start'],
    safetyNotes: 'Keep back straight; do not round lower back.'
  },
  {
    id: 'calf_seated',
    nameEn: 'Seated Calf Raise',
    nameFa: 'ساق پا نشسته',
    muscleGroup: 'Legs',
    equipment: 'Machine',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Plantar Flexion',
    primaryMuscles: ['Calves (Soleus)'],
    instructions: ['Sit with knees under pads', 'Lower heels as far as possible', 'Raise heels high on toes']
  },

  // --- CHEST (200s) ---
  { id: 'bp_flat_bb', nameEn: 'Flat Barbell Bench Press', nameFa: 'پرس سینه هالتر تخت', muscleGroup: 'Chest', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Horizontal Push', secondaryMuscles: ['Triceps', 'Front Delt'] }, 
  { id: 'bp_flat_db', nameEn: 'Flat Dumbbell Press', nameFa: 'پرس سینه دمبل تخت', muscleGroup: 'Chest', equipment: 'Dumbbell', mechanics: 'Compound', movementPattern: 'Horizontal Push', secondaryMuscles: ['Triceps', 'Front Delt'] }, 
  { id: 'bp_inc_bb', nameEn: 'Incline Barbell Bench Press', nameFa: 'پرس بالا سینه هالتر', muscleGroup: 'Chest', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Incline Push', secondaryMuscles: ['Triceps', 'Front Delt'] }, 
  { id: 'bp_inc_db', nameEn: 'Incline Dumbbell Press', nameFa: 'پرس بالا سینه دمبل', muscleGroup: 'Chest', equipment: 'Dumbbell', mechanics: 'Compound', movementPattern: 'Incline Push', secondaryMuscles: ['Triceps', 'Front Delt'] },
  { id: 'dips_weighted', nameEn: 'Chest Dips', nameFa: 'دیپ سینه', muscleGroup: 'Chest', equipment: 'Bodyweight', mechanics: 'Compound', movementPattern: 'Vertical Push', secondaryMuscles: ['Triceps'] }, 
  { id: 'chest_fly_cable', nameEn: 'Cable Crossover', nameFa: 'کراس اوور سیمکش', muscleGroup: 'Chest', equipment: 'Cable', mechanics: 'Isolation', movementPattern: 'Fly' }, 
  { id: 'pec_deck', nameEn: 'Pec Deck Machine', nameFa: 'دستگاه قفسه سینه (پروانه)', muscleGroup: 'Chest', equipment: 'Machine', mechanics: 'Isolation', movementPattern: 'Fly' },

  // New Chest
  { 
    id: 'chest_press_machine', 
    nameEn: 'Machine Chest Press', 
    nameFa: 'پرس سینه دستگاه', 
    muscleGroup: 'Chest', 
    equipment: 'Machine', 
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Horizontal Push'
  },
  { 
    id: 'fly_db_flat', 
    nameEn: 'Flat Dumbbell Fly', 
    nameFa: 'قفسه سینه دمبل تخت', 
    muscleGroup: 'Chest', 
    equipment: 'Dumbbell', 
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Fly',
    safetyNotes: 'Avoid over-stretching shoulders.'
  },
  {
    id: 'pushup_weighted',
    nameEn: 'Weighted Push-Up',
    nameFa: 'شنا سوئدی با وزنه',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Horizontal Push'
  },
  {
    id: 'bp_dec_bb',
    nameEn: 'Decline Barbell Bench Press',
    nameFa: 'پرس زیر سینه هالتر',
    muscleGroup: 'Chest',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Decline Push',
    secondaryMuscles: ['Triceps', 'Front Delt'],
    instructions: ['Lie on decline bench', 'Lower bar to lower chest', 'Press up to full extension'],
    safetyNotes: 'Have a spotter to help unrack.'
  },
  {
    id: 'fly_db_inc',
    nameEn: 'Incline Dumbbell Fly',
    nameFa: 'قفسه بالا سینه دمبل',
    muscleGroup: 'Chest',
    equipment: 'Dumbbell',
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Fly',
    secondaryMuscles: ['Front Delt'],
    instructions: ['Set bench to 30-45 degrees', 'Arms slightly bent', 'Lower weights in an arc', 'Squeeze chest at top']
  },
  {
    id: 'pushup_close',
    nameEn: 'Close-Grip Push-Up',
    nameFa: 'شنا دست جمع',
    muscleGroup: 'Chest', // Also Triceps
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Horizontal Push',
    secondaryMuscles: ['Triceps'],
    instructions: ['Hands inside shoulder width', 'Keep elbows tucked close to body', 'Lower chest to hands', 'Push back up']
  },

  // --- BACK (300s) ---
  { id: 'pullup_weighted', nameEn: 'Pull Up', nameFa: 'بارفیکس', muscleGroup: 'Back', equipment: 'Bodyweight', mechanics: 'Compound', movementPattern: 'Vertical Pull', secondaryMuscles: ['Biceps'] }, 
  { id: 'row_bb_bent', nameEn: 'Bent Over Barbell Row', nameFa: 'زیربغل هالتر خم', muscleGroup: 'Back', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Horizontal Pull', secondaryMuscles: ['Biceps', 'Rear Delt'] }, 
  { id: 'lat_pd_wide', nameEn: 'Lat Pulldown', nameFa: 'لت پول‌داون (زیربغل سیمکش)', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Compound', movementPattern: 'Vertical Pull', secondaryMuscles: ['Biceps'] }, 
  { id: 't_bar_row', nameEn: 'T-Bar Row', nameFa: 'تی بار رو', muscleGroup: 'Back', equipment: 'Machine', mechanics: 'Compound', movementPattern: 'Horizontal Pull', secondaryMuscles: ['Biceps'] }, 
  { id: 'lat_pushdown_cable', nameEn: 'Straight-Arm Pulldown', nameFa: 'ددلیفت با سیمکش (پول‌داون)', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Isolation', movementPattern: 'Isolation Pull' }, 
  { id: 'row_seated_cable', nameEn: 'Seated Cable Row', nameFa: 'زیربغل قایقی', muscleGroup: 'Back', equipment: 'Cable', mechanics: 'Compound', movementPattern: 'Horizontal Pull', secondaryMuscles: ['Biceps'] },

  // New Back
  { 
    id: 'chin_up', 
    nameEn: 'Chin Up', 
    nameFa: 'بارفیکس مچ برعکس', 
    muscleGroup: 'Back', 
    equipment: 'Bodyweight', 
    mechanics: 'Compound',
    movementPattern: 'Vertical Pull',
    instructions: ['Palms facing you', 'Pull chest to bar', 'Lower slowly'],
    difficulty: 'Intermediate',
    secondaryMuscles: ['Biceps']
  },
  { 
    id: 'row_db_single', 
    nameEn: 'Single Arm Dumbbell Row', 
    nameFa: 'زیربغل دمبل تک خم', 
    muscleGroup: 'Back', 
    equipment: 'Dumbbell', 
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Horizontal Pull (Unilateral)',
    secondaryMuscles: ['Biceps']
  },
  {
    id: 'rack_pull',
    nameEn: 'Rack Pull',
    nameFa: 'رک پول (ددلیفت نیمه)',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Advanced',
    movementPattern: 'Hip Hinge',
    safetyNotes: 'Maintain spine neutrality, heavy load risk.'
  },
  {
    id: 'row_machine',
    nameEn: 'Machine Row',
    nameFa: 'زیربغل اچ (Machine Row)',
    muscleGroup: 'Back',
    equipment: 'Machine',
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Horizontal Pull',
    secondaryMuscles: ['Biceps', 'Rear Delt'],
    instructions: ['Adjust seat height', 'Grip handles', 'Pull elbows back past torso', 'Squeeze back muscles']
  },
  {
    id: 'row_inverted',
    nameEn: 'Inverted Row',
    nameFa: 'بارفیکس خوابیده (Inverted Row)',
    muscleGroup: 'Back',
    equipment: 'Bodyweight', // Or Barbell in rack
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Horizontal Pull',
    secondaryMuscles: ['Biceps', 'Core'],
    instructions: ['Set bar at waist height', 'Hang under bar with straight body', 'Pull chest to bar']
  },
  {
    id: 'lat_pd_close',
    nameEn: 'Close-Grip Lat Pulldown',
    nameFa: 'زیربغل سیمکش دست جمع (V-Bar)',
    muscleGroup: 'Back',
    equipment: 'Cable',
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Vertical Pull',
    secondaryMuscles: ['Biceps'],
    instructions: ['Attach V-handle', 'Sit down and secure knees', 'Pull handle to upper chest', 'Squeeze lats']
  },

  // --- SHOULDERS (400s) ---
  { id: 'ohp_bb_stand', nameEn: 'Overhead Press', nameFa: 'پرس سرشانه هالتر ایستاده', muscleGroup: 'Shoulders', equipment: 'Barbell', mechanics: 'Compound', movementPattern: 'Vertical Push', secondaryMuscles: ['Triceps'] }, 
  { id: 'ohp_db_seat', nameEn: 'Seated Dumbbell Press', nameFa: 'پرس سرشانه دمبل نشسته', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Compound', movementPattern: 'Vertical Push', secondaryMuscles: ['Triceps'] }, 
  { id: 'lat_raise_db', nameEn: 'Lateral Raise', nameFa: 'نشر جانب', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Isolation', movementPattern: 'Abduction' }, 
  { id: 'rear_delt_fly', nameEn: 'Rear Delt Fly', nameFa: 'نشر خم (سرشانه پشتی)', muscleGroup: 'Shoulders', equipment: 'Dumbbell', mechanics: 'Isolation', movementPattern: 'Horizontal Abduction' }, 
  { id: 'face_pull', nameEn: 'Face Pull', nameFa: 'فیس پول', muscleGroup: 'Shoulders', equipment: 'Cable', mechanics: 'Isolation', movementPattern: 'Horizontal Pull', secondaryMuscles: ['Rear Delt', 'Rotator Cuff'] },

  // New Shoulders
  { 
    id: 'press_arnold', 
    nameEn: 'Arnold Press', 
    nameFa: 'پرس آرنولدی', 
    muscleGroup: 'Shoulders', 
    equipment: 'Dumbbell', 
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Vertical Push',
    instructions: ['Start palms facing you', 'Rotate as you press up', 'Palms face forward at top']
  },
  { 
    id: 'raise_front_db', 
    nameEn: 'Dumbbell Front Raise', 
    nameFa: 'نشر از جلو دمبل', 
    muscleGroup: 'Shoulders', 
    equipment: 'Dumbbell', 
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Shoulder Flexion'
  },
  {
    id: 'shrug_bb',
    nameEn: 'Barbell Shrug',
    nameFa: 'شراگ هالتر',
    muscleGroup: 'Shoulders', // Traps
    equipment: 'Barbell',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Elevation'
  },
  {
    id: 'press_mach_shoulder',
    nameEn: 'Machine Shoulder Press',
    nameFa: 'پرس سرشانه دستگاه',
    muscleGroup: 'Shoulders',
    equipment: 'Machine',
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Vertical Push',
    secondaryMuscles: ['Triceps'],
    instructions: ['Adjust seat so handles are at shoulder level', 'Press up until arms extended', 'Lower slowly']
  },
  {
    id: 'fly_reverse_mach',
    nameEn: 'Reverse Pec Deck',
    nameFa: 'فلای معکوس دستگاه (Rear Delt)',
    muscleGroup: 'Shoulders',
    equipment: 'Machine',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Horizontal Abduction',
    primaryMuscles: ['Rear Delt'],
    instructions: ['Face the machine', 'Adjust handles to rear', 'Pull arms back keeping them straight', 'Squeeze rear delts']
  },
  {
    id: 'row_upright_bb',
    nameEn: 'Upright Row',
    nameFa: 'کول هالتر ایستاده',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Vertical Pull',
    secondaryMuscles: ['Traps', 'Biceps'],
    instructions: ['Grip bar shoulder width', 'Pull bar straight up to chest level', 'Elbows should be higher than wrists'],
    safetyNotes: 'Stop at chest height to protect rotator cuff.'
  },

  // --- ARMS (500s) ---
  { id: 'curl_bb_stand', nameEn: 'Barbell Curl', nameFa: 'جلوبازو هالتر ایستاده', muscleGroup: 'Biceps', equipment: 'Barbell', mechanics: 'Isolation', movementPattern: 'Elbow Flexion' }, 
  { id: 'curl_db_hammer', nameEn: 'Hammer Curl', nameFa: 'جلوبازو دمبل چکشی', muscleGroup: 'Biceps', equipment: 'Dumbbell', mechanics: 'Isolation', movementPattern: 'Elbow Flexion' }, 
  { id: 'curl_db_inc', nameEn: 'Incline Dumbbell Curl', nameFa: 'جلوبازو دمبل میز شیبدار', muscleGroup: 'Biceps', equipment: 'Dumbbell', mechanics: 'Isolation', movementPattern: 'Elbow Flexion' }, 
  { id: 'tri_pushdown', nameEn: 'Triceps Pushdown', nameFa: 'پشت بازو سیمکش ایستاده', muscleGroup: 'Triceps', equipment: 'Cable', mechanics: 'Isolation', movementPattern: 'Elbow Extension' }, 
  { id: 'skull_crusher', nameEn: 'Skull Crusher', nameFa: 'پشت بازو هالتر خوابیده', muscleGroup: 'Triceps', equipment: 'Barbell', mechanics: 'Isolation', movementPattern: 'Elbow Extension' }, 

  // New Arms
  { 
    id: 'curl_preacher', 
    nameEn: 'Preacher Curl', 
    nameFa: 'جلوبازو لاری', 
    muscleGroup: 'Biceps', 
    equipment: 'Machine', 
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Elbow Flexion'
  },
  { 
    id: 'tri_ext_overhead_db', 
    nameEn: 'Overhead DB Extension', 
    nameFa: 'پشت بازو دمبل جفت بالای سر', 
    muscleGroup: 'Triceps', 
    equipment: 'Dumbbell', 
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Elbow Extension'
  },
  {
    id: 'dip_bench',
    nameEn: 'Bench Dip',
    nameFa: 'دیپ نیمکت',
    muscleGroup: 'Triceps',
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Beginner',
    movementPattern: 'Vertical Push'
  },
  {
    id: 'curl_conc_db',
    nameEn: 'Concentration Curl',
    nameFa: 'جلوبازو دمبل تمرکزی',
    muscleGroup: 'Biceps',
    equipment: 'Dumbbell',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Elbow Flexion',
    instructions: ['Sit on bench', 'Rest elbow on inner thigh', 'Curl weight up towards shoulder', 'Squeeze at top']
  },
  {
    id: 'curl_spider_bb',
    nameEn: 'Spider Curl',
    nameFa: 'جلوبازو عنکبوتی',
    muscleGroup: 'Biceps',
    equipment: 'Barbell', // Or Dumbbell/EZ Bar
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Elbow Flexion',
    instructions: ['Lie face down on incline bench', 'Arms hanging straight down', 'Curl weight up keeping elbows stationary']
  },
  {
    id: 'curl_reverse_bb',
    nameEn: 'Reverse Curl',
    nameFa: 'جلوبازو هالتر مچ برعکس',
    muscleGroup: 'Biceps', // And Forearms
    equipment: 'Barbell',
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Elbow Flexion',
    secondaryMuscles: ['Forearms'],
    instructions: ['Hold bar with overhand grip', 'Curl up keeping elbows at sides']
  },
  {
    id: 'bp_close_bb',
    nameEn: 'Close-Grip Bench Press',
    nameFa: 'پرس سینه دست جمع (پشت بازو)',
    muscleGroup: 'Triceps',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Horizontal Push',
    secondaryMuscles: ['Chest', 'Front Delt'],
    instructions: ['Grip bar shoulder-width apart', 'Keep elbows tucked in', 'Lower bar to lower chest', 'Press up']
  },
  {
    id: 'pushup_diamond',
    nameEn: 'Diamond Push-Up',
    nameFa: 'شنا دست جمع (الماسی)',
    muscleGroup: 'Triceps',
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Horizontal Push',
    instructions: ['Hands close together forming a diamond shape', 'Lower chest to hands', 'Push back up']
  },
  {
    id: 'kickback_db',
    nameEn: 'Tricep Kickback',
    nameFa: 'پشت بازو کیک‌بک دمبل',
    muscleGroup: 'Triceps',
    equipment: 'Dumbbell',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Elbow Extension',
    instructions: ['Bend over at hips', 'Keep upper arm parallel to floor', 'Extend elbow back fully', 'Return to 90 degrees']
  },

  // --- CORE (600s) ---
  { id: 'cable_crunch', nameEn: 'Cable Crunch', nameFa: 'کرانچ با وزنه (سیمکش)', muscleGroup: 'Abs', equipment: 'Cable', mechanics: 'Isolation', movementPattern: 'Spinal Flexion' }, 
  { id: 'leg_raise_hanging', nameEn: 'Hanging Leg Raise', nameFa: 'بالا آوردن پا آویزان', muscleGroup: 'Abs', equipment: 'Bodyweight', mechanics: 'Isolation', movementPattern: 'Hip Flexion' }, 
  { id: 'hyperextension', nameEn: 'Hyperextension', nameFa: 'هیپرتنشن (فیله کمر)', muscleGroup: 'Back', equipment: 'Bodyweight', mechanics: 'Isolation', movementPattern: 'Spinal Extension' }, 
  
  // New Core
  { 
    id: 'plank_static', 
    nameEn: 'Plank', 
    nameFa: 'پلانک', 
    muscleGroup: 'Abs', 
    equipment: 'Bodyweight', 
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Isometric',
    instructions: ['Hold straight body line', 'Brace core', 'Do not let hips sag']
  },
  { 
    id: 'ab_wheel', 
    nameEn: 'Ab Wheel Rollout', 
    nameFa: 'غلتک شکم (رول اوت)', 
    muscleGroup: 'Abs', 
    equipment: 'Machine', 
    mechanics: 'Compound',
    difficulty: 'Advanced',
    movementPattern: 'Anti-Extension',
    safetyNotes: 'Avoid if lower back pain exists.'
  },
  {
    id: 'russian_twist',
    nameEn: 'Russian Twist',
    nameFa: 'چرخش روسی',
    muscleGroup: 'Abs',
    equipment: 'Bodyweight',
    mechanics: 'Isolation',
    difficulty: 'Intermediate',
    movementPattern: 'Rotation'
  },
  {
    id: 'crunch_floor',
    nameEn: 'Crunch',
    nameFa: 'کرانچ شکم',
    muscleGroup: 'Abs',
    equipment: 'Bodyweight',
    mechanics: 'Isolation',
    difficulty: 'Beginner',
    movementPattern: 'Spinal Flexion',
    instructions: ['Lie on back, knees bent', 'Lift shoulders off floor using abs', 'Lower slowly']
  },
  {
    id: 'mountain_climber',
    nameEn: 'Mountain Climbers',
    nameFa: 'حرکت کوهنورد',
    muscleGroup: 'Abs',
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Core/Cardio',
    instructions: ['Start in plank position', 'Drive knees to chest alternating quickly', 'Keep hips low']
  },

  // --- FULL BODY / FUNCTIONAL ---
  {
    id: 'kettlebell_swing',
    nameEn: 'Kettlebell Swing',
    nameFa: 'سوئینگ کتل‌بل',
    muscleGroup: 'Full Body',
    equipment: 'Kettlebell',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Hip Hinge',
    instructions: ['Hinge at hips', 'Explode forward', 'Keep back flat'],
    safetyNotes: 'Use hips, not arms to lift.'
  },
  {
    id: 'thruster',
    nameEn: 'Thruster',
    nameFa: 'تراستر (اسکوات و پرس)',
    muscleGroup: 'Full Body',
    equipment: 'Barbell',
    mechanics: 'Compound',
    difficulty: 'Advanced',
    movementPattern: 'Squat/Press'
  },
  {
    id: 'burpee',
    nameEn: 'Burpees',
    nameFa: 'برپی',
    muscleGroup: 'Full Body',
    equipment: 'Bodyweight',
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Plyometric',
    instructions: ['Drop to squat', 'Kick feet back to pushup', 'Return feet to squat', 'Jump up']
  },
  {
    id: 'farmers_walk',
    nameEn: 'Farmers Walk',
    nameFa: 'راه رفتن کشاورز (حمل وزنه)',
    muscleGroup: 'Full Body',
    equipment: 'Dumbbell', // or Kettlebell
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Carry',
    secondaryMuscles: ['Forearms', 'Traps', 'Core'],
    instructions: ['Hold heavy weights at sides', 'Walk with upright posture', 'Keep shoulders back and core tight']
  },
  {
    id: 'box_jump',
    nameEn: 'Box Jump',
    nameFa: 'پرش روی جعبه',
    muscleGroup: 'Full Body',
    equipment: 'Bodyweight', // Box
    mechanics: 'Compound',
    difficulty: 'Intermediate',
    movementPattern: 'Jump',
    instructions: ['Stand in front of box', 'Squat slightly and explode up', 'Land softly on box with knees bent', 'Stand up fully']
  }
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
