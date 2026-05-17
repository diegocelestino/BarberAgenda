export interface DaySchedule {
  dayOfWeek: number;
  active: boolean;
  openTime: string;
  closeTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  slotInterval: number;
}

export interface Barber {
  barberId: string;
  name: string;
  rating: number;
  services: string[];
  schedule: DaySchedule[];
  commissionPercentage: number;
  active: boolean;
  avatarUrl?: string;
}
