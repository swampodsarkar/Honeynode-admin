import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCfwz5irJzMy1UGzVhqb4rmqL4z-jeeJzA",
  authDomain: "minerx-market.firebaseapp.com",
  databaseURL: "https://minerx-market-default-rtdb.firebaseio.com",
  projectId: "minerx-market",
  storageBucket: "minerx-market.firebasestorage.app",
  messagingSenderId: "1080849676320",
  appId: "1:1080849676320:web:1faa3502ad7899c6192445",
  measurementId: "G-E0SGPXWBQ4",
};

let app: FirebaseApp | null = null;

function getApp(): FirebaseApp {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

let _auth: Auth | null = null;
let _db: Database | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function getFirebaseDb(): Database {
  if (!_db) _db = getDatabase(getApp());
  return _db;
}

export const ADMIN_EMAILS = [
  "mdswampodsarkar@gmail.com",
  "admin@honeynode.io",
  "superadmin@honeynode.io",
];
