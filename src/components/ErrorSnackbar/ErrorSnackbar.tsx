import React, {useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {AppRootStateType, useAppDispatch, useAppSelector} from '../../app/store'
import {setAppErrorAC} from '../../app/app-reducer'
import {Alert, AlertProps, Snackbar, SnackbarCloseReason} from '@mui/material';

export function ErrorSnackbar() {
    const error = useAppSelector<string | null>(state => state.app.error);
    const [isOpen, setIsOpen] = useState(true);
    const dispatch = useAppDispatch()
    const handleClose = (event?: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return
        }
        dispatch(setAppErrorAC({error: null}));
    }
    useEffect(() => {
        error !== null ? setIsOpen(true) : setIsOpen(false);
    }, [error])
    return (
        <Snackbar open={isOpen} autoHideDuration={6000} onClose={handleClose}>
            <Alert severity="error" children={error} onClose={handleClose}/>
        </Snackbar>
    )
}
