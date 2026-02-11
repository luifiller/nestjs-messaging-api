import { MessageStatus } from '../../../domain/message/enum/message-status.enum';

export interface Message {
  id: string;
  sender: string;
  content: string;
  status: MessageStatus;
  createdAt: number;
  updatedAt: number;
  entity?: string;
}
