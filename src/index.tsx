import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import packageInfo from '../package.json'

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(<App />)

console.log(`Agenda Creator version ${packageInfo.version}`)
