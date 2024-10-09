import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB5wcxtVQENwRTe9W5xhGCxtxzCMrRMChQ",
    authDomain: "testqanda-71d0c.firebaseapp.com",
    projectId: "testqanda-71d0c",
    storageBucket: "testqanda-71d0c.appspot.com",
    messagingSenderId: "561203792963",
    appId: "1:561203792963:web:aff9cbc85436f523fd18f6",
    measurementId: "G-PP176HX70N"
  };
  
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

export default app;
