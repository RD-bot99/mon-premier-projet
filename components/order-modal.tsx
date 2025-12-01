"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import type { Order, OrderItem } from "@/lib/types"

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (order: Order) => void
  editingOrder?: Order | null
}

export default function OrderModal({ isOpen, onClose, onSubmit, editingOrder }: OrderModalProps) {
  const [clientName, setClientName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [items, setItems] = useState<OrderItem[]>([{ description: "", price: 0, quantity: 1 }])
  const [status, setStatus] = useState<"pending" | "paid" | "delivered">("pending")

  useEffect(() => {
    if (editingOrder) {
      setClientName(editingOrder.clientName)
      setDate(editingOrder.date)
      setItems(editingOrder.items)
      setStatus(editingOrder.status)
    } else {
      setClientName("")
      setDate(new Date().toISOString().split("T")[0])
      setItems([{ description: "", price: 0, quantity: 1 }])
      setStatus("pending")
    }
  }, [editingOrder, isOpen])

  const handleAddItem = () => {
    setItems([...items, { description: "", price: 0, quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientName.trim()) {
      alert("Veuillez entrer le nom du client")
      return
    }

    if (items.length === 0 || items.some((item) => !item.description.trim() || item.price <= 0)) {
      alert("Veuillez ajouter au moins un article valide")
      return
    }

    const order: Order = {
      id: editingOrder?.id || `ORD-${Date.now()}`,
      clientName,
      date,
      items,
      total,
      status,
    }

    onSubmit(order)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 animate-slide-in">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 className="text-2xl font-bold">{editingOrder ? "Modifier" : "Nouvelle"} Commande</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nom du Client</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium mb-4">Articles</label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      placeholder="Description de l'article"
                      className="w-full px-3 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, "price", Number.parseFloat(e.target.value) || 0)}
                      placeholder="Prix"
                      className="w-full px-3 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
                      step="0.01"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                      placeholder="Qté"
                      className="w-full px-3 py-2 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm"
                      min="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Ajouter un article
            </button>
          </div>

          {/* Total */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "pending" | "paid" | "delivered")}
              className="w-full px-4 py-2 bg-input border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="pending">En Attente</option>
              <option value="paid">Payée</option>
              <option value="delivered">Livrée</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {editingOrder ? "Mettre à jour" : "Créer"} la Commande
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition-colors font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
