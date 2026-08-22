import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WishlistItem } from '@/app/types/wishlist';
import {
    getWishlistApi,
    toggleWishlistApi,
    removeFromWishlistApi,
    clearWishlistApi,
} from '@/app/libs/wishlistApi';

interface WishlistState {
    items: WishlistItem[];
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchUserWishlist = createAsyncThunk(
    'wishlist/fetchUserWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getWishlistApi();
            return data.items;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const toggleWishlistItem = createAsyncThunk(
    'wishlist/toggleWishlistItem',
    async (productId: number, { rejectWithValue }) => {
        try {
            const data = await toggleWishlistApi(productId);
            return data.items;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const removeWishlistItem = createAsyncThunk(
    'wishlist/removeWishlistItem',
    async (productId: number, { rejectWithValue }) => {
        try {
            const data = await removeFromWishlistApi(productId);
            return data.items;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const clearUserWishlist = createAsyncThunk(
    'wishlist/clearUserWishlist',
    async (_, { rejectWithValue }) => {
        try {
            await clearWishlistApi();
            return [];
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        resetWishlist: (state) => {
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchUserWishlist.pending, (state) => { state.loading = true; })
            .addCase(fetchUserWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchUserWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Toggle
            .addCase(toggleWishlistItem.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            // Remove
            .addCase(removeWishlistItem.fulfilled, (state, action) => {
                state.items = action.payload;
            })
            // Clear
            .addCase(clearUserWishlist.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export const { resetWishlist } = wishlistSlice.actions;

// Aliases for compatibility
export const toggleWishlist = toggleWishlistItem;
export const removeFromWishlist = removeWishlistItem;
export const clearWishlist = clearUserWishlist;

export default wishlistSlice.reducer;
