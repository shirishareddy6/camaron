import { configureStore } from '@reduxjs/toolkit';
import authReducer    from './slices/authSlice';
import uiReducer      from './slices/uiSlice';
import productReducer from './slices/productSlice';

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    ui:      uiReducer,
    product: productReducer,
  },
  middleware: (getDefault) =>
    getDefault({ serializableCheck: false }),
});
