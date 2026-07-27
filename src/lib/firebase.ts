// Firebase configuration for GradeNext Portal
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCNYB_H-ykvJ0rUrohGFwYoSsA7SKltLLI',
  authDomain: 'gradenext-portal-app.firebaseapp.com',
  projectId: 'gradenext-portal-app',
  storageBucket: 'gradenext-portal-app.firebasestorage.app',
  messagingSenderId: '479122548138',
  appId: '1:479122548138:web:99578ed0bcd05a202477d3',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app

