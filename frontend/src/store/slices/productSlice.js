import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await productApi.list(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productApi.getById(id);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    items:      [],
    selected:   null,
    pagination: null,
    loading:    false,
    error:      null,
  },
  reducers: {
    clearSelected(state) { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading    = false;
        s.items      = a.payload.data;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProductById.pending,   (s) => { s.loading = true; s.selected = null; })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload; })
      .addCase(fetchProductById.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;

export const selectProducts   = (s) => s.product.items;
export const selectProduct    = (s) => s.product.selected;
export const selectProductPag = (s) => s.product.pagination;
export const selectProductLoading = (s) => s.product.loading;
