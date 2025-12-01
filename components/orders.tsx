"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Search, Trash2, Edit2 } from "lucide-react"
import OrderModal from "@/components/order-modal"
import type { Order } from "@/lib/types"
import { showNotification } from "@/lib/notifications"

type SortBy = "date" | "amount" | "client"
type StatusFilter = "all" | "pending" | "paid" | "delivered"

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("date")
  const [loading, setLoading] = useState(true)

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      const stored = localStorage.getItem("orders")
      setOrders(stored ? JSON.parse(stored) : [])
      setLoading(false)
    }
    loadOrders()
  }, [])

  // Save orders to localStorage
  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders)
    localStorage.setItem("orders", JSON.stringify(newOrders))
  }

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let result = orders

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (order) =>
          order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === "amount") return b.total - a.total
      if (sortBy === "client") return a.clientName.localeCompare(b.clientName)
      return 0
    })

    return result
  }, [orders, searchTerm, statusFilter, sortBy])

  const handleAddOrder = (order: Order) => {
    if (editingOrder) {
      const updated = orders.map((o) => (o.id === editingOrder.id ? order : o))
      saveOrders(updated)
      showNotification("Commande mise à jour", "success")
      setEditingOrder(null)
    } else {
      saveOrders([...orders, order])
      showNotification("Commande ajoutée", "success")
    }
    setIsModalOpen(false)
  }

  const handleDeleteOrder = (id: string) => {
    saveOrders(orders.filter((o) => o.id !== id))
    showNotification("Commande supprimée", "success")
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsModalOpen(true)
  }

  const statusColor: Record<string, string> = {
    pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return (
    <div className="p-6 md:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Commandes</h2>
          <p className="text-muted-foreground mt-1">{filteredOrders.length} commande(s)</p>
        </div>
        <button
          onClick={() => {
            setEditingOrder(null)
            setIsModalOpen(true)
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus size={20} />
          Nouvelle Commande
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par client ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En Attente</option>
            <option value="paid">Payée</option>
            <option value="delivered">Livrée</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="date">Trier par Date</option>
            <option value="amount">Trier par Montant</option>
            <option value="client">Trier par Client</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Aucune commande trouvée</p>
          <button
            onClick={() => {
              setEditingOrder(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            Créer la première commande
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Montant</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{order.id}</td>
                  <td className="px-4 py-3 font-medium">{order.clientName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                  <td className="px-4 py-3 text-right font-semibold">${order.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                      {order.status === "pending" && "En Attente"}
                      {order.status === "paid" && "Payée"}
                      {order.status === "delivered" && "Livrée"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingOrder(null)
        }}
        onSubmit={handleAddOrder}
        editingOrder={editingOrder}
      />
    </div>
  )
}
