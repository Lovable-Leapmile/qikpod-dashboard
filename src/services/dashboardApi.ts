
interface ApiResponse<T> {
  status: string;
  status_code: number;
  message: string;
  records: T[];
  total_records?: number;
  count?: number;
}

interface Location {
  id: number;
  primary_name: string;
  location_name: string;
  location_address: string;
  location_pincode: string;
}

interface LocationDetail {
  id: number;
  status: string | null;
  created_at: string;
  updated_at: string;
  location_name: string;
  primary_name: string;
  primary_fe: string | null;
  primary_contact: string;
  primary_bd: string | null;
  secondary_name: string | null;
  secondary_fe: string | null;
  secondary_contact: string;
  map_latitude: string;
  map_longitude: string;
  location_address: string;
  location_pincode: string;
  location_state: string | null;
  map_text: string;
  map_color: string | null;
  docs_status: string | null;
  primary_fe_contact: string | null;
  bd_tag: string | null;
  bd_details: string | null;
  payment_mode: string;
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

interface PodDetail {
  id: number;
  pod_name: string;
  pod_numtotaldoors: number;
  location_name: string;
  created_at: string;
  updated_at: string;
  pinged_at: string;
  pod_health: string;
  pod_state: string;
  pod_power_status: string;
  pod_production_version: string;
  pod_production_version_update_to: string;
  pod_touchless_enabled: boolean;
  status: string;
  pod_mode: string;
  pod_configuration_version: string;
  pod_root_version: string;
  fe_tag: string;
  fe_details: string;
}

interface LogEntry {
  log_id: number;
  updated_at: string;
  log_type: string;
  log_message: string;
}

interface User {
  id: number;
  user_name: string;
  user_phone: string;
}

interface Reservation {
  id: number;
  reservation_status: string;
}

interface StandardReservation {
  id: number;
  drop_by_name: string;
  location_name: string;
  created_by_name: string;
  status: string;
  created_at: string;
}

interface AdhocReservation {
  id: number;
  pod_name: string;
  user_phone: string;
  drop_time: string;
  pickup_time: string;
  rto_picktime: string;
  reservation_status: string;
}

const BASE_URL = 'https://robotmanagerv1test.qikpod.com:8989';
const LOGS_BASE_URL = 'https://newproduction.qikpod.com:8988';

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
    return data.count || data.total_records || 0;
  },

  getPodsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/pods/?num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Pod> = await response.json();
    return data.count || data.total_records || 0;
  },

  getUsersCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/users/?user_phone=9360155586&num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<User> = await response.json();
    return data.count || data.total_records || 0;
  },

  getReservationsCount: async (token: string): Promise<number> => {
    const response = await fetch(`${BASE_URL}/reservations/?num_records=-2`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Reservation> = await response.json();
    return data.count || data.total_records || 0;
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

  getUsers: async (token: string, numRecords: number = 100): Promise<User[]> => {
    const response = await fetch(`${BASE_URL}/users/?user_phone=9360155586&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<User> = await response.json();
    return data.records || [];
  },

  getReservations: async (token: string, numRecords: number = 100): Promise<Reservation[]> => {
    const response = await fetch(`${BASE_URL}/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<Reservation> = await response.json();
    return data.records || [];
  },

  // New Reservation APIs
  getStandardReservations: async (token: string, numRecords: number = 100): Promise<StandardReservation[]> => {
    const response = await fetch(`${BASE_URL}/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<StandardReservation> = await response.json();
    return data.records || [];
  },

  getAdhocReservations: async (token: string, numRecords: number = 100): Promise<AdhocReservation[]> => {
    const response = await fetch(`${BASE_URL}/adhoc/reservations/?num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<AdhocReservation> = await response.json();
    return data.records || [];
  },

  // Location Detail APIs
  getLocationDetail: async (token: string, locationId: number): Promise<LocationDetail | null> => {
    const response = await fetch(`${BASE_URL}/locations/?record_id=${locationId}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<LocationDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getLocationStandardReservations: async (token: string, locationId: number, numRecords: number = 100): Promise<StandardReservation[]> => {
    const response = await fetch(`${BASE_URL}/reservations/?location_id=${locationId}&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<StandardReservation> = await response.json();
    return data.records || [];
  },

  getLocationAdhocReservations: async (token: string, locationId: number, numRecords: number = 100): Promise<AdhocReservation[]> => {
    const response = await fetch(`${BASE_URL}/adhoc/reservations/?location_id=${locationId}&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<AdhocReservation> = await response.json();
    return data.records || [];
  },

  // Pod Detail APIs
  getPodDetail: async (token: string, podId: number): Promise<PodDetail | null> => {
    const response = await fetch(`${BASE_URL}/pods/?record_id=${podId}&num_records=1`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<PodDetail> = await response.json();
    return data.records?.[0] || null;
  },

  getPodLogs: async (token: string, podId: number, numRecords: number = 100): Promise<LogEntry[]> => {
    const response = await fetch(`${LOGS_BASE_URL}/logs/?record_id=${podId}&num_records=${numRecords}`, {
      headers: getAuthHeaders(token),
    });
    const data: ApiResponse<LogEntry> = await response.json();
    return data.records || [];
  },

  // Pod Update APIs
  updatePodMode: async (token: string, podId: number, podMode: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/pods/${podId}?verbose=true`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pod_mode: podMode }),
    });
    if (!response.ok) {
      throw new Error('Failed to update pod mode');
    }
  },

  updatePodVersion: async (token: string, podId: number, versionData: any): Promise<void> => {
    const response = await fetch(`${BASE_URL}/pods/${podId}?verbose=true`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(versionData),
    });
    if (!response.ok) {
      throw new Error('Failed to update pod version');
    }
  },

  updatePodFE: async (token: string, podId: number, feData: { fe_tag: string; fe_details: string }): Promise<void> => {
    const response = await fetch(`${BASE_URL}/pods/${podId}?verbose=true`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feData),
    });
    if (!response.ok) {
      throw new Error('Failed to update pod FE');
    }
  },
};

export type { Location, Pod, User, Reservation, StandardReservation, AdhocReservation, LocationDetail, PodDetail, LogEntry };
