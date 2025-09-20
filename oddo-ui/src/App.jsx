import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginComponent from './LoginComponent'
import DashboardComponent from './DashboardComponent'
import WorkOrdersComponent from './WorkOrdersComponent'
import WorkCenterTableComponent from './WorkCenterTableComponent'
import StockLedgerTableComponent from './StockLedgerTableComponent'
import BOMTableComponent from './BOMTableComponent'

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // Start with dashboard for now
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuState, setMenuState] = useState({ master: false, profile: false });

  const handleNavigation = (view) => {
    if (view === currentView) return; // Don't transition to same view
    
    setIsTransitioning(true);
    
    // Small delay to allow fade-out effect
    setTimeout(() => {
      setCurrentView(view);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50); // Short delay for fade-in
    }, 150);
  };

  const handleMenuStateChange = (menuType, isOpen) => {
    setMenuState(prev => ({
      ...prev,
      [menuType]: isOpen
    }));
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginComponent onNavigate={handleNavigation} />;
      case 'dashboard':
        return <DashboardComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'work-orders':
        return <WorkOrdersComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'work-center':
        return <WorkCenterTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'stock-ledger':
        return <StockLedgerTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'bom':
        return <BOMTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      default:
        return <LoginComponent onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className={`app-container ${isTransitioning ? 'transitioning' : ''}`}>
      <div 
        className={`page-transition transition-all duration-300 ${
          menuState.master ? 'ml-80' : ''
        } ${
          menuState.profile ? 'mr-80' : ''
        }`}
      >
        {renderCurrentView()}
      </div>
    </div>
  );
}

export default App;
