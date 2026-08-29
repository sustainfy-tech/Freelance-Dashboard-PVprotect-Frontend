export interface PlantsListProps {
  clientId: string;
  clientName?: string;
  onBack?: () => void;
  showHeader?: boolean;
}

export interface ApiPlantAddress {
  city?: string;
  state?: string;
  address: string;
  pincode?: string;
  line1?: string;
  line2?: string;
  [key: string]: unknown;
}

export interface ApiPlant {
  plantId: string;
  plantname?: string;
  userId?: string;
  address?: ApiPlantAddress;
  capacityKw?: number;
  status?: "active" | "attention" | "inactive" | string;
  installDate?: string | null;
  lastServiceDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ApiPlantsResponse {
  success: boolean;
  data: ApiPlant[];
}
