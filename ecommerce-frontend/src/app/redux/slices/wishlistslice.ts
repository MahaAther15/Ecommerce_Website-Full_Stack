import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
    id: string | number;
    name: string;
    price: number;
    image?: string;
}

interface WishlistState {
    items: WishlistItem[];
}

const loadWishlistFromStorage = (): WishlistItem[] => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wishlist_items');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse wishlist items', e);
            }
        }
    }
    return [];
};

const initialState: WishlistState = {
    items: loadWishlistFromStorage(),
};

export const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
            const exists = state.items.some((item) => item.id === action.payload.id);
            if (exists) {
                state.items = state.items.filter((item) => item.id !== action.payload.id);
            } else {
                state.items.push(action.payload);
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('wishlist_items', JSON.stringify(state.items));
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string | number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem('wishlist_items', JSON.stringify(state.items));
            }
        },
        clearWishlist: (state) => {
            state.items = [];
            if (typeof window !== 'undefined') {
                localStorage.removeItem('wishlist_items');
            }
        },
    },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
