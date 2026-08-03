export interface Master {
  id: number;
  firstName: string;
  surname: string;
  email?: string;
  phone?: string;
  groupServiceId?: number;
  groupService?: { id: number; groupName: string };

  // для бекенду
  services?: { id: number }[];

  // для фронту
  serviceIds?: number[];
}
