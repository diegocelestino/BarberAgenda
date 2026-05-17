export interface Service {
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
}
