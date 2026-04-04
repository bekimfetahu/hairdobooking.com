//store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        booking: bookingReducer,
    },
});

export default store;
