import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'

export interface GradeNextUser {
  uid: string
  displayName: string
  email: string
  role: 'student' | 'mentor'
  streak: number
  xp: number
  exercisesDone: number
  joinedAt: Date | null
}

interface AuthContextValue {
  user: GradeNextUser | null
  firebaseUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: 'student' | 'mentor') => Promise<void>
  logout: () => Promise<void>
  updateUserXP: (xpDelta: number) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<GradeNextUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (fbUser: User) => {
    try {
      const snap = await getDoc(doc(db, 'users', fbUser.uid))
      if (snap.exists()) {
        const data = snap.data()
        setUser({
          uid: fbUser.uid,
          displayName: data.displayName ?? fbUser.displayName ?? 'Student',
          email: fbUser.email ?? '',
          role: data.role ?? 'student',
          streak: data.streak ?? 0,
          xp: data.xp ?? 0,
          exercisesDone: data.exercisesDone ?? 0,
          joinedAt: data.joinedAt?.toDate() ?? null,
        })
      }
    } catch {
      // Firestore not configured yet — use basic profile
      setUser({
        uid: fbUser.uid,
        displayName: fbUser.displayName ?? 'Student',
        email: fbUser.email ?? '',
        role: 'student',
        streak: 0,
        xp: 0,
        exercisesDone: 0,
        joinedAt: null,
      })
    }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        await fetchUserProfile(fbUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [fetchUserProfile])

  const login = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await fetchUserProfile(cred.user)
  }, [fetchUserProfile])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'mentor',
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    const profile: Record<string, unknown> = {
      displayName: name,
      email,
      role,
      streak: 0,
      xp: 0,
      exercisesDone: 0,
      joinedAt: serverTimestamp(),
    }
    try {
      await setDoc(doc(db, 'users', cred.user.uid), profile)
    } catch {
      // Firestore unavailable — continue anyway
    }
    await fetchUserProfile(cred.user)
  }, [fetchUserProfile])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    setFirebaseUser(null)
  }, [])

  const updateUserXP = useCallback(async (xpDelta: number) => {
    if (!user) return
    const newXP = Math.max(0, user.xp + xpDelta)
    setUser((u) => u ? { ...u, xp: newXP } : u)
    try {
      await setDoc(doc(db, 'users', user.uid), { xp: newXP }, { merge: true })
    } catch { /* offline */ }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout, updateUserXP }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
