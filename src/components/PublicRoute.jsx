import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { motion } from "framer-motion"

export default function PublicRoute({ children }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                navigate("/chats")
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primarydark to-primarylight animate-gradient z-0"></div>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] z-0"></div>
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center gap-6 bg-white/10 backdrop-blur-3xl p-8 rounded-[2rem] border border-white/20 shadow-2xl"
                >
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-inner border border-white/30 backdrop-blur-md"
                    >
                        💬
                    </motion.div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-white font-bold text-sm tracking-wide uppercase">Loading...</div>
                    </div>
                </motion.div>
            </div>
        )
    }

    return children
}