import { Routes, Route, Navigate } from 'react-router-dom'
import { OrderProvider } from './context/OrderContext'
import Layout from './components/Layout'
import Menu from './pages/Menu'
import OrderConfirm from './pages/OrderConfirm'
import Tracker from './pages/Tracker'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminOrders from './admin/AdminOrders'
import AdminUsers from './admin/AdminUsers'

export default function App() {
  return (
    <OrderProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/menu" replace />} />
          <Route path="menu" element={<Menu />} />
          <Route path="order/:orderId" element={<OrderConfirm />} />
          <Route path="track/:orderId" element={<Tracker />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </OrderProvider>
  )
}
