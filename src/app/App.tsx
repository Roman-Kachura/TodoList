import React, {useCallback, useEffect} from 'react'
import './App.css'
import {
    AppBar,
    Button,
    CircularProgress,
    Container,
    IconButton,
    LinearProgress,
    Toolbar,
    Typography
} from '@material-ui/core'
import {Menu} from '@material-ui/icons'
import {TodolistsList} from '../features/TodolistsList/TodolistsList'
import {ErrorSnackbar} from '../components/ErrorSnackbar/ErrorSnackbar'
import {useDispatch, useSelector} from 'react-redux'
import {AppRootStateType} from './store'
import {initializeAppTC, RequestStatusType} from './app-reducer'
import {Route} from 'react-router-dom'
import {Login} from '../features/Login/Login'
import {logoutTC} from '../features/Login/auth-reducer'

type PropsType = {
    demo?: boolean
}

function App({demo = false}: PropsType) {
    const status = useSelector<AppRootStateType, RequestStatusType>((state) => state.app.status)
    const isInitialized = useSelector<AppRootStateType, boolean>((state) => state.app.isInitialized)
    const isLoggedIn = useSelector<AppRootStateType, boolean>(state => state.auth.isLoggedIn)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(initializeAppTC())
    }, [])

    const logoutHandler = useCallback(() => {
        dispatch(logoutTC())
    }, [])

    if (!isInitialized) {
        return <div
            style={{position: 'fixed', top: '30%', textAlign: 'center', width: '100%'}}>
            <CircularProgress color='secondary'/>
        </div>
    }

    return (
        <div className="App">
            <ErrorSnackbar/>
            <AppBar position="static" color='primary'>
                <Toolbar style={{display: 'flex', justifyContent: 'end'}}>
                    <Typography variant="h6">
                        {isLoggedIn && <Button color="inherit" onClick={logoutHandler}>Log out</Button>}
                    </Typography>
                </Toolbar>
                {status === 'loading' && <LinearProgress color='secondary'/>}
            </AppBar>
            <Container fixed>
                <Route exact path={'/'} render={() => <TodolistsList demo={demo}/>}/>
                <Route path={'/login'} render={() => <Login/>}/>
            </Container>
        </div>
    )
}

export default App
