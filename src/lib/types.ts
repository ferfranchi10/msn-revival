import type { Timestamp } from "firebase/firestore";
import type { UserStatus } from "./status";

export type UserProfile = {
  displayName: string;
  username: string;
  usernameLower: string;
  avatarId: string;
  /** URL de una imagen propia como avatar (Fase 7). Si está presente, tiene prioridad sobre `avatarId`. Opcional: los perfiles creados antes no la tienen. */
  avatarUrl?: string;
  status: UserStatus;
  personalMessage: string;
  activity: string;
  /** Avisar con un toast + sonido cuando un amigo se conecta (Fase 3). Default: true. */
  notifyFriendOnline: boolean;
  /** Avisar (toast + sonido + temblor) al recibir un zumbido (Fase 5). Default: true. */
  notifyNudge: boolean;
  /** Avisar (toast + sonido) al recibir un mensaje nuevo (Fase 6). Default: true. */
  notifyNewMessage: boolean;
  /** Avisar (toast + sonido) al recibir una solicitud de amistad (Fase 6). Default: true. */
  notifyFriendRequest: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
