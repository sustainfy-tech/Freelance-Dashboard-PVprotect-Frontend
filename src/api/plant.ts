import { apiRequest } from "./http";
import type { PlantsListData, ApiPlant } from "../types/Pages/Plant.types";


export async function listPlants(): Promise<ApiPlant[]> {
  const res = await apiRequest<PlantsListData>("/api/v1/plants/list");
  return res.items;
}