export interface GroupService {
  id: number;
  name: string;
  description?: string; // якщо є в бекенді
  dateCreated?: string; // якщо хочеш відображати
}
