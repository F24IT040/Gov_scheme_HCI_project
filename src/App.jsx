import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import WelcomeHero from './components/WelcomeHero';
import QueryBubble from './components/QueryBubble';
import SearchResults from './components/SearchResults';
import DetailPanel from './components/DetailPanel';
import EmptyState from './components/EmptyState';
import SearchForm from './components/SearchForm';
import RightSidebar from './components/RightSidebar';
import ProcessPage from './components/ProcessPage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TypingIndicator from './components/TypingIndicator';
import UserProfile from './components/UserProfile';

const RIGHT_SIDEBAR_MIN_WIDTH = 320;
const RIGHT_SIDEBAR_MAX_WIDTH = 560;
const RIGHT_SIDEBAR_EXPANDED_WIDTH = 448;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://govschemehciproject-production.up.railway.app';

// Page order for back-navigation
const PAGE_STACK = ['landing', 'login', 'register', 'app'];

export default function App() {
  const { i18n } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPageState] = useState('landing');
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Wrap setPage so every navigation pushes a history entry
  const setPage = (nextPage) => {
    window.history.pushState({ page: nextPage }, '', window.location.pathname);
    setPageState(nextPage);
  };

  const [pendingQuery, setPendingQuery] = useState('');
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
  const lastSearchRef = useRef('');
  const languageRef = useRef(i18n.language?.startsWith('hi') ? 'hi' : 'en');

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/session`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('No active session');
        return response.json();
      })
      .then((data) => { setCurrentUser(data.user); setIsLoggedIn(true); setPageState('app'); })
      .catch(() => { setIsLoggedIn(false); })
      .finally(() => setAuthChecked(true));
  }, []);

  // Handle browser back/forward buttons — stay inside the SPA
  useEffect(() => {
    // Push an initial state so back has somewhere to go
    window.history.replaceState({ page }, '', window.location.pathname);

    const onPopState = (e) => {
      if (e.state && e.state.page) {
        setPageState(e.state.page);
      } else {
        // No state means we've gone past the beginning — go to landing
        setPageState('landing');
        window.history.replaceState({ page: 'landing' }, '', window.location.pathname);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []); // eslint-disable-line

  const resetView = () => {
    setViewMode('results');
    setQueryInput('');
    setActiveCategory(null);
    setSelectedScheme(null);
    setRightSidebarWidth(RIGHT_SIDEBAR_MIN_WIDTH);
    setChatTurns([]);
  };

  const handleSearch = async (rawQuery, { replaceResults = false } = {}) => {
    const query = rawQuery.trim();
    if (!query) return;

    lastSearchRef.current = query;

    setViewMode('results');
    setSelectedScheme(null);
    setQueryInput('');
    const turnId = ++turnIdRef.current;
    const conversationHistory = replaceResults ? [] : chatTurns.map((turn) => ({
      role: 'user',
      content: turn.query
    }));

    setChatTurns((currentTurns) => {
      const nextTurn = {
        id: turnId,
        query,
        summary: '',
        schemes: [],
        suggestions: [],
        isSingle: false,
        isEmpty: false,
        loading: true,
        error: ''
      };
      return replaceResults ? [nextTurn] : [...currentTurns, nextTurn];
    });

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: conversationHistory,
          language: i18n.language?.startsWith('hi') ? 'hi' : 'en'
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
    // Don't open process page for no-match placeholder cards
    if (
      scheme?.isNoMatch ||
      scheme?.id === '__no_match__' ||
      (scheme?.confidence === 'Low' && !scheme?.official_url)
    ) return;
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

  const latestConversationText = [...chatTurns]
    .reverse()
    .find((turn) => !turn.loading && !turn.error && turn.summary)?.summary || '';

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
    const nextLanguage = i18n.language?.startsWith('hi') ? 'hi' : 'en';
    if (languageRef.current === nextLanguage) return;
    languageRef.current = nextLanguage;

    if (lastSearchRef.current) {
      setSelectedScheme(null);
      handleSearch(lastSearchRef.current, { replaceResults: true });
    }
  }, [i18n.language]); // Re-query the last result in the newly selected language.

  // Fire pending query when we arrive at the app page
  const pendingQueryRef = useRef('');
  useEffect(() => {
    pendingQueryRef.current = pendingQuery;
  }, [pendingQuery]);

  useEffect(() => {
    if (page === 'app' && pendingQueryRef.current) {
      const q = pendingQueryRef.current;
      pendingQueryRef.current = '';
      setPendingQuery('');
      // small delay so the app shell renders before the search fires
      setTimeout(() => handleSearch(q), 50);
    }
  }, [page]);

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

  const handleSignIn = () => setPage('login');
  const handleStartNow = () => setPage(isLoggedIn ? 'app' : 'login');
  const handleRegister = () => setPage('register');

  // The backend has created a verified HttpOnly session cookie.
  const handleLoginSuccess = (user) => {
    setCurrentUser(user || null);
    setIsLoggedIn(true);
    setPageState('app');
  };

  // Logout helper (clears persistence)
  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowProfile(false);
    setPage('landing');
  };

  if (!authChecked) return null;

  // Called when a category card is clicked on the landing page
  const handleCardClick = (query) => {
    if (isLoggedIn) {
      // Already logged in — go straight to chat and fire the query
      setPage('app');
      setPendingQuery(query);
    } else {
      // Not logged in — save query, send to login
      setPendingQuery(query);
      setPage('login');
    }
  };

  if (page === 'landing') {
    return <LandingPage onSignIn={handleSignIn} onStartNow={handleStartNow} onCardClick={handleCardClick} />;
  }

  if (page === 'login') {
    return <LoginPage onBack={() => setPage('landing')} onLogin={(remember) => handleLoginSuccess(remember)} onRegister={handleRegister} />;
  }

  if (page === 'register') {
    return <RegisterPage onBack={() => setPage('login')} onSubmit={() => handleLoginSuccess(false)} onLogin={() => setPage('login')} />;
  }

  if (!isLoggedIn) {
    return <LoginPage onBack={() => setPage('landing')} onLogin={handleLoginSuccess} onRegister={handleRegister} />;
  }

  return (
    <div className="app-shell flex w-full">

      {/* Full-page Process Simulator — renders over everything */}
      {viewMode === 'process' && (
        <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: '#F9F4EA' }}>
          <ProcessPage scheme={selectedScheme} onBack={handleBackToResults} />
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        onNewSearch={resetView}
        onCategorySelect={handleCategorySelect}
        activeCategory={activeCategory}
        onLogout={handleLogout}
        user={currentUser}
        onProfile={() => setShowProfile(true)}
      />

      {showProfile && <UserProfile user={currentUser} onClose={() => setShowProfile(false)} />}

      {/* Main Container */}
      <main className="flex min-w-0 flex-1 flex-col h-full">
        <section
          ref={chatContainerRef}
          className="chat-scroll flex-1 overflow-y-auto px-4 py-6 md:px-9 md:py-8"
        >
          <div className="mx-auto w-full max-w-4xl">
            {/* Hero Welcome — only show when no turns yet */}
            {chatTurns.length === 0 && <WelcomeHero onSelectPrompt={handleSearch} />}

            {/* Conversation Flow */}
            <div id="conversation" className="space-y-5" aria-live="polite">
              {chatTurns.map((turn) => (
                <div key={turn.id} className="space-y-4">
                  <QueryBubble query={turn.query} />

                  {turn.loading && <TypingIndicator />}

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
        conversationText={latestConversationText}
        width={rightSidebarWidth}
        isExpanded={rightSidebarWidth > RIGHT_SIDEBAR_MIN_WIDTH}
        onToggleExpand={handleRightSidebarToggle}
      />
    </div>
  );
}
