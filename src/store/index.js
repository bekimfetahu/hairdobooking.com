//store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import paymentReducer from './slices/paymentSlice';
import previewReducer from './slices/previewSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        booking: bookingReducer,
        payment: paymentReducer,
        preview: previewReducer,
    },
});

export default store;
