export interface Appointment {
  id?: number;
  datatime: string;       // ISO string
  summ?: number;          // total price if exists
  service?: any;          // legacy single service (if present)
  services?: { id: number }[];
  master: { id: number; firstName?: string; surname?: string };
  client: { id?: number; firstName?: string; surname?: string; mobile?: string; email?: string };
}
