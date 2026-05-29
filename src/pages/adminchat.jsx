import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { auth } from "../firebase/config"
import { sendMessage, listenMessages, uploadChatFile } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiLink, FiSend, FiSettings, FiLock, FiEye, FiClock, FiVolume2, FiX, FiPlus, FiImage, FiFileText, FiPaperclip, FiDownload } from "react-icons/fi"

const renderMessageContent = (msg, isMe) => {
  const hasFile = !!msg.fileUrl
  const isImage = hasFile && msg.fileType?.startsWith("image/")

  if (!hasFile) {
    return <div className={isMe ? "text-white text-[15px] leading-relaxed" : "text-slate-800 text-[15px] leading-relaxed"}>{msg.text}</div>
  }

  if (isImage) {
    return (
      <div className="flex flex-col gap-2 max-w-sm">
        <motion.img 
          whileHover={{ scale: 1.01 }}
          src={msg.fileUrl} 
          alt={msg.fileName || "Image"} 
          className="max-h-64 object-cover rounded-2xl w-full cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          onClick={() => window.open(msg.fileUrl, '_blank')}
        />
        {msg.text && msg.text !== msg.fileName && (
          <div className={isMe ? "text-white text-[15px] leading-relaxed mt-1" : "text-slate-800 text-[15px] leading-relaxed mt-1"}>{msg.text}</div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${isMe ? 'bg-white/15 border-white/20 text-white' : 'bg-slate-50 border-slate-200/80 text-slate-800'} max-w-xs`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-white/25 text-white' : 'bg-primary/10 text-primary'}`}>
        <FiPaperclip size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold truncate">{msg.fileName || "File"}</div>
        <div className={`text-[10px] ${isMe ? 'text-white/60' : 'text-slate-400'} font-semibold mt-0.5`}>
          {msg.fileSize ? `${(msg.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
        </div>
      </div>
      <a 
        href={msg.fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        download={msg.fileName}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-800'}`}
      >
        <FiDownload size={16} />
      </a>
    </div>
  )
}

export default function AdminChat({ groupId: propGroupId, onBack }) {
  const navigate = useNavigate()
  const { groupId: routeGroupId } = useParams()
  const groupId = propGroupId || routeGroupId
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [visibility, setVisibility] = useState("everyone")
  const [isAnnounce, setIsAnnounce] = useState(false)
  const [isTimed, setIsTimed] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileTypeAccept, setFileTypeAccept] = useState("*")
  const bottomRef = useRef(null)
  const uploadMenuRef = useRef(null)
  const fileInputRef = useRef(null)
  const user = auth.currentUser

  useEffect(() => {
    function handleClickOutside(event) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) {
        setShowUploadMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setShowUploadMenu(false)
    setUploading(true)
    setUploadProgress(0)

    try {
      const url = await uploadChatFile(groupId, file, (progress) => {
        setUploadProgress(Math.round(progress))
      })

      await sendMessage(groupId, {
        text: file.name,
        senderId: user.uid,
        senderName: user.displayName,
        type: isAnnounce ? "announce" : "normal",
        visibility: visibility,
        timed: isTimed,
        fileUrl: url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })
    } catch (err) {
      console.error("Upload error:", err)
      alert("File upload failed. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const triggerFileInput = (acceptType) => {
    setFileTypeAccept(acceptType)
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 50)
  }

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
      <div className={`bg-white/80 backdrop-blur-2xl border-b border-slate-100 px-4 ${propGroupId ? 'pt-4' : 'pt-12'} pb-4 flex items-center gap-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]`}>
        <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors">
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
                    {renderMessageContent(msg, true)}
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
                    {renderMessageContent(msg, false)}
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
          <div className="bg-white/95 backdrop-blur-xl px-4 py-3 pb-6 flex items-end gap-2 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept={fileTypeAccept}
              className="hidden" 
            />

            {/* Uploading Progress Notification Overlay */}
            <AnimatePresence>
              {uploading && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute inset-x-4 bottom-20 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg z-30"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-spin">
                    <FiClock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 text-sm font-bold truncate">Uploading attachment...</div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                      <motion.div 
                        className="bg-primary h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                  <div className="text-primary text-xs font-black whitespace-nowrap">{uploadProgress}%</div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-3xl min-h-[48px] px-3 py-2 flex items-center shadow-inner relative gap-2">
                {/* Upload Popup Trigger and Menu */}
                <div className="relative" ref={uploadMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/5 shadow-sm transition-colors flex-shrink-0"
                  >
                    <FiPlus size={18} className={`transition-transform duration-200 ${showUploadMenu ? 'rotate-45' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showUploadMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 450, damping: 28 }}
                        className="absolute bottom-12 left-0 bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.12)] min-w-[200px] flex flex-col gap-1 z-40"
                      >
                        <button
                          onClick={() => triggerFileInput("image/*,video/*")}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-700 text-sm font-semibold transition-colors text-left w-full"
                        >
                          <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center flex-shrink-0">
                            <FiImage size={16} />
                          </span>
                          Photos & Videos
                        </button>
                        <button
                          onClick={() => triggerFileInput("*")}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-slate-700 text-sm font-semibold transition-colors text-left w-full"
                        >
                          <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                            <FiFileText size={16} />
                          </span>
                          Document
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-[15px] text-slate-800 placeholder-slate-400 outline-none pr-2"
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