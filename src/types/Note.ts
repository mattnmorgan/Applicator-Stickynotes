import { Checklist } from "./Checklist";

export interface Note {
  id: string;
  name: string;
  content: string;
  labelIds: string[];
  lists: Checklist[];
  isFavorite: boolean;
  isArchived: boolean;
  isPinned: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
