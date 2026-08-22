import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    getProductReviewsApi,
    submitReviewApi,
    getOrderReviewsApi,
    ReviewItem,
    ProductReviewSummary,
} from "@/app/libs/reviewApi";

export type { ReviewItem, ProductReviewSummary };

interface ReviewState {
    summary: ProductReviewSummary | null;
    orderReviews: ReviewItem[];
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    summary: null,
    orderReviews: [],
    loading: false,
    submitting: false,
    error: null,
};

export const fetchProductReviews = createAsyncThunk(
    "reviews/fetchProductReviews",
    async (productId: number, { rejectWithValue }) => {
        try {
            return await getProductReviewsApi(productId);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to load reviews");
        }
    }
);

export const submitReview = createAsyncThunk(
    "reviews/submitReview",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            return await submitReviewApi(formData);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to submit review");
        }
    }
);

export const fetchOrderReviews = createAsyncThunk(
    "reviews/fetchOrderReviews",
    async (orderId: number, { rejectWithValue }) => {
        try {
            return await getOrderReviewsApi(orderId);
        } catch (err: any) {
            return rejectWithValue(err.message || "Failed to fetch order reviews");
        }
    }
);

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {
        clearReviewErrors: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductReviews.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.summary = action.payload;
            })
            .addCase(fetchProductReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(submitReview.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(submitReview.fulfilled, (state, action) => {
                state.submitting = false;
                state.orderReviews.push(action.payload);
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload as string;
            })
            .addCase(fetchOrderReviews.fulfilled, (state, action) => {
                state.orderReviews = action.payload;
            });
    },
});

export const { clearReviewErrors } = reviewSlice.actions;
export default reviewSlice.reducer;
