import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Calendar as CalendarIcon, PieChart, BookOpen, LogOut, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { toast } from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/daily-entry', label: 'Daily Entry', icon: BookOpen },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { path: '/insights', label: 'Insights', icon: PieChart },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  // Get user info
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsOpen(false);
    setIsLogoutModalOpen(false);
    toast.success('Logout successful');
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-16 md:px-8">
        
        {/* Mobile Left: Logo & Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Selfloom</span>
        </div>

        {/* Desktop Left: Empty to push right */}
        <div className="hidden md:block flex-1"></div>
        
        {/* Right Side Tools */}
        <div className="flex items-center gap-4">
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setProfileDropdown(!profileDropdown)}
              className="w-10 h-10 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
            >
              {initials}
            </button>
            
            {profileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                <div className="px-4 py-3 border-b border-gray-100 mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'email@example.com'}</p>
                </div>
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 transition-colors md:hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  isActive 
                    ? 'bg-primary-light text-primary'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
          
          <div className="my-2 border-t border-gray-100"></div>
          
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center w-full gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Logout?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
