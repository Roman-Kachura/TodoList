import {addTodolistTC, changeTodolistEntityStatusAC, fetchTodolistsTC, removeTodolistTC} from './todolists-reducer'
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {setAppStatusAC} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

const initialState: TasksStateType = {}

//Thunks

export const fetchTasksTC = createAsyncThunk('task/fetchTasks', async (todolistId: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}));
    const pr = await todolistsAPI.getTasks(todolistId);
    const tasks: Array<TaskType> = pr.data.items;
    thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'succeeded'}));
    return {tasks, todolistId}
})
export const removeTaskTC = createAsyncThunk('task/removeTask', async (payload: { taskId: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'loading'}));
    const pr = await todolistsAPI.deleteTask(payload.todolistId, payload.taskId);
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'succeeded'}));
        return {taskId: payload.taskId, todolistId: payload.todolistId};
    } catch (e) {
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'failed'}));
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
})
export const addTaskTC = createAsyncThunk('task/addTask', async (payload: { title: string, todolistId: string }, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'loading'}));
    const pr = await todolistsAPI.createTask(payload.todolistId, payload.title)
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'succeeded'}));
        return {task: pr.data.data.item}
    } catch (e) {
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'failed'}));
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
})
export const updateTaskTC = createAsyncThunk('task/updateTask', async (payload: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    const task = state.tasks[payload.todolistId].find((t: { id: string }) => t.id === payload.taskId);
    if (!task) {
        console.warn('task not found in the state');
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...payload.model
    }

    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
    thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'loading'}));
    const pr = await todolistsAPI.updateTask(payload.todolistId, payload.taskId, apiModel)
    try {
        if (pr.data.messages.length) {
            throw pr.data.messages[0];
        }

        if (pr.data.resultCode !== 0){
            throw pr.data.resultCode;
        }
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'succeeded'}));
        return {...payload};
    } catch (e) {
        thunkAPI.dispatch(changeTodolistEntityStatusAC({id: payload.todolistId, status: 'failed'}));
        handleServerNetworkError({message: pr.data.messages[0]}, thunkAPI.dispatch);
    }
})

//Reducer

const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTodolistTC.fulfilled, (state, action) => {
            if (action.payload) {
                state[action.payload.todolist.id] = [];
            }

        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action) => {
            if (action.payload) delete state[action.payload.id];
        });
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasksTC.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks;
        });

        builder.addCase(removeTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                const taskID = action.payload.taskId;
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(t => t.id === taskID);
                if (index > -1) {
                    tasks.splice(index, 1)
                }
            }

        });

        builder.addCase(addTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                state[action.payload.task.todoListId].unshift(action.payload.task);
            }
        });

        builder.addCase(updateTaskTC.fulfilled, (state, action) => {
            if (action.payload) {
                const taskID = action.payload.taskId;
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(t => t.id === taskID);
                if (index > -1) {
                    tasks[index] = {...tasks[index], ...action.payload.model}
                }
            }

        });
    }
})

export const tasksReducer = slice.reducer

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

