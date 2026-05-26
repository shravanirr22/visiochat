import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase/config"
import { findUserByPhone, createGroup } from "../firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiSearch, FiX, FiUsers, FiCheck } from "react-icons/fi"

export default function CreateGroup() {
    const navigate = useNavigate()
    const [groupName, setGroupName] = useState("")
    const [phoneInput, setPhoneInput] = useState("")
    const [selectedUsers, setSelectedUsers] = useState([])
    const [error, setError] = useState("")
    const [searching, setSearching] = useState(false)
    const [loading, setLoading] = useState(false)
    const user = auth.currentUser

    const handleAddByPhone = async () => {
        if (!phoneInput.trim()) return
        setSearching(true)
        setError("")
        try {
            const found = await findUserByPhone(phoneInput.trim())
            if (!found) {
                setError("No user found with this phone number!")
                return
            }
            if (found.id === user.uid) {
                setError("You are already the admin!")
                return
            }
            if (selectedUsers.find((u) => u.id === found.id)) {
                setError("User already added!")
                return
            }
            setSelectedUsers([...selectedUsers, found])
            setPhoneInput("")
        } catch (err) {
            setError("Something went wrong. Try again!")
        } finally {
            setSearching(false)
        }
    }

    const removeUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u.id !== userId))
    }

    const handleCreate = async () => {
        if (!groupName.trim()) {
            setError("Please enter group name!")
            return
        }
        setLoading(true)
        const memberIds = selectedUsers.map((u) => u.id)
        await createGroup(groupName, user.uid, memberIds)
        navigate("/chats")
    }

    return (
        <div className="min-h-screen bg-surface flex flex-col font-sans relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-full h-96 bg-primary/10 rounded-b-full blur-[100px] pointer-events-none"></div>

            {/* Top Bar */}
            <div className="bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <button onClick={() => navigate("/chats")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors">
                    <FiArrowLeft size={20} />
                </button>
                <h1 className="text-slate-800 text-xl font-extrabold tracking-tight ml-2">Create New Group</h1>
            </div>

            <div className="flex-1 px-4 sm:px-6 pt-6 pb-24 flex flex-col gap-6 relative z-10 max-w-lg mx-auto w-full">

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100">
                    {/* Group Name */}
                    <div className="flex flex-col gap-1.5 mb-6">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1 flex items-center gap-2">
                            <FiUsers size={14} className="text-primary" /> Group name
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. Class Group, Team Alpha"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                        />
                    </div>

                    {/* Add by Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">
                            Add members by phone
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <FiSearch size={16} />
                                </div>
                                <input
                                    type="tel"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddByPhone()}
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                                onClick={handleAddByPhone}
                                disabled={searching || !phoneInput.trim()}
                                className="bg-primary/10 text-primary border border-primary/20 px-5 rounded-2xl text-sm font-bold disabled:opacity-50 hover:bg-primary/20 transition-colors shadow-sm"
                            >
                                {searching ? "..." : "Add"}
                            </motion.button>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs font-medium mt-1 pl-1">
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Selected Members */}
                {selectedUsers.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">
                            Members added <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-1">{selectedUsers.length}</span>
                        </label>
                        <AnimatePresence>
                            {selectedUsers.map((u) => (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)]"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                        {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-slate-800 text-[15px] font-bold truncate">{u.name}</div>
                                        <div className="text-slate-400 text-xs font-medium">{u.phone}</div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, backgroundColor: "#FEE2E2" }} whileTap={{ scale: 0.9 }}
                                        onClick={() => removeUser(u.id)}
                                        className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        <FiX size={16} />
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

            </div>

            {/* Create Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-30">
                <div className="max-w-lg mx-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleCreate}
                        disabled={loading || !groupName.trim()}
                        className="w-full bg-gradient-to-r from-primary to-primarydark text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_8px_20px_rgb(107,76,255,0.3)] flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:scale-100"
                    >
                        {loading ? "Creating..." : <><FiCheck size={18} /> Create Group {selectedUsers.length > 0 && `(${selectedUsers.length})`}</>}
                    </motion.button>
                </div>
            </div>

        </div>
    )
}