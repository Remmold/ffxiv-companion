import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

/**
 * FFXIV-Themed Moogle Chat Assistant Page
 * Uses Final Fantasy XIV aesthetics - Classic FF blue with gold accents
 */
export default function AssistantPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetch('/api/assistant/status')
            .then(res => res.json())
            .then(data => setIsAvailable(data.available))
            .catch(() => setIsAvailable(false));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const sendMessage = async (messageText = input.trim()) => {
        if (!messageText || isLoading) return;

        const newUserMessage = { role: 'user', content: messageText };
        const updatedMessages = [...messages, newUserMessage];

        setInput('');
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            const historyForApi = messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));

            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    history: historyForApi
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'error',
                    content: data.error || 'Kupo! Something went wrong...'
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'error',
                content: 'Failed to connect, kupo!'
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const suggestedQuestions = [
        { text: "What's BiS for gatherers?", icon: "⚙️" },
        { text: "How do I unlock Pelupelu?", icon: "🤝" },
        { text: "Where do I farm Orange Scrips?", icon: "📜" },
        { text: "When do daily/weekly tasks reset?", icon: "⏰" },
        { text: "Where do I get folklore books?", icon: "📖" },
        { text: "What materia should I meld?", icon: "💎" }
    ];

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 25%, #132744 50%, #0d1f3c 75%, #0a1628 100%)'
            }}>

            {/* Decorative crystal background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 left-10 w-40 h-40 opacity-5"
                    style={{
                        background: 'linear-gradient(45deg, #4a9eff, #7eb8ff)',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        animation: 'pulse 4s ease-in-out infinite'
                    }} />
                <div className="absolute bottom-40 right-20 w-32 h-32 opacity-5"
                    style={{
                        background: 'linear-gradient(45deg, #ffd700, #ffed4a)',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        animation: 'pulse 5s ease-in-out infinite 1s'
                    }} />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 opacity-5"
                    style={{
                        background: 'linear-gradient(45deg, #4a9eff, #a8d4ff)',
                        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                        animation: 'pulse 6s ease-in-out infinite 2s'
                    }} />
            </div>

            {/* Header - FF Style */}
            <header className="relative z-10 border-b"
                style={{
                    background: 'linear-gradient(180deg, rgba(20, 40, 80, 0.95) 0%, rgba(15, 30, 60, 0.98) 100%)',
                    borderColor: 'rgba(74, 158, 255, 0.3)'
                }}>
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Moogle Avatar */}
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(255, 215, 0, 0.1))',
                                        border: '2px solid rgba(255, 215, 0, 0.5)',
                                        boxShadow: '0 0 20px rgba(74, 158, 255, 0.3)'
                                    }}>
                                    <img src="/moogle.png" alt="Moogle" className="w-14 h-14 object-contain" />
                                </div>
                                {/* Pom pom glow effect */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                                    style={{
                                        background: '#ff4444',
                                        boxShadow: '0 0 10px #ff4444, 0 0 20px #ff6666'
                                    }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold"
                                    style={{
                                        color: '#ffd700',
                                        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
                                    }}>
                                    Moogle Mail Assistant
                                </h1>
                                <p className="text-sm" style={{ color: 'rgba(168, 212, 255, 0.8)' }}>
                                    Ask about gathering, gear, and more, kupo! ✨
                                </p>
                            </div>
                        </div>
                        <Link to="/"
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={{
                                background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.1))',
                                border: '1px solid rgba(74, 158, 255, 0.4)',
                                color: '#a8d4ff'
                            }}>
                            ← Back to Companion
                        </Link>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="text-center py-8">
                            {/* Large Moogle */}
                            <div className="mb-6">
                                <img src="/moogle.png" alt="Moogle"
                                    className="w-32 h-32 mx-auto"
                                    style={{ filter: 'drop-shadow(0 0 20px rgba(74, 158, 255, 0.5))' }} />
                            </div>
                            <h2 className="text-3xl font-bold mb-3"
                                style={{
                                    color: '#ffd700',
                                    textShadow: '0 0 15px rgba(255, 215, 0, 0.4)'
                                }}>
                                Greetings, Kupo!
                            </h2>
                            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: '#a8d4ff' }}>
                                I'm your friendly Moogle assistant! Ask me about gathering,
                                crafting, scrips, and everything a Disciple of the Land needs to know!
                            </p>

                            {/* Suggested Questions - FF Style Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q.text)}
                                        className="text-left px-4 py-3 rounded-lg transition-all duration-200 group"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(20, 40, 80, 0.8), rgba(15, 30, 60, 0.9))',
                                            border: '1px solid rgba(74, 158, 255, 0.3)',
                                            color: '#a8d4ff'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.6)';
                                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(74, 158, 255, 0.3)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <span className="text-xl mr-2">{q.icon}</span>
                                        {q.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {/* Moogle avatar for assistant messages */}
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 mr-3 mt-1">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(255, 215, 0, 0.1))',
                                            border: '1px solid rgba(255, 215, 0, 0.4)'
                                        }}>
                                        <img src="/moogle.png" alt="Moogle" className="w-8 h-8 object-contain" />
                                    </div>
                                </div>
                            )}

                            <div className={`max-w-3xl rounded-xl px-5 py-4 ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}
                                style={msg.role === 'user'
                                    ? {
                                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 180, 0, 0.15))',
                                        border: '1px solid rgba(255, 215, 0, 0.4)',
                                        color: '#fff'
                                    }
                                    : msg.role === 'error'
                                        ? {
                                            background: 'rgba(150, 50, 50, 0.3)',
                                            border: '1px solid rgba(255, 100, 100, 0.4)',
                                            color: '#ffaaaa'
                                        }
                                        : {
                                            background: 'linear-gradient(135deg, rgba(20, 40, 80, 0.9), rgba(15, 30, 60, 0.95))',
                                            border: '1px solid rgba(74, 158, 255, 0.3)',
                                            color: '#e0f0ff'
                                        }
                                }>
                                {msg.role === 'assistant' ? (
                                    <div className="prose prose-invert prose-sm max-w-none
                                        prose-headings:text-amber-300 prose-headings:font-semibold prose-headings:mb-2 prose-headings:mt-4
                                        prose-h2:text-lg prose-h3:text-base
                                        prose-p:text-blue-100 prose-p:leading-relaxed prose-p:my-2
                                        prose-strong:text-yellow-300 prose-strong:font-semibold
                                        prose-ul:my-2 prose-li:text-blue-100 prose-li:my-0.5
                                        prose-code:text-cyan-300 prose-code:bg-blue-900/50 prose-code:px-1 prose-code:rounded
                                        [&>*:first-child]:mt-0">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading - Moogle Style */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex-shrink-0 mr-3 mt-1">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden animate-pulse"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(255, 215, 0, 0.1))',
                                        border: '1px solid rgba(255, 215, 0, 0.4)'
                                    }}>
                                    <img src="/moogle.png" alt="Moogle" className="w-8 h-8 object-contain" />
                                </div>
                            </div>
                            <div className="rounded-xl px-5 py-4"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(20, 40, 80, 0.9), rgba(15, 30, 60, 0.95))',
                                    border: '1px solid rgba(74, 158, 255, 0.3)'
                                }}>
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 rounded-full animate-bounce"
                                            style={{ background: '#ffd700', animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce"
                                            style={{ background: '#ffd700', animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full animate-bounce"
                                            style={{ background: '#ffd700', animationDelay: '300ms' }} />
                                    </div>
                                    <span style={{ color: '#a8d4ff' }}>Searching my letters, kupo...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area - FF Style */}
            <footer className="relative z-10 border-t px-4 py-4"
                style={{
                    background: 'linear-gradient(180deg, rgba(15, 30, 60, 0.98) 0%, rgba(10, 22, 40, 0.99) 100%)',
                    borderColor: 'rgba(74, 158, 255, 0.3)'
                }}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask your question, kupo!"
                            className="flex-1 rounded-xl px-5 py-3 text-base transition-all duration-200 outline-none"
                            style={{
                                background: 'rgba(10, 20, 40, 0.8)',
                                border: '1px solid rgba(74, 158, 255, 0.4)',
                                color: '#e0f0ff',
                                '::placeholder': { color: 'rgba(168, 212, 255, 0.5)' }
                            }}
                            disabled={isLoading || isAvailable === false}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim() || isAvailable === false}
                            className="rounded-xl px-6 py-3 font-semibold transition-all duration-200 flex items-center gap-2"
                            style={{
                                background: isLoading || !input.trim()
                                    ? 'rgba(50, 50, 80, 0.5)'
                                    : 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 180, 0, 0.2))',
                                border: '1px solid rgba(255, 215, 0, 0.5)',
                                color: isLoading || !input.trim() ? '#666' : '#ffd700',
                                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            Send
                        </button>
                    </div>
                    <p className="text-xs mt-3 text-center" style={{ color: 'rgba(168, 212, 255, 0.5)' }}>
                        🎮 Patch 7.4 Dawntrail • Limited to 50 questions/day • Powered by Moogle Magic
                    </p>
                </div>
            </footer>

            {/* CSS Animation for crystals */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.05; transform: scale(1); }
                    50% { opacity: 0.1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
