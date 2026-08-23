import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    createReturnRequestApi,
    getReturnRequestByOrderIdApi,
    getAllReturnRequestsAdminApi,
    updateReturnStatusAdminApi,
    ReturnRequestDto,
    CreateReturnRequestDto,
    UpdateReturnStatusDto,
} from "@/app/libs/returnRefundApi";

interface ReturnRefundState {
    allReturns: ReturnRequestDto[];
    currentOrderReturn: ReturnRequestDto | null;
    loading: boolean;
    submitting: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ReturnRefundState = {
    allReturns: [],
    currentOrderReturn: null,
    loading: false,
    submitting: false,
    error: null,
    successMessage: null,
};

export const submitReturnRequest = createAsyncThunk(
    "returnRefund/submit",
    async (dto: CreateReturnRequestDto, { rejectWithValue }) => {
        try {
            return await createReturnRequestApi(dto);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchReturnByOrderId = createAsyncThunk(
    "returnRefund/fetchByOrderId",
    async (orderId: number, { rejectWithValue }) => {
        try {
            return await getReturnRequestByOrderIdApi(orderId);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchAllReturnsAdmin = createAsyncThunk(
    "returnRefund/fetchAllAdmin",
    async (_, { rejectWithValue }) => {
        try {
            return await getAllReturnRequestsAdminApi();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const updateReturnStatusAdmin = createAsyncThunk(
    "returnRefund/updateStatusAdmin",
    async ({ id, dto }: { id: number; dto: UpdateReturnStatusDto }, { rejectWithValue }) => {
        try {
            return await updateReturnStatusAdminApi(id, dto);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const returnRefundSlice = createSlice({
    name: "returnRefund",
    initialState,
    reducers: {
        clearReturnState: (state) => {
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        // Customer Submit
        builder
            .addCase(submitReturnRequest.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitReturnRequest.fulfilled, (state, action: PayloadAction<ReturnRequestDto>) => {
                state.submitting = false;
                state.currentOrderReturn = action.payload;
                state.successMessage = "Return request submitted successfully!";
            })
            .addCase(submitReturnRequest.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload as string;
            });

        // Fetch Order Return
        builder.addCase(fetchReturnByOrderId.fulfilled, (state, action) => {
            state.currentOrderReturn = action.payload;
        });

        // Admin: All Returns
        builder
            .addCase(fetchAllReturnsAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllReturnsAdmin.fulfilled, (state, action: PayloadAction<ReturnRequestDto[]>) => {
                state.loading = false;
                state.allReturns = action.payload;
            })
            .addCase(fetchAllReturnsAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Admin: Update Status
        builder.addCase(updateReturnStatusAdmin.fulfilled, (state, action: PayloadAction<ReturnRequestDto>) => {
            const idx = state.allReturns.findIndex((r) => r.id === action.payload.id);
            if (idx !== -1) {
                state.allReturns[idx] = action.payload;
            }
        });
    },
});

export const { clearReturnState } = returnRefundSlice.actions;
export default returnRefundSlice.reducer;
