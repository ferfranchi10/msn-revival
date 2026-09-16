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
  /** Avisar con un toast + sonido cuando un amigo se conecta (Fase 3). Default: true. */
  notifyFriendOnline: boolean;
  /** Avisar (toast + sonido + temblor) al recibir un zumbido (Fase 5). Default: true. */
  notifyNudge: boolean;
  /** Sonido al recibir un mensaje nuevo (adelanto puntual de Fase 6). Default: true. */
  notifyNewMessage: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
