/**
 * API Service for Parking Lot Management System C++ Microservice
 * Base URL defaults to http://localhost:8080 (or /api when running with Vite proxy)
 */

export const DEFAULT_BASE_URL = 'https://parking-lot-system-1-tdw6.onrender.com';

let currentBaseUrl = DEFAULT_BASE_URL;

export const setApiBaseUrl = (url) => {
  currentBaseUrl = url.replace(/\/+$/, '');
};

export const getApiBaseUrl = () => currentBaseUrl;

/**
 * Check backend operational status
 */
export async function checkAvailability() {
  try {
    const res = await fetch(`${currentBaseUrl}/availability`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    // If direct fails (e.g. CORS or network), try proxy fallback '/api/availability'
    try {
      const proxyRes = await fetch(`/api/availability`);
      if (proxyRes.ok) {
        currentBaseUrl = '/api';
        return await proxyRes.json();
      }
    } catch (_) {}
    throw new Error(err.message || 'Failed to connect to parking microservice');
  }
}

/**
 * Park a vehicle
 * @param {string} plate - Vehicle license plate
 * @param {string} type - Vehicle type ('Car', 'Motorcycle', 'Truck')
 */
export async function parkVehicle(plate, type = 'Car') {
  const cleanPlate = plate.trim().toUpperCase();
  if (!cleanPlate) {
    throw new Error('Please enter a valid license plate');
  }

  const payload = {
    plate: cleanPlate,
    type: type || 'Car',
  };

  try {
    const res = await fetch(`${currentBaseUrl}/park`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ message: res.statusText }));

    if (res.status === 200) {
      return {
        success: true,
        status: data.status || 'success',
        ticketId: data.ticketId || `TKT-F${data.floor}-S${data.spot}-${cleanPlate}`,
        plate: data.plate || cleanPlate,
        floor: data.floor,
        spot: data.spot,
        type: type,
        timestamp: new Date().toISOString(),
      };
    } else if (res.status === 409) {
      return {
        success: false,
        status: 'failed',
        statusCode: 409,
        message: data.message || 'Parking lot is full',
      };
    } else {
      return {
        success: false,
        status: 'failed',
        statusCode: res.status,
        message: data.message || `Parking request failed (${res.status})`,
      };
    }
  } catch (err) {
    // Try proxy fallback if direct fails
    if (currentBaseUrl !== '/api') {
      try {
        const proxyRes = await fetch(`/api/park`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await proxyRes.json().catch(() => ({ message: proxyRes.statusText }));
        if (proxyRes.status === 200) {
          currentBaseUrl = '/api';
          return {
            success: true,
            status: 'success',
            ticketId: data.ticketId || `TKT-F${data.floor}-S${data.spot}-${cleanPlate}`,
            plate: data.plate || cleanPlate,
            floor: data.floor,
            spot: data.spot,
            type: type,
            timestamp: new Date().toISOString(),
          };
        } else {
          return {
            success: false,
            status: 'failed',
            statusCode: proxyRes.status,
            message: data.message || 'Parking request failed',
          };
        }
      } catch (_) {}
    }

    throw new Error(err.message || 'Unable to communicate with C++ backend server');
  }
}

/**
 * Checkout a vehicle
 * @param {string} plate - Vehicle license plate
 */
export async function checkoutVehicle(plate) {
  const cleanPlate = plate.trim().toUpperCase();
  if (!cleanPlate) {
    throw new Error('Please enter a valid license plate');
  }

  const payload = {
    plate: cleanPlate,
  };

  try {
    const res = await fetch(`${currentBaseUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({ message: res.statusText }));

    if (res.status === 200) {
      return {
        success: true,
        status: data.status || 'success',
        plate: cleanPlate,
        message: data.message || 'Spot freed successfully',
        timestamp: new Date().toISOString(),
      };
    } else if (res.status === 404) {
      return {
        success: false,
        status: 'failed',
        statusCode: 404,
        plate: cleanPlate,
        message: data.message || 'Checkout failed. Plate not found.',
      };
    } else {
      return {
        success: false,
        status: 'failed',
        statusCode: res.status,
        plate: cleanPlate,
        message: data.message || `Checkout request failed (${res.status})`,
      };
    }
  } catch (err) {
    // Try proxy fallback if direct fails
    if (currentBaseUrl !== '/api') {
      try {
        const proxyRes = await fetch(`/api/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await proxyRes.json().catch(() => ({ message: proxyRes.statusText }));
        if (proxyRes.status === 200) {
          currentBaseUrl = '/api';
          return {
            success: true,
            status: 'success',
            plate: cleanPlate,
            message: data.message || 'Spot freed successfully',
            timestamp: new Date().toISOString(),
          };
        } else {
          return {
            success: false,
            status: 'failed',
            statusCode: proxyRes.status,
            plate: cleanPlate,
            message: data.message || 'Checkout failed. Plate not found.',
          };
        }
      } catch (_) {}
    }

    throw new Error(err.message || 'Unable to communicate with C++ backend server');
  }
}
