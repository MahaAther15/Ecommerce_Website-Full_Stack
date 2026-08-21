import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCartApi, addToCartApi, updateCartQuantityApi, removeFromCartApi, clearCartApi, BackendCart } from '@/app/libs/cartApi';

export interface CartItem {
    id: number | string;
    productId?: number;
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
    loading: boolean;
    error: string | null;
}

// LocalStorage Helper
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

const calculateTotals = (items: CartItem[]) => {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { totalQuantity, totalAmount };
};

const initialItems = loadCartFromStorage();
const initialTotals = calculateTotals(initialItems);

const initialState: CartState = {
    items: initialItems,
    totalQuantity: initialTotals.totalQuantity,
    totalAmount: initialTotals.totalAmount,
    loading: false,
    error: null,
};

// --- Async Thunks for Authenticated Database Sync ---

// 1. Fetch Cart from Backend
export const fetchUserCart = createAsyncThunk(
    'cart/fetchUserCart',
    async (_, { rejectWithValue }) => {
        try {
            return await getCartApi();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 2. Add to Cart on Backend
export const addToCartAsync = createAsyncThunk(
    'cart/addToCartAsync',
    async ({ productId, quantity }: { productId: number; quantity?: number }, { rejectWithValue }) => {
        try {
            return await addToCartApi(productId, quantity || 1);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 3. Update Quantity on Backend
export const updateQuantityAsync = createAsyncThunk(
    'cart/updateQuantityAsync',
    async ({ productId, quantity }: { productId: number; quantity: number }, { rejectWithValue }) => {
        try {
            return await updateCartQuantityApi(productId, quantity);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 4. Remove Item on Backend
export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCartAsync',
    async (productId: number, { rejectWithValue }) => {
        try {
            return await removeFromCartApi(productId);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 5. Clear Cart on Backend
export const clearCartAsync = createAsyncThunk(
    'cart/clearCartAsync',
    async (_, { rejectWithValue }) => {
        try {
            await clearCartApi();
            return true;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local Client Mutation (For Guest Users)
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

            const totals = calculateTotals(state.items);
            state.totalQuantity = totals.totalQuantity;
            state.totalAmount = totals.totalAmount;

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
    extraReducers: (builder) => {
        const handleCartPayload = (state: CartState, action: PayloadAction<BackendCart>) => {
            state.loading = false;
            state.items = action.payload.items.map((i) => ({
                id: i.productId,
                productId: i.productId,
                name: i.title,
                price: i.price,
                image: i.imageUrl,
                quantity: i.quantity,
                stock: i.stockQuantity,
            }));
            state.totalQuantity = action.payload.totalQuantity;
            state.totalAmount = action.payload.totalAmount;

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart_items', JSON.stringify(state.items));
            }
        };

        // Fetch User Cart
        builder
            .addCase(fetchUserCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserCart.fulfilled, (state, action: PayloadAction<BackendCart>) => {
                handleCartPayload(state, action);
            })
            .addCase(fetchUserCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add to Cart
        builder.addCase(addToCartAsync.fulfilled, (state, action: PayloadAction<BackendCart>) => {
            handleCartPayload(state, action);
        });

        // Update Quantity
        builder.addCase(updateQuantityAsync.fulfilled, (state, action: PayloadAction<BackendCart>) => {
            handleCartPayload(state, action);
        });

        // Remove from Cart
        builder.addCase(removeFromCartAsync.fulfilled, (state, action: PayloadAction<BackendCart>) => {
            handleCartPayload(state, action);
        });

        // Clear Cart
        builder.addCase(clearCartAsync.fulfilled, (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart_items');
            }
        });
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
