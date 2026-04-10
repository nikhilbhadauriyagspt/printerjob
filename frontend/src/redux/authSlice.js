import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: "auth",
    initialState: {
        loading: true,
        user: null, 
        isSupportEnabled: true, // Global config
    },
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setConfig: (state, action) => {
            state.isSupportEnabled = action.payload;
        }
    }
});

export const { setLoading, setUser, setConfig } = authSlice.actions;
export default authSlice.reducer;
