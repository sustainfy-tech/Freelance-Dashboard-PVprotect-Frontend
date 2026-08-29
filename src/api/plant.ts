import { apiRequest } from "./http";
import type { ApiPlant } from "../types/Pages/Plant.types";

export function listPlants() {
  return apiRequest<ApiPlant[]>("/plants/list");
}
