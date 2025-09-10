const API_BASE_URL = 'https://stagingv3.leapmile.com/podcore';
const AUTH_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo';

export interface OTPResponse {
  user_otp: string;
}

export interface ValidateOTPResponse {
  status: string;
  status_code: number;
  message: string;
  timestamp: string;
  records: Array<{
    id: number;
    user_name: string;
    user_phone: string;
    user_email: string;
    user_address: string;
    user_type: string;
    user_flatno: string;
    user_dropcode: string;
    user_pickupcode: string;
    user_credit_limit: string;
    user_credit_used: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  user_phone: string;
  access_token: string;
  statusbool: boolean;
  ok: boolean;
  api_processing_time: number;
}

export interface UserLocation {
  location_id: number;
  user_id: number;
  id: number;
  user_name: string;
  user_flatno: string;
  user_type: string;
  user_email: string;
  user_phone: string;
  location_name: string;
  location_address: string;
  location_pincode: string;
  location_state: string | null;
  status: string;
  user_dropcode: string;
  user_pickupcode: string;
  user_credit_limit: string;
  user_credit_used: string;
  created_at: string;
  updated_at: string;
}

export interface PodInfo {
  id: string;
  name: string;
  location_id: string;
  status: string;
}

export interface LocationInfo {
  id: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Reservation {
  id: string;
  reservation_status: string;
  reservation_type?: string;
  drop_code?: string;
  pickup_code?: string;
  package_description?: string;
  created_at: string;
  pod_name: string;
  created_by_name?: string;
  reservation_awbno?: string;
  location_name?: string;
}

export const apiService = {
  async generateOTP(userPhone: string): Promise<OTPResponse> {
    const response = await fetch(`${API_BASE_URL}/otp/generate_otp/?user_phone=${userPhone}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate OTP');
    }

    return response.json();
  },

  async validateOTP(userPhone: string, otpCode: string): Promise<ValidateOTPResponse> {
    const response = await fetch(`${API_BASE_URL}/otp/validate_otp/?user_phone=${userPhone}&otp_text=${otpCode}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to validate OTP');
    }

    const data = await response.json();
    // Store the access token for future use
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);
    }

    return data;
  },

  async getUserLocations(userId: number): Promise<UserLocation[]> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/locations/?user_id=${userId}&order_by_field=updated_at&order_by_type=DESC`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user locations');
    }

    const data = await response.json();
    return data.records || [];
  },

  async getPodInfo(podName: string): Promise<PodInfo> {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/pods/?pod_name=${podName}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch pod info: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const pod = data.records[0];
        // Save location_id to local storage
        localStorage.setItem('current_location_id', pod.location_id);

        return {
          id: pod.id,
          name: pod.pod_name,
          location_id: pod.location_id,
          status: pod.status || 'available'
        };
      }

      throw new Error('Pod not found');
    } catch (error) {
      console.error('Error fetching pod info:', error);
      throw error;
    }
  },

  async getLocationInfo(locationId: string): Promise<LocationInfo> {
    try {
      const authToken = localStorage.getItem('auth_token');
      const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/locations/?record_id=${locationId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': authorization
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch location info: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.records && data.records.length > 0) {
        const location = data.records[0];
        // Save location name to local storage
        localStorage.setItem('current_location_name', location.location_name);

        return {
          id: location.id,
          location_name: location.location_name,
          address: location.location_address || '',
          city: location.city || '',
          state: location.state || '',
          pincode: location.pincode || ''
        };
      }

      throw new Error('Location not found');
    } catch (error) {
      console.error('Error fetching location info:', error);
      throw error;
    }
  },

  async addUserLocation(userId: number, locationId: string): Promise<void> {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/locations/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        location_id: locationId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to add user location');
    }
  },

  async getReservations(phoneNum: string, locationId: string, status: string): Promise<Reservation[]> {
    try {
      const response = await fetch(
        `https://stagingv3.leapmile.com/podcore/reservations/?reservation_status=${status}&createdby_phone=${phoneNum}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo'
          }
        }
      );

      const data = await response.json();

      // Handle 404 "Records not found" gracefully
      if (response.status === 404 || (data.status === 'failure' && data.message === 'Records not found.')) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch reservations: ${response.statusText}`);
      }

      if (data.records) {
        const currentLocationName = localStorage.getItem('current_location_name') || undefined
        return data.records.map((record: any) => ({
          id: String(record.id),
          reservation_type: record.reservation_type,
          reservation_status: record.reservation_status,
          pod_name: record.pod_name,
          created_at: record.created_at,
          package_description: record.package_description,
          drop_code: record.drop_code,
          pickup_code: record.pickup_code,
          // Additional fields requested for card content
          created_by_name: record.created_by_name ?? record.created_by ?? undefined,
          reservation_awbno: record.reservation_awbno ?? record.awb_number ?? undefined,
          location_name: record.location_name ?? currentLocationName,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw error;
    }
  },

  async registerUser(userData: {
    user_phone: string;
    user_name: string;
    user_email: string;
    user_flatno: string;
    user_address: string;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2wiOiJhZG1pbiIsImV4cCI6MTkxMTYyMDE1OX0.RMEW55tHQ95GVap8ChrGdPRbuVxef4Shf0NRddNgGJo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...userData,
        user_type: 'customer'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to register user');
    }

    return response.json();
  },

  // Check for available doors at a location
  checkFreeDoor: async (locationId: string): Promise<boolean> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/doors/free_door/?location_id=${locationId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.statusbool || false;
  },

  // Create a new reservation
  createReservation: async (reservationData: {
    created_by_phone: string;
    drop_by_phone: string;
    pickup_by_phone: string;
    pod_id: string;
    reservation_awbno: string;
  }): Promise<{ reservation_id: string }> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/reservations/create`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create reservation');
    }

    const data = await response.json();
    return { reservation_id: data.reservation_id || data.id };
  },

  // Get reservation details by ID
  getReservationDetails: async (reservationId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/reservations/?record_id=${reservationId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reservation details');
    }

    const data = await response.json();
    return data.records?.[0] || data;
  },

  // Re-send Drop OTP
  resendDropOTP: async (reservationId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/reservations/resend_otp/?reservation_id=${reservationId}&otp_type=drop_otp`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to resend drop OTP');
    }

    return response.json();
  },

  // Cancel Reservation
  cancelReservation: async (reservationId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/reservations/cancel/${reservationId}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel reservation');
    }

    return response.json();
  },

  // Check if user exists at location
  checkUserAtLocation: async (userId: number, locationId: string): Promise<boolean> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/locations/?user_id=${userId}&location_id=${locationId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.records && data.records.length > 0;
  },

  // Update user profile
  updateUser: async (userId: number, userData: {
    user_email?: string;
    user_name?: string;
    user_address?: string;
    user_flatno?: string;
  }): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  // Get users for a location (Site Admin)
  getLocationUsers: async (locationId: string): Promise<any[]> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/users/locations/?location_id=${locationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.records || [];
  },

  // Get Pod Details with access code and door count
  getPodDetails: async (podId: string, locationId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/pods/?record_id=${podId}&location_id=${locationId}&pod_mode=adhoc`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pod details');
    }

    const data = await response.json();
    return data.records?.[0] || null;
  },

  // Get Doors of Pod
  getPodDoors: async (podId: string): Promise<any[]> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/pods/doors/${podId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pod doors');
    }

    const data = await response.json();
    return data.records || [];
  },

  // Get reservations for a location (Site Admin)
  getLocationReservations: async (locationId: string, status: string): Promise<any[]> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/reservations/?location_id=${locationId}&reservation_status=${status}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data.records || [];
    }

    throw new Error(data.detail || 'Failed to fetch reservations');
  },

  // Remove user (Site Admin)
  removeUser: async (userId: number): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to remove user');
    }
  },

  // Get user by ID (for profile viewing)
  getUserById: async (userId: string): Promise<any> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/users/?record_id=${userId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to fetch user details');
    }

    const data = await response.json();
    return data.records?.[0] || null;
  },

  // Get user-location mapping ID
  getUserLocationMapping: async (userId: number, locationId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/locations/?user_id=${userId}&location_id=${locationId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to fetch user-location mapping');
    }

    const data = await response.json();
    return data.records?.[0] || null;
  },

  // Remove user from location using mapping ID
  removeUserFromLocation: async (mappingId: number): Promise<void> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/users/locations/${mappingId}`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to remove user from location');
    }
  },

  // Get reservation details by door number and pod ID
  getDoorReservationDetails: async (doorNumber: number, podId: string): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/adhoc/reservations/?door_number=${doorNumber}&pod_id=${podId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch door reservation details');
    }

    const data = await response.json();
    return data.records?.[0] || null;
  },

  // Get door access code by pod ID and door number
  getDoorAccessCode: async (podId: string, doorNumber: number): Promise<any> => {
    const authToken = localStorage.getItem('auth_token');
    const authorization = authToken ? `Bearer ${authToken}` : AUTH_TOKEN;

    const response = await fetch(`${API_BASE_URL}/doors/?pod_id=${podId}&door_no=${doorNumber}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authorization,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch door access code');
    }

    const data = await response.json();
    return data;
  }
};