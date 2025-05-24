import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  Menu,
  X,
  Home,
  ScrollText,
  Users,
  BookOpen,
  LogIn,
  LogOut,
} from 'lucide-react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    navigate('/logout');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 py-2 px-3 rounded transition-colors duration-200 ${
      isActive
        ? 'bg-darkfantasy-neutral text-darkfantasy-highlight font-bold'
        : 'text-darkfantasy-neutral hover:bg-darkfantasy-secondary hover:text-darkfantasy-highlight'
    }`;

  return (
    <div
      className={`fixed top-0 left-0 bg-darkfantasy-primary text-white h-screen ${
        isOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 flex flex-col z-50`}
    >
      <button
        className="w-full flex justify-center p-4"
        onClick={toggleSidebar}
      >
        {isOpen ? <X /> : <Menu />}
      </button>
      <nav className="flex flex-col p-2 space-y-2">
        <NavLink to="/" className={navItemClass}>
          <Home size={20} />
          {isOpen && 'Home'}
        </NavLink>
        <NavLink to="/rules" className={navItemClass}>
          <ScrollText size={20} />
          {isOpen && 'Rules'}
        </NavLink>
        {user && (
          <>
            <NavLink to="/characters" className={navItemClass}>
              <Users size={20} />
              {isOpen && 'Characters'}
            </NavLink>
            <NavLink to="/journals" className={navItemClass}>
              <BookOpen size={20} />
              {isOpen && 'Journals'}
            </NavLink>
          </>
        )}
        {user ? (
          <NavLink to="/logout" className={navItemClass} onClick={handleLogout}>
            <LogOut size={20} />
            {isOpen && 'Logout'}
          </NavLink>
        ) : (
          <NavLink to="/login" className={navItemClass}>
            <LogIn size={20} />
            {isOpen && 'Login'}
          </NavLink>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;