export type Message = {
  id: string;
  roomId?: string;
  userId: string;
  text: string;
  createdAt: Date;
};

