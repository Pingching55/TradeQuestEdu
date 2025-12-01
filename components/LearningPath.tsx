
import React, { useState } from 'react';
import { Chapter } from '../types';
import { CheckCircle2, Circle, Lock, PlayCircle, Link as LinkIcon, ChevronDown, ChevronUp, FileText, Video, Edit2, Trash2, Save, Plus } from 'lucide-react';

interface LearningPathProps {
  chapters: Chapter[];
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  isTeacherMode: boolean;
  onUpdateChapter: (chapter: Chapter) => void;
  onAddChapter: () => void;
  onDeleteChapter: (id: string) => void;
}

const LearningPath: React.FC<LearningPathProps> = ({ 
    chapters, 
    completedIds, 
    onToggleComplete, 
    isTeacherMode,
    onUpdateChapter,
    onAddChapter,
    onDeleteChapter
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Chapter | null>(null);

  const progress = chapters.length > 0 ? Math.round((completedIds.length / chapters.length) * 100) : 0;

  const scrollToChapter = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleExpand = (id: string, isLocked: boolean) => {
    // In teacher mode, we can always expand
    if (isLocked && !isTeacherMode) return;
    setExpandedId(prev => prev === id ? null : id);
  };

  const startEditing = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chapter.id);
    setEditForm(chapter);
    setExpandedId(chapter.id); // Auto expand when editing
  };

  const saveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editForm) {
        // Simple helper to convert youtube watch links to embed links
        let cleanVideoUrl = editForm.videoUrl || '';
        if (cleanVideoUrl.includes('youtube.com/watch?v=')) {
            const videoId = cleanVideoUrl.split('v=')[1]?.split('&')[0];
            if (videoId) cleanVideoUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (cleanVideoUrl.includes('youtu.be/')) {
            const videoId = cleanVideoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (videoId) cleanVideoUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        onUpdateChapter({ ...editForm, videoUrl: cleanVideoUrl });
        setEditingId(null);
        setEditForm(null);
    }
  };

  return (
    <div className="pb-24 px-4 pt-6">
      <div className="mb-8 bg-surface p-6 rounded-3xl shadow-lg border border-slate-700">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-2xl font-bold text-white">
             {isTeacherMode ? "Curriculum Editor" : "Your Progress"}
          </h2>
          {!isTeacherMode && <span className="text-2xl font-bold text-primary">{progress}%</span>}
        </div>
        
        {!isTeacherMode ? (
            <>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                ></div>
                </div>
                <p className="text-slate-400 text-sm mt-3">
                {progress === 100 ? "Mastery achieved! Keep refining." : "Keep pushing! Consistency is key."}
                </p>
            </>
        ) : (
            <div className="flex items-center gap-2">
                <button 
                    onClick={onAddChapter}
                    className="w-full bg-primary/20 border border-primary text-primary font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/30 transition-colors"
                >
                    <Plus size={18} /> Add New Chapter
                </button>
            </div>
        )}
      </div>

      <div className="relative border-l-2 border-slate-700 ml-4 space-y-8">
        {chapters.map((chapter, index) => {
          const isCompleted = completedIds.includes(chapter.id);
          const isNext = !isCompleted && (index === 0 || completedIds.includes(chapters[index - 1].id));
          const isLocked = !isCompleted && !isNext;
          const isExpanded = expandedId === chapter.id;
          const isEditing = editingId === chapter.id;
          const prereqs = chapters.filter(c => chapter.prerequisiteIds?.includes(c.id));
          
          return (
            <div key={chapter.id} id={chapter.id} className="relative pl-8 group scroll-mt-28">
              {/* Timeline Dot */}
              <div 
                className={`absolute -left-[9px] top-0 p-1 rounded-full border-2 transition-colors duration-300 bg-background z-10
                  ${isCompleted ? 'border-win text-win' : isNext || isTeacherMode ? 'border-primary text-primary' : 'border-slate-600 text-slate-600'}
                `}
              >
                {isCompleted ? <CheckCircle2 size={16} fill="currentColor" className="text-background"/> : 
                 (isNext || isTeacherMode) ? <PlayCircle size={16} fill="currentColor" className="text-background" /> : 
                 <Lock size={16} />}
              </div>

              {/* Card */}
              <div 
                onClick={() => toggleExpand(chapter.id, isLocked)}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden
                  ${isLocked && !isTeacherMode ? 'bg-surface/30 border-slate-700 opacity-70 cursor-not-allowed' : 
                    isExpanded ? 'bg-surface border-primary ring-1 ring-primary/50' : 
                    isCompleted ? 'bg-surface/50 border-win/30 cursor-pointer hover:bg-surface/70' : 
                    'bg-surface border-slate-700 cursor-pointer hover:border-slate-500'}
                `}
              >
                {/* Header Section */}
                <div className="p-5 relative">
                  {/* Edit Controls (Teacher Mode) */}
                  {isTeacherMode && !isEditing && (
                    <div className="absolute top-4 right-12 flex gap-2">
                        <button 
                            onClick={(e) => startEditing(chapter, e)}
                            className="p-1.5 bg-slate-800 rounded-lg text-primary hover:bg-slate-700"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }}
                            className="p-1.5 bg-slate-800 rounded-lg text-loss hover:bg-slate-700"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-14">
                      {isEditing ? (
                          <input 
                            value={editForm?.title}
                            onChange={(e) => setEditForm(prev => prev ? {...prev, title: e.target.value} : null)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-1 text-white font-bold mb-2"
                            placeholder="Chapter Title"
                          />
                      ) : (
                        <h3 className={`font-semibold text-lg ${isCompleted ? 'text-win' : 'text-white'}`}>
                            {chapter.title}
                        </h3>
                      )}
                      
                      {isEditing ? (
                           <input 
                           value={editForm?.duration}
                           onChange={(e) => setEditForm(prev => prev ? {...prev, duration: e.target.value} : null)}
                           onClick={(e) => e.stopPropagation()}
                           className="w-24 bg-slate-900 border border-slate-600 rounded p-1 text-xs font-mono text-slate-300"
                           placeholder="15 min"
                         />
                      ) : (
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-md mt-1 inline-block">
                            {chapter.duration}
                        </span>
                      )}
                    </div>
                    {(!isLocked || isTeacherMode) && (
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    )}
                  </div>
                  
                  {!isExpanded && (
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {chapter.description}
                    </p>
                  )}
                  
                  {/* Prerequisites Link (Collapsed View) */}
                  {!isExpanded && prereqs.length > 0 && (
                    <div className="mt-3 flex items-center text-xs text-slate-500">
                       <LinkIcon size={12} className="mr-1" />
                       <span>Req: {prereqs.map(p => p.title).join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (!isLocked || isTeacherMode) && (
                  <div className="border-t border-slate-700/50 bg-slate-900/30 p-5 animate-fade-in">
                    {isEditing ? (
                        <div className="space-y-3 mb-4" onClick={(e) => e.stopPropagation()}>
                             <textarea 
                                value={editForm?.description}
                                onChange={(e) => setEditForm(prev => prev ? {...prev, description: e.target.value} : null)}
                                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-300 min-h-[80px]"
                                placeholder="Description"
                            />
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Video URL (YouTube/Vimeo)</label>
                                <input 
                                    value={editForm?.videoUrl || ''}
                                    onChange={(e) => setEditForm(prev => prev ? {...prev, videoUrl: e.target.value} : null)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-blue-400"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold">Slides URL (GDrive/Dropbox)</label>
                                <input 
                                    value={editForm?.slidesUrl || ''}
                                    onChange={(e) => setEditForm(prev => prev ? {...prev, slidesUrl: e.target.value} : null)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-blue-400"
                                    placeholder="https://docs.google.com/..."
                                />
                            </div>
                            <button 
                                onClick={saveChapter}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 font-bold"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        {chapter.description}
                        </p>
                    )}

                    {/* Prerequisites (Expanded) */}
                    {!isEditing && prereqs.length > 0 && (
                      <div className="mb-6 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">Prerequisites</div>
                        <div className="flex flex-wrap gap-2">
                          {prereqs.map(p => (
                            <a
                              key={p.id}
                              href={`#${p.id}`}
                              onClick={(e) => scrollToChapter(e, p.id)}
                              className="text-xs text-primary hover:text-blue-300 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded transition-colors flex items-center"
                            >
                              <LinkIcon size={10} className="mr-1" />
                              {p.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Media Content - Only show if not editing or if we want to preview while editing */}
                    {!isEditing && (
                        <div className="space-y-4">
                        {chapter.videoUrl ? (
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700 shadow-inner">
                            <iframe 
                                src={chapter.videoUrl} 
                                title={chapter.title}
                                className="w-full h-full" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                            </div>
                        ) : (
                            <div className="aspect-video w-full bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 border border-slate-700 border-dashed">
                            <Video size={48} className="mb-2 opacity-50" />
                            <p className="text-sm">Video content pending upload</p>
                            </div>
                        )}

                        {chapter.slidesUrl && (
                            <a 
                            href={chapter.slidesUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors group"
                            >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                <FileText size={20} />
                                </div>
                                <div>
                                <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">Lesson Slides</p>
                                <p className="text-[10px] text-slate-500">Document/PDF Link</p>
                                </div>
                            </div>
                            <ChevronDown size={16} className="-rotate-90 text-slate-500" />
                            </a>
                        )}
                        </div>
                    )}

                    {/* Action Button - Hide in teacher mode to prevent accidental completion */}
                    {!isTeacherMode && (
                        <button 
                        className={`mt-6 w-full py-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95
                            ${isCompleted ? 'bg-win/10 text-win border border-win/20 hover:bg-win/20' : 'bg-primary text-white hover:bg-blue-600 shadow-primary/20'}
                        `}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onToggleComplete(chapter.id);
                        }}
                        >
                        {isCompleted ? (
                            <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 size={18} /> Completed
                            </span>
                        ) : (
                            "Mark Lesson Complete"
                        )}
                        </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
