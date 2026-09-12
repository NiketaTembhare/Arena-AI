import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, CheckCircle, XCircle, Filter, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchAdminQuestions, createQuestion, updateQuestion, toggleQuestionActive } from '../services/roomService';
import { audioEngine } from '../game/audioEngine';

export const AdminView = ({ onBackHome }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [questions, setQuestions] = useState([]);
  const [roundFilter, setRoundFilter] = useState('all'); // 'all' | '1' | '2' | '3'
  const [isLoading, setIsLoading] = useState(false);

  // Modal State for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form Fields
  const [formRound, setFormRound] = useState(1);
  const [questionType, setQuestionType] = useState('image_comparison');
  const [promptText, setPromptText] = useState('');
  const [realImageUrl, setRealImageUrl] = useState('');
  const [aiImageUrl, setAiImageUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [isActive, setIsActive] = useState(true);

  // PIN authentication handler
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pin.trim() === '1234' || pin.trim() === '7777') {
      audioEngine.playClick();
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Invalid Admin PIN. Enter 1234 or 7777.');
    }
  };

  // Load questions on auth or roundFilter change
  const loadQuestions = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const data = await fetchAdminQuestions(roundFilter);
    setQuestions(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions();
    }
  }, [isAuthenticated, roundFilter]);

  // Handle active status toggle
  const handleToggleActive = async (q) => {
    audioEngine.playClick();
    await toggleQuestionActive(q.id, q.is_active);
    loadQuestions();
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    audioEngine.playClick();
    setEditingQuestion(null);
    setFormRound(1);
    setQuestionType('image_comparison');
    setPromptText('Which portrait is AI-generated?');
    setRealImageUrl('/images/round1/q01_real.jpg');
    setAiImageUrl('/images/round1/q01_ai.jpg');
    setLogoUrl('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectOptionIndex(0);
    setExplanation('');
    setIsActive(true);
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (q) => {
    audioEngine.playClick();
    setEditingQuestion(q);
    setFormRound(q.round);
    setQuestionType(q.question_type);
    setPromptText(q.prompt_text || '');
    setRealImageUrl(q.real_image_url || '');
    setAiImageUrl(q.ai_image_url || '');
    setLogoUrl(q.logo_url || '');

    const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []);
    setOption1(opts[0] || '');
    setOption2(opts[1] || '');
    setOption3(opts[2] || '');
    setOption4(opts[3] || '');

    const idx = opts.findIndex(o => o === q.correct_option);
    setCorrectOptionIndex(idx >= 0 ? idx : 0);

    setExplanation(q.explanation || '');
    setIsActive(q.is_active);
    setShowModal(true);
  };

  // Auto-switch question type on round change in form
  const handleRoundChangeInForm = (r) => {
    setFormRound(r);
    if (r === 1) setQuestionType('image_comparison');
    if (r === 2) setQuestionType('logo_mcq');
    if (r === 3) setQuestionType('emoji_mcq');
  };

  // Submit form
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    audioEngine.playClick();

    const optionsArray = [option1.trim(), option2.trim(), option3.trim(), option4.trim()].filter(Boolean);
    const selectedCorrectOption = optionsArray[correctOptionIndex] || optionsArray[0] || '';

    const payload = {
      round: parseInt(formRound, 10),
      question_type: questionType,
      prompt_text: promptText.trim(),
      real_image_url: formRound === 1 ? realImageUrl.trim() : null,
      ai_image_url: formRound === 1 ? aiImageUrl.trim() : null,
      logo_url: formRound === 2 ? logoUrl.trim() : null,
      options: (formRound === 2 || formRound === 3) ? JSON.stringify(optionsArray) : null,
      correct_option: (formRound === 2 || formRound === 3) ? selectedCorrectOption : null,
      explanation: explanation.trim(),
      is_active: isActive
    };

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);
      } else {
        await createQuestion(payload);
      }
      setShowModal(false);
      loadQuestions();
    } catch (err) {
      alert("Error saving question: " + err.message);
    }
  };

  // PIN Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] relative z-10">
        <div className="glass-panel p-8 rounded-3xl w-full text-center border-2 border-cyan-400 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 text-3xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-heading font-black text-2xl text-white">QUESTION ADMIN PANEL</h2>
            <p className="text-xs text-slate-300 font-mono mt-1">Enter Host / Admin PIN to manage game content.</p>
          </div>

          {pinError && (
            <div className="w-full p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-mono">
              {pinError}
            </div>
          )}

          <form onSubmit={handleVerifyPin} className="w-full flex flex-col gap-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="4-Digit PIN (e.g. 1234)"
              maxLength={4}
              required
              className="input-cyber text-center font-heading font-black text-2xl tracking-widest py-3 w-full"
            />
            <button type="submit" className="btn-cyber-primary w-full py-4 text-sm">
              UNLOCK ADMIN PANEL
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6 relative z-10 min-h-screen">
      
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackHome}
            className="p-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">QUESTION ADMIN PANEL</h1>
            <span className="text-xs font-mono text-cyan-400">Manage questions table without manual SQL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadQuestions}
            className="btn-cyber-secondary py-2.5 px-4 text-xs flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="btn-cyber-primary py-2.5 px-5 text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD QUESTION</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
        <span className="text-xs font-mono text-slate-400 px-3 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-cyan-400" /> FILTER:
        </span>
        {[
          { id: 'all', label: 'ALL ROUNDS' },
          { id: '1', label: 'ROUND 1 (IMAGE COMPARE)' },
          { id: '2', label: 'ROUND 2 (LOGO MCQ)' },
          { id: '3', label: 'ROUND 3 (EMOJI MCQ)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoundFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              roundFilter === tab.id
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 overflow-x-auto">
        {questions.length === 0 ? (
          <div className="p-12 text-center text-sm font-mono text-slate-400">
            No questions found for this filter. Click "ADD QUESTION" above.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900/90 text-cyan-400 font-mono text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 text-center">ROUND</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">PROMPT / EMOJI</th>
                <th className="py-3 px-4">DETAILS / PATHS</th>
                <th className="py-3 px-4 text-center">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-body text-sm text-slate-200">
              {questions.map((q) => {
                const opts = Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []);
                return (
                  <tr key={q.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 text-center font-heading font-black text-cyan-300">
                      R{q.round}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {q.question_type}
                    </td>
                    <td className="py-3 px-4 font-bold text-white max-w-[200px] truncate">
                      {q.prompt_text || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300 max-w-[250px]">
                      {q.round === 1 && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-emerald-400 truncate">Real: {q.real_image_url}</span>
                          <span className="text-purple-400 truncate">AI: {q.ai_image_url}</span>
                        </div>
                      )}
                      {q.round === 2 && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-cyan-300 truncate">Logo: {q.logo_url}</span>
                          <span className="text-emerald-400">Ans: {q.correct_option}</span>
                        </div>
                      )}
                      {q.round === 3 && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-amber-300">Opts: {opts.join(', ')}</span>
                          <span className="text-emerald-400">Ans: {q.correct_option}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(q)}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                          q.is_active
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {q.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                        title="Edit Question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-cyan-400 max-w-xl w-full flex flex-col gap-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-heading font-black text-xl text-white">
                {editingQuestion ? 'EDIT QUESTION' : 'ADD NEW QUESTION'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4 text-left font-body text-sm">
              {/* Round Selector */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  TARGET ROUND
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoundChangeInForm(r)}
                      className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                        formRound === r
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      ROUND {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt / Question Text */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  PROMPT / EMOJI CLUE
                </label>
                <input
                  type="text"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={formRound === 3 ? "e.g. ☁️ 💻 🌐" : "e.g. Which portrait is AI-generated?"}
                  required
                  className="input-cyber w-full py-2.5 px-3 text-sm"
                />
              </div>

              {/* Round 1 Fields */}
              {formRound === 1 && (
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div>
                    <label className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">
                      REAL IMAGE STATIC PATH
                    </label>
                    <input
                      type="text"
                      value={realImageUrl}
                      onChange={(e) => setRealImageUrl(e.target.value)}
                      placeholder="/images/round1/q01_real.jpg"
                      required
                      className="input-cyber w-full py-2 px-3 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block mb-1">
                      AI IMAGE STATIC PATH
                    </label>
                    <input
                      type="text"
                      value={aiImageUrl}
                      onChange={(e) => setAiImageUrl(e.target.value)}
                      placeholder="/images/round1/q01_ai.jpg"
                      required
                      className="input-cyber w-full py-2 px-3 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Round 2 Logo Field */}
              {formRound === 2 && (
                <div>
                  <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                    LOGO STATIC URL
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/images/round2/openai.png"
                    required
                    className="input-cyber w-full py-2 px-3 text-xs font-mono"
                  />
                </div>
              )}

              {/* Round 2 & 3 Options & Correct Answer Selector */}
              {(formRound === 2 || formRound === 3) && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                    4 OPTIONS (SELECT RADIO FOR CORRECT ANSWER)
                  </label>
                  {[
                    { val: option1, setVal: setOption1, idx: 0 },
                    { val: option2, setVal: setOption2, idx: 1 },
                    { val: option3, setVal: setOption3, idx: 2 },
                    { val: option4, setVal: setOption4, idx: 3 },
                  ].map(opt => (
                    <div key={opt.idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_option_radio"
                        checked={correctOptionIndex === opt.idx}
                        onChange={() => setCorrectOptionIndex(opt.idx)}
                        className="w-4 h-4 accent-cyan-400 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt.val}
                        onChange={(e) => opt.setVal(e.target.value)}
                        placeholder={`Option ${opt.idx + 1}`}
                        required
                        className="input-cyber flex-1 py-1.5 px-3 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Explanation Field */}
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  EXPLANATION TEXT
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  rows={2}
                  className="input-cyber w-full py-2 px-3 text-xs resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cyber-secondary flex-1 py-3 text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-cyber-primary flex-1 py-3 text-xs"
                >
                  SAVE QUESTION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
