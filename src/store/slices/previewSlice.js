import { createSlice } from '@reduxjs/toolkit';

const previewSlice = createSlice({
    name: 'preview',
    initialState: {
        previewToken: null,
        currentPreviewSlug: null, // Track which salon is being previewed
    },
    reducers: {
        setPreviewToken(state, action) {
            const { token, slug } = action.payload;
            state.previewToken = token;
            state.currentPreviewSlug = slug;
        },
        clearPreviewToken(state) {
            state.previewToken = null;
            state.currentPreviewSlug = null;
        },
    },
});

export const { setPreviewToken, clearPreviewToken } = previewSlice.actions;
export default previewSlice.reducer;
