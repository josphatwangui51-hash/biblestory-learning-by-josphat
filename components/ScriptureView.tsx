import React, { useState } from 'react';
import { Volume2, Loader2, PenLine } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { playAudioContent } from '../utils/audioPlayer';
import { useNotes } from '../contexts/NotesContext';
import { StoryData } from '../types';

interface ScriptureViewProps {
  story: StoryData;
}

export const ScriptureView: React.FC<ScriptureViewProps> = ({ story }) => {
  const [isNarrating, setIsNarrating] = useState(false);
  const { openWithDraft } = useNotes();

  const handleListen = async () => {
    if (isNarrating) return;
    
    setIsNarrating(true);
    try {
      const audioData = await generateSpeech(story.text);
      if (audioData) {
        await playAudioContent(audioData);
      }
    } finally {
      setIsNarrating(false);
    }
  };

  const handleNote = () => {
    openWithDraft(`Reflecting on ${story.reference}:\n`);
  };

  return (
    <section id="scripture" className="py-24 px-4 md:px-8 bg-desert-sand/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display text-stone-800 mb-2">The Encounter</h2>
          <div className="h-1 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        <div className="bg-white p-8 md:p-12 shadow-xl rounded-sm border-l-4 border-orange-500 relative">
           <span className="absolute -top-6 -left-4 text-9xl text-orange-100 font-serif leading-none select-none z-0">“</span>
           
           <div className="absolute top-8 right-8 z-20 flex gap-3">
             <button 
               onClick={handleListen}
               disabled={isNarrating}
               className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-orange-600 hover:text-orange-800 disabled:opacity-50 transition-colors"
               aria-label="Listen to scripture"
             >
               {isNarrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
               <span className="hidden sm:inline">Listen</span>
             </button>
             
             <div className="w-px h-4 bg-orange-200"></div>

             <button 
               onClick={handleNote}
               className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-stone-500 hover:text-stone-800 transition-colors"
               aria-label="Add note about scripture"
             >
               <PenLine className="w-4 h-4" />
               <span className="hidden sm:inline">Note</span>
             </button>
           </div>
          
          <div className="relative z-10">
            <h3 className="text-stone-500 font-sans text-sm uppercase tracking-wider mb-6">{story.reference}</h3>
            
            <div className="prose prose-lg prose-stone font-serif text-stone-800 leading-loose">
              {/* Simple rendering for now, can be improved with parsing if needed */}
              <p>{story.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};