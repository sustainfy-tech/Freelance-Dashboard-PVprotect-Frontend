export interface ApiPlant {
  noOfModules: JsonValue | undefined;
  capacityKw: number;
  plantId: string;
  lastServiceDate: string | null;
  plantName: string;
  installDate: string;
  updatedAt: string;
  userId: string;
  status: string;
  longitude: number;
  createdAt: string;
  address: string;
  latitude: number;
  plantPhotos: string[];
  siteConditions: string;
}

export interface PlantsListApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    items: ApiPlant[];
    count: number;
  };
}

export interface PlantsListData {
  items: ApiPlant[];
  count: number;
}
export interface PlantsApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    items: ApiPlant[];
    count: number;
  };
}

export interface PlantDetailModalProps {
  plant: ApiPlant;
  onClose: () => void;
}

export interface PlantMapModalProps {
  plant: ApiPlant;
  onClose: () => void;
}

export interface LeafletMap {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  remove: () => void;
}
export interface LeafletLayer {
  addTo: (map: LeafletMap) => LeafletLayer;
  bindPopup: (html: string) => LeafletLayer;
  openPopup: () => LeafletLayer;
}
export interface LeafletStatic {
  map: (el: HTMLElement, opts?: { zoomControl?: boolean }) => LeafletMap;
  tileLayer: (
    url: string,
    opts?: { attribution?: string; maxZoom?: number },
  ) => LeafletLayer;
  marker: (latlng: [number, number]) => LeafletLayer;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ApiPlantPhoto {
  type?: string;
  size?: number;
  s3key?: string;
  name?: string;
}

export interface ApiSiteConditions {
  waterPumpAvailable?: boolean;
  waterAvailable?: boolean;
  everyModuleAccessible?: boolean;
  walkwaysAvailable?: boolean;
  hosePipeAvailable?: boolean;
  [key: string]: boolean | undefined;
}

export interface PlantPhotoWithUrl {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}
