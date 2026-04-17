import { adminAuth, adminDb } from "../config/firebaseAdmin.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const demoDataPath = path.resolve(__dirname, "../../firebase-demo-data.json");
const demoData = JSON.parse(fs.readFileSync(demoDataPath, "utf8"));

async function resetRealtimeDatabase() {
  console.log("Clearing Realtime Database...");
  await adminDb.ref("/").set(null);
}

async function resetAuthenticationUsers() {
  console.log("Clearing Firebase Authentication users...");

  let nextPageToken;
  let deletedCount = 0;

  do {
    const listResult = await adminAuth.listUsers(1000, nextPageToken);
    const uids = listResult.users.map((user) => user.uid);

    if (uids.length > 0) {
      const deleteResult = await adminAuth.deleteUsers(uids);
      deletedCount += deleteResult.successCount;

      if (deleteResult.failureCount > 0) {
        console.warn(
          "Some auth users could not be deleted:",
          deleteResult.errors,
        );
      }
    }

    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  console.log(`Deleted ${deletedCount} auth users.`);
}

async function getOrCreateUser(email, password) {
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true,
    });

    console.log(
      `Created new auth user for ${email} -> UID: ${userRecord.uid}`,
    );
    return userRecord.uid;
  } catch (error) {
    if (
      error.code === "auth/email-already-in-use" ||
      error.code === "auth/email-already-exists"
    ) {
      const existingUser = await adminAuth.getUserByEmail(email);
      await adminAuth.updateUser(existingUser.uid, {
        emailVerified: true,
        password,
      });

      console.log(
        `Found existing auth user for ${email} -> UID: ${existingUser.uid}`,
      );
      return existingUser.uid;
    }

    throw error;
  }
}

async function run() {
  try {
    await resetRealtimeDatabase();
    await resetAuthenticationUsers();

    console.log("Setting up Firebase Auth accounts to get real UIDs...");

    const superadminUid = await getOrCreateUser(
      "superadmin@demo.com",
      "password123",
    );
    const agent1Uid = await getOrCreateUser("sarah@demo.com", "password123");
    const agent2Uid = await getOrCreateUser("john@demo.com", "password123");

    console.log("\nUpdating demo data with real Auth UIDs...");

    const newUsers = {
      [superadminUid]: demoData.users["superadmin_demo"],
      [agent1Uid]: demoData.users["agent_demo_1"],
      [agent2Uid]: demoData.users["agent_demo_2"],
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
    await adminDb.ref("/").set(finalData);

    console.log(
      "SUCCESS! Demo data seeded with real Auth bindings, subscribers, and campaigns.",
    );
    console.log("\nYOU CAN NOW LOGIN WITH:");
    console.log("Superadmin: superadmin@demo.com  | Password: password123");
    console.log("Agent 1:    sarah@demo.com       | Password: password123");
    console.log("Agent 2:    john@demo.com        | Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

run();
