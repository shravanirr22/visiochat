import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "../firebase/config"
import { saveUser } from "../firebase/firestore"
import { motion } from "framer-motion"
import { FcGoogle } from "react-icons/fc"
import { FiUser, FiMail, FiPhone, FiLock, FiArrowLeft } from "react-icons/fi"

export default function Signup() {
    const navigate = useNavigate()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("teacher")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSignup = async () => {
        if (!name || !email || !password || !phone) {
            setError("Please fill all fields including phone number")
            return
        }
        try {
            setLoading(true)
            setError("")
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(userCredential.user, { displayName: name })

            await saveUser(userCredential.user, role, phone)
            navigate("/login")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        try {
            setLoading(true)
            setError("")
            const result = await signInWithPopup(auth, googleProvider)
            await saveUser(result.user, "student", phone)
            navigate("/chats")
        } catch (err) {
            setError("Google sign in failed. Try again!")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-10 px-4 sm:px-6">
            
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primarydark to-primarylight animate-gradient z-0"></div>
            
            {/* Glassmorphic Overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[40px] z-0"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-8 sm:p-10"
            >
                <button 
                    onClick={() => navigate("/")} 
                    className="absolute top-6 left-6 text-slate-400 hover:text-primary transition-colors p-2 bg-white/50 rounded-full"
                >
                    <FiArrowLeft size={20} />
                </button>

                <div className="text-center mb-6 mt-4">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create account</h1>
                    <p className="text-slate-500 mt-2 font-medium">Join VisioChat today</p>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Error */}
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
                            {error}
                        </motion.div>
                    )}

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Full name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiUser size={18} />
                            </div>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Phone number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiPhone size={18} />
                            </div>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Email address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiMail size={18} />
                            </div>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <FiLock size={18} />
                            </div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password"
                                className="w-full bg-white/60 border border-white/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2 mt-1">
                        <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">I am a</label>
                        <div className="flex gap-3">
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setRole("teacher")}
                                className={`flex-1 border-2 font-bold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 ${role === "teacher" ? "border-primary bg-primary/10 text-primary" : "border-white/50 bg-white/40 text-slate-500 hover:bg-white/60"}`}
                            >
                                👨‍🏫 Teacher
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setRole("student")}
                                className={`flex-1 border-2 font-bold py-3 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 ${role === "student" ? "border-primary bg-primary/10 text-primary" : "border-white/50 bg-white/40 text-slate-500 hover:bg-white/60"}`}
                            >
                                👨‍🎓 Student
                            </motion.button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSignup} disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-primarydark text-white font-bold py-4 rounded-2xl text-sm shadow-[0_8px_20px_rgb(107,76,255,0.3)] hover:shadow-[0_8px_25px_rgb(107,76,255,0.4)] transition-all mt-4 disabled:opacity-60 disabled:scale-100"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-1">
                        <div className="flex-1 h-[2px] bg-slate-200/60 rounded-full"></div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
                        <div className="flex-1 h-[2px] bg-slate-200/60 rounded-full"></div>
                    </div>

                    {/* Google */}
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)" }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={loading}
                        className="w-full bg-white/70 border border-white/50 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:scale-100"
                    >
                        <FcGoogle size={20} />
                        Continue with Google
                    </motion.button>

                    <p className="text-center text-sm text-slate-500 mt-2 font-medium">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/login")} className="text-primary font-bold cursor-pointer hover:text-primarydark transition-colors">
                            Sign in
                        </span>
                    </p>

                </div>
            </motion.div>
        </div>
    )
}