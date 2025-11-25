import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, WorkoutPlan, ExerciseDefinition, TraineeSummary, TraineeData } from './types';
import { DEFAULT_USER_PROFILE, MOCK_ATHLETE_PROFILE, EXERCISE_DATABASE, ADMIN_CONFIG } from './constants';
import { LayoutDashboard, User, Utensils, Video, Globe, CalendarPlus, PlayCircle, Users, ArrowRight, MessageSquare, CreditCard, Loader2, LogOut } from 'lucide-react';
import { saveUserProfile, fetchUserData, saveUserData, completeOnboarding, saveWorkoutPlan, fetchActiveWorkoutPlan, linkTraineeToCoach } from './services/userData';
import { useAuth } from './context/AuthContext';

// Components
import Auth from './components/Auth';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import NutritionTracker from './components/NutritionTracker';
import FormCheck from './components/FormCheck';
import LiveCoach from './components/LiveCoach';
import ResearchChat from './components/ResearchChat';
import PlanBuilder from './components/PlanBuilder';
import ActiveSession from './components/ActiveSession';
import { CoachDashboard } from './components/CoachDashboard';
import CoachMessenger from './components/CoachMessenger';
import BusinessTools from './components/BusinessTools';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import OnboardingTour from './components/OnboardingTour';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  
  // UI State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [traineeData, setTraineData] = useState<TraineeData>({ workoutLogs: [], wellnessLogs: [], nutritionLogs: [] });
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>([]);
  const fullExerciseDb = [...EXERCISE_DATABASE, ...customExercises];

  const [selectedTrainee, setSelectedTrainee] = useState<TraineeSummary | null>(null);

  // --- Load User Data on Auth Change ---
  useEffect(() => {
      if (user) {
          // Super Admin Override
          if (user.id === ADMIN_CONFIG.SUPER_ADMIN_UID || user.email === 'admin@fitpro.ir') {
             setUserProfile({ ...DEFAULT_USER_PROFILE, id: user.id, role: 'SuperAdmin', name: 'مدیر ارشد' });
             setCurrentView(AppView.SUPER_ADMIN_DASHBOARD);
             return;
          }

          const loadData = async () => {
              setIsLoadingData(true);
              try {
                  // 1. Map Auth User to UserProfile state
                  const profile: UserProfile = {
                      ...DEFAULT_USER_PROFILE,
                      id: user.id,
                      email: user.email,
                      name: user.name || user.email?.split('@')[0] || 'User',
                      role: user.role as any || 'Trainee',
                      phoneNumber: user.phoneNumber,
                      subscriptionTier: user.subscriptionTier,
                      subscriptionStatus: user.subscriptionStatus,
                      verificationStatus: user.verificationStatus,
                      inviteCode: user.inviteCode,
                      avatarUrl: user.avatarUrl,
                      coachConnectStatus: user.coachConnectStatus,
                      connectedCoachName: user.connectedCoachName,
                      hasSeenDashboardTour: user.hasSeenDashboardTour,
                  };
                  setUserProfile(profile);

                  // 2. Set View based on Role
                  if (profile.role === 'Coach') {
                      setCurrentView(AppView.COACH_DASHBOARD);
                  } else if (profile.role === 'SuperAdmin') {
                      setCurrentView(AppView.SUPER_ADMIN_DASHBOARD);
                  } else {
                      setCurrentView(AppView.DASHBOARD);
                  }

                  // 3. Fetch Operational Data (Logs, Plans)
                  const [dbTraineeData, dbPlan] = await Promise.all([
                      fetchUserData(user.id),
                      fetchActiveWorkoutPlan(user.id)
                  ]);

                  if (dbTraineeData) {
                      setTraineData(dbTraineeData);
                  } else {
                      const initData: TraineeData = { workoutLogs: [], wellnessLogs: [], nutritionLogs: [] };
                      setTraineData(initData);
                  }

                  if (dbPlan) {
                      setActivePlan(dbPlan);
                  } else {
                      setActivePlan(null);
                  }

              } catch (err) {
                  console.error("Failed to load user data:", err);
              } finally {
                  setIsLoadingData(false);
              }
          };
          loadData();
      } else {
          // Reset State on Logout
          setUserProfile(DEFAULT_USER_PROFILE);
          setTraineData({ workoutLogs: [], wellnessLogs: [], nutritionLogs: [] });
          setActivePlan(null);
          setCurrentView(AppView.DASHBOARD);
      }
  }, [user]);

  // --- Routing Logic for Admin ---
  useEffect(() => {
      const hostname = window.location.hostname;
      const path = window.location.pathname;

      if ((hostname === 'secure-admin.ir' || path === ADMIN_CONFIG.SECRET_PATH)) {
          setCurrentView(AppView.SUPER_ADMIN_DASHBOARD);
      }
  }, []);

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
      setUserProfile(updatedProfile);
      try {
          await saveUserProfile(updatedProfile);
      } catch (err) {
          alert("خطا در ذخیره تغییرات.");
      }
  };

  const handleConnectRequest = async (inviteCode: string) => {
      if (!inviteCode) return;
      try {
          const { coachName, coachId } = await linkTraineeToCoach(userProfile.id, userProfile.name, inviteCode);
          alert(`درخواست شما برای ${coachName} ارسال شد.`);
          
          const updated = { 
              ...userProfile, 
              coachConnectStatus: 'Pending' as const,
              connectedCoachName: coachName,
              coachId: coachId 
          };
          setUserProfile(updated);
          await saveUserProfile(updated);
      } catch (e: any) {
          alert(e.message || "کد دعوت معتبر نیست یا خطایی رخ داده است.");
      }
  };

  const handleCoachRequestAction = (requestId: string, action: 'APPROVE' | 'REJECT') => {
      const updatedRequests = userProfile.pendingRequests?.filter(r => r.id !== requestId) || [];
      if (action === 'APPROVE') {
         alert("درخواست تایید شد. شاگرد به لیست اضافه گردید.");
      } 
      const updatedProfile = { ...userProfile, pendingRequests: updatedRequests };
      handleProfileUpdate(updatedProfile);
  };

  const handleAddCustomExercise = (newExercise: ExerciseDefinition) => {
    setCustomExercises(prev => [...prev, newExercise]);
  };

  const handleRemoveCustomExercise = (exerciseId: string) => {
    setCustomExercises(prev => prev.filter(e => e.id !== exerciseId));
  };

  const handleCoachCreatePlan = (trainee: TraineeSummary) => {
      setSelectedTrainee(trainee);
      setCurrentView(AppView.PLAN_BUILDER);
  };

  const handleCoachViewTrainee = (trainee: TraineeSummary) => {
      setSelectedTrainee(trainee);
      setCurrentView(AppView.DASHBOARD);
  };

  const handleBackToCoachDashboard = () => {
      setSelectedTrainee(null);
      setCurrentView(AppView.COACH_DASHBOARD);
  };
  
  const handleCoachSendMessage = (traineeId: string) => {
      setCurrentView(AppView.COACH_MESSAGES);
  };

  const handleTourComplete = async () => {
    setUserProfile(prev => ({ ...prev, hasSeenDashboardTour: true }));
    if (userProfile.id) {
        await completeOnboarding(userProfile.id);
    }
  };

  const scrollToFooter = () => {
      const footer = document.getElementById('contact-footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
  };

  const NavItem = ({ view, icon: Icon, label, id }: { view: AppView; icon: any; label: string; id?: string }) => (
    <button
      id={id}
      onClick={() => {
          if(view === AppView.COACH_DASHBOARD) setSelectedTrainee(null);
          setCurrentView(view);
      }}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all ${
        currentView === view
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  if (authLoading || isLoadingData) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="text-center">
                  <Loader2 size={48} className="text-emerald-500 animate-spin mx-auto mb-4"/>
                  <p className="text-slate-400">در حال بارگذاری...</p>
              </div>
          </div>
      );
  }

  if (currentView === AppView.SUPER_ADMIN_DASHBOARD) {
      return <SuperAdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-200" dir="rtl">
      
      {user && !userProfile.hasSeenDashboardTour && userProfile.role !== 'Guest' && (
          <OnboardingTour 
             role={userProfile.role as 'Coach' | 'Trainee'} 
             onComplete={handleTourComplete} 
          />
      )}
      
      <Header onContactClick={scrollToFooter} />

      <div className="flex flex-1 relative">
        {!user ? (
             <div className="w-full">
                 <Auth />
             </div>
        ) : (
            <>
                <aside className="w-64 bg-slate-900 border-l border-slate-800 p-6 flex-shrink-0 fixed right-0 top-20 h-[calc(100vh-5rem)] z-40 overflow-y-auto custom-scrollbar hidden lg:block">
                    {userProfile.role === 'Coach' && (
                        <div className="mb-6 animate-fade-in">
                            <p className="px-4 text-xs font-bold text-emerald-400 uppercase mb-2">پنل مدیریت</p>
                            <nav className="space-y-1">
                                <NavItem view={AppView.COACH_DASHBOARD} icon={Users} label="مرکز فرماندهی" />
                                <NavItem id="tour-inbox-link" view={AppView.COACH_MESSAGES} icon={MessageSquare} label="پیام‌ها" />
                                <NavItem view={AppView.COACH_BUSINESS} icon={CreditCard} label="امور مالی" />
                                <NavItem view={AppView.PLAN_BUILDER} icon={CalendarPlus} label="بانک برنامه‌ها" />
                            </nav>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">تمرین شخصی</p>
                        <nav className="space-y-1">
                            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="داشبورد من" />
                            {userProfile.role === 'Trainee' && <NavItem view={AppView.ACTIVE_SESSION} icon={PlayCircle} label="شروع تمرین" />}
                            <NavItem view={AppView.NUTRITION_TRACKER} icon={Utensils} label="دفترچه تغذیه" />
                        </nav>
                    </div>

                    {userProfile.role !== 'Coach' && (
                        <div className="mb-6">
                            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">برنامه‌ریزی</p>
                            <nav className="space-y-1">
                                <NavItem view={AppView.PLAN_BUILDER} icon={CalendarPlus} label="مدیریت برنامه" />
                                <NavItem view={AppView.PROFILE} icon={User} label="پروفایل من" />
                            </nav>
                        </div>
                    )}
                    
                    {userProfile.role === 'Coach' && (
                        <div className="mb-6">
                            <nav className="space-y-1">
                            <NavItem view={AppView.PROFILE} icon={User} label="پروفایل مربی" />
                            </nav>
                        </div>
                    )}

                    <div className="mb-6">
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">ابزارهای هوشمند</p>
                        <nav className="space-y-1">
                            <NavItem view={AppView.FORM_CHECK} icon={Video} label="آنالیز فرم" />
                            <NavItem id="tour-chat-link" view={AppView.CHAT} icon={Globe} label="مرکز تحقیقات" />
                        </nav>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <button 
                            onClick={() => signOut()} 
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-all"
                        >
                            <LogOut size={20} />
                            <span className="font-medium text-sm">خروج از حساب</span>
                        </button>
                    </div>
                </aside>

                <main className="flex-1 lg:mr-64 p-4 md:p-8 relative w-full max-w-full overflow-x-hidden">
                    {userProfile.role === 'Coach' && selectedTrainee && currentView !== AppView.COACH_DASHBOARD && (
                        <div className="bg-blue-900/30 border border-blue-500/30 text-blue-200 px-4 py-3 rounded-xl mb-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <Users size={18} />
                                <span>شما در حال مشاهده پرونده شاگرد هستید: <strong className="text-white">{selectedTrainee.name}</strong></span>
                            </div>
                            <button onClick={handleBackToCoachDashboard} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                                بازگشت <ArrowRight size={14} className="rotate-180"/>
                            </button>
                        </div>
                    )}

                    <div className="max-w-5xl mx-auto">
                    {currentView === AppView.COACH_DASHBOARD && (
                        <CoachDashboard 
                            userProfile={userProfile} 
                            onSelectTraineeForPlan={handleCoachCreatePlan}
                            onViewTraineeDashboard={handleCoachViewTrainee}
                            onHandleRequest={handleCoachRequestAction}
                            onSendMessage={handleCoachSendMessage}
                        />
                    )}
                    
                    {currentView === AppView.COACH_MESSAGES && <CoachMessenger />}
                    {currentView === AppView.COACH_BUSINESS && <BusinessTools />}

                    {currentView === AppView.DASHBOARD && (
                        <Dashboard 
                            profile={selectedTrainee ? MOCK_ATHLETE_PROFILE : userProfile} 
                            plan={activePlan || undefined} 
                            onStartWorkout={() => setCurrentView(AppView.ACTIVE_SESSION)}
                            onHireCoach={() => setCurrentView(AppView.PROFILE)}
                            traineeData={traineeData}
                        />
                    )}
                    
                    {currentView === AppView.ACTIVE_SESSION && (
                        <ActiveSession 
                            plan={activePlan!} 
                            exerciseDb={fullExerciseDb}
                            traineeData={traineeData}
                            onFinish={() => {
                                alert("تمرین ذخیره شد!");
                                setCurrentView(AppView.DASHBOARD);
                            }} 
                        />
                    )}

                    {currentView === AppView.PLAN_BUILDER && (
                        <PlanBuilder 
                            initialPlan={activePlan || undefined}
                            isReadOnly={userProfile.role === 'Trainee' && userProfile.coachConnectStatus === 'Connected'}
                            customExercises={customExercises}
                            onAddCustomExercise={handleAddCustomExercise}
                            onRemoveCustomExercise={handleRemoveCustomExercise}
                            targetTraineeId={selectedTrainee?.id}
                            targetTraineeName={selectedTrainee?.name}
                            onSave={async (plan: WorkoutPlan) => {
                                try {
                                    const savedPlan = await saveWorkoutPlan(plan);
                                    // Update state if for self, otherwise just notify
                                    if (userProfile.role === 'Trainee' || !selectedTrainee) {
                                        setActivePlan(savedPlan);
                                    }
                                    alert("برنامه ذخیره شد!");
                                    if (userProfile.role === 'Coach') {
                                        handleBackToCoachDashboard();
                                    } else {
                                        setCurrentView(AppView.ACTIVE_SESSION);
                                    }
                                } catch (e) {
                                    alert("خطا در ذخیره برنامه. لطفا اتصال اینترنت را بررسی کنید.");
                                }
                            }} 
                        />
                    )}
                    
                    {currentView === AppView.NUTRITION_TRACKER && <NutritionTracker plan={activePlan || undefined} />}
                    {currentView === AppView.PROFILE && (
                        <Profile 
                            key={userProfile.id}
                            profile={userProfile} 
                            onUpdate={handleProfileUpdate} 
                            onConnectRequest={handleConnectRequest}
                        />
                    )}
                    {currentView === AppView.FORM_CHECK && <FormCheck />}
                    {currentView === AppView.CHAT && <ResearchChat />}
                    </div>
                </main>
            </>
        )}
      </div>
      <Footer />
      <LiveCoach />
    </div>
  );
}

export default App;