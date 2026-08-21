import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product, PagedResult, ProductFilterParams } from "@/app/types/product";
import { getProductsApi, getProductByIdApi, getFeaturedProductsApi, getCategoriesApi } from "@/app/libs/productApi";
import { createProductApi, updateProductApi, deleteProductApi } from "@/app/libs/productApi";

interface ProductState {
    products: Product[];
    totalItems: number;
    pageNumber: number;
    totalPages: number;
    featuredProducts: Product[];
    selectedProduct: Product | null;
    categories: string[];
    filters: ProductFilterParams;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    totalItems: 0,
    pageNumber: 1,
    totalPages: 1,
    featuredProducts: [],
    selectedProduct: null,
    categories: [],
    filters: {
        search: "",
        category: "All",
        brand: "All",
        sortBy: "default",
        pageNumber: 1,
        pageSize: 12,
    },
    loading: false,
    error: null,
};

// Async Thunks
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (filter: ProductFilterParams | undefined, { rejectWithValue }) => {
        try {
            return await getProductsApi(filter);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    "products/fetchProductById",
    async (id: number, { rejectWithValue }) => {
        try {
            return await getProductByIdApi(id);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    "products/fetchFeaturedProducts",
    async (count: number = 8, { rejectWithValue }) => {
        try {
            return await getFeaturedProductsApi(count);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchCategories = createAsyncThunk(
    "products/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            return await getCategoriesApi();
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// Async Thunks for Admin
export const addProduct = createAsyncThunk(
    "products/addProduct",
    async (dto: any, { rejectWithValue }) => {
        try {
            return await createProductApi(dto);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const editProduct = createAsyncThunk(
    "products/editProduct",
    async ({ id, dto }: { id: number; dto: any }, { rejectWithValue }) => {
        try {
            return await updateProductApi(id, dto);
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const removeProduct = createAsyncThunk(
    "products/removeProduct",
    async (id: number, { rejectWithValue }) => {
        try {
            await deleteProductApi(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<ProductFilterParams>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters(state) {
            state.filters = initialState.filters;
        },
    },
    extraReducers: (builder) => {
        // 1. Fetch Products
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<PagedResult<Product>>) => {
                state.loading = false;
                state.products = action.payload.items;
                state.totalItems = action.payload.totalItems;
                state.pageNumber = action.payload.pageNumber;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // 2. Fetch Product By ID
        builder
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action: PayloadAction<Product>) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // 3. Featured Products
        builder
            .addCase(fetchFeaturedProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
                state.featuredProducts = action.payload;
            });

        // 4. Categories
        builder
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.categories = action.payload;
            });

        // 5. Add Product (Admin)
        builder
            .addCase(addProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                state.products.unshift(action.payload);
                state.totalItems += 1;
            });

        // 6. Edit Product (Admin)
        builder
            .addCase(editProduct.fulfilled, (state, action: PayloadAction<Product>) => {
                const index = state.products.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            });

        // 7. Remove Product (Admin)
        builder
            .addCase(removeProduct.fulfilled, (state, action: PayloadAction<number>) => {
                state.products = state.products.filter((p) => p.id !== action.payload);
                state.totalItems -= 1;
            });
    },
});

export const { setFilters, resetFilters } = productSlice.actions;
export default productSlice.reducer;

