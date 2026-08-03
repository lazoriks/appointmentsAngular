export interface ServiceModel {
  id: number;
  serviceName: string;
  price: number;
  period: number;
  description?: string;
  groupServiceId?: number;
  groupService?: { id: number; groupName: string };
}
