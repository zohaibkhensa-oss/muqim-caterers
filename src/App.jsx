import { Routes, Route, Navigate } from 'react-router-dom'
import StorefrontLayout from '@/layouts/StorefrontLayout'
import AdminLayout from '@/layouts/AdminLayout'

import Landing from '@/pages/storefront/Landing'
import Packages from '@/pages/storefront/Packages'
import PackageDetail from '@/pages/storefront/PackageDetail'
import MenuLibrary from '@/pages/storefront/MenuLibrary'
import BookFlow from '@/pages/storefront/BookFlow'
import BookingStatus from '@/pages/storefront/BookingStatus'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminBookings from '@/pages/admin/AdminBookings'
import AdminBookingDetail from '@/pages/admin/AdminBookingDetail'
import AdminCalendar from '@/pages/admin/AdminCalendar'
import AdminMenus from '@/pages/admin/AdminMenus'
import AdminClients from '@/pages/admin/AdminClients'
import AdminStaff from '@/pages/admin/AdminStaff'
import AdminVendors from '@/pages/admin/AdminVendors'
import AdminReports from '@/pages/admin/AdminReports'
import AdminLeads from '@/pages/admin/AdminLeads'
import AdminTasks from '@/pages/admin/AdminTasks'
import AdminLogin from '@/pages/admin/AdminLogin'

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route index element={<Landing />} />
        <Route path="packages" element={<Packages />} />
        <Route path="packages/:id" element={<PackageDetail />} />
        <Route path="menu" element={<MenuLibrary />} />
        <Route path="book" element={<BookFlow />} />
        <Route path="booking" element={<BookingStatus />} />
        <Route path="booking/:ref" element={<BookingStatus />} />
      </Route>

      <Route path="admin/login" element={<AdminLogin />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="tasks" element={<AdminTasks />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:id" element={<AdminBookingDetail />} />
        <Route path="calendar" element={<AdminCalendar />} />
        <Route path="menus" element={<AdminMenus />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="vendors" element={<AdminVendors />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
