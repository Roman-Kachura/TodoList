import React, {useCallback, useEffect} from 'react'
import './App.css'
import {TodolistsList} from '../features/TodolistsList/TodolistsList'
import {useSelector} from 'react-redux'
import {AppRootStateType, useAppDispatch} from './store'
import {initializeAppTC, RequestStatusType} from './app-reducer'
import {Route, Routes} from 'react-router-dom'
import {Login} from '../features/Login/Login'
import {logoutTC} from '../features/Login/auth-reducer'
import {AppBar, Button, CircularProgress, Container, LinearProgress, Toolbar, Typography} from '@mui/material';

import {ErrorSnackbar} from '../components/ErrorSnackbar/ErrorSnackbar';


function App() {
    const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status);
    const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized);
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeAppTC())
    }, []);

    const logoutHandler = useCallback(() => {
        dispatch(logoutTC())
    }, []);
    console.log(isInitialized)

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
            <CircularProgress color="secondary"/>
        </div>
    }

    return (
        <div className="App">
            <ErrorSnackbar/>
            <AppBar position="static" color="primary">
                <Toolbar style={{display: 'flex', justifyContent: 'end'}}>
                    <Typography variant="h6">
                        {isLoggedIn && <Button color="inherit" onClick={logoutHandler}>Log out</Button>}
                    </Typography>
                </Toolbar>
                {status === 'loading' && <LinearProgress color="secondary"/>}
            </AppBar>
            <Container fixed>
                <Routes>
                    <Route path={'/'} element={<TodolistsList/>}/>
                    <Route path={'/login'} element={<Login/>}/>
                </Routes>
            </Container>
        </div>
    )
}

export default App
