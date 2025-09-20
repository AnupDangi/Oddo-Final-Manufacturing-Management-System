import React, { useState } from 'react';
import { 
  User,
  X,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const ProfileNavbar = ({ onNavigate, onMenuStateChange }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const profileMenuItems = [
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'reports', label: 'My Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  console.log('ProfileNavbar initialized with onNavigate:', !!onNavigate);

  const handleProfileAction = (action) => {
    setIsAnimating(true);
    
    setTimeout(() => {
      console.log(`ProfileNavbar - handleProfileAction called with action: ${action}`);
      
      // Direct navigation to the appropriate view based on action
      if (onNavigate) {
        if (action === 'logout') {
          onNavigate('login');
        } else if (action === 'reports') {
          console.log('ProfileNavbar - Navigating to reports view');
          onNavigate('reports');
        } else if (action === 'profile') {
          console.log('ProfileNavbar - Navigating to user profile');
          onNavigate('profile');
        } else if (action === 'settings') {
          console.log('ProfileNavbar - Navigating to settings');
          onNavigate('settings');
        } else {
          console.log(`ProfileNavbar - Unknown profile action: ${action}`);
        }
      } else {
        console.error('ProfileNavbar - onNavigate function not provided!');
      }
      
      // Close the dropdown
      setShowProfileDropdown(false);
      if (onMenuStateChange) {
        onMenuStateChange('profile', false);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleOpenProfile = () => {
    setShowProfileDropdown(true);
    if (onMenuStateChange) {
      onMenuStateChange('profile', true);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileDropdown(false);
    if (onMenuStateChange) {
      onMenuStateChange('profile', false);
    }
  };

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={handleOpenProfile}
        className="flex items-center p-2 rounded-md hover:bg-gray-100 transition-all duration-200 btn-smooth"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center transform transition-transform duration-200 hover:scale-110">
          <User className="h-5 w-5 text-white" />
        </div>
      </button>

      {/* Profile Dropdown Sidebar (from RIGHT side) */}
      {showProfileDropdown && (
        <>
          <div 
            className="fixed inset-0 bg-transparent z-40 transition-opacity duration-300" 
            onClick={handleCloseProfile}
          ></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg z-50 profile-slide-in">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Profile Setup</h3>
              <button 
                onClick={handleCloseProfile}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 btn-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <div className="space-y-2">
                {profileMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleProfileAction(item.key)}
                      disabled={isAnimating}
                      className={`w-full text-left p-3 text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-3 transition-all duration-200 transform hover:scale-105 hover:shadow-sm ${
                        isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <hr className="my-2" />
                <button 
                  onClick={() => handleProfileAction('logout')}
                  disabled={isAnimating}
                  className={`w-full text-left p-3 text-red-600 hover:bg-red-50 rounded flex items-center space-x-3 transition-all duration-200 transform hover:scale-105 hover:shadow-sm ${
                    isAnimating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default ProfileNavbar;