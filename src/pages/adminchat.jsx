import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendMessage, listenMessages } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiLink, FiSend, FiSettings, FiLock, FiEye, FiClock, FiVolume2, FiX } from "react-icons/fi"

export default function AdminChat() {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [visibility, setVisibility] = useState("everyone")
  const [isAnnounce, setIsAnnounce] = useState(false)
  const [isTimed, setIsTimed] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const bottomRef = useRef(null)
  const user = auth.currentUser

  useEffect(() => {
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
      type: isAnnounce ? "announce" : "normal",
      visibility: visibility,
      timed: isTimed,
    })
    setInput("")
  }

  const inviteLink = `${window.location.origin}/join/${groupId}`

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert("Link copied!")
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary/30 relative">

      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-0 w-full h-screen pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate("/chats")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-sm font-bold shadow-md">
          CG
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 text-base font-bold truncate">Class Group</div>
          <div className="text-primary text-[11px] font-bold uppercase tracking-wider">Admin View</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/10 border border-primary/20 px-4 py-2 rounded-full shadow-sm hover:bg-primary/15 transition-colors"
        >
          <FiLink size={14} /> Invite
        </motion.button>
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

              {/* My Message */}
              {msg.senderId === user.uid && msg.type !== "announce" && (
                <div className="flex flex-col items-end">
                  <div className="bg-gradient-to-br from-primary to-primarydark rounded-3xl rounded-tr-[4px] px-5 py-3 max-w-[80%] shadow-[0_4px_15px_rgba(107,76,255,0.2)]">
                    <div className="text-white text-[15px] leading-relaxed">{msg.text}</div>
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <span className="text-white/70 text-[10px] font-bold flex items-center gap-1">
                        {msg.timed ? <><FiClock size={10} /> Timed</> : msg.visibility === "selected" ? <><FiLock size={10}/> Selected</> : <><FiEye size={10}/> Everyone</>}
                      </span>
                      <span className="text-white/70 text-[10px] font-bold">
                        {msg.createdAt?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Member Message */}
              {msg.senderId !== user.uid && msg.type !== "announce" && (
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

      <div className="sticky bottom-0 z-30">
          {/* Admin Controls */}
          <div className="bg-white/90 backdrop-blur-xl border-t border-slate-100 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2 mb-2 text-primary font-bold text-[11px] uppercase tracking-wider">
                <FiSettings size={12} /> Admin Controls
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="text-xs font-bold border border-slate-200 rounded-xl px-4 py-2 text-slate-600 bg-slate-50 outline-none focus:border-primary/50 transition-colors cursor-pointer appearance-none flex-shrink-0"
              >
                <option value="everyone">👁️ Everyone</option>
                <option value="selected">🔒 Selected only</option>
              </select>
              <button
                onClick={() => setIsAnnounce(!isAnnounce)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isAnnounce ? "bg-primary text-white border-primary shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FiVolume2 size={14} /> Announce
              </button>
              <button
                onClick={() => setIsTimed(!isTimed)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  isTimed ? "bg-primary text-white border-primary shadow-md" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <FiClock size={14} /> Timed
              </button>
            </div>
          </div>

          {/* Input */}
          <div className="bg-white/95 backdrop-blur-xl px-4 py-3 pb-6 flex items-end gap-2">
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-3xl min-h-[48px] px-5 py-3 flex items-center shadow-inner">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
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

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center z-50">
            <motion.div 
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[2.5rem] p-8 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowShare(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <FiX size={18} />
              </button>

              <div className="text-slate-800 font-extrabold text-2xl mb-1">
                Invite Members
              </div>
              <div className="text-slate-500 font-medium text-sm mb-6">
                Share this link to invite people to your group
              </div>

              {/* Link Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <FiLink size={14} />
                </div>
                <div className="flex-1 text-slate-700 text-sm font-medium truncate">
                  {inviteLink}
                </div>
                <button
                  onClick={copyLink}
                  className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors flex-shrink-0"
                >
                  Copy
                </button>
              </div>

              {/* Share Options */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* WhatsApp */}
                <button
                  onClick={() => window.open(`https://wa.me/?text=Join my group on VisioChat! ${inviteLink}`)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-[#E8F8F5] border border-[#A3E4D7] hover:bg-[#D1F2EB] transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">📱</span>
                  <span className="text-[11px] text-[#117A65] font-extrabold uppercase tracking-wider">WhatsApp</span>
                </button>

                {/* SMS */}
                <button
                  onClick={() => window.open(`sms:?body=Join my group on VisioChat! ${inviteLink}`)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">💬</span>
                  <span className="text-[11px] text-blue-700 font-extrabold uppercase tracking-wider">SMS</span>
                </button>

                {/* Email */}
                <button
                  onClick={() => window.open(`mailto:?subject=Join my VisioChat group&body=Join my group on VisioChat! ${inviteLink}`)}
                  className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">📧</span>
                  <span className="text-[11px] text-slate-600 font-extrabold uppercase tracking-wider">Email</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}