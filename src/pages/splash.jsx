import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function Splash() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-6">
            
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primarydark to-primarylight animate-gradient z-0"></div>
            
            {/* Glassmorphic Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[50px] z-0"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center w-full max-w-sm"
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.2 }}
                    className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-2xl border border-white/30"
                >
                    💬
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white text-4xl font-extrabold mb-3 tracking-tight drop-shadow-md text-center"
                >
                    VisioChat
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 text-center text-base leading-relaxed mb-12 font-medium px-4"
                >
                    Smart messaging with full control over who sees what and when
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-full flex flex-col gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/signup")}
                        className="w-full bg-white text-primarydark font-bold py-4 rounded-2xl text-base shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow"
                    >
                        Get Started
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/login")}
                        className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold py-4 rounded-2xl text-base hover:bg-white/20 transition-colors"
                    >
                        I already have an account
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    )
}