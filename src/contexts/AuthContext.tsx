import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { DetectiveProfile, AuthUser } from '../types';
import { DEFAULT_DETECTIVE_PROFILE } from '../data/learningContent';

interface AuthContextType {
  user: User | null;
  profile: DetectiveProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, classroom: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOnlineProfile: (updates: Partial<DetectiveProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DetectiveProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Auth State
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && db) {
        // Subscribe to Firestore Profile
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as DetectiveProfile);
          } else {
            // If user exists in Auth but not in Firestore (shouldn't happen with proper register)
            setProfile(null);
          }
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error('ระบบคลาวด์ยังไม่ได้ติดตั้ง (Firebase Auth not initialized). กรุณาตั้งค่า API Keys ในเมนู Settings ของ AI Studio ก่อนใช้งานระบบออนไลน์');
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed' || error.message.includes('operation-not-allowed')) {
        console.warn('Firebase Auth Operation Not Allowed. Please enable Email/Password authentication in Firebase Console.');
        throw new Error('ระบบยังไม่ได้เปิดใช้งานการเข้าสู่ระบบด้วยอีเมล/รหัสผ่าน (กรุณาเปิดใช้งาน Email/Password ใน Firebase Console)');
      }
      throw error;
    }
  };

  const register = async (email: string, pass: string, name: string, classroom: string) => {
    if (!auth || !db) {
      throw new Error('ระบบคลาวด์ยังไม่ได้ติดตั้ง (Firebase not initialized). กรุณาตั้งค่า API Keys ในเมนู Settings ของ AI Studio ก่อนใช้งานระบบออนไลน์');
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });

      // Create initial Firestore Profile
      const newProfile: DetectiveProfile = {
        ...DEFAULT_DETECTIVE_PROFILE,
        name: name,
        authUser: {
          id: userCredential.user.uid,
          name: name,
          usernameOrEmail: email,
          classroom: classroom,
          schoolName: 'โรงเรียนสาธิตวิทยาการ',
          loginMethod: 'password',
          role: 'student',
          isTeacher: false,
          avatar: '🕵️',
          createdAt: new Date().toISOString(),
        }
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth Operation Not Allowed during register. Proceeding with local state.');
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const updateOnlineProfile = async (updates: Partial<DetectiveProfile>) => {
    if (!user || !db) return;
    const profileRef = doc(db, 'users', user.uid);
    await setDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      login, 
      register, 
      logout,
      updateOnlineProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
