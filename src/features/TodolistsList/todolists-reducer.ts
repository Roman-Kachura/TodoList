import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {RequestStatusType, setAppStatusAC,} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'

const initialState: Array<TodolistDomainType> = [];

// Thunks
export const fetchTodolistsTC = createAsyncThunk('todolists/fetchTodoLists', async (payload, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const pr = await todolistsAPI.getTodolists();
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    return {todolists: pr.data};
});
export const removeTodolistTC = createAsyncThunk('todolists/removeTodoList', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}));
    const pr = await todolistsAPI.deleteTodolist(todolistId);
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: todolistId};
    } catch (e) {
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
});
export const addTodolistTC = createAsyncThunk('todolists/addTodolist', async (title: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    const pr = await todolistsAPI.createTodolist(title);
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
        return {todolist: pr.data.data.item};
    } catch (e) {
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
});
export const changeTodolistTitleTC = createAsyncThunk('todolists/changeTodolistTitle', async (payload: { id: string, title: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.id, status: 'loading'}));
    const pr = await todolistsAPI.updateTodolist(payload.id, payload.title);
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.id, status: 'succeeded'}));
        return {id: payload.id, title: payload.title};
    } catch (e) {
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.id, status: 'failed'}));
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
});

// Reducer
const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}));
        });

        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            if (action.payload) {
                const todolistID = action.payload.id;
                const index = state.findIndex(tl => tl.id === todolistID);
                if (index > -1) {
                    state.splice(index, 1);
                }
            }
        });

        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            if (action.payload) {
                state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'});
            }
        });

        builder.addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
            if (action.payload) {
                const todolistID = action.payload.id;
                const index = state.findIndex(tl => tl.id === todolistID);
                state[index].title = action.payload.title;
            }
        });
    }
});
export const todolistsReducer = slice.reducer;

// Actions
export const {changeTodolistFilterAC, changeTodolistEntityStatusAC} = slice.actions;

// Types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
};
