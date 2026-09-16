import type { Timestamp } from "firebase/firestore";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export type Friendship = {
  id: string;
  userId: string;
  friendId: string;
  status: FriendshipStatus;
  blockedBy: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

/** Id determinístico por par de usuarios: evita duplicados y simplifica las reglas. */
export function getFriendshipId(uidA: string, uidB: string): string {
  return uidA < uidB ? `${uidA}_${uidB}` : `${uidB}_${uidA}`;
}

/** Dado un friendship y mi uid, devuelve el uid de la otra persona. */
export function getOtherUid(friendship: Friendship, myUid: string): string {
  return friendship.userId === myUid ? friendship.friendId : friendship.userId;
}
