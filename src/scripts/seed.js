import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const demoDataPath = path.resolve(__dirname, "../../firebase-demo-data.json");
const demoData = JSON.parse(fs.readFileSync(demoDataPath, "utf8"));

async function getOrCreateUser(email, password) {
  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log(
      `Created new auth user for ${email} -> UID: ${userCred.user.uid}`,
    );
    return userCred.user.uid;
  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
      const tempCred = await signInWithEmailAndPassword(auth, email, password);
      console.log(
        `Found existing auth user for ${email} -> UID: ${tempCred.user.uid}`,
      );
      return tempCred.user.uid;
    }
    throw e;
  }
}

async function run() {
  try {
    console.log("Setting up Firebase Auth accounts to get real UIDs...");

    // Use default password password123
    const superadminUid = await getOrCreateUser(
      "superadmin@demo.com",
      "password123",
    );
    const agent1Uid = await getOrCreateUser("sarah@demo.com", "password123");
    const agent2Uid = await getOrCreateUser("john@demo.com", "password123");
    const customer1Uid = await getOrCreateUser(
      "alice@company.com",
      "password123",
    );
    const customer2Uid = await getOrCreateUser("bob@startup.io", "password123");
    const customer3Uid = await getOrCreateUser(
      "charlie@movies.net",
      "password123",
    );

    console.log("\nUpdating demo data with real Auth UIDs...");

    // Remap demoData keeping the content but using real UIDs
    const newUsers = {
      [superadminUid]: demoData.users["superadmin_demo"],
      [agent1Uid]: demoData.users["agent_demo_1"],
      [agent2Uid]: demoData.users["agent_demo_2"],
      [customer1Uid]: demoData.users["customer_1"],
      [customer2Uid]: demoData.users["customer_2"],
      [customer3Uid]: demoData.users["customer_3"],
    };

    let chatsStr = JSON.stringify(demoData.chats);
    chatsStr = chatsStr.replace(/agent_demo_1/g, agent1Uid);
    chatsStr = chatsStr.replace(/agent_demo_2/g, agent2Uid);
    const newChats = JSON.parse(chatsStr);

    const finalData = {
      users: newUsers,
      chats: newChats,
      subscribers: demoData.subscribers,
      campaigns: demoData.campaigns,
    };

    console.log("Seeding data to Realtime Database...");
    const dbRef = ref(db, "/");
    await set(dbRef, finalData);

    console.log(
      "SUCCESS! Demo data seeded with real Auth bindings, subscribers, and campaigns.",
    );
    console.log("\nYOU CAN NOW LOGIN WITH:");
    console.log("Superadmin: superadmin@demo.com  | Password: password123");
    console.log("Agent 1:    sarah@demo.com       | Password: password123");
    console.log("Agent 2:    john@demo.com        | Password: password123");
    console.log("Customer 1: alice@company.com    | Password: password123");
    console.log("Customer 2: bob@startup.io       | Password: password123");
    console.log("Customer 3: charlie@movies.net   | Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

run();
