
import React, { useState, useEffect } from 'react';
import { AppTab, TradeEntry, Chapter, UserRole } from './types';
import { COURSE_CURRICULUM } from './constants';
import TabBar from './components/TabBar';
import LearningPath from './components/LearningPath';
import TradeJournal from './components/TradeJournal';
import AiMentor from './components/AiMentor';
import Auth from './components/Auth';
import { supabase } from './lib/supabaseClient';
import { PenTool, School, LogOut, Loader2 } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Custom State for Hardcoded Admin Login
  const [isLocalTeacher, setIsLocalTeacher] = useState(() => {
    return localStorage.getItem('fx_mastery_admin_auth') === 'true';
  });

  const [userRole, setUserRole] = useState<UserRole>('student');
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.LEARN);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  
  // Data State
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [tradeEntries, setTradeEntries] = useState<TradeEntry[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // --- AUTHENTICATION & INITIALIZATION ---

  // Handle Role Assignment based on Auth Method
  useEffect(() => {
    if (isLocalTeacher) {
        setUserRole('teacher');
        setIsTeacherMode(true); 
    } else if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role);
        setIsTeacherMode(false); 
    } else {
        setUserRole('student');
        setIsTeacherMode(false);
    }
  }, [session, isLocalTeacher]);

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
          setIsLocalTeacher(false);
          localStorage.removeItem('fx_mastery_admin_auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DATA FETCHING ---

  // Fetch Chapters (Public for everyone)
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map DB columns (snake_case) to our TypeScript types (camelCase)
          const mappedChapters: Chapter[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            duration: d.duration,
            isLocked: d.is_locked,
            prerequisiteIds: d.prerequisite_ids || [],
            videoUrl: d.video_url,
            slidesUrl: d.slides_url
          }));
          setChapters(mappedChapters);
        } else {
          // Fallback to constants if DB is empty
          setChapters(COURSE_CURRICULUM);
        }
      } catch (err) {
        console.error("Error fetching chapters:", err);
        setChapters(COURSE_CURRICULUM); // Fallback
      }
    };

    fetchChapters();
  }, []);

  // Fetch User Data (Progress & Journal) when Session exists
  useEffect(() => {
    if (!session?.user) {
        setCompletedChapters([]);
        setTradeEntries([]);
        return;
    }

    const fetchUserData = async () => {
      setIsDataLoading(true);
      
      // 1. Fetch Progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('chapter_id')
        .eq('user_id', session.user.id);
      
      if (progressData) {
        setCompletedChapters(progressData.map((p: any) => p.chapter_id));
      }

      // 2. Fetch Journal
      const { data: journalData } = await supabase
        .from('trade_journal')
        .select('*')
        .eq('user_id', session.user.id);

      if (journalData) {
        const mappedTrades: TradeEntry[] = journalData.map((t: any) => ({
          id: t.id,
          pair: t.pair,
          type: t.type,
          entryDate: parseInt(t.entry_date),
          result: t.result,
          pnl: parseFloat(t.pnl),
          notes: t.notes,
          screenshotUrl: t.screenshot_url,
          user_id: t.user_id
        }));
        setTradeEntries(mappedTrades);
      }

      setIsDataLoading(false);
    };

    fetchUserData();
  }, [session]);


  // --- USER ACTIONS (PROGRESS) ---

  const toggleChapterComplete = async (id: string) => {
    // Optimistic UI update
    const isCurrentlyComplete = completedChapters.includes(id);
    setCompletedChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );

    if (!session?.user) return; // Local teacher mode doesn't track progress in DB

    if (isCurrentlyComplete) {
      // Remove completion
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', session.user.id)
        .eq('chapter_id', id);
    } else {
      // Add completion
      await supabase
        .from('user_progress')
        .insert({ user_id: session.user.id, chapter_id: id });
    }
  };

  // --- USER ACTIONS (JOURNAL) ---

  const addTradeEntry = async (entry: TradeEntry) => {
    // Optimistic UI
    setTradeEntries(prev => [...prev, entry]);

    if (!session?.user) return;

    // DB Insert
    await supabase.from('trade_journal').insert({
      id: entry.id,
      user_id: session.user.id,
      pair: entry.pair,
      type: entry.type,
      entry_date: entry.entryDate,
      result: entry.result,
      pnl: entry.pnl,
      notes: entry.notes,
      screenshot_url: entry.screenshotUrl
    });
  };

  const deleteTradeEntry = async (id: string) => {
    // Optimistic UI
    setTradeEntries(prev => prev.filter(entry => entry.id !== id));

    if (!session?.user) return;

    // DB Delete
    await supabase.from('trade_journal').delete().eq('id', id).eq('user_id', session.user.id);
  };

  // --- TEACHER ACTIONS (CURRICULUM) ---

  const handleUpdateChapter = async (updatedChapter: Chapter) => {
    // Optimistic UI
    setChapters(prev => prev.map(c => c.id === updatedChapter.id ? updatedChapter : c));

    // DB Update
    await supabase
      .from('chapters')
      .update({
        title: updatedChapter.title,
        description: updatedChapter.description,
        duration: updatedChapter.duration,
        video_url: updatedChapter.videoUrl,
        slides_url: updatedChapter.slidesUrl,
        prerequisite_ids: updatedChapter.prerequisiteIds
      })
      .eq('id', updatedChapter.id);
  };

  const handleAddChapter = async () => {
    const newId = `c${Date.now()}`;
    const newChapter: Chapter = {
      id: newId,
      title: 'New Lesson',
      description: 'Enter description here...',
      duration: '10 min',
      isLocked: false,
      prerequisiteIds: chapters.length > 0 ? [chapters[chapters.length - 1].id] : [],
      videoUrl: '',
      slidesUrl: ''
    };

    // Optimistic UI
    setChapters(prev => [...prev, newChapter]);

    // DB Insert
    await supabase.from('chapters').insert({
        id: newChapter.id,
        title: newChapter.title,
        description: newChapter.description,
        duration: newChapter.duration,
        is_locked: newChapter.isLocked,
        prerequisite_ids: newChapter.prerequisiteIds,
        video_url: '',
        slides_url: ''
    });
  };

  const handleDeleteChapter = async (id: string) => {
    if (window.confirm("Delete this chapter? This cannot be undone.")) {
      // Optimistic UI
      setChapters(prev => prev.filter(c => c.id !== id));
      
      // DB Delete
      await supabase.from('chapters').delete().eq('id', id);
    }
  };

  // --- LOGIN HANDLERS ---

  const handleTeacherLogin = () => {
    localStorage.setItem('fx_mastery_admin_auth', 'true');
    setIsLocalTeacher(true);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('fx_mastery_admin_auth');
    setIsLocalTeacher(false);
    setUserRole('student');
    setIsTeacherMode(false);
    setCompletedChapters([]);
    setTradeEntries([]);
    await supabase.auth.signOut();
  };

  // --- RENDER ---

  if (isLoadingSession) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center text-primary">
            <Loader2 size={40} className="animate-spin" />
        </div>
    )
  }

  // Auth Gate
  if (!session && !isLocalTeacher) {
    return <Auth onTeacherLogin={handleTeacherLogin} />;
  }

  const renderContent = () => {
    if (isDataLoading && userRole === 'student') {
        return (
            <div className="flex justify-center pt-20">
                <Loader2 size={32} className="animate-spin text-slate-500" />
            </div>
        );
    }

    switch (currentTab) {
      case AppTab.LEARN:
        return (
          <LearningPath 
            chapters={chapters} 
            completedIds={completedChapters}
            onToggleComplete={toggleChapterComplete}
            isTeacherMode={isTeacherMode}
            onUpdateChapter={handleUpdateChapter}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
          />
        );
      case AppTab.JOURNAL:
        return (
          <TradeJournal 
            entries={tradeEntries}
            onAddEntry={addTradeEntry}
            onDeleteEntry={deleteTradeEntry}
          />
        );
      case AppTab.MENTOR:
        return <AiMentor />;
      default:
        return <LearningPath 
          chapters={chapters} 
          completedIds={completedChapters}
          onToggleComplete={toggleChapterComplete}
          isTeacherMode={isTeacherMode}
          onUpdateChapter={handleUpdateChapter}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          <span className="text-primary">TradeQuest</span> <span className="text-slate-400 text-sm">[Edu]</span>
        </h1>
        
        <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400">
                {userRole}
            </span>

            {/* Toggle Teacher Mode (Only visible for Teachers) */}
            {currentTab === AppTab.LEARN && userRole === 'teacher' && (
                <button 
                    onClick={() => setIsTeacherMode(!isTeacherMode)}
                    className={`p-2 rounded-full transition-colors ${isTeacherMode ? 'bg-primary text-white' : 'bg-surface text-slate-400 hover:text-white'}`}
                    title={isTeacherMode ? "Switch to Student View" : "Switch to Editor Mode"}
                >
                    {isTeacherMode ? <PenTool size={16} /> : <School size={16} />}
                </button>
            )}
            
            {/* Progress Counter (Student View Only) */}
            {!isTeacherMode && currentTab === AppTab.LEARN && (
                <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-surface rounded-md border border-slate-700 hidden sm:block">
                    {completedChapters.length} / {chapters.length} Done
                </div>
            )}

            <button 
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-loss transition-colors"
                title="Sign Out"
            >
                <LogOut size={18} />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto">
        {renderContent()}
      </main>

      {/* Tab Navigation */}
      <TabBar currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

export default App;