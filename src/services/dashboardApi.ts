
interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  records: T[];
  total_records?: number;
}

interface Location {
  id: number;
  primary_name: string;
  location_name: string;
  location_address: string;
  location_pincode: string;
}

interface Pod {
  id: number;
  pod_name: string;
  pod_power_status: string;
  status: string;
  pod_health: string;
  pod_numtotaldoors: number;
  location_name: string;
}

const BASE_URL = 'https://robotmanagerv1test.qikpod.com:8989';

const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Accept': 'application/json',
});

export const dashboardApi = {
  // Count APIs
  getLocationsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/locations/?num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Location> = await response.json();
    return data.total_records || 0;
  },

  getPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/pods/?num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Pod> = await response.json();
    return data.total_records || 0;
  },

  getUsersCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/users/?user_phone=9360155586&num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<any> = await response.json();
    return data.total_records || 0;
  },

  getReservationsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/reservations/?num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<any> = await response.json();
    return data.total_records || 0;
  },

  // Data APIs
  getLocations: async (token: string, numRecords: number = 100): Promise<Location[]> => {
    const response = await fetch(`${BASE_URL}/locations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Location> = await response.json();
    return data.records || [];
  },

  getPods: async (token: string, numRecords: number = 100): Promise<Pod[]> => {
    const response = await fetch(`${BASE_URL}/pods/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Pod> = await response.json();
    return data.records || [];
  },
};

export type { Location, Pod };
