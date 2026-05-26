# 💬 VisioChat

> **Smart messaging with full control over who sees what and when.**

VisioChat is a role-based controlled group messaging system where admins can control message visibility per member in real time. Unlike WhatsApp or Telegram, VisioChat allows sending a message inside a group where some members see it while others see a locked placeholder — all inside one single group.

---

## 🚀 Live Demo

🔗 [Coming Soon — Deploy on Vercel]

---

## ✨ Features

- 🔒 **Controlled Message Visibility** — Admin controls who sees each message
- 📢 **Announcement Mode** — Send highlighted broadcast messages to the group
- ⏰ **Timed Message Release** — Messages auto-reveal at a scheduled time
- 👁️ **Hidden Message Placeholder** — Members see a lock icon instead of restricted content
- 👨‍🏫 **Role Based Access** — Teacher/Admin vs Student/Member roles
- 📱 **Add Members by Phone Number** — Search and add users by their registered phone number
- 🔥 **Real Time Messaging** — Powered by Firebase Firestore live sync
- 🔐 **Firebase Authentication** — Email/Password and Google Sign-In
- 🤖 **AI Integration** — Claude AI powered smart suggestions *(coming soon)*
- 📦 **Bulk Messaging** — Send personalized messages to multiple members *(coming soon)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| State Management | Zustand |
| Authentication | Firebase Auth |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Animation | Framer Motion |
| AI Integration | Claude API *(coming soon)* |
| Deployment | Vercel |

---

## 📁 Project Structure

```
visiochat/
├── src/
│   ├── firebase/
│   │   ├── config.js         → Firebase configuration
│   │   └── firestore.js      → Firestore helper functions
│   ├── pages/
│   │   ├── Splash.jsx        → Landing screen
│   │   ├── Login.jsx         → Login screen
│   │   ├── Signup.jsx        → Signup screen
│   │   ├── Chats.jsx         → Chat list screen
│   │   ├── CreateGroup.jsx   → Create group screen
│   │   ├── AdminChat.jsx     → Admin chat view
│   │   └── MemberChat.jsx    → Member chat view
│   ├── App.jsx               → Main app with routing
│   └── main.jsx              → Entry point
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Firebase account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/visiochat.git

# Navigate to project folder
cd visiochat

# Install dependencies
npm install

# Start development server
npm run dev
```

### Firebase Setup

1. Go to [firebase.google.com](https://firebase.google.com)
2. Create a new project named **visiochat**
3. Enable **Authentication** → Email/Password and Google
4. Enable **Firestore Database** in test mode
5. Copy your Firebase config
6. Create `src/firebase/config.js`:

```js
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export default app
```

### Firestore Rules

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Deployment Configuration (Fixing 404 Errors)

Since VisioChat is a React Single Page Application (SPA), direct navigation to deep links (like `/join/group-id`) might result in a 404 error on standard hosting platforms. We have included configuration files to fix this:

- **Vercel**: The `vercel.json` file in the root directory routes all fallback traffic to `index.html`.
- **Netlify**: The `public/_redirects` file handles the fallback routing.
- **Firebase Hosting**: If using Firebase, ensure your `firebase.json` has a rewrite rule mapping `"**"` to `"/index.html"`.

---

## 🗺️ Roadmap

- [x] Splash, Login, Signup screens
- [x] Firebase Authentication
- [x] Google Sign-In
- [x] Real time messaging with Firestore
- [x] Admin and Member chat views
- [x] Visibility control (Everyone / Selected)
- [x] Announcement mode
- [x] Timed message release
- [x] Add members by phone number
- [x] Create group feature
- [ ] Push notifications with FCM
- [ ] Invite link to join group
- [ ] AI powered smart suggestions
- [ ] Bulk personalized messaging
- [ ] Image and video sharing
- [ ] Deploy on Vercel

---

## 🤔 Why VisioChat?

Existing messaging platforms like WhatsApp give admins control over **who can send** messages but zero control over **who can see** a specific message inside the same group.

VisioChat solves exactly that — **one group, per message visibility control.**

| Feature | WhatsApp | Telegram | VisioChat |
|---|---|---|---|
| Group messaging | ✅ | ✅ | ✅ |
| Role based access | ⚠️ Partial | ⚠️ Partial | ✅ Full |
| Per message visibility | ❌ | ❌ | ✅ |
| Timed message release | ❌ | ❌ | ✅ |
| Hidden placeholder | ❌ | ❌ | ✅ |
| AI suggestions | ❌ | ❌ | ✅ Soon |


---

## 📄 License

This project is licensed under the MIT License.

---

⭐ **If you found this project helpful, please give it a star!**