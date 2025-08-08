export interface Appointment {
  id: number;
  datatime: string;
  master: { id: number; firstName: string };
  client: { id: number; firstName: string };
  service: { id: number; serviceName: string };
}
