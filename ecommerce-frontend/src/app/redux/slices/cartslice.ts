import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string | number;
    name: string;
    price: number;
    image?: string;
    quantity: number;
    stock?: number;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

// LocalStorage se saved cart uthana
const loadCartFromStorage = (): CartItem[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('cart_items');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse cart items', e);
            }
        }
    }
    return [];
};

const initialItems = loadCartFromStorage();

const calculateTotals = (items: CartItem[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { totalQuantity, totalAmount };
};

const totals = calculateTotals(initialItems);

const initialState: CartState = {
    items: initialItems,
    totalQuantity: totals.totalQuantity,
    totalAmount: totals.totalAmount,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
            const quantityToAdd = action.payload.quantity || 1;
            const existingItem = state.items.find((item) => item.id === action.payload.id);

            if (existingItem) {
                existingItem.quantity += quantityToAdd;
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: quantityToAdd,
                });
            }

            // Re-calculate totals
            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;

            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_items', JSON.stringify(state.items));
            }
        },

        removeFromCart: (state, action: PayloadAction<string | number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_items', JSON.stringify(state.items));
            }
        },

        updateQuantity: (
            state,
            action: PayloadAction<{ id: string | number; quantity: number }>
        ) => {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item && action.payload.quantity > 0) {
                item.quantity = action.payload.quantity;
            } else if (item && action.payload.quantity <= 0) {
                state.items = state.items.filter((i) => i.id !== action.payload.id);
            }

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_items', JSON.stringify(state.items));
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart_items');
            }
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
