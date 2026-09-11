import type { Timestamp } from "firebase/firestore";
import type { UserStatus } from "./status";

export type UserProfile = {
  displayName: string;
  username: string;
  usernameLower: string;
  email: string;
  avatarId: string;
  status: UserStatus;
  personalMessage: string;
  activity: string;
  isOnline: boolean;
  lastSeen: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
