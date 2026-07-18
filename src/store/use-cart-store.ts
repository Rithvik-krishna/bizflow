import { create } from 'zustand';
import { ProductData } from '@/actions/inventory';

export interface CartItem {
  product: ProductData;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  discount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
  addItem: (product: ProductData) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: 'CASH' | 'CARD' | 'UPI') => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItems: [],
  selectedCustomerId: null,
  selectedCustomerName: null,
  discount: 0,
  paymentMethod: 'CASH',

  addItem: (product) => set((state) => {
    const existingIndex = state.cartItems.findIndex((item) => item.product.id === product.id);
    if (existingIndex !== -1) {
      const updated = [...state.cartItems];
      updated[existingIndex].quantity += 1;
      return { cartItems: updated };
    }
    return { cartItems: [...state.cartItems, { product, quantity: 1 }] };
  }),

  removeItem: (productId) => set((state) => ({
    cartItems: state.cartItems.filter((item) => item.product.id !== productId),
  })),

  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cartItems: state.cartItems.filter((item) => item.product.id !== productId) };
    }
    return {
      cartItems: state.cartItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    };
  }),

  setCustomer: (id, name) => set({ selectedCustomerId: id, selectedCustomerName: name }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  clearCart: () => set({ cartItems: [], selectedCustomerId: null, selectedCustomerName: null, discount: 0, paymentMethod: 'CASH' }),
}));
