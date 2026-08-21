import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    placeOrderApi,
    getMyOrdersApi,
    getOrderByIdApi,
    cancelOrderApi,
    getAllOrdersAdminApi,
    updateOrderStatusAdminApi,
    OrderDto,
    PlaceOrderDto,
} from "@/app/libs/orderApi";

interface OrderState {
    myOrders: OrderDto[];
    allOrders: OrderDto[]; // Admin
    selectedOrder: OrderDto | null;
    loading: boolean;
    placing: boolean; // Checkout button spinner
    error: string | null;
    successMessage: string | null;
}

const initialState: OrderState = {
    myOrders: [],
    allOrders: [],
    selectedOrder: null,
    loading: false,
    placing: false,
    error: null,
    successMessage: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────

// 1. Place Order
export const placeOrder = createAsyncThunk(
    "order/placeOrder",
    async (dto: PlaceOrderDto, { rejectWithValue }) => {
        try {
            return await placeOrderApi(dto);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 2. Fetch My Orders
export const fetchMyOrders = createAsyncThunk(
    "order/fetchMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            return await getMyOrdersApi();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 3. Fetch Order By ID
export const fetchOrderById = createAsyncThunk(
    "order/fetchOrderById",
    async (orderId: number, { rejectWithValue }) => {
        try {
            return await getOrderByIdApi(orderId);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 4. Cancel Order
export const cancelOrder = createAsyncThunk(
    "order/cancelOrder",
    async (orderId: number, { rejectWithValue }) => {
        try {
            await cancelOrderApi(orderId);
            return orderId; // return ID to remove from state
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 5. Admin: Get All Orders
export const fetchAllOrdersAdmin = createAsyncThunk(
    "order/fetchAllOrdersAdmin",
    async (_, { rejectWithValue }) => {
        try {
            return await getAllOrdersAdminApi();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 6. Admin: Update Order Status
export const updateOrderStatusAdmin = createAsyncThunk(
    "order/updateOrderStatusAdmin",
    async ({ orderId, status }: { orderId: number; status: string }, { rejectWithValue }) => {
        try {
            return await updateOrderStatusAdminApi(orderId, status);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// ─── Slice ────────────────────────────────────────────────────────

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearOrderError: (state) => { state.error = null; },
        clearOrderSuccess: (state) => { state.successMessage = null; },
        clearSelectedOrder: (state) => { state.selectedOrder = null; },
    },
    extraReducers: (builder) => {
        // Place Order
        builder
            .addCase(placeOrder.pending, (state) => {
                state.placing = true;
                state.error = null;
            })
            .addCase(placeOrder.fulfilled, (state, action: PayloadAction<OrderDto>) => {
                state.placing = false;
                state.myOrders.unshift(action.payload); // Add to top of history
                state.selectedOrder = action.payload;
                state.successMessage = "Order placed successfully!";
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.placing = false;
                state.error = action.payload as string;
            });

        // Fetch My Orders
        builder
            .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
            .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<OrderDto[]>) => {
                state.loading = false;
                state.myOrders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch By ID
        builder
            .addCase(fetchOrderById.pending, (state) => { state.loading = true; })
            .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<OrderDto>) => {
                state.loading = false;
                state.selectedOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Cancel Order
        builder
            .addCase(cancelOrder.fulfilled, (state, action: PayloadAction<number>) => {
                // Update status locally instead of refetching
                const order = state.myOrders.find((o) => o.id === action.payload);
                if (order) order.status = "Cancelled";
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Admin: All Orders
        builder
            .addCase(fetchAllOrdersAdmin.pending, (state) => { state.loading = true; })
            .addCase(fetchAllOrdersAdmin.fulfilled, (state, action: PayloadAction<OrderDto[]>) => {
                state.loading = false;
                state.allOrders = action.payload;
            })
            .addCase(fetchAllOrdersAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Admin: Update Status
        builder.addCase(updateOrderStatusAdmin.fulfilled, (state, action: PayloadAction<OrderDto>) => {
            const idx = state.allOrders.findIndex((o) => o.id === action.payload.id);
            if (idx !== -1) state.allOrders[idx] = action.payload;
        });
    },
});

export const { clearOrderError, clearOrderSuccess, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
