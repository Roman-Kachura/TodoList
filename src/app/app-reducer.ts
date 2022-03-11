import {authAPI} from '../api/todolists-api';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {handleServerNetworkError} from "../utils/error-utils";

const initialState: InitialStateType = {
    status: 'idle',
    error: null,
    isInitialized: false
};

export const initializeAppTC = createAsyncThunk('app/initializeAppTC', async (payload, ThunkAPI) => {
    ThunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const pr = await authAPI.me();
    try {
        if (pr.data.resultCode !== 0) {
            throw pr.data.messages;
        }
        ThunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {isInitialized: true, isLoggedIn: true};
    } catch (e) {
        handleServerNetworkError({message: pr.data.messages[0]}, ThunkAPI.dispatch);
        return {isInitialized: true, isLoggedIn: false};
    }
});

const slice = createSlice({
    name: 'app',
    initialState: initialState,
    reducers: {
        setAppStatusAC: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
        setAppErrorAC: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },
        setAppInitializedAC: (state, action: PayloadAction<{ isInitialized: boolean }>) => {
            state.isInitialized = action.payload.isInitialized
        }
    },
    extraReducers: (builder) => {
        builder.addCase(initializeAppTC.fulfilled, (state, action) => {
            state.isInitialized = action.payload.isInitialized;
        })
    }
});

export const appReducer = slice.reducer;

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed';
export type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
};

export const {setAppErrorAC, setAppStatusAC, setAppInitializedAC} = slice.actions;
export type SetAppErrorActionType = ReturnType<typeof setAppErrorAC>;
export type SetAppStatusActionType = ReturnType<typeof setAppStatusAC>;

