import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { getGroup, joinGroup } from "../firebase/firestore"
import { motion } from "framer-motion"
import { FiXCircle, FiCheckCircle, FiUsers, FiArrowRight } from "react-icons/fi"

export default function JoinGroup() {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const [group, setGroup] = useState(null)
    const [status, setStatus] = useState("loading")
    const [user, setUser] = useState(null)

    useEffect(() => {
        const fetchGroup = async () => {
            const data = await getGroup(groupId)
            if (!data) {
                setStatus("notfound")
                return
            }
            setGroup(data)
            setStatus("found")
        }
        fetchGroup()

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribe()
    }, [groupId])

    const handleJoin = async () => {
        if (!user) {
            localStorage.setItem("pendingGroupId", groupId)
            navigate("/signup")
            return
        }

        if (group.members.includes(user.uid)) {
            navigate(
                group.adminId === user.uid
                    ? `/chat/admin/${groupId}`
                    : `/chat/member/${groupId}`
            )
            return
        }

        setStatus("joining")
        await joinGroup(groupId, user.uid)
        setStatus("joined")
        setTimeout(() => {
            navigate(`/chat/member/${groupId}`)
        }, 1500)
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6">
            
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primarydark to-primarylight animate-gradient z-0"></div>
            
            {/* Glassmorphic Overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[40px] z-0"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 text-center flex flex-col items-center"
            >
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-primary to-primarydark rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg mb-6 text-white border border-white/20"
                >
                    💬
                </motion.div>
                
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">VisioChat</h1>

                {/* Loading */}
                {status === "loading" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-slate-500 font-medium text-sm">Loading group info...</div>
                    </motion.div>
                )}

                {/* Not Found */}
                {status === "notfound" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex flex-col items-center w-full">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <FiXCircle size={32} />
                        </div>
                        <div className="text-slate-800 font-extrabold text-xl mb-1">Invalid invite link</div>
                        <div className="text-slate-500 text-sm font-medium mb-8">This group does not exist or link has expired.</div>
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/")}
                            className="w-full bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl text-[15px] hover:bg-slate-200 transition-colors"
                        >
                            Go to Home
                        </motion.button>
                    </motion.div>
                )}

                {/* Group Found */}
                {status === "found" && group && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex flex-col items-center w-full">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-2xl font-extrabold text-primary mb-4 border border-primary/20">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-slate-800 font-extrabold text-xl mb-1">{group.name}</div>
                        <div className="text-slate-500 text-sm font-medium mb-8 flex items-center gap-1.5 justify-center">
                            <FiUsers size={14} className="text-primary" /> {group.members.length} members · You are invited!
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handleJoin}
                            className="w-full bg-gradient-to-r from-primary to-primarydark text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_8px_20px_rgb(107,76,255,0.3)] hover:shadow-[0_8px_25px_rgb(107,76,255,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                            {user ? "Join Group" : "Sign up to Join"} <FiArrowRight size={18} />
                        </motion.button>
                        
                        {!user && (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    localStorage.setItem("pendingGroupId", groupId)
                                    navigate("/login")
                                }}
                                className="mt-3 w-full bg-white/70 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-[14px] hover:bg-white transition-colors"
                            >
                                Already have an account? Login
                            </motion.button>
                        )}
                    </motion.div>
                )}

                {/* Joining */}
                {status === "joining" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-slate-500 font-medium text-sm">Joining {group?.name}...</div>
                    </motion.div>
                )}

                {/* Joined */}
                {status === "joined" && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex flex-col items-center w-full">
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                            className="w-16 h-16 bg-green-100 text-green-500 rounded-[1.25rem] flex items-center justify-center mb-4 border border-green-200"
                        >
                            <FiCheckCircle size={32} />
                        </motion.div>
                        <div className="text-slate-800 font-extrabold text-xl mb-1">Successfully Joined!</div>
                        <div className="text-slate-500 text-sm font-medium">Taking you to the group...</div>
                    </motion.div>
                )}

            </motion.div>
        </div>
    )
}