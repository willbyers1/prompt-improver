
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GlassCard from './components/GlassCard';
import ApiKeyModal from './components/ApiKeyModal';
import { enhancePrompt } from './services/geminiService';
import { PromptStats } from './types';

const STORAGE_KEY = 'GEMINI_API_KEY';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Load key from session storage
  useEffect(() => {
    const savedKey = sessionStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSetApiKey = (key: string) => {
    sessionStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    showToast("Key accepted. Forge ready.", "success");
  };

  const resetKey = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setDraft('');
    setEnhanced('');
    showToast("Key cleared. Workspace locked.", "success");
  };

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStats = (text: string): PromptStats => ({
    characters: text.length,
    words: text.trim().split(/\s+/).filter(Boolean).length
  });

  const draftStats = useMemo(() => getStats(draft), [draft]);
  const enhancedStats = useMemo(() => getStats(enhanced), [enhanced]);

  const handleEnhance = async () => {
    if (!draft.trim()) {
      showToast("Please enter a draft prompt first.", "error");
      return;
    }
    if (!apiKey) return;

    setIsEnhancing(true);
    try {
      const result = await enhancePrompt(apiKey, draft);
      setEnhanced(result);
      showToast("Prompt successfully refined!", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = () => {
    if (!enhanced) return;
    navigator.clipboard.writeText(enhanced);
    showToast("Copied to clipboard!", "success");
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {!apiKey && <ApiKeyModal onSubmit={handleSetApiKey} />}

      <header className="container mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.282a1 1 0 01-.845 0l-.628-.282a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547l-1.168 1.168a1 1 0 001.414 1.414l1.168-1.168z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 18v-2a7 7 0 0114 0v2" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">PromptAlchemy</h1>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-medium">Transmute your ideas</p>
          </div>
        </div>

        <button
          onClick={resetKey}
          className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-lg border border-slate-800 transition-all active:scale-95"
        >
          Reset Key
        </button>
      </header>

      <main className={`container mx-auto px-6 flex-grow pb-12 transition-all duration-500 ${!apiKey ? 'blur-md pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Input Section */}
          <div className="flex flex-col space-y-4 h-full">
            <GlassCard title="Source Draft" stats={draftStats} className="flex-grow">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste your raw, weak, or simple prompt here..."
                className="w-full h-[400px] lg:h-[500px] bg-transparent border-none text-slate-200 resize-none focus:outline-none placeholder:text-slate-600 text-base leading-relaxed"
              />
            </GlassCard>
            <button
              onClick={handleEnhance}
              disabled={isEnhancing || !draft.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 shadow-xl ${
                isEnhancing || !draft.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-[0.99]'
              }`}
            >
              {isEnhancing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Transmuting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Enhance Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex flex-col space-y-4 h-full">
            <GlassCard title="Enhanced Result" stats={enhancedStats} className="flex-grow">
              <textarea
                readOnly
                value={enhanced}
                placeholder="Your master-level prompt will manifest here..."
                className="w-full h-[400px] lg:h-[500px] bg-transparent border-none text-blue-100 resize-none focus:outline-none placeholder:text-slate-600 text-base leading-relaxed"
              />
            </GlassCard>
            <button
              onClick={copyToClipboard}
              disabled={!enhanced}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 border shadow-sm ${
                !enhanced
                ? 'bg-transparent border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white active:scale-[0.99]'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy to Clipboard</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-6 text-center relative z-10 border-t border-white/5">
        <p className="text-slate-500 text-xs">
          Forged by <span className="text-blue-400 font-semibold">Mert Batu BULBUL</span>
        </p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all animate-bounce ${
          toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-blue-600/90 text-white'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
