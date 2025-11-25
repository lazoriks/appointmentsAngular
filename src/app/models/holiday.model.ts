import { Master } from './master.model';

export interface Holiday {
  id: number;
  master?: Master;
  startDate: string;   // 'YYYY-MM-DD'
  finishDate: string;  // 'YYYY-MM-DD'
}
