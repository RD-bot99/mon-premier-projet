"use client"

import { useEffect, useState } from "react"
import { TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"
import StatCard from "@/components/stat-card"
import type { Order } from "@/lib/types"

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = () => {
      const stored = localStorage.getItem("orders")
      setOrders(stored ? JSON.parse(stored) : [])
      setLoading(false)
    }
    loadOrders()
    window.addEventListener("storage", loadOrders)
    return () => window.removeEventListener("storage", loadOrders)
  }, [])

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const completedOrders = orders.filter((o) => o.status === "delivered").length

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Vue d'ensemble de vos commandes</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Commandes"
            value={totalOrders}
            icon={TrendingUp}
            trend="+12% ce mois"
            color="bg-blue-500"
          />
          <StatCard
            title="Total Payé"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={DollarSign}
            trend={`${totalRevenue > 0 ? "+" : ""}${totalRevenue}€`}
            color="bg-green-500"
          />
          <StatCard
            title="En Attente"
            value={pendingOrders}
            icon={Clock}
            trend={`${pendingOrders} à traiter`}
            color="bg-orange-500"
          />
          <StatCard
            title="Livrées"
            value={completedOrders}
            icon={CheckCircle}
            trend={`${((completedOrders / totalOrders) * 100 || 0).toFixed(0)}%`}
            color="bg-teal-500"
          />
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Commandes Récentes</h3>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune commande. Commencez à en ajouter!</p>
        ) : (
          <div className="space-y-3">
            {orders
              .slice(-5)
              .reverse()
              .map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">{order.clientName}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.total.toFixed(2)}</p>
                    <p
                      className={`text-xs font-medium ${
                        order.status === "delivered"
                          ? "text-green-600 dark:text-green-400"
                          : order.status === "paid"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {order.status === "pending" && "En Attente"}
                      {order.status === "paid" && "Payée"}
                      {order.status === "delivered" && "Livrée"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
