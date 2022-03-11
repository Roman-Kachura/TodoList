import React from 'react'
import {action} from '@storybook/addon-actions'
import App from './App'
import {BrowserRouterDecoration, ReduxStoreProviderDecorator} from '../stories/decorators/ReduxStoreProviderDecorator'

export default {
    title: 'App Stories',
    component: App,
    decorators: [ReduxStoreProviderDecorator, BrowserRouterDecoration]
}

export const AppBaseExample = (props: any) => {
    return (<App demo={true}/>)
}
