import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase/config"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"
import { FiMail, FiLock } from "react-icons/fi"

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please fill all fields")
            return
        }
        try {
            setLoading(true)
            setError("")
            await signInWithEmailAndPassword(auth, email, password)
            navigate("/chats")
        } catch (err) {
            setError("Invalid email or password")
        } finally {
            setLoading(false)
        }
    }

    const pendingGroupId = localStorage.getItem("pendingGroupId")
    if (pendingGroupId) {
        navigate(`/join/${pendingGroupId}`, { replace: true })
        localStorage.removeItem("pendingGroupId")
    }

    const handleGoogle = async () => {
        try {
            setLoading(true)
            setError("")
            await signInWithPopup(auth, googleProvider)
            navigate("/chats")
        } catch (err) {
            setError("Google sign in failed. Try again!")
        } finally {
            setLoading(false)
        }
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
                className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-10"
            >
                <div className="text-center mb-8">
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                        className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primarydark rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-6"
                    >
                        💬
                    </motion.div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome back!</h1>
                    <p className="text-slate-500 mt-2 font-medium">Sign in to VisioChat</p>
                </div>

                <div className="flex flex-col gap-5">
                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                            {error}
                        </motion.div>
                    )}

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-sm font-semibold pl-1">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiMail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@email.com"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-sm font-semibold pl-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiLock size={18} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-primary text-sm cursor-pointer font-bold hover:text-primarydark transition-colors">
                            Forgot password?
                        </span>
                    </div>

                    {/* Sign In Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-primarydark text-white font-bold py-4 rounded-2xl text-sm shadow-[0_8px_20px_rgb(107,76,255,0.3)] hover:shadow-[0_8px_25px_rgb(107,76,255,0.4)] transition-all disabled:opacity-60 disabled:scale-100"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-2">
                        <div className="flex-1 h-[2px] bg-slate-200/60 rounded-full"></div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
                        <div className="flex-1 h-[2px] bg-slate-200/60 rounded-full"></div>
                    </div>

                    {/* Google Button */}
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full bg-white/70 border border-white/50 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100"
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </motion.button>

                    <p className="text-center text-sm text-slate-500 mt-2 font-medium">
                        New here?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="text-primary font-bold cursor-pointer hover:text-primarydark transition-colors"
                        >
                            Create account
                        </span>
                    </p>

                </div>
            </motion.div>
        </div>
    )
}