import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/config"
import { getUserGroups } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiMessageSquare, FiUsers, FiPhone, FiSettings, FiPlus, FiLogOut, FiCpu } from "react-icons/fi"
import AIWidget from "../components/AIWidget"
import AdminChat from "./adminchat"
import MemberChat from "./memberchat"

export default function Chats() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGroupId, setSelectedGroupId] = useState(null)
    const user = auth.currentUser

    useEffect(() => {
        const fetchGroups = async () => {
            if (!user) return
            const data = await getUserGroups(user.uid)
            setGroups(data)
            setTimeout(() => setLoading(false), 800)
        }
        fetchGroups()
    }, [user])

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    }

    return (
        <div className="min-h-screen bg-surface flex font-sans selection:bg-primary/30 relative overflow-hidden">
            
            {/* Left Pane (Chats Sidebar) */}
            <div className={`flex flex-col h-screen border-r border-slate-100/80 bg-white relative ${selectedGroupId ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] lg:w-[420px] flex-shrink-0 z-10`}>
                
                {/* Ambient Background Glows */}
                <div className="absolute top-0 left-0 w-full h-96 bg-primary/10 rounded-b-full blur-[100px] pointer-events-none"></div>

                {/* Premium Top Bar */}
                <div className="bg-white/70 backdrop-blur-3xl px-6 pt-12 pb-6 rounded-b-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border-b border-white/50 relative z-20">
                    <div className="flex items-center justify-between mb-6">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-slate-800 text-3xl font-extrabold tracking-tight drop-shadow-sm"
                        >
                            VisioChat
                        </motion.h1>
                        <div className="flex gap-3 items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate("/profile")}
                                className="relative w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-lg font-bold shadow-lg"
                            >
                                {user?.displayName?.charAt(0).toUpperCase() ?? "?"}
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-[2.5px] border-white rounded-full"></span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: "rgba(241,245,249,1)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { auth.signOut(); navigate("/login") }}
                                className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                <FiLogOut size={20} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Glassmorphic Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiSearch className="text-slate-400" size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full bg-slate-100/80 border border-white/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                        />
                    </motion.div>
                </div>

                {/* Groups List */}
                <div className="flex-1 overflow-y-auto px-4 pt-6 pb-28 relative z-10">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                key="skeleton"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center gap-4 px-3 py-3">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-200 animate-pulse"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-slate-200 rounded-md w-1/2 animate-pulse"></div>
                                            <div className="h-3 bg-slate-200 rounded-md w-3/4 animate-pulse"></div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : filteredGroups.length === 0 ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center h-64 gap-5 mt-4"
                            >
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                                    <FiMessageSquare className="text-primary text-4xl" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-slate-800 font-extrabold text-xl">No conversations</h3>
                                    <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto font-medium">Start chatting by creating or joining a new group</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="list"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="space-y-2"
                            >
                                {filteredGroups.map((group) => (
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(241, 245, 249, 0.8)" }}
                                        whileTap={{ scale: 0.98 }}
                                        key={group.id}
                                        onClick={() => setSelectedGroupId(group.id)}
                                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group relative border ${selectedGroupId === group.id ? 'bg-slate-100/80 border-slate-200/50 shadow-sm' : 'bg-white border-transparent hover:border-slate-100 hover:shadow-sm'}`}
                                    >
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:shadow-lg transition-shadow">
                                                {group.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[2.5px] border-white rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0 border-b border-slate-100 pb-3 group-last:border-none">
                                            <div className="flex justify-between items-baseline mb-1 mt-1">
                                                <h3 className="text-slate-800 font-bold text-base truncate pr-2">{group.name}</h3>
                                                <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
                                                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-slate-500 text-sm truncate pr-4 font-medium">
                                                    {group.adminId === user?.uid ? "You are the admin" : "Tap to open conversation"}
                                                </p>
                                                {group.members.length > 0 && (
                                                    <div className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-primary flex items-center justify-center text-[11px] text-white font-bold shadow-sm">
                                                        {group.members.length}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Glassmorphic Bottom Nav Inside Sidebar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/60 pb-5 pt-3 px-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                    <div className="flex justify-between max-w-md mx-auto">
                        <div className="flex flex-col items-center gap-1 cursor-pointer group relative">
                            <div className="px-5 py-1.5 rounded-2xl bg-primary/10 text-primary transition-all">
                                <FiMessageSquare size={22} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-primary font-bold mt-0.5">Chats</span>
                            <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full"></div>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="px-5 py-1.5 rounded-2xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-all">
                                <FiUsers size={22} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5 group-hover:text-slate-600 transition-colors">Groups</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="px-5 py-1.5 rounded-2xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-all">
                                <FiPhone size={22} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5 group-hover:text-slate-600 transition-colors">Calls</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                            <div className="px-5 py-1.5 rounded-2xl text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-700 transition-all">
                                <FiSettings size={22} className="stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold mt-0.5 group-hover:text-slate-600 transition-colors">Settings</span>
                        </div>
                    </div>
                </div>



            </div>

            {/* Right Pane (Active Chat or WhatsApp Web Empty State Placeholder) */}
            <div className={`flex-1 flex flex-col h-screen bg-slate-50 relative ${!selectedGroupId ? 'hidden md:flex' : 'flex'} z-0`}>
                {selectedGroupId ? (
                    (() => {
                        const activeGroup = groups.find(g => g.id === selectedGroupId)
                        const isAdmin = activeGroup ? activeGroup.adminId === user?.uid : false
                        if (isAdmin) {
                            return (
                                <div className="flex-1 h-full overflow-hidden flex flex-col">
                                    <AdminChat groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />
                                </div>
                            )
                        } else {
                            return (
                                <div className="flex-1 h-full overflow-hidden flex flex-col">
                                    <MemberChat groupId={selectedGroupId} onBack={() => setSelectedGroupId(null)} />
                                </div>
                            )
                        }
                    })()
                ) : (
                    /* Beautiful Empty State Placeholder */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 relative overflow-hidden h-full">
                        {/* Elegant grid background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-60"></div>
                        
                        <div className="relative z-10 max-w-md flex flex-col items-center gap-6">
                            <div className="w-28 h-28 rounded-[2.25rem] bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center shadow-inner relative animate-float">
                                <FiMessageSquare className="text-primary text-5xl drop-shadow-[0_4px_12px_rgba(107,76,255,0.2)]" />
                                <span className="absolute bottom-6 right-6 w-3.5 h-3.5 bg-accent rounded-full animate-ping"></span>
                                <span className="absolute bottom-6 right-6 w-3.5 h-3.5 bg-accent border-2 border-white rounded-full shadow-sm"></span>
                            </div>
                            <div>
                                <h2 className="text-slate-800 font-extrabold text-3xl tracking-tight mb-2">VisioChat Desktop</h2>
                                <p className="text-slate-500 text-[14px] font-medium leading-relaxed max-w-[320px] mx-auto">
                                    Select a group conversation from the sidebar list to start sending controlled, timed, or announcement messages.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white shadow-sm border border-slate-100 rounded-full px-4.5 py-2 mt-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Role-based controlled visibility enabled
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium FAB (fixed to bottom-right of page) */}
            <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-group")}
                className={`fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primarydark text-white rounded-2xl shadow-[0_8px_25px_rgb(107,76,255,0.4)] flex items-center justify-center z-30 transition-transform border border-white/20 ${selectedGroupId ? 'hidden md:flex' : 'flex'}`}
            >
                <FiPlus size={28} />
            </motion.button>

            {/* Floating AI Assistant Widget (fixed to bottom-right of page) */}
            <AIWidget isChatOpen={!!selectedGroupId} />

        </div>
    )
}