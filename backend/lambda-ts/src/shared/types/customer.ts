export interface CustomerNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Customer {
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  customerNotes?: CustomerNote[];
  loyaltyPoints: number;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
}
