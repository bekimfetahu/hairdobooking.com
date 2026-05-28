//store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import paymentReducer from './slices/paymentSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        booking: bookingReducer,
        payment: paymentReducer,
    },
});

export default store;
