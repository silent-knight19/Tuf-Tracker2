import { useState, useEffect, useCallback } from 'react';
import { X, MessageSquare, Send, Award, BrainCircuit, Lightbulb, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import SafeMarkdown from '../../ui/SafeMarkdown';
import { auth } from '../../../config/firebase';
import { useScrollLock } from '../../../hooks/useScrollLock';

import { createPortal } from 'react-dom';

function GuidedDebriefModal({ isOpen, onClose, problemTitle, difficulty, onComplete }) {
  const [step, setStep] = useState('loading'); // loading, questions, analyzing, results
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  useScrollLock(isOpen);

  const fetchQuestions = useCallback(async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await api.post('/ai/debrief/questions', {
        title: problemTitle,
        difficulty: difficulty || 'Medium'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setQuestions(res.data.questions);
      setStep('questions');
    } catch (err) {
      console.error('Failed to fetch questions:', err);
      // Fallback questions handled by backend logic usually, but here just close on hard fail
      onClose();
      alert("Failed to start debrief. Please try again.");
    }
  }, [problemTitle, difficulty, onClose]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setStep('loading');
        setQuestions([]);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setAnalysis(null);
        fetchQuestions();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchQuestions]);

  const handleAnswerSubmit = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All answered, submit for analysis
      setStep('analyzing');
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await api.post('/ai/debrief/analyze', {
          title: problemTitle,
          questions: questions,
          answers: Object.values(answers)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAnalysis(res.data);
        setStep('results');
        
        // Notify parent to save results
        if (onComplete) {
          onComplete(res.data);
        }

      } catch (err) {
        console.error('Analysis failed:', err);
        setStep('questions'); // Go back? or close?
        alert("Failed to analyze responses.");
      }
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#0F1115] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-800 bg-dark-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guided Debrief</h2>
              <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">{problemTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode='wait'>
            
            {/* 1. Loading Questions */}
            {step === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                <p className="text-dark-300 font-medium">Generating probing questions...</p>
              </motion.div>
            )}

            {/* 2. Interview Loop */}
            {step === 'questions' && questions.length > 0 && (
              <motion.div 
                key="questions"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-bold text-dark-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= currentQuestionIndex ? 'bg-purple-500' : 'bg-dark-800'}`} />
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-medium text-white mb-6 leading-relaxed">
                  {questions[currentQuestionIndex]}
                </h3>

                <textarea
                  autoFocus
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => setAnswers({...answers, [currentQuestionIndex]: e.target.value})}
                  placeholder="Type your answer here..."
                  className="w-full flex-1 bg-dark-900 border border-dark-800 rounded-xl p-4 text-dark-100 focus:outline-none focus:border-purple-500/50 resize-none mb-6"
                />

                <div className="flex justify-end">
                  <button 
                    onClick={handleAnswerSubmit}
                    disabled={!answers[currentQuestionIndex]?.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Analyze Response' : 'Next Question'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. Analyzing */}
            {step === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              >
                <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse" />
                <div>
                  <h3 className="text-lg font-bold text-white">Analyzing Understanding...</h3>
                  <p className="text-dark-400">Calculating confidence score and generating advice.</p>
                </div>
              </motion.div>
            )}

            {/* 4. Results */}
            {step === 'results' && analysis && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col"
              >
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex items-center gap-4">
                     <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                       <Award className="w-8 h-8" />
                     </div>
                     <div>
                       <div className="text-xs text-dark-500 font-bold uppercase tracking-wider">Confidence Score</div>
                       <div className="text-2xl font-black text-white">{analysis.confidenceScore}<span className="text-base text-dark-500">/5</span></div>
                     </div>
                   </div>
                   
                   <div className="bg-dark-900 p-4 rounded-xl border border-dark-800 flex items-center gap-4">
                     <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-lg">
                       <Lightbulb className="w-8 h-8" />
                     </div>
                     <div>
                       <div className="text-xs text-dark-500 font-bold uppercase tracking-wider">Status</div>
                       <div className="text-lg font-bold text-white">
                         {analysis.confidenceScore >= 4 ? 'Expert' : analysis.confidenceScore >= 3 ? 'Competent' : 'Needs Review'}
                       </div>
                     </div>
                   </div>
                </div>

                <div className="bg-dark-900/50 rounded-xl p-5 border border-dark-800 mb-6 flex-1 overflow-y-auto">
                   <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <BrainCircuit className="w-4 h-4" /> Strategic Advice
                   </h4>
                   <div className="prose prose-invert prose-sm max-w-none text-dark-200">
                     <SafeMarkdown>{analysis.advice}</SafeMarkdown>
                   </div>
                </div>

                <button 
                  onClick={onClose}
                  className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
                >
                  Complete Debrief
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default GuidedDebriefModal;
