import React, { useState, useEffect } from 'react';
import { ArrowDown, Film, Loader2, Volume2 } from 'lucide-react';
import { StoryData } from '../types';
import { generateSceneVideo, generateSpeech } from '../services/geminiService';
import { playAudioContent } from '../utils/audioPlayer';

interface HeroProps {
  story: StoryData;
}

export const Hero: React.FC<HeroProps> = ({ story }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');

  // Reset video when story changes
  useEffect(() => {
    setVideoUrl(null);
  }, [story.id]);

  const handleVisualize = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setLoadingStep('Creating scene...');
    
    try {
      // 1. Generate Video
      const prompt = `Cinematic, photorealistic shot of ${story.titlePrefix} ${story.titleHighlight} in the bible. ${story.theme}. 4k, atmospheric lighting, slow motion movement.`;
      const generatedUrl = await generateSceneVideo(prompt);
      
      if (generatedUrl) {
        setVideoUrl(generatedUrl);
        
        // 2. Generate and Play Audio Narration
        setLoadingStep('Preparing audio...');
        const audioData = await generateSpeech(story.text);
        if (audioData) {
          await playAudioContent(audioData);
        }
      }
    } catch (e) {
      console.error("Visualization failed", e);
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden flex items-center justify-center text-center px-4 bg-stone-900 transition-all duration-700">
      {/* Background Media Layer */}
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video 
            src={videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover animate-fade-in"
          />
        ) : (
          <div 
            key={story.backgroundImage}
            className="absolute inset-0 opacity-40 bg-cover bg-center animate-fade-in transition-opacity duration-1000"
            style={{ backgroundImage: `url('${story.backgroundImage}')` }}
          ></div>
        )}
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-stone-900 opacity-90"></div>

      {/* Top Caption */}
      <div className="absolute top-8 left-0 w-full z-20 flex justify-center">
        <div className="flex items-center gap-3 opacity-80">
           <div className="h-[1px] w-8 bg-orange-500"></div>
           <span className="text-white font-serif text-xs tracking-[0.3em] uppercase text-shadow-sm">Josphat Bible Analysis</span>
           <div className="h-[1px] w-8 bg-orange-500"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <span key={`chap-${story.id}`} className="text-orange-400 font-sans tracking-[0.3em] text-sm md:text-base uppercase mb-4 animate-fade-in-up">{story.chapterRef}</span>
        <h1 key={`title-${story.id}`} className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-6 drop-shadow-lg animate-fade-in-up">
          {story.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200">{story.titleHighlight}</span>
        </h1>
        <p key={`theme-${story.id}`} className="text-xl md:text-2xl text-stone-300 font-serif italic max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up animation-delay-200">
          “{story.theme}”
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up animation-delay-300">
          <button 
            onClick={() => document.getElementById('scripture')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 border border-white/20 hover:border-white/50 px-6 py-3 rounded-full backdrop-blur-sm"
          >
            <span className="uppercase text-xs tracking-widest font-sans">Read Story</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>

          <button 
            onClick={handleVisualize}
            disabled={isGenerating}
            className={`group flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md transition-all duration-300 border ${isGenerating ? 'bg-orange-900/50 border-orange-500/50 text-orange-200' : 'bg-orange-600 hover:bg-orange-500 border-transparent text-white shadow-lg hover:shadow-orange-900/50'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="uppercase text-xs tracking-widest font-sans">{loadingStep}</span>
              </>
            ) : videoUrl ? (
              <>
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="uppercase text-xs tracking-widest font-sans">Replay Narration</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span className="uppercase text-xs tracking-widest font-sans">Visualize & Narrate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};