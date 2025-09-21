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
import ManufacturingOrderForm from './components/ManufacturingOrderForm'
import ManufacturingOrderConfirmed from './components/ManufacturingOrderConfirmed'
import MyReportComponent from './components/MyReportComponent'
import { useAuth } from './context/AuthContext'

function App() {
  const [currentView, setCurrentView] = useState('login'); // Start with login by default
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuState, setMenuState] = useState({ master: false, profile: false });
  const [manufacturingOrderData, setManufacturingOrderData] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  // Check authentication status on app load or when auth state changes
  useEffect(() => {
    // Redirect to dashboard if authenticated, login if not
    if (isAuthenticated && currentView === 'login') {
      setCurrentView('dashboard');
    } else if (!isAuthenticated && currentView !== 'login') {
      setCurrentView('login');
    }
  }, [isAuthenticated, currentView]);

  const handleMenuStateChange = (menuType, isOpen) => {
    setMenuState(prev => ({
      ...prev,
      [menuType]: isOpen
    }));
  };

  // Update handleNavigation to handle passing data between views
  const handleNavigation = (view, data = null) => {
    console.log('App - Navigation request received for:', view, 'with data:', data);
    console.log('App - Current view before navigation:', currentView);
    
    // Enhanced debugging for work-center and stock-ledger navigation
    if (view === 'work-center' || view === 'stock-ledger') {
      console.log(`App - Special debug for ${view} navigation request`);
      console.log(`App - handleNavigation was called directly with ${view}`);
      console.trace(`App - Navigation trace for ${view}`);
    }
    
    // If data is provided, store it
    if (data) {
      if (view === 'manufacturing-order-confirmed') {
        setManufacturingOrderData(data.orderData);
      }
    }
    
    // Validate that view is a supported component
    const validViews = ['login', 'dashboard', 'manufacturing-order-form', 'manufacturing-order-confirmed', 
                        'work-orders', 'work-center', 'stock-ledger', 'bom', 'reports'];
    
    if (!validViews.includes(view)) {
      console.error('App - Invalid view requested:', view);
      console.log('App - Valid views are:', validViews.join(', '));
    }
    
    // Handle logout
    if (view === 'logout') {
      logout();
      setCurrentView('login');
      return;
    }
    
    // Protect routes - redirect to login if not authenticated
    if (!isAuthenticated && view !== 'login') {
      setCurrentView('login');
      return;
    }
    
    // Don't transition to same view
    if (view === currentView) return;
    
    setIsTransitioning(true);
    
    // Small delay to allow fade-out effect
    setTimeout(() => {
      console.log('App - Setting currentView to:', view);
      setCurrentView(view);
      setTimeout(() => {
        setIsTransitioning(false);
        console.log('App - Current view is now:', view);
      }, 50); // Short delay for fade-in
    }, 150);
  };

  const renderCurrentView = () => {
    console.log('Rendering view for currentView:', currentView);
    
    switch (currentView) {
      case 'login':
        return <LoginComponent onNavigate={handleNavigation} />;
      case 'dashboard':
        return <DashboardComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'manufacturing-order-form':
        return <ManufacturingOrderForm onNavigate={handleNavigation} />;
      case 'manufacturing-order-confirmed':
        return <ManufacturingOrderConfirmed onNavigate={handleNavigation} orderData={manufacturingOrderData} />;
      case 'work-orders':
        return <WorkOrdersComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'work-center': // Must match the 'component' value in masterMenuItems
        console.log('App - Rendering WorkCenterTableComponent');
        return <WorkCenterTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'stock-ledger': // Must match the 'component' value in masterMenuItems
        console.log('App - Rendering StockLedgerTableComponent');
        return <StockLedgerTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'bom':
        return <BOMTableComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      case 'reports': // This matches the key in profileMenuItems in ProfileNavbar.jsx
        console.log('App - Rendering MyReportComponent');
        return <MyReportComponent onNavigate={handleNavigation} onMenuStateChange={handleMenuStateChange} />;
      default:
        console.log('Falling back to default view (LoginComponent)');
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
