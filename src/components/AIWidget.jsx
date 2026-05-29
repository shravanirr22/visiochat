import { useState, useEffect, useRef } from "react"
import { auth } from "../firebase/config"
import { sendMessage, listenMessages, clearAIChat } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiSend, FiSettings, FiTrash2, FiKey, FiCpu, FiCheck, FiX, FiInfo } from "react-icons/fi"

export default function AIWidget({ isChatOpen }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [apiKey, setApiKey] = useState("")
    const [tempKey, setTempKey] = useState("")
    const [keySavedMessage, setKeySavedMessage] = useState(false)
    const bottomRef = useRef(null)
    const user = auth.currentUser

    // Load key on mount
    useEffect(() => {
        const storedKey = localStorage.getItem("visiochat_gemini_key") || ""
        setApiKey(storedKey)
        setTempKey(storedKey)
    }, [])

    // Listen to messages
    useEffect(() => {
        if (!user || !isOpen) return
        const unsubscribe = listenMessages(`ai_${user.uid}`, (msgs) => {
            setMessages(msgs)
        })
        return () => unsubscribe()
    }, [user, isOpen])

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isTyping, isOpen])

    // Suggestions
    const suggestions = [
        { text: "📝 Draft a group announcement.", label: "Draft" },
        { text: "🔒 Explain controlled visibility.", label: "Visibility" },
        { text: "⏰ How do timed messages work?", label: "Timed" }
    ]

    // Mock Responder
    const getMockResponse = (prompt) => {
        const text = prompt.toLowerCase()
        if (text.includes("visibility") || text.includes("visible") || text.includes("hide") || text.includes("lock")) {
            return `🔒 **Controlled Visibility** allows you to hide messages inside group chats!\n\n1. Select **"Selected only"** from the visibility dropdown in Admin Controls.\n2. Non-selected members see a locked placeholder, while selected members see the content.`;
        }
        if (text.includes("timed") || text.includes("release") || text.includes("schedule")) {
            return `⏰ **Timed Messages** let you delay message release.\n\n- Toggle the **"Timed"** button before sending. The message will automatically reveal itself at the set time!`;
        }
        if (text.includes("announce") || text.includes("broadcast")) {
            return `📢 **Announcements** highlight broadcasts in a styled banner with a speaker icon. Toggle **"Announce"** in Admin Controls to use!`;
        }
        if (text.includes("api") || text.includes("key") || text.includes("set") || text.includes("configure")) {
            return `🔑 **Configure API Key:**\n\n1. Get a key from [Google AI Studio](https://aistudio.google.com/) or [Groq Console](https://console.groq.com/).\n2. Open widget settings (⚙️ icon).\n3. Paste the key and save!`;
        }
        return `🤖 **VisioBot (Demo Mode)**\n\nI'm in Demo Mode. Add a Gemini or Groq API Key via the settings gear (⚙️) to unlock full internet answers!\n\nAsk about:\n- **"visibility"**\n- **"timed"**\n- **"announce"**`;
    }

    // Call AI API
    const callAI = async (userPrompt, chatHistory, userApiKey) => {
        const isGroq = userApiKey.startsWith("gsk_")
        if (isGroq) {
            const messagesPayload = [
                {
                    role: "system",
                    content: "You are VisioBot, a friendly and highly capable AI assistant integrated into VisioChat. VisioChat is a role-based controlled group messaging platform. Keep your answers concise, engaging, and formatted in clean markdown. Help the user write messages, answer questions, or formulate announcements."
                }
            ]
            const recentMessages = chatHistory.slice(-10)
            recentMessages.forEach(msg => {
                messagesPayload.push({
                    role: msg.senderId === "ai" ? "assistant" : "user",
                    content: msg.text
                })
            })
            messagesPayload.push({
                role: "user",
                content: userPrompt
            })

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userApiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messagesPayload,
                    temperature: 0.7,
                    max_tokens: 800
                })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData?.error?.message || `Groq API error ${response.status}`)
            }

            const data = await response.json()
            const responseText = data?.choices?.[0]?.message?.content
            if (!responseText) {
                throw new Error("No response content received from Groq API.")
            }
            return responseText
        } else {
            const recentMessages = chatHistory.slice(-10)
            const contents = recentMessages.map(msg => ({
                role: msg.senderId === "ai" ? "model" : "user",
                parts: [{ text: msg.text }]
            }))
            contents.push({
                role: "user",
                parts: [{ text: userPrompt }]
            })

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey}`
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: contents,
                    systemInstruction: {
                        parts: [{
                            text: "You are VisioBot, a friendly and highly capable AI assistant integrated into VisioChat. VisioChat is a role-based controlled group messaging platform. Keep your answers concise, engaging, and formatted in clean markdown. Help the user write messages, answer questions, or formulate announcements."
                        }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    }
                })
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData?.error?.message || `Gemini API error ${response.status}`)
            }

            const data = await response.json()
            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (!responseText) {
                throw new Error("No response content received from Gemini API.")
            }
            return responseText
        }
    }

    const handleSend = async (textToSend) => {
        if (!textToSend.trim() || isTyping || !user) return
        const prompt = textToSend.trim()
        setInput("")

        await sendMessage(`ai_${user.uid}`, {
            text: prompt,
            senderId: user.uid,
            senderName: user.displayName || "User",
            type: "normal",
            visibility: "everyone",
        })

        setIsTyping(true)

        try {
            let responseText = ""
            const activeKey = apiKey || import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GEMINI_API_KEY

            if (activeKey) {
                responseText = await callAI(prompt, messages, activeKey)
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                responseText = getMockResponse(prompt)
            }

            await sendMessage(`ai_${user.uid}`, {
                text: responseText,
                senderId: "ai",
                senderName: "VisioBot",
                type: "normal",
                visibility: "everyone",
            })
        } catch (error) {
            console.error("AI Error:", error)
            await sendMessage(`ai_${user.uid}`, {
                text: `❌ **Failed to generate AI response**\n\n*Error: ${error.message}*\n\nPlease verify your API key in settings (⚙️).`,
                senderId: "ai",
                senderName: "VisioBot",
                type: "normal",
                visibility: "everyone",
            })
        } finally {
            setIsTyping(false)
        }
    }

    const handleSaveKey = () => {
        const trimmed = tempKey.trim()
        localStorage.setItem("visiochat_gemini_key", trimmed)
        setApiKey(trimmed)
        setKeySavedMessage(true)
        setTimeout(() => setKeySavedMessage(false), 2000)
    }

    const handleDeleteKey = () => {
        localStorage.removeItem("visiochat_gemini_key")
        setApiKey("")
        setTempKey("")
    }

    const handleClearHistory = async () => {
        if (!user) return
        if (window.confirm("Clear chat history with VisioBot?")) {
            await clearAIChat(user.uid)
        }
    }

    const parseMarkdown = (text) => {
        if (!text) return ""
        const lines = text.split("\n")
        return lines.map((line, idx) => {
            const trimmed = line.trim()
            if (line.startsWith("### ") || line.startsWith("## ") || line.startsWith("# ")) {
                const clean = line.replace(/^#{1,3}\s+/, "")
                return <h5 key={idx} className="font-bold text-slate-800 text-xs mt-2 mb-0.5">{renderBoldAndLinks(clean)}</h5>
            }
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                const clean = trimmed.replace(/^[-*]\s+/, "")
                return (
                    <ul key={idx} className="list-disc list-inside ml-2.5 text-[12px] text-slate-600 leading-normal my-0.5">
                        <li>{renderBoldAndLinks(clean)}</li>
                    </ul>
                )
            }
            return (
                <p key={idx} className="text-[12px] text-slate-600 leading-relaxed my-0.5 min-h-[0.8rem]">
                    {renderBoldAndLinks(line)}
                </p>
            )
        })
    }

    const renderBoldAndLinks = (text) => {
        const boldParts = text.split(/\*\*([^*]+)\*\*/)
        return boldParts.map((part, idx) => {
            if (idx % 2 === 1) {
                return <strong key={idx} className="font-bold text-slate-800">{part}</strong>
            }
            const linkParts = part.split(/\[([^\]]+)\]\(([^)]+)\)/)
            if (linkParts.length > 1) {
                return linkParts.map((subPart, subIdx) => {
                    if (subIdx % 3 === 1) {
                        return (
                            <a key={subIdx} href={linkParts[subIdx + 1]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">
                                {subPart}
                            </a>
                        )
                    }
                    if (subIdx % 3 === 2) return null
                    return subPart
                })
            }
            return part
        })
    }

    if (!user) return null

    return (
        <div className="font-sans">
            {/* Floating Launcher Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className={`fixed bottom-44 right-6 w-14 h-14 bg-gradient-to-br from-primary via-[#8A70FF] to-accent text-white rounded-2xl shadow-[0_8px_25px_rgba(107,76,255,0.4)] flex items-center justify-center z-30 transition-transform border border-white/20 ${isChatOpen ? 'hidden md:flex' : 'flex'}`}
                    >
                        <FiCpu size={26} className="drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]" />
                        <span className="absolute top-0 right-0 w-3 h-3 bg-accent border-2 border-white rounded-full"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat overlay widget */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className={`fixed bottom-[6.5rem] right-6 w-[360px] h-[500px] max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-40 flex flex-col overflow-hidden ${isChatOpen ? 'hidden md:flex' : 'flex'}`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primarylight/30 to-transparent border-b border-slate-100 px-4 py-3 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-[#8A70FF] to-accent flex items-center justify-center text-white text-md shadow-sm">
                                <FiCpu size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-slate-800 text-sm font-extrabold truncate">VisioBot</span>
                                    <span className="bg-accent/15 text-accent text-[8px] font-extrabold px-1 py-0.5 rounded-full uppercase">AI</span>
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Ready to assist
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                                <button
                                    onClick={handleClearHistory}
                                    title="Clear chat"
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    title="AI Settings"
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                >
                                    <FiSettings size={14} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    title="Minimize"
                                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                                >
                                    <FiX size={15} />
                                </button>
                            </div>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto relative z-10 bg-slate-50/30">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary text-xl mb-3 shadow-inner">
                                        🚀
                                    </div>
                                    <h4 className="text-slate-800 font-bold text-sm mb-0.5">How can I help you?</h4>
                                    <p className="text-slate-400 text-[11px] max-w-[220px] mb-4">
                                        Ask me questions or request post drafts for your groups.
                                    </p>
                                    <div className="w-full space-y-1.5 text-left">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSend(s.text)}
                                                className="w-full text-left bg-white border border-slate-100 hover:border-primary/20 rounded-xl p-2.5 shadow-sm flex flex-col gap-0.5 transition-all hover:bg-primarylight/10"
                                            >
                                                <span className="text-[11px] text-slate-600 font-medium leading-normal">{s.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {messages.map((msg) => (
                                        <div key={msg.id}>
                                            {msg.senderId === user.uid ? (
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-gradient-to-br from-primary to-primarydark rounded-2xl rounded-tr-[4px] px-3.5 py-2 max-w-[85%] shadow-sm">
                                                        <div className="text-white text-[13px] leading-relaxed">{msg.text}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-start">
                                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-[4px] px-3.5 py-2 max-w-[90%] shadow-sm">
                                                        <div className="space-y-0.5">{parseMarkdown(msg.text)}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </AnimatePresence>
                            )}

                            {isTyping && (
                                <div className="flex flex-col items-start">
                                    <div className="bg-white border border-slate-100 rounded-xl px-3.5 py-2.5 shadow-sm">
                                        <div className="flex gap-1 items-center h-3">
                                            <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                            <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} className="h-1" />
                        </div>

                        {/* Input bar */}
                        <div className="bg-white border-t border-slate-100 px-3 py-2 pb-4 flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                                placeholder="Type a message..."
                                disabled={isTyping}
                                className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-4 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSend(input)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md flex-shrink-0 transition-colors ${input.trim() && !isTyping ? "bg-primary" : "bg-slate-200 pointer-events-none text-slate-400"}`}
                            >
                                <FiSend size={12} className="ml-0.5" />
                            </motion.button>
                        </div>

                        {/* Modal settings embedded */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end"
                                >
                                    <motion.div
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "100%" }}
                                        className="bg-white rounded-t-3xl p-5 w-full shadow-2xl relative border-t border-slate-100"
                                    >
                                        <button
                                            onClick={() => setShowSettings(false)}
                                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
                                        >
                                            <FiX size={13} />
                                        </button>

                                        <div className="flex items-center gap-2 mb-1.5">
                                            <FiKey className="text-primary" size={16} />
                                            <h4 className="text-slate-800 font-extrabold text-sm">AI Keys</h4>
                                        </div>
                                        <p className="text-slate-500 text-[10px] leading-relaxed mb-4">
                                            Paste your Gemini (AIzaSy...) or Groq (gsk_...) key. Keys are saved strictly in your local browser storage.
                                        </p>

                                        <div className="space-y-3 mb-4">
                                            <div>
                                                <input
                                                    type="password"
                                                    value={tempKey}
                                                    onChange={(e) => setTempKey(e.target.value)}
                                                    placeholder="Paste key here (gsk_... or AIzaSy...)"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/50 transition-all"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleSaveKey}
                                                    className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-primarydark transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <FiCheck size={12} /> Save Key
                                                </button>
                                                {apiKey && (
                                                    <button
                                                        onClick={handleDeleteKey}
                                                        className="bg-red-50 text-red-500 border border-red-100 px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>

                                            <AnimatePresence>
                                                {keySavedMessage && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-center text-[10px] text-green-600 font-bold bg-green-50 rounded-lg py-1 border border-green-100"
                                                    >
                                                        Key Saved Successfully!
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex gap-3 text-[10px] font-bold text-primary mt-2">
                                            <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                Gemini Console →
                                            </a>
                                            <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                Groq Console →
                                            </a>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
