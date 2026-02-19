import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { placeOrderApi, getOrderStatusApi, apiStatusToFrontend } from '../api'

const STEPS = ['kitchen', 'on_way', 'delivered']
const STEP_LABELS = { kitchen: 'Preparing', on_way: 'On Way', delivered: 'Delivered' }

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    try {
      const s = localStorage.getItem('stc_orders')
      return s ? JSON.parse(s) : []
    } catch {
      return []
    }
  })
  const [currentOrderId, setCurrentOrderId] = useState(null)
  const [apiError, setApiError] = useState(null)

  // Sync orders from localStorage when it changes (from other tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'stc_orders' && e.newValue) {
        try {
          const newOrders = JSON.parse(e.newValue)
          setOrders(newOrders)
        } catch (_) {}
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const pollInterval = setInterval(() => {
      try {
        const stored = localStorage.getItem('stc_orders')
        if (stored) {
          const parsed = JSON.parse(stored)
          setOrders((current) => {
            if (JSON.stringify(current) !== JSON.stringify(parsed)) {
              return parsed
            }
            return current
          })
        }
      } catch (_) {}
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
    }
  }, [])

  const persistOrders = useCallback((next) => {
    setOrders((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next
      try {
        localStorage.setItem('stc_orders', JSON.stringify(updated))
      } catch (_) {}
      return updated
    })
  }, [])

  const placeOrder = useCallback(async ({ station, items, urgent }) => {
    setApiError(null)
    const apiOrderIds = []

    try {
      // API accepts one item per order - send one POST per cart item
      for (const item of items) {
        const res = await placeOrderApi({
          station,
          item: item.name,
          priority: !!urgent,
        })
        apiOrderIds.push({
          id: res.id,
          eta_minutes: res.eta_minutes ?? 10,
          runner_id: res.runner_id,
        })
      }
    } catch (err) {
      setApiError(err.message || 'Failed to place order')
      throw err
    }

    // Use first API order id as primary for tracking; store combined order locally
    const primaryId = String(apiOrderIds[0]?.id ?? `ORD-${Date.now()}`)
    const order = {
      id: primaryId,
      station,
      items,
      urgent: !!urgent,
      status: apiStatusToFrontend('Preparing'),
      createdAt: new Date().toISOString(),
      estimatedMins: apiOrderIds[0]?.eta_minutes ?? 10,
      apiOrderIds,
    }
    persistOrders((prev) => [...prev, order])
    setCurrentOrderId(primaryId)
    return primaryId
  }, [persistOrders])

  const getOrder = useCallback((orderId) => {
    return orders.find((o) => o.id === orderId) ?? null
  }, [orders])

  const setOrderStatus = useCallback((orderId, status) => {
    if (!STEPS.includes(status)) return
    persistOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    )
  }, [persistOrders])

  const advanceOrderStatus = useCallback((orderId) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const idx = STEPS.indexOf(order.status)
    if (idx < STEPS.length - 1) {
      setOrderStatus(orderId, STEPS[idx + 1])
    }
  }, [orders, setOrderStatus])

  const deleteOrdersByStation = useCallback((station) => {
    if (!station) return
    persistOrders((prev) => prev.filter((o) => o.station !== station))
  }, [persistOrders])

  const deleteAllOrders = useCallback(() => {
    persistOrders([])
    setCurrentOrderId(null)
  }, [persistOrders])

  const saveFeedback = useCallback((orderId, rating, comment) => {
    persistOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              feedback: {
                rating: typeof rating === 'number' ? rating : null,
                comment: comment || '',
              },
            }
          : o,
      ),
    )
  }, [persistOrders])

  // Poll API for order status updates (for orders created via API)
  useEffect(() => {
    const poll = async () => {
      const toPoll = orders.filter((o) => o.apiOrderIds?.length > 0 && o.status !== 'delivered')
      for (const order of toPoll) {
        try {
          const res = await getOrderStatusApi(order.apiOrderIds[0].id)
          const newStatus = apiStatusToFrontend(res.status)
          if (newStatus !== order.status) {
            persistOrders((prev) =>
              prev.map((o) =>
                o.id === order.id
                  ? { ...o, status: newStatus, estimatedMins: res.eta_minutes ?? o.estimatedMins }
                  : o,
              ),
            )
          }
        } catch (_) {}
      }
    }
    const t = setInterval(poll, 3000)
    poll()
    return () => clearInterval(t)
  }, [orders, persistOrders])

  const value = {
    orders,
    currentOrderId,
    setCurrentOrderId,
    apiError,
    setApiError,
    placeOrder,
    getOrder,
    setOrderStatus,
    advanceOrderStatus,
    deleteOrdersByStation,
    deleteAllOrders,
    saveFeedback,
    STEPS,
    STEP_LABELS,
  }
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrder() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrder must be used within OrderProvider')
  return ctx
}
