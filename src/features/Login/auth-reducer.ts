import {initializeAppTC, setAppStatusAC} from '../../app/app-reducer'
import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'

const initialState = {
    isLoggedIn: false
}

// Thunks
export const loginTC = createAsyncThunk('auth/loginTC', async (payload: { data: LoginParamsType }, ThunkAPI) => {
    ThunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const pr = await authAPI.login(payload.data);
    try {
        if (pr.data.messages.length || pr.data.resultCode !== 0) {
            throw pr.data;
        }
        ThunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {isLoggedIn: true}
    } catch (e) {
        handleServerNetworkError({message: pr.data.messages[0]}, ThunkAPI.dispatch);
    }
});
export const logoutTC = createAsyncThunk('auth/logoutTC', async (payload, ThunkAPI) => {
    ThunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const pr = await authAPI.logout();
    try {
        if (pr.data.messages.length || pr.data.resultCode !== 0) {
            throw pr.data;
        }
        ThunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {isLoggedIn: false}
    } catch (e) {
        handleServerNetworkError({message: pr.data.messages[0]}, ThunkAPI.dispatch);
    }
})


const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(loginTC.fulfilled, (state, action) => {
            if (action.payload) {
                state.isLoggedIn = action.payload.isLoggedIn;
            }
        })
        builder.addCase(logoutTC.fulfilled, (state, action) => {
            if (action.payload) {
                state.isLoggedIn = action.payload.isLoggedIn;
            }
        })
        builder.addCase(initializeAppTC.fulfilled, (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn;
        })
    }
});

export const authReducer = slice.reducer;

