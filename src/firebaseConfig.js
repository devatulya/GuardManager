import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyADWO74Y8jqtxXLPUHD_R3BXLlhp4misTY",
    authDomain: "guard-manager-32196.firebaseapp.com",
    projectId: "guard-manager-32196",
    storageBucket: "guard-manager-32196.firebasestorage.app",
    messagingSenderId: "663757090429",
    appId: "1:663757090429:web:87973e8090d4939ec98b14",
    measurementId: "G-F5L7CP3H5F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Default getAuth() uses in-memory persistence in React Native if not configured
// We replace it with initializeAuth + AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;
