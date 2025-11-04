// components/MobileChatPage.js
import React, { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

const MobileChatPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome! I'm your garden assistant. Let me help you keep your plants and crops healthy.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Scroll after message is added
    setTimeout(scrollToBottom, 100);

    try {
      const recentMessages = messages.slice(-2);
      const conversationHistory = recentMessages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: currentInput,
          conversationHistory: conversationHistory,
          systemPrompt: `You are Leafy, a friendly garden assistant for AgroCare. 

IMPORTANT RULES:
1. ONLY answer questions about plants, gardening, crops, farming, agriculture, and plant care
2. If the question is NOT about plants/farming, politely say: "Sorry, I can only help with plant and farming questions."
3. Use simple, easy English words that anyone can understand
4. Give answers in clear steps (Step 1, Step 2, etc.) when explaining how to do something
5. Keep answers short and helpful (2-4 sentences or simple steps)
6. Be friendly and encouraging

Examples of what to answer:
✓ Plant diseases and treatment
✓ How to grow vegetables
✓ Watering schedules
✓ Fertilizer advice
✓ Pest control
✓ Soil problems
✓ Crop recommendations

Examples of what NOT to answer:
✗ Math homework
✗ Cooking recipes (unless about growing ingredients)
✗ General knowledge questions
✗ Programming or technology
✗ Any non-farming topics`,
          maxTokens: 200,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      const botMessage = {
        id: Date.now(),
        text: data.reply || "Sorry, I couldn't understand.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "⚠️ Error: Could not connect to server.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full transition-all duration-300 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 scale-90"
            : "bg-transparent hover:scale-110"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <img
              src="/leafy.jpg"
              alt="Leafy Assistant"
              className="w-12 h-12 object-cover border-2 border-white rounded-full"
            />
          </div>
        )}
      </button>

      {/* Full Screen Chat Window for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col" style={{ height: '100vh', height: '100dvh' }}>
          {/* Header */}
          <div className="bg-[#1c352d] px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="AgroCare Logo"
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Agrocare</h3>
              <p className="text-green-200 text-xs">
                Leafy - Your personal assistant
              </p>
            </div>
          </div>

          {/* Messages Area - Flexible height */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 mr-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src="/leafy.jpg"
                        alt="Leafy Assistant"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    message.sender === "user"
                      ? "bg-white text-gray-800 rounded-br-sm shadow-md"
                      : "bg-[#1c352d] text-white rounded-tl-sm shadow-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {message.text}
                  </p>
                </div>

                {message.sender === "user" && (
                  <div className="flex-shrink-0 ml-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex mb-4 justify-start">
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src="/leafy.jpg"
                      alt="Leafy Assistant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="bg-[#1c352d] rounded-2xl rounded-tl-sm shadow-md px-5 py-3.5 flex items-center">
                  <div className="flex gap-1.5">
                    <div 
                      className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms', animationDuration: '1s' }}
                    ></div>
                    <div 
                      className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                      style={{ animationDelay: '200ms', animationDuration: '1s' }}
                    ></div>
                    <div 
                      className="w-2 h-2 bg-green-300 rounded-full animate-bounce"
                      style={{ animationDelay: '400ms', animationDuration: '1s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom */}
          <div 
            className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0 safe-bottom"
            style={{
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))'
            }}
          >
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setTimeout(scrollToBottom, 300)}
                placeholder="Write your question..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full text-base focus:outline-none focus:border-[#1c352d] transition-colors"
                style={{ minHeight: '48px', fontSize: '16px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                  inputValue.trim()
                    ? "bg-[#1c352d] hover:bg-[#2a4a3f] text-white active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                style={{ minWidth: '48px', minHeight: '48px' }}
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileChatPage;