import { ChecklistItem } from "./ChecklistItem";

export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}
