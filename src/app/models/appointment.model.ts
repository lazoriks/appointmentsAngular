import { Client } from './client.model';
import { Master } from './master.model';
import { ServiceModel } from './service.model';

export interface Appointment {
  id: number;
  datatime: string;       // ISO
  summ?: number;          // decimal(10,2)
  service?: ServiceModel; // старе поле
  services?: ServiceModel[];
  client: Client;
  master: Master;
}
