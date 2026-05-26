import { BrowserRouter, Routes, Route } from "react-router-dom"
import Splash from "./pages/splash"
import Login from "./pages/login"
import Signup from "./pages/signup"
import Chats from "./pages/chats"
import AdminChat from "./pages/adminchat"
import MemberChat from "./pages/memberchat"
import CreateGroup from "./pages/creategroup"
import ProtectedRoute from "./components/protectedroute"
import PublicRoute from "./components/PublicRoute"
import JoinGroup from "./pages/JoinGroup"
import Profile from "./pages/profile"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Splash /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
        <Route path="/chat/admin/:groupId" element={<ProtectedRoute><AdminChat /></ProtectedRoute>} />
        <Route path="/chat/member/:groupId" element={<ProtectedRoute><MemberChat /></ProtectedRoute>} />
        <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
        <Route path="/join/:groupId" element={<JoinGroup />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App