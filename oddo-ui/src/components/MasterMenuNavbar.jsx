import React, { useState } from 'react';
import { 
  Menu,
  X,
  FileText,
  Settings,
  Factory,
  Package
} from 'lucide-react';

const MasterMenuNavbar = ({ onNavigate, currentModule = '', onMenuStateChange }) => {
  const [showMasterMenu, setShowMasterMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const masterMenuItems = [
    { 
      key: 'manufacturing-orders', 
      label: 'Manufacturing Orders', 
      icon: FileText, 
      component: 'dashboard' 
    },
    { 
      key: 'work-orders', 
      label: 'Work Orders', 
      icon: Settings, 
      component: 'work-orders' 
    },
    { 
      key: 'bom', 
      label: 'Bills of Materials', 
      icon: FileText, 
      component: 'bom' 
    },
    { 
      key: 'work-center', 
      label: 'Work Center', 
      icon: Factory, 
      component: 'work-center' 
    },
    { 
      key: 'stock-ledger', 
      label: 'Stock Ledger', 
      icon: Package, 
      component: 'stock-ledger' 
    }
  ];

  const handleNavigateToModule = (component) => {
    console.log('MasterMenuNavbar - handleNavigateToModule called with component:', component);
    console.log('MasterMenuNavbar - onNavigate function exists:', !!onNavigate);
    
    // Debug logging for work-center and stock-ledger specifically
    if (component === 'work-center' || component === 'stock-ledger') {
      console.log(`MasterMenuNavbar - Special debug for ${component} navigation`);
      console.log(`MasterMenuNavbar - Current module is: ${currentModule}`);
      console.log(`MasterMenuNavbar - Matched menu item:`, masterMenuItems.find(item => item.component === component));
    }
    
    setIsAnimating(true);
    
    // Add a slight delay for visual feedback
    setTimeout(() => {
      if (onNavigate) {
        console.log('MasterMenuNavbar - Calling onNavigate with:', component);
        console.log('MasterMenuNavbar - onNavigate type:', typeof onNavigate);
        onNavigate(component);
      } else {
        console.error('MasterMenuNavbar - onNavigate function not provided!');
      }
      setShowMasterMenu(false);
      if (onMenuStateChange) {
        onMenuStateChange('master', false);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleOpenMenu = () => {
    setShowMasterMenu(true);
    if (onMenuStateChange) {
      onMenuStateChange('master', true);
    }
  };

  const handleCloseMenu = () => {
    setShowMasterMenu(false);
    if (onMenuStateChange) {
      onMenuStateChange('master', false);
    }
  };

  return (
    <>
      {/* Master Menu Button */}
      <button
        onClick={handleOpenMenu}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 btn-smooth"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Master Menu Sidebar (from LEFT side) */}
      {showMasterMenu && (
        <>
          <div 
            className="fixed inset-0 bg-transparent z-40 transition-opacity duration-300" 
            onClick={handleCloseMenu}
          ></div>
          <div className="fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-50 menu-slide-in">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Master Menu</h3>
              <button 
                onClick={handleCloseMenu}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 btn-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <div className="space-y-2">
                {masterMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        console.log(`MasterMenuNavbar - Click on menu item: ${item.label} (${item.key}), navigating to: ${item.component}`);
                        handleNavigateToModule(item.component);
                      }}
                      disabled={isAnimating}
                      className={`w-full text-left p-3 rounded flex items-center space-x-3 transition-all duration-200 transform hover:scale-105 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-md' 
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      } ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default MasterMenuNavbar;