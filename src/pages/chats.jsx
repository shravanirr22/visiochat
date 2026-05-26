import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/config"
import { getUserGroups } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiMessageSquare, FiUsers, FiPhone, FiSettings, FiPlus, FiLogOut } from "react-icons/fi"

export default function Chats() {
    const navigate = useNavigate()
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
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
        <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary/30 relative">
            
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
                                    onClick={() =>
                                        navigate(
                                            group.adminId === user?.uid
                                                ? `/chat/admin/${group.id}`
                                                : `/chat/member/${group.id}`
                                        )
                                    }
                                    className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all group relative bg-white border border-transparent hover:border-slate-100 hover:shadow-sm"
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

            {/* Premium FAB */}
            <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/create-group")}
                className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primarydark text-white rounded-2xl shadow-[0_8px_25px_rgb(107,76,255,0.4)] flex items-center justify-center z-30 transition-transform border border-white/20"
            >
                <FiPlus size={28} />
            </motion.button>

            {/* Glassmorphic Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/60 pb-5 pt-3 px-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
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
    )
}