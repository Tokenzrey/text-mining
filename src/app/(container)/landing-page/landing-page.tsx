'use client';

import { useMutation } from '@tanstack/react-query';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

interface Emotion {
  id: string;
  name: string;
  desc: string;
}

// Data
const allEmotions: Emotion[] = [
  { id: 'anger', name: 'Anger', desc: 'Kemarahan, frustrasi.' },
  {
    id: 'cognitive dysfunction',
    name: 'Cognitive Dysfunction',
    desc: 'Kebingungan, disfungsi kognitif.',
  },
  { id: 'emptiness', name: 'Emptiness', desc: 'Kekosongan, kehampaan.' },
  { id: 'hopelessness', name: 'Hopelessness', desc: 'Keputusasaan.' },
  { id: 'loneliness', name: 'Loneliness', desc: 'Kesepian, isolasi.' },
  { id: 'sadness', name: 'Sadness', desc: 'Kesedihan, duka.' },
  { id: 'suicide intent', name: 'Suicide Intent', desc: 'Niat bunuh diri.' },
  {
    id: 'worthlessness',
    name: 'Worthlessness',
    desc: 'Perasaan tidak berharga.',
  },
];

// Main component
export default function LandingPage() {
  // State management
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Menganalisis emosi...');
  const [detectedEmotions, setDetectedEmotions] = useState<string[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  // We can simplify the state management without using textToAnalyze
  // by updating the analyzeText function implementation

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);

  const emotionColors: Record<string, string> = {
    anger: 'bg-red-500/80 text-white',
    sadness: 'bg-blue-500/80 text-white',
    loneliness: 'bg-sky-600/80 text-white',
    emptiness: 'bg-gray-500/80 text-white',
    hopelessness: 'bg-indigo-700/80 text-white',
    worthlessness: 'bg-purple-700/80 text-white',
    'cognitive dysfunction': 'bg-yellow-500/80 text-black',
    'suicide intent': 'bg-black/80 text-red-400 border border-red-400',
  };

  // Handle close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize ScrollReveal - fixed for Next.js
  useEffect(() => {
    // Only import and initialize ScrollReveal on the client side
    const initScrollReveal = async () => {
      try {
        // Dynamic import to ensure ScrollReveal only loads in browser
        const ScrollReveal = (await import('scrollreveal')).default;

        const sr = ScrollReveal({
          distance: '50px',
          duration: 1000,
          easing: 'cubic-bezier(0.5, 0, 0, 1)',
          reset: false,
        });

        sr.reveal('.reveal-up', { origin: 'bottom', interval: 100 });
        sr.reveal('.reveal-down', { origin: 'top' });
        sr.reveal('.feature-card', { origin: 'bottom', interval: 150 });
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat memuat ScrollReveal.',
        );
      }
    };

    // Only run in browser environment
    if (typeof window !== 'undefined') {
      initScrollReveal();
    }
  }, []);

  // Analysis function - Fixed dependency array and simplified implementation
  const analyzeText = useCallback(
    (textOverride?: string) => {
      const text = (
        typeof textOverride === 'string' ? textOverride : textInput
      ).trim();

      // Reset states
      setErrorMessage(null);
      setInfoMessage(null);

      if (text === '') {
        setInfoMessage('Silakan masukkan teks untuk dianalisis.');
        setDetectedEmotions([]);
        return;
      }

      setIsLoading(true);
      setLoadingText('Menganalisis emosi...');

      // Simulate analysis (just like in the original code)
      setTimeout(() => {
        // Create a copy of emotion IDs to avoid modifying the original data
        const shuffled = [...allEmotions.map((e) => e.id)].sort(
          () => 0.5 - Math.random(),
        );
        const detectedCount = Math.floor(Math.random() * 3) + 1;
        const detected = shuffled.slice(0, detectedCount);

        // Specific text detection logic
        if (
          text.toLowerCase().includes('benci') ||
          text.toLowerCase().includes('marah')
        ) {
          if (!detected.includes('anger')) detected.push('anger');
        }
        if (
          text.toLowerCase().includes('sedih') ||
          text.toLowerCase().includes('nangis')
        ) {
          if (!detected.includes('sadness')) detected.push('sadness');
        }

        setIsLoading(false);
        setDetectedEmotions(detected);

        if (detected.length === 0) {
          setInfoMessage('Tidak ada emosi negatif yang terdeteksi.');
        }
      }, 1500);
    },
    [textInput], // Removed unnecessary allEmotions dependency
  );

  // TanStack Query mutation for Gemini API calls
  const geminiMutation = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      // Safely access the API key with fallback to empty string
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

      if (!apiKey) {
        // Improved mock response handling
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

        if (prompt.includes('saran balasan')) {
          return 'Saya mengerti perasaan Anda saat ini. Terkadang hidup memang berat, tapi ingatlah bahwa Anda tidak sendirian. Saya di sini untuk mendengarkan kapanpun Anda butuhkan. Bagaimana jika kita bertemu untuk secangkir kopi minggu ini?';
        } else {
          // Mock example generation based on emotion
          const emotionExamples: Record<string, string> = {
            anger:
              'Saya benar-benar muak dengan pelayanan di tempat ini! Sudah menunggu berjam-jam dan masih diabaikan. SANGAT MENGECEWAKAN!',
            sadness:
              'Menatap foto-foto kenangan kita, terasa begitu hampa. Terlalu banyak momen yang tidak akan pernah terulang kembali...',
            loneliness:
              'Di tengah keramaian pun, aku tetap sendiri. Rasanya seperti tak ada seorangpun yang benar-benar mengerti.',
            emptiness:
              'Bangun tidur dan menjalani aktivitas seperti robot. Tidak ada yang terasa berarti lagi.',
            hopelessness:
              'Sudah berkali-kali mencoba, tapi tetap gagal. Sepertinya tidak ada jalan keluar dari situasi ini.',
            worthlessness:
              'Apa gunanya semua usaha ini? Tanpa diriku pun, semua akan tetap berjalan dengan baik.',
            'cognitive dysfunction':
              'Saya tidak bisa fokus akhir-akhir ini... pikiran saya terpecah-pecah, sulit mengingat hal sederhana yang biasanya mudah.',
            'suicide intent':
              'Rasanya tidak ada gunanya melanjutkan hidup seperti ini. Mungkin semua akan lebih baik jika aku tidak ada.',
          };

          const emotionId = prompt.match(/emosi "([^"]+)"/)?.[1] || '';
          return (
            emotionExamples[emotionId] ||
            'Hari ini saya merasa sangat sedih dan putus asa. Tidak ada yang peduli dengan apa yang saya rasakan.'
          );
        }
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const chatHistory = [{ role: 'user', parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            `Gagal menghubungi API Gemini. Status: ${response.status}`,
          );
        }

        const result = await response.json();

        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0
        ) {
          return result.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Tidak ada konten yang diterima dari API.');
        }
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error('Terjadi kesalahan saat memanggil API.');
      }
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data, variables) => {
      if (variables.prompt.includes('saran balasan')) {
        // Improved implementation for response suggestions
        setInfoMessage('Saran balasan berhasil dibuat.');
        // Additional functionality could be added here, like
        // copying to clipboard or displaying in a dedicated area
      } else {
        // For example generation - update input and analyze it
        setTextInput(data);
        // Directly analyze the text rather than using textToAnalyze state
        analyzeText(data);
      }
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memanggil Gemini API.',
      );
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleGenerateExample = (emotionId: string) => {
    if (!emotionId) return;

    setLoadingText(
      `Gemini sedang membuat contoh teks untuk emosi ${emotionId}...`,
    );
    setErrorMessage(null);
    setInfoMessage(null);

    const prompt = `Buat satu contoh kalimat atau tweet singkat (tidak lebih dari 280 karakter) yang dengan jelas mengekspresikan emosi "${emotionId}". Buat dalam bahasa Indonesia. Jangan sertakan tanda kutip di awal atau akhir.`;

    geminiMutation.mutate({ prompt });
  };

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsDropdownOpen(!isDropdownOpen);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const handleEmotionKeyDown = (e: KeyboardEvent, emotionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedEmotion(emotionId);
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <div className='aurora-background'></div>

      <div className='relative z-10'>
        {/* Header */}
        <header className='absolute top-0 right-0 left-0 px-4 py-5 md:px-8'>
          <nav className='container mx-auto flex items-center justify-between'>
            <div className='text-2xl font-bold text-white'>
              <span className='text-purple-400'>Sentimen</span>Analyst
            </div>
            <button className='hidden transform rounded-full bg-purple-600 px-6 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-purple-700 md:inline-block'>
              Hubungi Kami
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <main
          id='home'
          className='flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12 text-center'
        >
          <div className='reveal-up mx-auto max-w-3xl'>
            <h1 className='mb-4 text-4xl leading-tight font-extrabold text-white md:text-6xl'>
              Mengungkap{' '}
              <span className='bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent'>
                Nuansa Emosi
              </span>{' '}
              di Balik Teks
            </h1>
            <p className='mx-auto mb-8 max-w-2xl text-lg text-slate-300 md:text-xl'>
              Platform kami menggunakan AI canggih untuk analisis multi-label,
              dan kini didukung Gemini untuk memberikan wawasan lebih dalam.
            </p>

            {/* Input Area */}
            <div className='gradient-border mx-auto w-full max-w-2xl shadow-2xl shadow-purple-900/50'>
              <textarea
                className='h-32 w-full resize-none rounded-lg bg-[#1a163a] p-4 text-white placeholder-slate-400 focus:outline-none'
                placeholder='Masukkan teks seperti tweet, ulasan, atau pesan di sini...'
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    analyzeText();
                  }
                }}
                aria-label='Teks untuk analisis emosi'
              ></textarea>
            </div>
            <button
              className='mt-6 transform rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-indigo-700'
              onClick={() => analyzeText()}
            >
              Analisis Sekarang
            </button>
          </div>

          {/* Results Area */}
          <div className='mt-12 w-full max-w-3xl'>
            {isLoading ? (
              <div className='text-white'>
                <svg
                  className='mx-auto h-8 w-8 animate-spin text-purple-400'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  aria-label='Loading'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <p className='mt-2'>{loadingText}</p>
              </div>
            ) : (
              <>
                {errorMessage && <p className='text-red-400'>{errorMessage}</p>}

                {infoMessage && (
                  <p className='text-yellow-400'>{infoMessage}</p>
                )}

                {/* Display detected emotions */}
                <div className='flex flex-wrap items-center justify-center'>
                  {detectedEmotions.map((emotion) => (
                    <div
                      key={emotion}
                      className={`emotion-tag ${emotionColors[emotion] || 'bg-gray-400'}`}
                      role='status'
                      aria-label={`Detected emotion: ${allEmotions.find((e) => e.id === emotion)?.name || emotion}`}
                    >
                      {allEmotions.find((e) => e.id === emotion)?.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>

        {/* Gemini Example Generator Section */}
        <section className='bg-black/20 px-4 py-20'>
          <div className='container mx-auto text-center'>
            <div className='reveal-down'>
              <h2 className='text-3xl font-bold text-white md:text-4xl'>
                Butuh Inspirasi?
              </h2>
              <p className='mx-auto mt-2 max-w-2xl text-slate-300'>
                Gunakan Gemini untuk membuat contoh teks berdasarkan emosi yang
                Anda pilih.
              </p>
            </div>
            <div className='reveal-up mx-auto mt-8 flex max-w-lg flex-col items-center gap-4 sm:flex-row'>
              {/* Accessible Dropdown */}
              <div
                className='relative w-full flex-grow sm:w-auto'
                ref={dropdownRef}
              >
                <button
                  className='custom-dropdown-btn flex w-full items-center justify-between rounded-full border border-purple-500 bg-[#1a163a] px-5 py-3 text-left text-white transition-colors hover:bg-[#272152] focus:ring-2 focus:ring-purple-400 focus:outline-none'
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onKeyDown={handleDropdownKeyDown}
                  aria-haspopup='listbox'
                  aria-expanded={isDropdownOpen}
                  aria-label='Pilih emosi'
                >
                  <span>
                    {selectedEmotion
                      ? allEmotions.find((e) => e.id === selectedEmotion)?.name
                      : 'Pilih emosi'}
                  </span>
                  <svg
                    className={`h-5 w-5 text-purple-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 transform' : ''}`}
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>

                {/* Dropdown Menu - Accessible */}
                {isDropdownOpen && (
                  <div
                    className='custom-dropdown-menu absolute z-100 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-purple-500 bg-[#1a163a] py-1 shadow-lg shadow-purple-900/30 backdrop-blur-md'
                    role='listbox'
                    aria-label='Daftar emosi'
                    tabIndex={-1}
                  >
                    {allEmotions.map((emotion) => (
                      <div
                        key={emotion.id}
                        className='cursor-pointer px-5 py-3 text-left text-white transition-colors hover:bg-purple-600/30'
                        onClick={() => {
                          setSelectedEmotion(emotion.id);
                          setIsDropdownOpen(false);
                        }}
                        onKeyDown={(e) => handleEmotionKeyDown(e, emotion.id)}
                        role='option'
                        aria-selected={selectedEmotion === emotion.id}
                        tabIndex={0}
                      >
                        {emotion.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className='w-full transform rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-8 py-3 font-bold text-white transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-orange-500 sm:w-auto'
                onClick={() => {
                  if (selectedEmotion) {
                    handleGenerateExample(selectedEmotion);
                  }
                }}
                disabled={!selectedEmotion || isLoading}
                aria-label='Generate example text for selected emotion'
              >
                ✨ Buat Contoh
              </button>
            </div>
          </div>
        </section>

        {/* Features Section (Emotions Detected) */}
        <section id='features' className='px-4 py-20'>
          <div className='container mx-auto'>
            <div className='reveal-down mb-12 text-center'>
              <h2 className='text-3xl font-bold text-white md:text-4xl'>
                Emosi yang Kami Deteksi
              </h2>
              <p className='mx-auto mt-2 max-w-2xl text-slate-300'>
                Model kami dilatih untuk mengenali spektrum emosi yang luas dan
                seringkali tumpang tindih.
              </p>
            </div>
            <div className='grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4'>
              {allEmotions.map((emotion) => (
                <div
                  key={emotion.id}
                  className='feature-card rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:border-purple-400'
                >
                  <h3 className='text-lg font-bold text-white'>
                    {emotion.name}
                  </h3>
                  <p className='mt-1 text-sm text-slate-400'>{emotion.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-slate-900/50 px-4 py-8 text-center'>
          <div className='container mx-auto text-slate-400'>
            <p>&copy; 2024 SentimenAnalyst. Seluruh hak cipta dilindungi.</p>
            <p className='mt-2 text-sm'>Didukung oleh Google Gemini</p>
          </div>
        </footer>
      </div>

      {/* Fix for JSX and global properties */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        body {
          font-family: 'Inter', sans-serif;
          background-color: #0a091e;
          color: #e0e0e0;
        }

        .aurora-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(
              ellipse 80% 80% at 20% -20%,
              rgba(120, 112, 255, 0.2),
              transparent
            ),
            radial-gradient(
              ellipse 80% 80% at 80% 120%,
              rgba(255, 88, 188, 0.2),
              transparent
            );
          z-index: 0;
          filter: blur(80px);
          opacity: 0.7;
        }

        .gradient-border {
          border: 2px solid transparent;
          background-clip: padding-box;
          border-radius: 12px;
          position: relative;
        }
        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          margin: -2px;
          border-radius: inherit;
          background: linear-gradient(to right, #8a2be2, #4a00e0);
          transition: all 0.3s ease-in-out;
        }
        .gradient-border:focus-within::before {
          background: linear-gradient(to right, #a261ea, #6a2ee0);
        }

        .emotion-tag {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          border-radius: 9999px;
          font-weight: 500;
          margin: 4px;
          transition: all 0.3s ease;
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gemini-feature-btn {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }

        .gemini-feature-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Custom Dropdown Styling */
        .custom-dropdown-btn {
          position: relative;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .custom-dropdown-btn:hover {
          border-color: #a855f7;
        }

        .custom-dropdown-menu {
          border: 1px solid rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
          animation: dropdownFadeIn 0.3s ease-out forwards;
          backdrop-filter: blur(10px);
          scrollbar-width: thin;
          scrollbar-color: #a855f7 #1a163a;
        }

        .custom-dropdown-menu::-webkit-scrollbar {
          width: 6px;
        }

        .custom-dropdown-menu::-webkit-scrollbar-track {
          background: #1a163a;
          border-radius: 10px;
        }

        .custom-dropdown-menu::-webkit-scrollbar-thumb {
          background: #a855f7;
          border-radius: 10px;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
        }}
      />
    </>
  );
}
