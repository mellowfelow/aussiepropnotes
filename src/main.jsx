import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

const root = document.getElementById('root')
const app = <BrowserRouter><App /></BrowserRouter>
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
