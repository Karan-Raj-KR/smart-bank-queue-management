import axios from 'axios';

const PROD_URL = 'https://smart-bank-queue-management-production.up.railway.app';
const baseURL = import.meta.env.DEV ? '/api' : PROD_URL;

const api = axios.create({
  baseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export async function generateToken(name, phone, serviceType, isPriority, branchId = 1) {
  const response = await api.post('/tokens/generate', {
    customer_name: name,
    phone: phone,
    service_type: serviceType,
    is_priority: isPriority,
    branch_id: branchId,
  });
  return response.data;
}

export async function getQueueStatus(branchId = 1) {
  const response = await api.get(`/counters/queue/${branchId}`);
  return response.data;
}

export async function callNextToken(counterId) {
  const response = await api.post('/counters/call-next', {
    counter_id: counterId,
  });
  return response.data;
}

export async function getAnalyticsSummary(branchId = 1) {
  const response = await api.get(`/analytics/${branchId}/summary`);
  return response.data;
}

export async function getAnalyticsHourly(branchId = 1) {
  const response = await api.get(`/analytics/${branchId}/hourly`);
  return response.data;
}

export async function getAnalyticsServiceBreakdown(branchId = 1) {
  const response = await api.get(`/analytics/${branchId}/service-breakdown`);
  return response.data;
}

export async function checkHealth() {
  try {
    const url = import.meta.env.DEV
      ? '/api/health'
      : `${PROD_URL}/health`;
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

export default api;
