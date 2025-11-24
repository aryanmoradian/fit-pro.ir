
import React, { useRef, useState, useEffect } from 'react';
import { VideoComment } from '../types';
import { Play, Pause, MessageSquare, User, Send, Clock, SkipBack, SkipForward } from 'lucide-react';

interface Props {
  videoUrl: string;
  comments: VideoComment[];
  onAddComment: (comment: Omit<VideoComment, 'id' | 'createdAt'>) => void;
  currentUserRole: 'Coach' | 'Trainee';
}

const VideoPlayer: React.FC<Props> = ({ videoUrl, comments, onAddComment, currentUserRole }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmitComment = () => {
    if (!newCommentText.trim()) return;
    onAddComment({
      timestamp: currentTime,
      text: newCommentText,
      author: currentUserRole
    });
    setNewCommentText('');
    // Pause to let user reflect on comment addition? Optional.
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl h-[600px]">
      
      {/* Video Section */}
      <div className="flex-1 bg-black relative flex flex-col justify-center">
        <video 
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onClick={togglePlay}
        />
        
        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={togglePlay} className="text-white hover:text-emerald-400">
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full relative cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    seekTo(pos * duration);
                }}>
                    <div className="absolute top-0 left-0 h-full bg-emerald-500 rounded-full" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                    {/* Comment Markers */}
                    {comments.map(c => (
                        <div 
                            key={c.id} 
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full hover:scale-150 transition-transform"
                            style={{ left: `${(c.timestamp / duration) * 100}%` }}
                            title={`${formatTime(c.timestamp)}: ${c.text}`}
                        ></div>
                    ))}
                </div>
                <span className="text-xs font-mono text-white">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="w-full md:w-80 border-l border-slate-800 flex flex-col bg-slate-900">
          <div className="p-4 border-b border-slate-800 bg-slate-900">
              <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare size={18} className="text-emerald-400"/> بازخورد فنی
              </h3>
              <p className="text-xs text-slate-500 mt-1">برای ثبت نظر، ویدیو را در لحظه خطا متوقف کنید.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {comments.length === 0 && (
                  <div className="text-center text-slate-600 mt-10">
                      <Clock size={32} className="mx-auto mb-2 opacity-50"/>
                      <p className="text-sm">هنوز نظری ثبت نشده است.</p>
                  </div>
              )}
              {comments.sort((a,b) => a.timestamp - b.timestamp).map(comment => (
                  <div 
                    key={comment.id} 
                    onClick={() => seekTo(comment.timestamp)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${Math.abs(currentTime - comment.timestamp) < 1 ? 'bg-emerald-900/20 border-emerald-500/50 ring-1 ring-emerald-500/30' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'}`}
                  >
                      <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${comment.author === 'Coach' ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'}`}>
                              {comment.author === 'Coach' ? 'مربی' : comment.author === 'AI' ? 'هوش مصنوعی' : 'شما'}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                              <Clock size={10} /> {formatTime(comment.timestamp)}
                          </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">{comment.text}</p>
                  </div>
              ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
              <div className="relative">
                  <span className="absolute -top-6 left-0 text-[10px] text-emerald-400 bg-slate-800 px-2 rounded border border-slate-700">
                      در حال ثبت برای: {formatTime(currentTime)}
                  </span>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="نکته اصلاحی را بنویسید..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                      />
                      <button 
                        onClick={handleSubmitComment}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg"
                      >
                          <Send size={16} />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
