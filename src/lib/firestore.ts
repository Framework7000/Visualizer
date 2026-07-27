import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

export interface LeaderboardEntry {
  uid: string
  displayName: string
  xp: number
  streak: number
  exercisesDone: number
  role: 'student' | 'mentor'
}

// Fetch top N leaderboard entries (one-time)
export async function fetchLeaderboard(count = 50): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(count),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      return {
        uid: d.id,
        displayName: data.displayName ?? 'Anonymous',
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        exercisesDone: data.exercisesDone ?? 0,
        role: data.role ?? 'student',
      }
    })
  } catch {
    return []
  }
}

// Subscribe to live leaderboard updates
export function subscribeLeaderboard(
  count: number,
  onUpdate: (entries: LeaderboardEntry[]) => void,
): Unsubscribe {
  try {
    const q = query(
      collection(db, 'users'),
      orderBy('xp', 'desc'),
      limit(count),
    )
    return onSnapshot(q, (snap) => {
      const entries = snap.docs.map((d) => {
        const data = d.data()
        return {
          uid: d.id,
          displayName: data.displayName ?? 'Anonymous',
          xp: data.xp ?? 0,
          streak: data.streak ?? 0,
          exercisesDone: data.exercisesDone ?? 0,
          role: data.role ?? 'student',
        }
      })
      onUpdate(entries)
    })
  } catch {
    return () => {}
  }
}

// Get a specific user's rank
export async function getUserRank(uid: string): Promise<number> {
  try {
    const q = query(collection(db, 'users'), orderBy('xp', 'desc'))
    const snap = await getDocs(q)
    const idx = snap.docs.findIndex((d) => d.id === uid)
    return idx === -1 ? -1 : idx + 1
  } catch {
    return -1
  }
}

// Demo data for when Firebase is not yet configured
export function getDemoLeaderboard(): LeaderboardEntry[] {
  return [
    { uid: '1', displayName: 'Aryan Singh', xp: 980, streak: 14, exercisesDone: 24, role: 'student' },
    { uid: '2', displayName: 'Priya Sharma', xp: 850, streak: 9, exercisesDone: 20, role: 'student' },
    { uid: '3', displayName: 'Rohan Gupta', xp: 720, streak: 7, exercisesDone: 18, role: 'student' },
    { uid: '4', displayName: 'Ananya Patel', xp: 640, streak: 5, exercisesDone: 15, role: 'student' },
    { uid: '5', displayName: 'Dev Malhotra', xp: 580, streak: 4, exercisesDone: 13, role: 'student' },
    { uid: '6', displayName: 'Kavya Nair', xp: 510, streak: 6, exercisesDone: 11, role: 'student' },
    { uid: '7', displayName: 'Siddharth Rao', xp: 470, streak: 3, exercisesDone: 10, role: 'student' },
    { uid: '8', displayName: 'Ishaan Verma', xp: 390, streak: 2, exercisesDone: 8, role: 'student' },
    { uid: '9', displayName: 'Aisha Khan', xp: 310, streak: 5, exercisesDone: 7, role: 'student' },
    { uid: '10', displayName: 'Nikhil Joshi', xp: 250, streak: 1, exercisesDone: 5, role: 'student' },
  ]
}
