import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { token, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
      return
    }
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      
      setStats(statsRes.data)
      setOrders(ordersRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '4px' }}>
            <h3>Total Users</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
          </div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '4px' }}>
            <h3>Total Products</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalProducts}</p>
          </div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '4px' }}>
            <h3>Total Orders</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalOrders}</p>
          </div>
          <div style={{ backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '4px' }}>
            <h3>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${stats.totalRevenue}</p>
          </div>
        </div>
      )}

      <h2>Recent Orders</h2>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.first_name} {order.last_name}</td>
              <td>{order.email}</td>
              <td>${order.total_amount}</td>
              <td>{order.status}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
