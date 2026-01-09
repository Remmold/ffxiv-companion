import { useState, useRef, useEffect } from 'react';

/**
 * Floating chat assistant for FFXIV questions.
 * Uses the PydanticAI backend with Groq LLM.
 */
export default function AssistantChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const messagesEndRef = useRef(null);

    // Check if assistant is available on mount
    useEffect(() => {
        fetch('/api/assistant/status')
            .then(res => res.json())
            .then(data => setIsAvailable(data.available))
            .catch(() => setIsAvailable(false));
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'error',
                    content: data.error || 'Something went wrong. Please try again.'
                }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'error',
                content: 'Failed to connect to assistant.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Don't render if assistant is not available
    if (isAvailable === false) return null;

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg 
                    flex items-center justify-center transition-all duration-300
                    ${isOpen
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                    }`}
                title="Ask the FFXIV Assistant"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <span className="text-2xl">🤖</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] 
                    bg-gray-900 border border-gray-700 rounded-xl shadow-2xl
                    flex flex-col overflow-hidden animate-in slide-in-from-bottom-4"
                    style={{ height: '500px', maxHeight: 'calc(100vh - 160px)' }}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 
                        px-4 py-3 border-b border-gray-700 flex-shrink-0">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                            <span>🤖</span>
                            FFXIV Gathering Assistant
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Ask about gear, nodes, scrips, and more
                        </p>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                <p className="text-3xl mb-2">👋</p>
                                <p className="text-sm">Ask me about FFXIV gathering!</p>
                                <div className="mt-4 space-y-2">
                                    {['What\'s BiS for gatherers?', 'How do I unlock Pelupelu?', 'What gives Orange Scrips?'].map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInput(q)}
                                            className="block w-full text-left text-xs text-purple-400 
                                                hover:text-purple-300 bg-gray-800/50 rounded px-3 py-2
                                                hover:bg-gray-800 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm
                                        ${msg.role === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : msg.role === 'error'
                                                ? 'bg-red-900/50 text-red-300 border border-red-700'
                                                : 'bg-gray-800 text-gray-200'
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg px-4 py-3">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-700 p-3 flex-shrink-0 bg-gray-800/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about FFXIV gathering..."
                                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2
                                    text-white placeholder-gray-500 text-sm
                                    focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 
                                    disabled:cursor-not-allowed text-white rounded-lg px-4 py-2
                                    transition-colors flex-shrink-0"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Powered by AI • Limited to 50 questions/day
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
