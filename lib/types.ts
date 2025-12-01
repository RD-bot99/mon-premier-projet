export interface OrderItem {
  description: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  clientName: string
  date: string
  items: OrderItem[]
  total: number
  status: "pending" | "paid" | "delivered"
}
