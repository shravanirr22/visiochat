import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { motion } from "framer-motion"

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                navigate("/login")
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-primarydark/5 animate-pulse z-0 pointer-events-none"></div>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 flex flex-col items-center gap-6"
                >
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 bg-gradient-to-br from-primary to-primarydark rounded-[1.5rem] flex items-center justify-center text-4xl shadow-[0_10px_30px_rgba(107,76,255,0.3)] border border-white/20"
                    >
                        💬
                    </motion.div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-primary font-bold text-sm tracking-wide uppercase">Authenticating...</div>
                    </div>
                </motion.div>
            </div>
        )
    }

    return user ? children : null
}