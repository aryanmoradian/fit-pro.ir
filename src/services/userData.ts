import { supabase } from "../lib/supabaseClient";
import { UserProfile, TraineeData, VideoFeedbackLog, PaymentRequest, WorkoutLog, WellnessLog, NutritionLog, AnthropometryLog, ExerciseDefinition, WorkoutPlan, TraineeSummary, DirectMessage } from "../types";

// --- HELPERS: Map DB Snake_Case to App CamelCase ---

const mapProfileFromDB = (data: any): UserProfile => ({
    id: data.id,
    email: data.email,
    name: data.full_name || data.email?.split('@')[0] || 'User',
    role: data.role || 'Guest',
    avatarUrl: data.avatar_url,
    phoneNumber: data.phone_number,
    
    subscriptionTier: data.subscription_tier || 'Free',
    subscriptionStatus: data.subscription_status || 'Active',
    subscriptionExpiryDate: data.subscription_expiry_date,
    verificationStatus: data.verification_status || 'Pending',
    
    measurements: (data.measurements || []).map(mapMeasurementFromDB),
    settings: data.settings || {},
    customExercises: (data.custom_exercises || []).map(mapExerciseFromDB),
    
    certUrl: data.cert_url || data.avatar_url, 
    bio: data.bio,
    isActive: data.is_active,
    inviteCode: data.invite_code,
    pendingRequests: data.pending_requests || [],
    
    age: data.age || 0,
    height: data.height || 0,
    gender: data.gender || 'Male',
    joiningDate: data.joining_date || new Date().toISOString(),
    experienceLevel: data.experience_level || 'Beginner',
    coachConnectStatus: data.coach_connect_status || 'None',
    coachId: data.coach_id,
    connectedCoachName: data.coach?.full_name // Mapped from Joined Table
});

const mapProfileToDB = (profile: UserProfile) => {
    return {
        id: profile.id,
        email: profile.email,
        full_name: profile.name,
        role: profile.role,
        avatar_url: profile.avatarUrl || profile.certUrl, // Fallback if certUrl used as avatar
        phone_number: profile.phoneNumber,
        
        subscription_tier: profile.subscriptionTier,
        subscription_status: profile.subscriptionStatus,
        subscription_expiry_date: profile.subscriptionExpiryDate,
        verification_status: profile.verificationStatus,
        
        settings: profile.settings,
        
        bio: profile.bio,
        is_active: profile.isActive,
        invite_code: profile.inviteCode,
        pending_requests: profile.pendingRequests,
        
        age: profile.age,
        height: profile.height,
        gender: profile.gender,
        experience_level: profile.experienceLevel,
        coach_connect_status: profile.coachConnectStatus,
        coach_id: profile.coachId
    };
};

const mapMeasurementFromDB = (m: any): AnthropometryLog => ({
    logId: m.id,
    date: m.date,
    weight: m.weight,
    bodyFat: m.body_fat,
    chest: m.chest,
    waist: m.waist,
    shoulders: m.shoulders,
    armRight: m.arm_right,
    armLeft: m.arm_left,
    thighRight: m.thigh_right,
    thighLeft: m.thigh_left,
    calfRight: m.calf_right,
    calfLeft: m.calf_left,
    photoFrontUri: m.photo_front_uri,
    photoSideUri: m.photo_side_uri,
    photoBackUri: m.photo_back_uri
});

const mapMeasurementToDB = (m: AnthropometryLog, userId: string) => ({
    user_id: userId,
    date: m.date,
    weight: m.weight,
    body_fat: m.bodyFat,
    chest: m.chest,
    waist: m.waist,
    shoulders: m.shoulders,
    arm_right: m.armRight,
    arm_left: m.armLeft,
    thigh_right: m.thighRight,
    thigh_left: m.thighLeft,
    calf_right: m.calfRight,
    calf_left: m.calfLeft,
    photo_front_uri: m.photoFrontUri,
    photo_side_uri: m.photoSideUri,
    photo_back_uri: m.photoBackUri
});

const mapExerciseFromDB = (e: any): ExerciseDefinition => ({
    id: e.id,
    nameEn: e.name_en,
    nameFa: e.name_fa,
    muscleGroup: e.muscle_group,
    equipment: e.equipment,
    mechanics: e.mechanics
});

const mapExerciseToDB = (e: ExerciseDefinition, userId: string) => ({
    user_id: userId,
    name_en: e.nameEn,
    name_fa: e.nameFa,
    muscle_group: e.muscleGroup,
    equipment: e.equipment,
    mechanics: e.mechanics
});

const mapPlanToDB = (plan: WorkoutPlan) => {
    return {
        user_id: plan.userId, // Owner
        trainee_id: plan.traineeId || null,
        name: plan.name,
        description: plan.description || null,
        start_date: plan.startDate,
        weeks_count: plan.weeksCount,
        creator_id: plan.creatorId,
        days: plan.days, // JSONB
        nutrition_template: plan.nutritionTemplate || [], // JSONB
        is_active: plan.isActive
    };
};

const mapPlanFromDB = (data: any): WorkoutPlan => ({
    id: data.id,
    userId: data.user_id,
    traineeId: data.trainee_id,
    name: data.name,
    description: data.description,
    startDate: data.start_date,
    weeksCount: data.weeks_count,
    creatorId: data.creator_id,
    days: data.days,
    nutritionTemplate: data.nutrition_template,
    isActive: data.is_active
});

// --- PROFILE SERVICES ---

export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    // Explicitly join the profiles table again for the coach info
    // We use the FK 'coach_id' which references 'profiles.id'
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        measurements (*),
        custom_exercises (*),
        coach:profiles!coach_id ( full_name )
      `)
      .eq('id', uid)
      .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error("Supabase profile fetch error:", error.message);
        return null; 
    }
    
    if (data.measurements) {
        data.measurements.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return mapProfileFromDB(data);
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

export const saveUserProfile = async (profile: UserProfile) => {
  try {
    if (!profile.id) throw new Error("User ID is missing");
    
    const dbData = mapProfileToDB(profile);
    
    const { error } = await supabase
      .from('profiles')
      .upsert(dbData, { onConflict: 'id' });

    if (error) throw error;

    if (profile.measurements && profile.measurements.length > 0) {
        const lastMeasurement = profile.measurements[profile.measurements.length - 1];
        const mDb = mapMeasurementToDB(lastMeasurement, profile.id);
        
        const { error: mError } = await supabase
            .from('measurements')
            .upsert({ ...mDb, id: lastMeasurement.logId.startsWith('init') ? undefined : lastMeasurement.logId });
        
        if (mError) console.error("Error saving measurement:", mError);
    }
    
    if (profile.customExercises && profile.customExercises.length > 0) {
        for (const ex of profile.customExercises) {
            if (ex.id.startsWith('custom_')) {
                 const exDb = mapExerciseToDB(ex, profile.id);
                 await supabase.from('custom_exercises').insert(exDb);
            }
        }
    }

  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

export const updateCoachVerificationStatus = async (userId: string, status: 'Verified' | 'Rejected' | 'Pending') => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ verification_status: status })
            .eq('id', userId);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating verification status:", error);
        throw error;
    }
};

export const generateInviteCode = async (userId: string): Promise<string> => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `COACH_${randomStr}`;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ invite_code: code })
            .eq('id', userId);

        if (error) throw error;
        return code;
    } catch (error) {
        console.error("Error generating invite code:", error);
        throw error;
    }
};

export const fetchCoachTrainees = async (coachId: string): Promise<TraineeSummary[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                *,
                workout_logs (date)
            `)
            .eq('coach_id', coachId);

        if (error) throw error;

        return data.map((p: any) => {
            const logs = p.workout_logs || [];
            logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastActive = logs.length > 0 ? logs[0].date : 'Inactive';
            
            const consistency = Math.min(100, logs.length * 2); 

            return {
                id: p.id,
                name: p.full_name || p.email,
                lastActive: lastActive,
                planName: 'برنامه فعال', 
                consistencyScore: consistency,
                status: consistency > 80 ? 'OnTrack' : consistency < 20 ? 'Inactive' : 'Risk',
                photoUrl: p.avatar_url,
                paymentStatus: p.subscription_status === 'Active' ? 'Active' : 'Expired',
                subscriptionExpiryDate: p.subscription_expiry_date
            } as TraineeSummary;
        });
    } catch (error) {
        console.error("Error fetching trainees:", error);
        return [];
    }
};

export const fetchAllCoaches = async (): Promise<UserProfile[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'Coach')
            .eq('verification_status', 'Verified');

        if (error) throw error;
        return data.map(mapProfileFromDB);
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return [];
    }
};

export const linkTraineeToCoach = async (traineeId: string, traineeName: string, inviteCode: string) => {
    try {
        const { data: coachData, error: coachError } = await supabase
            .from('profiles')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

        if (coachError || !coachData) throw new Error("کد دعوت نامعتبر است.");

        const newRequest = {
            id: `req_${Date.now()}`,
            traineeId: traineeId,
            traineeName: traineeName,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
        };

        const currentRequests = coachData.pending_requests || [];
        const updatedRequests = [...currentRequests, newRequest];

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ pending_requests: updatedRequests })
            .eq('id', coachData.id);

        if (updateError) throw updateError;

        return { coachName: coachData.full_name, coachId: coachData.id };

    } catch (error) {
        console.error("Error linking trainee to coach:", error);
        throw error;
    }
};

// --- WORKOUT PLAN SERVICES ---

export const saveWorkoutPlan = async (plan: WorkoutPlan): Promise<WorkoutPlan> => {
    try {
        const dbData = mapPlanToDB(plan);
        const { data, error } = await supabase
            .from('workout_plans')
            .insert(dbData)
            .select()
            .single();

        if (error) throw error;
        return mapPlanFromDB(data);
    } catch (error) {
        console.error("Error saving workout plan:", error);
        throw error;
    }
};

export const fetchActiveWorkoutPlan = async (userId: string): Promise<WorkoutPlan | null> => {
    try {
        const { data, error } = await supabase
            .from('workout_plans')
            .select('*')
            .or(`user_id.eq.${userId},trainee_id.eq.${userId}`)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return mapPlanFromDB(data);
    } catch (error) {
        console.error("Error fetching active plan:", error);
        return null;
    }
};

// --- STORAGE & DOCUMENTS SERVICES ---

export const uploadCertification = async (uid: string, file: File): Promise<string> => {
    try {
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `certifications/${uid}/${timestamp}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents') 
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        await supabase
            .from('documents')
            .insert({
                coach_id: uid,
                file_url: publicUrl,
                status: 'pending'
            });

        return publicUrl;
    } catch (error) {
        console.error("Error uploading certification:", error);
        throw error;
    }
};

export const uploadWorkoutVideo = async (uid: string, file: File): Promise<string> => {
    try {
        const bucketName = 'documents';
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `workout_videos/${uid}/${timestamp}_${cleanName}`;
        
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
};

const mapWorkoutLogFromDB = (l: any): WorkoutLog => ({
    id: l.id,
    targetId: l.target_id,
    date: l.date,
    setNumber: l.set_number,
    reps: l.reps,
    weight: l.weight,
    rpe: l.rpe,
    restTime: l.rest_time,
    videoUrl: l.video_url,
    videoFeedbackId: l.video_feedback_id
});

const mapWorkoutLogToDB = (l: WorkoutLog, userId: string) => ({
    user_id: userId,
    target_id: l.targetId,
    date: l.date,
    set_number: l.setNumber,
    reps: l.reps,
    weight: l.weight,
    rpe: l.rpe,
    rest_time: l.restTime,
    video_url: l.videoUrl,
    video_feedback_id: l.videoFeedbackId
});

const mapWellnessLogFromDB = (l: any): WellnessLog => ({
    id: l.id,
    userId: l.user_id,
    date: l.date,
    sleepDuration: l.sleep_duration,
    sorenessLevel: l.soreness_level,
    energyMood: l.energy_mood,
    notes: l.notes
});

const mapWellnessLogToDB = (l: WellnessLog, userId: string) => ({
    user_id: userId,
    date: l.date,
    sleep_duration: l.sleepDuration,
    soreness_level: l.sorenessLevel,
    energy_mood: l.energyMood,
    notes: l.notes
});

const mapNutritionLogFromDB = (l: any): NutritionLog => ({
    id: l.id,
    userId: l.user_id,
    date: l.date,
    mealName: l.meal_name,
    description: l.description,
    isCompleted: l.is_completed,
    macros: l.macros
});

const mapNutritionLogToDB = (l: NutritionLog, userId: string) => ({
    user_id: userId,
    date: l.date,
    meal_name: l.mealName,
    description: l.description,
    is_completed: l.isCompleted,
    macros: l.macros
});

export const fetchUserData = async (uid: string): Promise<TraineeData | null> => {
    try {
        const [wLogs, wlLogs, nLogs] = await Promise.all([
            supabase.from('workout_logs').select('*').eq('user_id', uid),
            supabase.from('wellness_logs').select('*').eq('user_id', uid),
            supabase.from('nutrition_logs').select('*').eq('user_id', uid)
        ]);

        return {
            workoutLogs: wLogs.data?.map(mapWorkoutLogFromDB) || [],
            wellnessLogs: wlLogs.data?.map(mapWellnessLogFromDB) || [],
            nutritionLogs: nLogs.data?.map(mapNutritionLogFromDB) || []
        };
    } catch (error) {
        console.error("Error fetching trainee data:", error);
        return { workoutLogs: [], wellnessLogs: [], nutritionLogs: [] };
    }
};

export const saveUserData = async (uid: string, data: Partial<TraineeData>) => {
    try {
        if (data.workoutLogs && data.workoutLogs.length > 0) {
            const dbLogs = data.workoutLogs.map(l => {
                const mapped = mapWorkoutLogToDB(l, uid);
                return l.id.startsWith('new_') ? { ...mapped } : { ...mapped, id: l.id };
            });
            
            const { error } = await supabase.from('workout_logs').upsert(dbLogs);
            if(error) console.error("Workout log save error", error);
        }

        if (data.wellnessLogs && data.wellnessLogs.length > 0) {
            const dbLogs = data.wellnessLogs.map(l => {
                const mapped = mapWellnessLogToDB(l, uid);
                return l.id.startsWith('wl_') ? { ...mapped } : { ...mapped, id: l.id };
            });
            await supabase.from('wellness_logs').upsert(dbLogs);
        }

        if (data.nutritionLogs && data.nutritionLogs.length > 0) {
            const dbLogs = data.nutritionLogs.map(l => {
                const mapped = mapNutritionLogToDB(l, uid);
                return l.id.startsWith('log_') ? { ...mapped } : { ...mapped, id: l.id };
            });
            await supabase.from('nutrition_logs').upsert(dbLogs);
        }

    } catch (error) {
        console.error("Error saving user data:", error);
    }
};

export const saveVideoFeedback = async (uid: string, feedback: VideoFeedbackLog) => {
    try {
        const { error } = await supabase.from('video_feedback_logs').insert({
            user_id: uid,
            workout_log_id: feedback.workoutLogId,
            exercise_name: feedback.exerciseName,
            video_url: feedback.videoUrl,
            upload_date: feedback.uploadDate,
            comments: feedback.comments
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error saving video feedback:", error);
    }
};

export const completeOnboarding = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('settings').eq('id', uid).single();
    const currentSettings = data?.settings || {};
    
    await supabase.from('profiles').update({
        settings: { ...currentSettings, hasSeenDashboardTour: true }
    }).eq('id', uid);
};

export const fetchPendingCoaches = async (): Promise<UserProfile[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'Coach')
            .eq('verification_status', 'Pending');

        if (error) throw error;
        return data.map(mapProfileFromDB);
    } catch (error) {
        console.error("Error fetching pending coaches:", error);
        return [];
    }
};

export const fetchTransactions = async (): Promise<PaymentRequest[]> => {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                profiles:user_id (full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
             console.warn("Transactions fetch error (check table existence):", error.message);
             return [];
        }

        return data.map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            userName: t.profiles?.full_name || 'Unknown',
            months: t.months || 1,
            amountUSD: t.amount,
            amountIRR: (t.amount || 0) * 60000, 
            txId: t.tx_id,
            status: t.status,
            requestDate: t.created_at,
            network: 'TRC20'
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
};

export const submitPaymentRequest = async (request: PaymentRequest): Promise<'AUTO_APPROVED' | 'PENDING'> => {
    try {
        const { error } = await supabase
            .from('transactions')
            .insert({
                user_id: request.userId,
                tx_id: request.txId,
                amount: request.amountUSD,
                status: 'Pending',
                months: request.months
            });

        if (error) throw error;
        
        return 'PENDING';
    } catch (error) {
        console.error("Error submitting payment:", error);
        throw error;
    }
};

export const processPayment = async (requestId: string, userId: string, status: 'Approved' | 'Rejected', months: number) => {
    try {
        const { error } = await supabase
            .from('transactions')
            .update({ status })
            .eq('id', requestId);

        if (error) throw error;

        if (status === 'Approved') {
             const expiryDate = new Date();
             expiryDate.setDate(expiryDate.getDate() + (months * 30));
             
             await supabase.from('profiles').update({
                subscription_tier: 'Premium',
                subscription_status: 'Active',
                subscription_expiry_date: expiryDate.toLocaleDateString('fa-IR')
            }).eq('id', userId);
        }
    } catch (error) {
        console.error("Error processing payment:", error);
        throw error;
    }
};

export const sendEmailNotification = async (type: string, payload: any) => {
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, payload })
        });
    } catch(e) {
        console.error("Failed to send email notification", e);
    }
};

// --- REALTIME MESSAGING SERVICES ---

export const fetchMessages = async (senderId: string, receiverId: string): Promise<DirectMessage[]> => {
    try {
        const { data, error } = await supabase
            .from('direct_messages')
            .select('*')
            .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            senderName: 'User', 
            text: msg.text,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: msg.is_read
        }));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
};

export const sendDirectMessage = async (senderId: string, receiverId: string, text: string) => {
    try {
        const { error } = await supabase
            .from('direct_messages')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                text: text,
                is_read: false
            });
        
        if (error) throw error;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
};