import { User as FirebaseUser } from "firebase/auth";

export interface UserProfile {
  name: string;
  email: string;
  role: "customer" | "agent" | "superadmin";
  onlineStatus: boolean;
  lastSeen: number;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
}
