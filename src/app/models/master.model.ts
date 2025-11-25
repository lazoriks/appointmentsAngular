export interface Master {
  id: number;
  firstName: string;
  surname: string;
  email?: string;
  phone?: string;
  groupServiceId?: number;

  // для бекенду
  services?: { id: number }[];

  // для фронту
  serviceIds?: number[];
}
