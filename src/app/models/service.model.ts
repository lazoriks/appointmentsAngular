export interface Service {
  id?: number;
  serviceName: string;
  price: number;
  period: number;
  description?: string;
  groupServiceId?: number;
}
