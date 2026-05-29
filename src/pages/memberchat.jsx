import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendMessage, listenMessages } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiSend, FiVolume2, FiLock } from "react-icons/fi"

export default function MemberChat({ groupId: propGroupId, onBack }) {
    const navigate = useNavigate()
    const { groupId: routeGroupId } = useParams()
    const groupId = propGroupId || routeGroupId
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const bottomRef = useRef(null)
    const user = auth.currentUser

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate("/chats")
        }
    }

    useEffect(() => {
        if (!groupId) return
        const unsubscribe = listenMessages(groupId, (msgs) => {
            setMessages(msgs)
        })
        return () => unsubscribe()
    }, [groupId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return
        await sendMessage(groupId, {
            text: input,
            senderId: user.uid,
            senderName: user.displayName,
            type: "normal",
            visibility: "everyone",
        })
        setInput("")
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary/30 relative">

            {/* Ambient Background Glow */}
            <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Top Bar */}
            <div className={`bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-4 ${propGroupId ? 'pt-4' : 'pt-12'} pb-4 flex items-center gap-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]`}>
                <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FiArrowLeft size={20} />
                </button>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-sm font-bold shadow-md">
                    CG
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-slate-800 text-base font-bold truncate">Class Group</div>
                    <div className="text-primary text-[11px] font-bold uppercase tracking-wider">Member View</div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 px-4 py-6 flex flex-col gap-4 overflow-y-auto relative z-10">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >

                            {/* Announcement */}
                            {msg.type === "announce" && (
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl px-5 py-4 shadow-sm my-2 backdrop-blur-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                    <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2 uppercase tracking-wide">
                                        <FiVolume2 size={14} /> Announcement
                                    </div>
                                    <div className="text-slate-800 text-sm font-medium leading-relaxed">{msg.text}</div>
                                    <div className="text-slate-400 text-[10px] font-bold mt-2 text-right">
                                        {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                </div>
                            )}

                            {/* Hidden Message */}
                            {msg.type === "normal" && msg.visibility === "selected" && msg.senderId !== user.uid && (
                                <div className="flex flex-col items-start">
                                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl rounded-tl-[4px] px-5 py-3 max-w-[80%]">
                                        <div className="flex items-center gap-2 text-slate-500 text-[13px] font-medium italic">
                                            <FiLock size={14} /> This message is not visible to you
                                        </div>
                                        <div className="text-slate-400 text-[10px] font-bold mt-2 text-right">
                                            {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* My Message */}
                            {msg.senderId === user.uid && msg.type !== "announce" && (
                                <div className="flex flex-col items-end">
                                    <div className="bg-gradient-to-br from-primary to-primarydark rounded-3xl rounded-tr-[4px] px-5 py-3 max-w-[80%] shadow-[0_4px_15px_rgba(107,76,255,0.2)]">
                                        <div className="text-white text-[15px] leading-relaxed">{msg.text}</div>
                                        <div className="text-white/70 text-[10px] font-bold mt-2 text-right">
                                            {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other Member Normal Message */}
                            {msg.senderId !== user.uid && msg.type === "normal" && msg.visibility === "everyone" && (
                                <div className="flex flex-col items-start">
                                    <div className="text-[11px] font-bold text-slate-400 mb-1 ml-2">{msg.senderName}</div>
                                    <div className="bg-white border border-slate-100 rounded-3xl rounded-tl-[4px] px-5 py-3 max-w-[80%] shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
                                        <div className="text-slate-800 text-[15px] leading-relaxed">{msg.text}</div>
                                        <div className="text-slate-400 text-[10px] font-bold mt-2 text-right">
                                            {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={bottomRef} className="h-2" />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 z-30">
                <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-3 pb-6 flex items-end gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    <div className="flex-1 bg-slate-100 border border-slate-200 rounded-3xl min-h-[48px] px-5 py-3 flex items-center shadow-inner">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type a reply..."
                            className="w-full bg-transparent text-[15px] text-slate-800 placeholder-slate-400 outline-none"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-colors ${input.trim() ? "bg-primary" : "bg-slate-300 pointer-events-none"}`}
                    >
                        <FiSend size={18} className="ml-1" />
                    </motion.button>
                </div>
            </div>

        </div>
    )
}