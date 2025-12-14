import React, { useState, useRef, useEffect } from 'react';
import { generateReflectiveContent, generateSpeech, generateSceneVideo } from '../services/geminiService';
import { playAudioContent } from '../utils/audioPlayer';
import { Sparkles, Send, BookOpen, History, Heart, Lightbulb, Volume2, Loader2, BookmarkPlus, Film, X } from 'lucide-react';
import { ChatMessage, StoryData } from '../types';
import { useNotes } from '../contexts/NotesContext';

interface AICompanionProps {
  story: StoryData;
}

interface VisualizationState {
  text: string;
  videoUrl: string | null;
  audioData: string | null;
  isLoading: boolean;
  loadingStep: string;
}

export const AICompanion: React.FC<AICompanionProps> = ({ story }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `I am here to help you reflect on this sacred moment in ${story.chapterRef}. What would you like to explore about ${story.titlePrefix} ${story.titleHighlight}?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const [visualization, setVisualization] = useState<VisualizationState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { addNote } = useNotes();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const responseText = await generateReflectiveContent(text, story.aiContext);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const handleSpeak = async (text: string, index: number) => {
    if (speakingId !== null) return;
    setSpeakingId(index);
    try {
      const audioData = await generateSpeech(text);
      if (audioData) {
        await playAudioContent(audioData);
      }
    } finally {
      setSpeakingId(null);
    }
  };

  const handleVisualize = async (text: string) => {
    setVisualization({
      text,
      videoUrl: null,
      audioData: null,
      isLoading: true,
      loadingStep: 'Dreaming up the scene...'
    });

    try {
        // Create a visual prompt based on the story and the specific insight
        const visualPrompt = `Cinematic, photorealistic biblical scene. Theme: ${story.titlePrefix} ${story.titleHighlight}. Mood: ${story.theme}. Visual context: ${text.slice(0, 100)}. 4k, dramatic lighting.`;
        
        const videoUrl = await generateSceneVideo(visualPrompt);
        
        if (videoUrl) {
            setVisualization(prev => prev ? { ...prev, videoUrl, loadingStep: 'Preparing narration...' } : null);
            
            const audioData = await generateSpeech(text);
            
            setVisualization(prev => prev ? { ...prev, audioData, isLoading: false } : null);
            
            if (audioData) {
                await playAudioContent(audioData);
            }
        } else {
            setVisualization(null);
            // Optionally handle error notification here
        }
    } catch (error) {
        console.error(error);
        setVisualization(null);
    }
  };

  const handleSaveNote = (text: string) => {
    addNote(text, 'AI Insight');
  };

  const QuickPrompt = ({ icon: Icon, text, prompt }: { icon: any, text: string, prompt: string }) => (
    <button
      onClick={() => handleSend(prompt)}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-orange-50 text-stone-700 hover:text-orange-700 rounded-full text-sm transition-all border border-stone-200 hover:border-orange-200"
    >
      <Icon className="w-4 h-4" />
      {text}
    </button>
  );

  return (
    <section className="py-24 px-4 bg-white relative">
      
      {/* Visualization Modal */}
      {visualization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/95 backdrop-blur-sm p-4 animate-fade-in">
            <button 
                onClick={() => setVisualization(null)}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                aria-label="Close visualization"
            >
                <X className="w-8 h-8" />
            </button>
            
            <div className="max-w-6xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-stone-800 h-[80vh] md:h-[70vh]">
                {/* Video Container */}
                <div className="relative md:w-2/3 bg-stone-900 flex items-center justify-center h-1/2 md:h-full">
                    {visualization.videoUrl ? (
                        <video 
                            src={visualization.videoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover animate-fade-in"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-6" />
                            <p className="text-orange-200 font-display text-xl animate-pulse">{visualization.loadingStep}</p>
                            <p className="text-stone-500 text-sm mt-4 max-w-xs mx-auto">Generating a unique cinematic background for this insight using Veo...</p>
                        </div>
                    )}
                </div>
                
                {/* Text/Controls Container */}
                <div className="p-8 md:w-1/3 flex flex-col bg-stone-900 border-l border-stone-800 h-1/2 md:h-full">
                    <div className="flex items-center gap-2 mb-6 text-orange-500 shrink-0">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-display tracking-widest text-sm uppercase">AI Insight</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2">
                        <p className="text-stone-300 font-serif leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                            {visualization.text}
                        </p>
                    </div>

                    {visualization.audioData && !visualization.isLoading && (
                        <div className="mt-6 pt-6 border-t border-stone-800 shrink-0">
                             <button 
                                onClick={() => playAudioContent(visualization.audioData!)}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-lg transition-colors font-sans text-sm tracking-wide uppercase"
                             >
                                <Volume2 className="w-4 h-4" /> Replay Narration
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Context / Instructions */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-3xl font-display text-stone-800">Deepen Your Understanding</h2>
          <p className="text-stone-600 font-sans leading-relaxed">
            Use this interactive companion to explore the theological depth, historical context, and personal application of {story.chapterRef}.
          </p>
          
          <div className="space-y-4 pt-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Recommended Topics</h3>
             <div className="flex flex-wrap gap-3">
                <QuickPrompt icon={BookOpen} text="Explain Meaning" prompt={`Explain the theological significance of ${story.reference}.`} />
                <QuickPrompt icon={History} text="Historical Context" prompt="What is the historical and cultural context of this passage?" />
                <QuickPrompt icon={Heart} text="Daily Devotional" prompt="Write a short, encouraging devotional based on this passage." />
                <QuickPrompt icon={Lightbulb} text="Life Application" prompt="How can I apply the lessons from this story to my modern life?" />
             </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 bg-white/50 rounded-t-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-stone-700">Study Assistant</span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-stone-800 text-white rounded-br-none' 
                      : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                  ))}

                  {msg.role === 'model' && (
                    <div className="absolute -bottom-10 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm border border-stone-100">
                        <button 
                        onClick={() => handleSpeak(msg.text, idx)}
                        disabled={speakingId !== null}
                        className={`p-2 rounded-full hover:bg-orange-50 transition-colors ${speakingId === idx ? 'text-orange-500' : 'text-stone-400 hover:text-orange-500'}`}
                        aria-label="Read aloud"
                        title="Read Aloud"
                        >
                        {speakingId === idx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        
                        <div className="w-px bg-stone-200 my-1"></div>

                        <button 
                        onClick={() => handleVisualize(msg.text)}
                        disabled={visualization !== null}
                        className="p-2 rounded-full text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                        aria-label="Visualize"
                        title="Visualize & Narrate"
                        >
                        <Film className="w-4 h-4" />
                        </button>

                        <div className="w-px bg-stone-200 my-1"></div>
                        
                        <button 
                        onClick={() => handleSaveNote(msg.text)}
                        className="p-2 rounded-full text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                        aria-label="Save to notes"
                        title="Save to Notes"
                        >
                        <BookmarkPlus className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-stone-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-stone-200 rounded-b-2xl">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask a question about the passage..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="bg-stone-800 hover:bg-stone-900 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};