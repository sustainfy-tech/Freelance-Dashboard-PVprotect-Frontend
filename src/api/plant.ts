import { apiRequest } from "./http";
import type { PlantsListData, ApiPlant } from "../types/Pages/Plant.types";

export async function listPlants(): Promise<ApiPlant[]> {
  const res = await apiRequest<PlantsListData>("/api/v1/plants/list");
  return res.items;
}

export type PlantCapacityStats = {
  totalCapacityKw: number;
  plantCount: number;
  updatedAt: string;
  totalRevenue: number;
  paidBookingCount: number;
  activeBookingCount: number;
  bookingPipeline: {
    pending: number;
    received: number;
    assigned: number;
    in_progress: number;
    completed: number;
    payment_pending: number;
  };
}; 

export function getPlantCapacityStats(): Promise<PlantCapacityStats> {
  return apiRequest<PlantCapacityStats>("/api/v1/plants/capacity/cache");
}