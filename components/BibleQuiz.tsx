import React, { useState, useEffect } from 'react';
import { generateStoryQuiz } from '../services/geminiService';
import { QuizQuestion, StoryData } from '../types';
import { CheckCircle, XCircle, BrainCircuit, RefreshCw, Trophy, ChevronRight } from 'lucide-react';

interface BibleQuizProps {
  story: StoryData;
}

export const BibleQuiz: React.FC<BibleQuizProps> = ({ story }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'finished'>('idle');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Reset quiz when story changes
  useEffect(() => {
    setStatus('idle');
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIdx(0);
  }, [story.id]);

  const startQuiz = async () => {
    setStatus('loading');
    const quizData = await generateStoryQuiz(story.text + " " + story.aiContext);
    if (quizData && quizData.length > 0) {
      setQuestions(quizData);
      setUserAnswers(new Array(quizData.length).fill(-1));
      setStatus('active');
    } else {
      setStatus('idle');
      // Ideally handle error UI here
    }
  };

  const handleOptionSelect = (optionIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setStatus('finished');
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  if (status === 'idle') {
    return (
      <section className="py-16 px-4 bg-stone-100 border-t border-stone-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
            <BrainCircuit className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-display text-stone-800 mb-2">Test Your Knowledge</h2>
            <p className="text-stone-600 mb-6 font-serif">
              Take a quick AI-generated quiz to see how well you understand the story of {story.titlePrefix} {story.titleHighlight}.
            </p>
            <button 
              onClick={startQuiz}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold tracking-wide transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'loading') {
    return (
      <section className="py-16 px-4 bg-stone-100 border-t border-stone-200">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center">
            <RefreshCw className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-stone-800 font-display text-lg animate-pulse">Consulting the archives...</p>
            <p className="text-stone-500 text-sm mt-2">Generating unique questions for you.</p>
          </div>
        </div>
      </section>
    );
  }

  if (status === 'active') {
    const question = questions[currentQuestionIdx];
    return (
      <section className="py-16 px-4 bg-stone-100 border-t border-stone-200">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-2 bg-stone-100 w-full">
              <div 
                className="h-full bg-orange-500 transition-all duration-300" 
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Question {currentQuestionIdx + 1} of {questions.length}</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full">Quiz Mode</span>
              </div>

              <h3 className="text-xl md:text-2xl font-display text-stone-800 mb-8 leading-relaxed">
                {question.question}
              </h3>

              <div className="space-y-3 mb-8">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 group ${
                      userAnswers[currentQuestionIdx] === idx 
                        ? 'border-orange-500 bg-orange-50 text-orange-900 ring-1 ring-orange-500' 
                        : 'border-stone-200 hover:border-orange-300 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                       userAnswers[currentQuestionIdx] === idx ? 'border-orange-500 bg-orange-500 text-white' : 'border-stone-300 group-hover:border-orange-400'
                    }`}>
                      {userAnswers[currentQuestionIdx] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="font-sans">{option}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={nextQuestion}
                  disabled={userAnswers[currentQuestionIdx] === -1}
                  className="flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentQuestionIdx === questions.length - 1 ? 'Finish & Mark' : 'Next Question'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Finished State
  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <section className="py-16 px-4 bg-stone-100 border-t border-stone-200">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
          <div className="bg-stone-900 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 to-transparent"></div>
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
            <h2 className="text-3xl font-display mb-2">Quiz Complete!</h2>
            <div className="text-6xl font-bold text-orange-400 mb-2">{percentage}%</div>
            <p className="text-stone-400">You scored {score} out of {questions.length}</p>
          </div>

          <div className="p-8 bg-stone-50">
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctAnswerIndex;
                return (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                      )}
                      <div>
                        <h4 className="font-bold text-stone-800 mb-1">{q.question}</h4>
                        <p className={`text-sm mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Your answer: {q.options[userAnswers[idx]]}
                        </p>
                        {!isCorrect && (
                           <p className="text-sm text-stone-500 mb-2">
                             Correct answer: <span className="font-bold text-stone-700">{q.options[q.correctAnswerIndex]}</span>
                           </p>
                        )}
                        <div className="mt-3 bg-stone-50 p-3 rounded-lg text-xs text-stone-600 font-serif italic border-l-2 border-orange-300">
                           <span className="font-bold not-italic text-orange-800 block mb-1">Explanation:</span>
                           {q.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => {
                   setStatus('idle');
                   setQuestions([]);
                   setUserAnswers([]);
                   setCurrentQuestionIdx(0);
                }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-stone-200 hover:border-orange-500 hover:text-orange-600 rounded-full font-bold transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};