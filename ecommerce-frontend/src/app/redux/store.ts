import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authslice';
import cartReducer from './slices/cartslice';
import wishlistReducer from './slices/wishlistslice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            auth: authReducer,
            cart: cartReducer,
            wishlist: wishlistReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
