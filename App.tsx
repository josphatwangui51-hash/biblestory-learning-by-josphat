import React, { useEffect, useState } from 'react';
import { Heart, Mail, MessageCircle, Book } from 'lucide-react';
import { Hero } from './components/Hero';
import { ScriptureView } from './components/ScriptureView';
import { AICompanion } from './components/AICompanion';
import { BibleQuiz } from './components/BibleQuiz';
import { NotesWidget } from './components/NotesWidget';
import { NotesProvider } from './contexts/NotesContext';
import { notifyVisit } from './services/notificationService';
import { stories } from './data/stories';
import { StoryData } from './types';

const App: React.FC = () => {
  const [currentStory, setCurrentStory] = useState<StoryData>(stories[0]);

  useEffect(() => {
    // Trigger the notification service when the app loads
    notifyVisit();
  }, []);

  return (
    <NotesProvider>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-orange-200 selection:text-orange-900 transition-colors duration-500">
        <Hero story={currentStory} />
        <ScriptureView story={currentStory} />
        {/* Key forces remount when story changes to reset chat state */}
        <AICompanion key={`chat-${currentStory.id}`} story={currentStory} />
        
        {/* Bible Quiz Section */}
        <BibleQuiz key={`quiz-${currentStory.id}`} story={currentStory} />

        <NotesWidget />
        
        {/* Story Selector Section */}
        <section className="bg-stone-100 py-16 px-4 border-t border-stone-200">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-8 justify-center">
              <Book className="w-5 h-5 text-orange-600" />
              <h3 className="font-display text-2xl text-stone-800">Explore Other Stories</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story) => (
                <button
                  key={story.id}
                  onClick={() => {
                    setCurrentStory(story);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`relative overflow-hidden rounded-xl h-48 group text-left transition-all shadow-md hover:shadow-xl ${currentStory.id === story.id ? 'ring-2 ring-orange-500' : ''}`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${story.backgroundImage}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-300 mb-1 block">{story.chapterRef}</span>
                    <h4 className="font-display text-xl leading-tight">{story.titlePrefix} {story.titleHighlight}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 px-4 border-t border-stone-200">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Heart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="font-display text-2xl text-stone-800 mb-2">Support Josphat Bible Analysis</h3>
            <p className="text-stone-600 mb-8 font-serif italic text-lg">
              "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
              <span className="block text-sm text-stone-400 mt-2 not-italic font-sans">— 2 Corinthians 9:7</span>
            </p>
            
            <div className="bg-stone-50 p-8 rounded-2xl border border-stone-200 inline-block w-full md:w-auto mb-12">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Contribution Details</p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="px-4 py-2 bg-green-600 rounded-lg text-white font-bold tracking-wider shadow-sm">
                  M-PESA
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Number</span>
                  <span className="font-mono text-2xl md:text-3xl font-bold text-stone-800 tracking-wide">0796 335 209</span>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-100 pt-8">
               <p className="text-sm text-stone-400 uppercase tracking-widest font-bold mb-4">For Any Info Contact</p>
               <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
                  <a href="mailto:josphatwangui51@gmail.com" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-stone-50 transition-colors text-stone-600 group">
                    <Mail className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-colors" />
                    <span className="text-sm font-medium">josphatwangui51@gmail.com</span>
                  </a>
                   <a href="https://wa.me/254796335209" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-stone-50 transition-colors text-stone-600 group">
                    <MessageCircle className="w-4 h-4 text-stone-400 group-hover:text-green-600 transition-colors" />
                    <span className="text-sm font-medium">WhatsApp: +254 796 335 209</span>
                  </a>
               </div>
            </div>
          </div>
        </section>

        <footer className="bg-stone-900 text-stone-400 py-12 px-4 border-t border-stone-800">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white font-display text-lg mb-1">{currentStory.titlePrefix} {currentStory.titleHighlight}</h3>
              <p className="text-sm opacity-60">{currentStory.reference}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              {[currentStory.chapterRef, 'Bible Stories', "Josphat Bible Analysis"].map(tag => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full border border-stone-700 bg-stone-800/50">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="text-xs text-stone-600">
               © {new Date().getFullYear()} Josphat Bible Analysis
            </div>
          </div>
        </footer>
      </div>
    </NotesProvider>
  );
};

export default App;