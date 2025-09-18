"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { FlashcardSet } from "@/data/flashcards";

const colorPalette = [
  { name: "Blue", value: "#0ea5e9" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

function getColorFromSeed(seed: string | null | undefined) {
  if (seed && seed.startsWith("#")) {
    return seed;
  }
  return colorPalette[0].value;
}

function formatCardCount(count: number) {
  if (count === 1) return "1 card";
  return `${count} cards`;
}

export default function AuthNav({
  isSignedIn,
  email,
}: {
  isSignedIn: boolean;
  email?: string | null;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFlashcardsDropdownOpen, setIsFlashcardsDropdownOpen] = useState(false);
  const [isMobileFlashcardsOpen, setIsMobileFlashcardsOpen] = useState(false);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoadingSets, setIsLoadingSets] = useState(false);
  const [setsLoaded, setSetsLoaded] = useState(false);
  const flashcardsDropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const handleSignOut = async () => {
    try { await supabase.auth.signOut(); } catch {}
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const fetchFlashcardSets = async () => {
    if (!isSignedIn || setsLoaded || isLoadingSets) return;

    setIsLoadingSets(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) return;

      const { data: rows } = await supabase
        .from("flashcard_sets")
        .select("id,title,description,cover_seed,created_at, flashcards(count)")
        .order("created_at", { ascending: false })
        .eq("user_id", user.user.id)
        .limit(3);

      const sets: FlashcardSet[] = (rows ?? []).map((row: any) => {
        const count = Array.isArray(row.flashcards) && row.flashcards.length > 0 ? row.flashcards[0]?.count ?? 0 : 0;
        return {
          id: row.id,
          title: row.title,
          description: row.description,
          cardCount: count,
          coverSeed: row.cover_seed,
          createdAt: row.created_at,
        };
      });

      setFlashcardSets(sets);
      setSetsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch flashcard sets:", error);
    } finally {
      setIsLoadingSets(false);
    }
  };

  // Load sets in background when signed in
  useEffect(() => {
    if (isSignedIn && !setsLoaded) {
      fetchFlashcardSets();
    }
  }, [isSignedIn]);

  const toggleFlashcardsDropdown = () => {
    setIsFlashcardsDropdownOpen(!isFlashcardsDropdownOpen);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flashcardsDropdownRef.current && !flashcardsDropdownRef.current.contains(event.target as Node)) {
        setIsFlashcardsDropdownOpen(false);
      }
    };

    if (isFlashcardsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFlashcardsDropdownOpen]);

  if (!isSignedIn) {
    return (
      <>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <a
            href="/login"
            className="px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-blue)] to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            Get Started
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed right-0 top-0 h-full w-80 z-50 md:hidden shadow-2xl" style={{backgroundColor: '#101d23', borderLeft: '1px solid #2b4554'}}>
              <div className="flex items-center justify-between p-6" style={{backgroundColor: '#101d23'}}>
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-white transition-all duration-200" style={{backgroundColor: '#1a2c38'}}
                  aria-label="Close menu"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4" style={{backgroundColor: '#101d23'}}>
                <a
                  href="/login"
                  className="block w-full px-4 py-3 rounded-lg text-white font-medium text-center transition-all duration-200" style={{backgroundColor: '#1a2c38'}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="block w-full px-4 py-3 rounded-lg text-white text-center font-medium" style={{backgroundColor: '#2563eb'}}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-3 text-sm">
        <a
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-blue)] to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium whitespace-nowrap"
        >
          Dashboard
        </a>
        <div className="relative" ref={flashcardsDropdownRef}>
          <button
            onClick={toggleFlashcardsDropdown}
            className="px-4 py-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border-dark)] text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-200 font-medium whitespace-nowrap flex items-center gap-2"
          >
            Flashcards
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${isFlashcardsDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Flashcards Dropdown */}
          {isFlashcardsDropdownOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 rounded-lg border border-[var(--border-dark)] shadow-xl z-50" style={{backgroundColor: '#101d23'}}>
              <div className="p-4">
                {isLoadingSets ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                ) : flashcardSets.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {flashcardSets.map((set) => (
                        <a
                          key={set.id}
                          href={`/flashcards/${set.id}`}
                          className="block p-3 rounded-lg border border-[var(--border-dark)] hover:bg-white/5 transition-all duration-200"
                          style={{backgroundColor: '#1a2c38'}}
                          onClick={() => setIsFlashcardsDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{backgroundColor: getColorFromSeed(set.coverSeed)}}
                                />
                                <h3 className="text-sm font-medium text-white truncate">
                                  {set.title}
                                </h3>
                              </div>
                              {set.description && (
                                <p className="text-xs text-white/60 mt-1 truncate">
                                  {set.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <span
                                className="px-2 py-1 text-xs font-medium text-white rounded flex-shrink-0"
                                style={{backgroundColor: getColorFromSeed(set.coverSeed)}}
                              >
                                {formatCardCount(set.cardCount)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  // TODO: Implement delete functionality
                                  if (confirm(`Delete "${set.title}"?`)) {
                                    console.log(`Deleting set: ${set.id}`);
                                  }
                                }}
                                className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors opacity-60 hover:opacity-100"
                                aria-label="Delete set"
                              >
                                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>

                    {/* My Sets Button - Different Style */}
                    <div className="mt-4 pt-3 border-t border-[var(--border-dark)]">
                      <a
                        href="/flashcards"
                        className="block w-full p-3 rounded-lg border-2 border-dashed border-[var(--accent-blue)]/40 text-[var(--accent-blue)] hover:border-[var(--accent-blue)]/60 hover:bg-[var(--accent-blue)]/5 transition-all duration-200 text-center font-medium"
                        onClick={() => setIsFlashcardsDropdownOpen(false)}
                      >
                        View All My Sets →
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-white/60 text-sm mb-3">No flashcard sets yet</p>
                    <a
                      href="/flashcards"
                      className="inline-block px-4 py-2 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:bg-[var(--accent-blue-hover)] transition-all duration-200"
                      onClick={() => setIsFlashcardsDropdownOpen(false)}
                    >
                      Create Your First Set
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <a
          href="/speaking"
          className="px-4 py-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border-dark)] text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-200 font-medium whitespace-nowrap"
        >
          Speaking
        </a>
        <span className="px-3 py-2 rounded-lg bg-white/5 text-white/70 text-xs font-medium whitespace-nowrap">
          {email || "Signed in"}
        </span>
        <button
          className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium whitespace-nowrap"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 z-50 md:hidden shadow-2xl" style={{backgroundColor: '#101d23', borderLeft: '1px solid #2b4554'}}>
            <div className="flex items-center justify-between p-6" style={{backgroundColor: '#101d23'}}>
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-white transition-all duration-200" style={{backgroundColor: '#1a2c38'}}
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4" style={{backgroundColor: '#101d23'}}>
              <a
                href="/dashboard"
                className="block w-full px-4 py-3 rounded-lg text-white text-center font-medium" style={{backgroundColor: '#2563eb'}}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <div className="space-y-2">
                <button
                  onClick={() => setIsMobileFlashcardsOpen(!isMobileFlashcardsOpen)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 relative" style={{backgroundColor: '#1a2c38', border: '1px solid #2b4554'}}
                >
                  <span>Flashcards</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 absolute right-4 ${isMobileFlashcardsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mobile Flashcards Dropdown */}
                {isMobileFlashcardsOpen && (
                  <div className="flex flex-col items-center space-y-2 px-4">
                    {isLoadingSets ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : flashcardSets.length > 0 ? (
                      <>
                        {flashcardSets.map((set) => (
                          <a
                            key={set.id}
                            href={`/flashcards/${set.id}`}
                            className="block p-3 rounded-lg border border-[var(--border-dark)] hover:bg-white/5 transition-all duration-200 w-5/6"
                            style={{backgroundColor: '#1a2c38'}}
                            onClick={() => {
                              setIsMobileFlashcardsOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{backgroundColor: getColorFromSeed(set.coverSeed)}}
                                  />
                                  <h3 className="text-sm font-medium text-white truncate">
                                    {set.title}
                                  </h3>
                                </div>
                                {set.description && (
                                  <p className="text-xs text-white/60 mt-1 truncate">
                                    {set.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span
                                  className="px-2 py-1 text-xs font-medium text-white rounded flex-shrink-0"
                                  style={{backgroundColor: getColorFromSeed(set.coverSeed)}}
                                >
                                  {formatCardCount(set.cardCount)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // TODO: Implement delete functionality
                                    if (confirm(`Delete "${set.title}"?`)) {
                                      console.log(`Deleting set: ${set.id}`);
                                    }
                                  }}
                                  className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                  aria-label="Delete set"
                                >
                                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </a>
                        ))}

                        {/* Mobile My Sets Button */}
                        <a
                          href="/flashcards"
                          className="block w-5/6 p-3 rounded-lg border-2 border-dashed border-[var(--accent-blue)]/40 text-[var(--accent-blue)] hover:border-[var(--accent-blue)]/60 hover:bg-[var(--accent-blue)]/5 transition-all duration-200 text-center font-medium text-sm"
                          onClick={() => {
                            setIsMobileFlashcardsOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          View All My Sets →
                        </a>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-white/60 text-sm mb-3">No flashcard sets yet</p>
                        <a
                          href="/flashcards"
                          className="inline-block px-4 py-2 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:bg-[var(--accent-blue-hover)] transition-all duration-200"
                          onClick={() => {
                            setIsMobileFlashcardsOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          Create Your First Set
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <a
                href="/speaking"
                className="block w-full px-4 py-3 rounded-lg text-white font-medium text-center transition-all duration-200" style={{backgroundColor: '#1a2c38', border: '1px solid #2b4554'}}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Speaking
              </a>
              <div className="pt-4" style={{borderTop: '1px solid #2b4554'}}>
                <div className="px-4 py-3 rounded-lg text-white text-sm font-medium text-center mb-4" style={{backgroundColor: '#1a2c38'}}>
                  {email || "Signed in"}
                </div>
                <button
                  className="block w-full px-4 py-3 rounded-lg text-white font-medium text-center transition-all duration-200" style={{backgroundColor: '#1a2c38'}}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

