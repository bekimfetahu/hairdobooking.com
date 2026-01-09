//store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

const store = configureStore({
    reducer: {
        auth: authReducer, // Add more reducers here if needed
    },
});

export default store;
