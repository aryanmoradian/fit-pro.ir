
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export type UserRole = 'Trainee' | 'Coach' | 'Admin' | 'Guest' | 'SuperAdmin';

export type AuthViewMode = 
  | 'LOGIN' 
  | 'FORGOT_PASSWORD' 
  | 'RESET_PASSWORD' 
  | 'SIGNUP_CREDENTIALS' 
  | 'VERIFY_EMAIL' 
  | 'SIGNUP_ROLE' 
  | 'SIGNUP_COACH_VERIFICATION';

export interface AuthData {
  email: string;
  password?: string;
  name?: string;
  phoneNumber?: string; // New field
  role?: UserRole;
  // Verification Data
  certUrl?: string;
  bio?: string;
}

// --- Table 1: Users (ورزشکاران) ---
export interface TraineeRequest {
    id: string;
    traineeId: string;
    traineeName: string;
    date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface UserProfile {
  id: string; // user_id
  email?: string;
  name: string;
  role: UserRole; // نقش کاربر
  phoneNumber?: string;
  avatarUrl?: string;
  subscriptionTier?: 'Free' | 'Premium'; // وضعیت اشتراک
  subscriptionStatus?: 'Active' | 'Expired' | 'PendingUpgrade'; // وضعیت دقیق‌تر برای ادمین
  subscriptionExpiryDate?: string; // تاریخ انقضا (YYYY/MM/DD)
  
  age: number;
  height: number; // cm
  weight?: number; // current weight helper
  targetWeightKg?: number; // وزن هدف جدید
  gender: Gender;
  joiningDate: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  measurements: AnthropometryLog[]; // Relation to BodyMetricsLog
  settings?: CoachSettings; // تنظیمات مربی
  customExercises?: ExerciseDefinition[]; // حرکات سفارشی کاربر
  
  // Coach Specific
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  certUrl?: string;
  bio?: string;
  isActive?: boolean;
  inviteCode?: string; // کد دعوت اختصاصی
  pendingRequests?: TraineeRequest[]; // درخواست‌های ورودی

  // Trainee Specific
  coachId?: string; // For self-service trainees linking to a coach
  coachConnectStatus?: 'None' | 'Pending' | 'Connected';
  connectedCoachName?: string;
  
  // UX State
  hasSeenDashboardTour?: boolean;
}

export interface CoachSettings {
    autoCheckinEnabled: boolean;
    checkinDay: string; // e.g. 'Friday'
    checkinTime: string; // e.g. '21:00'
}

// Wrapper for Coach Dashboard List
export type PaymentStatus = 'Active' | 'Expiring_Soon' | 'Expired' | 'Pending_Verification';

export interface TraineeSummary {
    id: string;
    name: string;
    lastActive: string;
    planName: string;
    consistencyScore: number; // Overall Score
    status: 'OnTrack' | 'Risk' | 'Injured' | 'Inactive';
    alertMessage?: string;
    photoUrl?: string;
    
    // --- New Analytical Fields for Group Filters ---
    lastPrDate?: string; // Date of last Personal Record
    volumeTrend?: 'Up' | 'Flat' | 'Down'; // Volume progression status
    asymmetryMax?: number; // Max difference in cm (Left vs Right)
    nutritionAdherence?: number; // 0-100%
    trainingAdherence?: number; // 0-100%
    
    // --- Injury & Fatigue Risk Fields (Updated for Risk Logic) ---
    injuryRiskScore?: number; // 0-100 (High is bad)
    fatigueLevel?: 'Low' | 'Medium' | 'High';
    sleepAverage?: number; // Hours (last check-in)
    sorenessLevel?: number; // 1-10 (last check-in)

    // --- Business Fields ---
    paymentStatus?: PaymentStatus;
    subscriptionExpiryDate?: string;
}

// --- Table 2: BodyMetricsLog (ردیابی سایز) ---
export interface AnthropometryLog {
  logId: string;
  date: string;
  weight: number;
  bodyFat?: number;
  
  // Measurements (cm) - Split for Symmetry Analysis
  chest?: number;
  waist?: number;
  shoulders?: number;
  
  armRight?: number; 
  armLeft?: number;
  
  thighRight?: number; 
  thighLeft?: number;
  
  calfRight?: number; 
  calfLeft?: number;

  // Photos
  photoFrontUri?: string;
  photoSideUri?: string;
  photoBackUri?: string;
}

// --- Table 3: Exercises (حرکات مرجع) ---
export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Abs' | 'Cardio';
export type EquipmentType = 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Bodyweight' | 'Smith Machine';

export interface ExerciseDefinition {
  id: string; // exercise_id
  nameEn: string; 
  nameFa?: string; 
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  mechanics?: 'Compound' | 'Isolation';
  videoUrl?: string; // Link to form video
  anatomyImgUrl?: string; // Link to anatomy gif
}

// --- Nutrition Template Structure ---
export interface NutritionMealTemplate {
  id: string;
  mealName: string; // e.g. "Breakfast"
  description: string; // e.g. "5 Eggs + Oats"
}

// --- Table 4: WorkoutPlan (برنامه تمرینی اصلی) ---
export interface WorkoutTemplate {
    id: string;
    name: string;
    description: string;
    difficulty: 'Intermediate' | 'Advanced';
    daysCount: number;
}

export interface WorkoutPlan {
  id: string; // plan_id
  userId: string; // Owner (Coach or Self)
  traineeId?: string; // The specific trainee this plan is for (if created by coach)
  name: string; // نام_برنامه
  description?: string; // Added description field
  startDate: string; // تاریخ_شروع
  weeksCount: number; // تعداد_هفته‌ها
  creatorId: string; // سازنده (user or system)
  days: WorkoutDay[]; // Helper structure to organize targets
  nutritionTemplate?: NutritionMealTemplate[]; // الگوی تغذیه
  isActive: boolean;
  customExercises?: ExerciseDefinition[]; // Embedded custom exercises
}

export interface WorkoutDay {
  id: string;
  name: string; // e.g. "Saturday"
  targets: ExerciseTarget[];
}

// --- Table 5: ExerciseTarget (تارگت حرکت روزانه) ---
// This represents the "Plan" for a specific exercise on a specific day
export interface ExerciseTarget {
  id: string; // target_id
  planId: string; // FK to WorkoutPlan
  exerciseId: string; // FK to ExerciseDefinition
  dayName: string; // Denormalized for easier access, e.g., "Saturday"
  order: number; // ترتیب_حرکت
  sets: number; // ست_هدف
  reps: string; // تکرار_هدف (e.g., "8-12")
  restTime?: string; // زمان استراحت (e.g. "60s")
  notes?: string; // یادداشت_مربی
}

// --- Table 6: WorkoutLog (لاگ عملکرد واقعی) ---
// This tracks the ACTUAL execution vs the Target
export interface WorkoutLog {
  id: string; // log_id
  targetId: string; // FK to ExerciseTarget (Crucial for linking back to plan)
  date: string; // تاریخ_اجرا
  setNumber: number; // ست_واقعی (1, 2, 3...)
  reps: number; // تکرار_واقعی
  weight: number; // وزنه_استفاده_شده_kg
  rpe?: number; // میزان_سختی (1-10)
  restTime?: number; // زمان_استراحت_واقعی_sec
  
  // New Fields for Video Feedback
  videoUrl?: string;
  videoFeedbackId?: string;
}

export interface VideoComment {
  id: string;
  timestamp: number; // Seconds from start
  text: string;
  author: 'Coach' | 'Trainee' | 'AI';
  createdAt?: string;
}

export interface VideoFeedbackLog {
    id: string;
    workoutLogId: string;
    userId: string;
    exerciseName: string;
    videoUrl: string;
    uploadDate: string;
    comments: VideoComment[];
}

// --- Table 7: NutritionLog (لاگ تغذیه روزانه) ---
export interface NutritionLog {
  id: string; // log_id
  userId: string;
  date: string;
  mealName: string; // e.g. "Breakfast"
  description: string; // e.g. "5 Eggs + Oats"
  isCompleted: boolean;
}

// --- NEW: Advanced Nutrition & Fueling ---
export interface SupplementLog {
    name: string; // e.g., "Creatine", "Whey", "Caffeine"
    taken: boolean;
    time?: string; // e.g. "Pre-workout"
}

export interface DailyNutritionStats {
    id: string;
    userId: string;
    date: string;
    waterIntake: number; // liters
    fiberIntake: number; // grams (estimated)
    totalProtein: number; // grams
    supplementProtein: number; // grams (Processed source)
    supplements: SupplementLog[];
}

// --- Table 8: WellnessLog (لاگ سلامت و ریکاوری) ---
export interface WellnessLog {
    id: string;
    userId: string;
    date: string;
    sleepDuration: number; // Hours
    sorenessLevel: number; // 1-10
    energyMood: 'High' | 'Medium' | 'Low';
    notes?: string;
}

// --- Messaging ---
export interface DirectMessage {
    id: string;
    senderId: string; // Coach or Trainee ID
    receiverId: string;
    senderName: string;
    text: string;
    timestamp: string;
    isRead: boolean;
}

// --- App View State ---
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  COACH_DASHBOARD = 'COACH_DASHBOARD', 
  COACH_MESSAGES = 'COACH_MESSAGES', 
  COACH_BUSINESS = 'COACH_BUSINESS', 
  PROFILE = 'PROFILE',
  PLAN_BUILDER = 'PLAN_BUILDER',
  ACTIVE_SESSION = 'ACTIVE_SESSION',
  NUTRITION_TRACKER = 'NUTRITION_TRACKER',
  FORM_CHECK = 'FORM_CHECK',
  CHAT = 'CHAT',
  SUPER_ADMIN_DASHBOARD = 'SUPER_ADMIN_DASHBOARD' // New Secured View
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  sources?: Array<{ title: string; uri: string }>;
}

// --- NEW: Trainee Data Aggregation ---
export interface TraineeData {
    workoutLogs: WorkoutLog[];
    wellnessLogs: WellnessLog[];
    nutritionLogs: NutritionLog[];
    videoFeedbacks?: VideoFeedbackLog[]; // Added
}

export interface PersonalRecord {
    id: string;
    exerciseName: string;
    weight: number;
    reps: number;
    date: string;
    oneRepMax: number;
    isNew: boolean;
}

// --- NEW: Coach Insight & Recommendations ---
export interface CoachInsight {
    id: string;
    type: 'RISK' | 'OPPORTUNITY' | 'ACHIEVEMENT';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    traineeId: string;
    traineeName: string;
    message: string;
    suggestion: string;
    metric?: string;
}

// --- NEW: Payment & Subscription ---
export interface PaymentRequest {
    id: string;
    userId: string;
    userName: string;
    months: number;
    amountUSD: number;
    amountIRR: number;
    txId: string; // Transaction Hash (Replaces receiptUrl)
    status: 'Pending' | 'Approved' | 'Rejected';
    requestDate: string;
    processedDate?: string;
    network: string; // e.g. 'TRC20'
}
