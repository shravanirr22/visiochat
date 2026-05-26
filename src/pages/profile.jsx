import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { updateProfile, signOut } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { auth, storage, db } from "../firebase/config"
import { motion, AnimatePresence } from "framer-motion"
import { FiArrowLeft, FiCamera, FiCheck, FiLogOut, FiUser, FiPhone, FiMail, FiBookOpen } from "react-icons/fi"

export default function Profile() {
  const navigate = useNavigate()
  const user = auth.currentUser
  const [name, setName] = useState(user?.displayName || "")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setPhone(data.phone || "")
        setRole(data.role || "student")
        setPhotoURL(data.photoURL || user?.photoURL || "")
      }
    }
    fetchUser()
  }, [])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
      await updateProfile(user, { photoURL: url })
      await updateDoc(doc(db, "users", user.uid), { photoURL: url })
    } catch (err) {
      console.log("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await updateProfile(user, { displayName: name })
      await updateDoc(doc(db, "users", user.uid), {
        name: name,
        phone: phone,
        role: role,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.log("Update error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-primary/20 to-primarydark/10 rounded-b-full blur-[100px] pointer-events-none z-0"></div>

      {/* Top Bar */}
      <div className="bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-4 pt-12 pb-4 flex items-center gap-3 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate("/chats")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-600 hover:bg-slate-200 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-slate-800 text-xl font-extrabold tracking-tight ml-2">My Profile</h1>
      </div>

      <div className="flex-1 px-4 sm:px-6 pt-8 pb-10 flex flex-col items-center gap-6 relative z-10 max-w-lg mx-auto w-full">

        {/* Profile Photo */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative group">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-28 h-28 rounded-[2rem] object-cover border-[6px] border-white shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-primary to-primarydark flex items-center justify-center text-white text-4xl font-extrabold border-[6px] border-white shadow-xl">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Upload Button */}
            <label className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg border border-slate-100 text-primary hover:bg-slate-50 transition-colors">
              <FiCamera size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          {uploading && (
            <div className="text-primary font-medium text-xs bg-primary/10 px-3 py-1 rounded-full animate-pulse">Uploading photo...</div>
          )}
        </motion.div>

        {/* Form Container */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full bg-white rounded-[2rem] p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-5 mt-2">

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-green-50 border border-green-200 text-green-700 font-bold text-[13px] px-4 py-3 rounded-2xl flex items-center gap-2 mb-2">
                <FiCheck size={16} /> Profile updated successfully!
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1 flex items-center gap-2">
              <FiUser size={14} className="text-primary" /> Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1 flex items-center gap-2">
              <FiPhone size={14} className="text-primary" /> Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
            />
          </div>

          {/* Email - readonly */}
          <div className="flex flex-col gap-1.5 opacity-70">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1 flex items-center gap-2">
              <FiMail size={14} className="text-primary" /> Email address
            </label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] text-slate-500 outline-none cursor-not-allowed"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-3 mt-2">
            <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1 flex items-center gap-2">
              <FiBookOpen size={14} className="text-primary" /> I am a
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setRole("teacher")}
                className={`flex-1 border-2 font-bold py-3.5 rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2 ${
                  role === "teacher"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">👨‍🏫</span> Teacher
              </button>
              <button
                onClick={() => setRole("student")}
                className={`flex-1 border-2 font-bold py-3.5 rounded-2xl text-[14px] transition-all flex items-center justify-center gap-2 ${
                  role === "student"
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">👨‍🎓</span> Student
              </button>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-2"></div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primarydark text-white font-bold py-4 rounded-2xl text-[15px] shadow-[0_8px_20px_rgb(107,76,255,0.3)] flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:scale-100"
          >
            {loading ? "Saving..." : "Save Changes"}
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "#FEE2E2" }} whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full bg-slate-50 border border-red-100 text-red-500 font-bold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-2 transition-colors"
          >
            <FiLogOut size={18} /> Logout
          </motion.button>

        </motion.div>
      </div>
    </div>
  )
}