import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id?: string;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const loadInitialAuth = (): AuthState => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const authUserStr = localStorage.getItem('authUser') || localStorage.getItem('currentUser');
        let user: User | null = null;
        if (authUserStr) {
            try {
                const parsed = JSON.parse(authUserStr);
                user = {
                    id: parsed.id || '',
                    name: parsed.fullName || parsed.name || 'User',
                    email: parsed.email || '',
                    role: parsed.role || 'User',
                };
            } catch {
                user = null;
            }
        }
        return {
            user,
            token,
            isAuthenticated: !!token,
            isLoading: false,
        };
    }
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
    };
};

const initialState: AuthState = loadInitialAuth();

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem('authToken', action.payload.token);
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('authUser', JSON.stringify({
                    fullName: action.payload.user.name,
                    email: action.payload.user.email,
                    role: action.payload.user.role,
                }));
                localStorage.setItem('currentUser', JSON.stringify({
                    fullName: action.payload.user.name,
                    name: action.payload.user.name,
                    email: action.payload.user.email,
                    role: action.payload.user.role,
                }));
            }
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
                localStorage.removeItem('currentUser');
            }
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
