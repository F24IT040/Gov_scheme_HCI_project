import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import WelcomeHero from './components/WelcomeHero';
import QueryBubble from './components/QueryBubble';
import SearchResults from './components/SearchResults';
import DetailPanel from './components/DetailPanel';
import EmptyState from './components/EmptyState';
import SearchForm from './components/SearchForm';
import RightSidebar from './components/RightSidebar';
import ProcessPage from './components/ProcessPage';

const RIGHT_SIDEBAR_MIN_WIDTH = 320;
const RIGHT_SIDEBAR_MAX_WIDTH = 560;
const RIGHT_SIDEBAR_EXPANDED_WIDTH = 448;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function App() {
  const [queryInput, setQueryInput] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [viewMode, setViewMode] = useState('results');
  const [rightSidebarWidth, setRightSidebarWidth] = useState(RIGHT_SIDEBAR_MIN_WIDTH);
  const [isResizingRightSidebar, setIsResizingRightSidebar] = useState(false);
  const [chatTurns, setChatTurns] = useState([]);

  const chatContainerRef = useRef(null);
  const rightSidebarResizeRef = useRef({ startX: 0, startWidth: RIGHT_SIDEBAR_MIN_WIDTH });
  const turnIdRef = useRef(0);

  const resetView = () => {
    setViewMode('results');
    setQueryInput('');
    setActiveCategory(null);
    setSelectedScheme(null);
    setRightSidebarWidth(RIGHT_SIDEBAR_MIN_WIDTH);
    setChatTurns([]);
  };

  const handleSearch = async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query) return;

    setViewMode('results');
    setSelectedScheme(null);
    setQueryInput('');
    const turnId = ++turnIdRef.current;
    const conversationHistory = chatTurns.map((turn) => ({
      role: 'user',
      content: turn.query
    }));

    setChatTurns((currentTurns) => [
      ...currentTurns,
      {
        id: turnId,
        query,
        summary: '',
        schemes: [],
        suggestions: [],
        isSingle: false,
        isEmpty: false,
        loading: true,
        error: ''
      }
    ]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: conversationHistory
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch scheme details');
      }

      const schemes = Array.isArray(data?.schemes)
        ? data.schemes
        : [data];
      const normalizedSchemes = schemes.filter(Boolean);
      const primaryScheme = normalizedSchemes[0] || null;

      setActiveCategory(primaryScheme?.category || null);

      setChatTurns((currentTurns) =>
        currentTurns.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                summary: data?.summary || primaryScheme?.summary || '',
                schemes: normalizedSchemes,
                suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
                isSingle: normalizedSchemes.length <= 1,
                isEmpty: normalizedSchemes.length === 0,
                loading: false,
                error: ''
              }
            : turn
        )
      );

      if (primaryScheme) {
        setSelectedScheme(primaryScheme);
      }
    } catch (error) {
      setActiveCategory(null);
      setChatTurns((currentTurns) =>
        currentTurns.map((turn) =>
          turn.id === turnId
            ? {
                ...turn,
                loading: false,
                error: error.message || 'Something went wrong while searching',
                isEmpty: true
              }
            : turn
        )
      );
    }
  };

  const handleCategorySelect = (category) => {
    if (category === 'scholarship') {
      handleSearch('I am a student. I want scholarship');
    } else if (category === 'farming') {
      handleSearch('Tell me about PM-Kisan scheme');
    }
  };

  const handleSelectScheme = (scheme) => {
    setSelectedScheme((prev) => (prev?.id === scheme.id ? null : scheme));
  };

  const handleViewProcess = (scheme) => {
    setSelectedScheme(scheme);
    setViewMode('process');
  };

  const handleBackToResults = () => {
    setViewMode('results');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(queryInput);
  };

  const handleRightSidebarToggle = () => {
    setRightSidebarWidth((currentWidth) =>
      currentWidth > RIGHT_SIDEBAR_MIN_WIDTH
        ? RIGHT_SIDEBAR_MIN_WIDTH
        : RIGHT_SIDEBAR_EXPANDED_WIDTH
    );
  };

  const handleRightSidebarResizeStart = (event) => {
    if (window.innerWidth < 1024) return;

    event.preventDefault();
    rightSidebarResizeRef.current = {
      startX: event.clientX,
      startWidth: rightSidebarWidth
    };
    setIsResizingRightSidebar(true);
  };

  useEffect(() => {
    if (chatTurns.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatTurns, selectedScheme]);

  useEffect(() => {
    if (!isResizingRightSidebar) return;

    const handlePointerMove = (event) => {
      const { startX, startWidth } = rightSidebarResizeRef.current;
      const delta = startX - event.clientX;
      const nextWidth = Math.min(
        RIGHT_SIDEBAR_MAX_WIDTH,
        Math.max(RIGHT_SIDEBAR_MIN_WIDTH, startWidth + delta)
      );

      setRightSidebarWidth(nextWidth);
    };

    const handlePointerUp = () => {
      setIsResizingRightSidebar(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingRightSidebar]);

  return (
    <div className="app-shell flex w-full">
      {/* Left Sidebar */}
      <Sidebar
        onNewSearch={resetView}
        onCategorySelect={handleCategorySelect}
        activeCategory={activeCategory}
      />

      {/* Main Container */}
      <main className="flex min-w-0 flex-1 flex-col h-full">
        {viewMode === 'process' ? (
          <section className="chat-scroll flex-1 overflow-y-auto px-4 py-6 md:px-9 md:py-8">
            <ProcessPage scheme={selectedScheme} onBack={handleBackToResults} />
          </section>
        ) : (
          <section
            ref={chatContainerRef}
            className="chat-scroll flex-1 overflow-y-auto px-4 py-6 md:px-9 md:py-8"
          >
          <div className="mx-auto w-full max-w-4xl">
            {/* Hero Welcome */}
            <WelcomeHero />

            {/* Conversation Flow */}
            <div id="conversation" className="space-y-5" aria-live="polite">
              {chatTurns.map((turn) => (
                <div key={turn.id} className="space-y-4">
                  <QueryBubble query={turn.query} />

                  {turn.loading && (
                    <div className="glass-panel rounded-2xl px-4 py-3 text-sm text-slate-600">
                      Looking up the best matching scheme...
                    </div>
                  )}

                  {!turn.loading && turn.error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {turn.error}
                    </div>
                  )}

                  {!turn.loading && !turn.error && (turn.schemes.length > 0 || (turn.suggestions && turn.suggestions.length > 0) || turn.summary) && (
                    <SearchResults
                      summary={turn.summary}
                      schemes={turn.schemes}
                      selectedSchemeId={selectedScheme?.id}
                      onSelectScheme={handleSelectScheme}
                      onViewProcess={handleViewProcess}
                      onClearResults={resetView}
                      isSingle={turn.isSingle}
                      suggestions={turn.suggestions}
                      onSelectSuggestion={handleSearch}
                    />
                  )}

                  {!turn.loading && !turn.error && turn.isEmpty && turn.suggestions.length === 0 && (
                    <EmptyState message={turn.summary} />
                  )}
                </div>
              ))}

              {/* In-stream Detail Drawer */}
              {selectedScheme && (
                <DetailPanel
                  scheme={selectedScheme}
                  onClose={() => setSelectedScheme(null)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Footer Prompt & Input Form */}
        <SearchForm
          value={queryInput}
          onChange={setQueryInput}
          onSubmit={handleFormSubmit}
          onSelectPrompt={handleSearch}
        />
      </main>

      <div
        className="hidden lg:flex shrink-0 items-stretch"
        aria-hidden="true"
      >
        <button
          type="button"
          onPointerDown={handleRightSidebarResizeStart}
          className="group flex w-3 cursor-col-resize items-stretch justify-center bg-transparent px-0"
          aria-label="Resize right sidebar"
          title="Drag to resize the right sidebar"
        >
          <span className="my-6 w-px rounded-full bg-slate-200 transition group-hover:bg-blue-400" />
        </button>
      </div>

      {/* Right Sidebar Inspector */}
      <RightSidebar
        selectedScheme={selectedScheme}
        width={rightSidebarWidth}
        isExpanded={rightSidebarWidth > RIGHT_SIDEBAR_MIN_WIDTH}
        onToggleExpand={handleRightSidebarToggle}
      />
    </div>
  );
}
