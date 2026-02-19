// Use /api proxy in dev to avoid CORS; direct URL for production
const BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8000'

// Map API status to frontend status
const API_STATUS_MAP = {
  Preparing: 'kitchen',
  'On Way': 'on_way',
  'On way': 'on_way',
  Delivered: 'delivered',
}

export function apiStatusToFrontend(apiStatus) {
  if (!apiStatus) return 'kitchen'
  const normalized = String(apiStatus).trim()
  return API_STATUS_MAP[normalized] ?? 'kitchen'
}

export async function placeOrderApi({ station, item, priority }) {
  const res = await fetch(`${BASE_URL}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      station,
      item,
      priority: priority ? 'Urgent' : 'Regular',
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Place order failed: ${res.status}`)
  }
  return res.json()
}


export async function getOrdersApi() {
  const res = await fetch(`${BASE_URL}/orders`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Get orders failed: ${res.status}`)
  }
  return res.json()
}

export async function getOrderStatusApi(orderId) {
  const res = await fetch(`${BASE_URL}/status/${orderId}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Get status failed: ${res.status}`)
  }
  return res.json()
}

export async function updateOrderStatusApi(orderId, status) {
  const res = await fetch(`${BASE_URL}/status/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Update status failed: ${res.status}`)
  }
  return res.json()
}
