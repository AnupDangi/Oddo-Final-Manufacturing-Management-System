import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginComponent from './LoginComponent'
import DashboardComponent from './DashboardComponent'
import ManufacturingOrdersComponent from './ManufacturingOrdersComponent'
import WorkOrdersComponent from './WorkOrdersComponent'

function App() {
  return (
    <>
      <LoginComponent />
      <DashboardComponent />
      <ManufacturingOrdersComponent />
      <WorkOrdersComponent />
    </>
  );
}

export default App
