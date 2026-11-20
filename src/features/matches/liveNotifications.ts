export type LiveLike = {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  receivedAt: number;
};

export const liveLikesKey = (userId: string) => ['live-likes', userId] as const;
