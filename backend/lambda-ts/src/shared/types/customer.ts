export interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}
