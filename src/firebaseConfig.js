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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { browserLocalPersistence, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const persistence = Platform.OS === 'web'
    ? browserLocalPersistence
    : getReactNativePersistence(AsyncStorage);

export const auth = initializeAuth(app, {
    persistence
});

export const db = getFirestore(app);

export default app;
