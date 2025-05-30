import { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { DiceBoxContext } from '../DiceBoxContext';
import {
  Menu,
  X,
  Home,
  ScrollText,
  Users,
  BookOpen,
  LogIn,
  LogOut,
  Trash2,
  Palette,
} from 'lucide-react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { diceBox, diceColor, setDiceColor } = useContext(DiceBoxContext);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    navigate('/logout');
  };

  const clearDice = () => {
    if (diceBox) {
      try {
        diceBox.clear();
        console.log('Dice cleared manually');
      } catch (err) {
        console.warn('Failed to clear dice:', err);
      }
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 py-2 px-3 rounded transition-colors duration-200 font-darkfantasy ${
      isActive
        ? 'bg-darkfantasy-neutral text-darkfantasy-highlight font-bold'
        : 'text-darkfantasy-neutral hover:bg-darkfantasy-secondary/80 hover:text-darkfantasy-highlight'
    } ${isOpen ? '' : 'justify-center'}`;

  return (
    <div
      className={`fixed top-0 left-0 bg-darkfantasy-primary text-darkfantasy-neutral h-screen ${
        isOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 flex flex-col z-50 shadow-darkfantasy border-darkfantasy`}
    >
      <button
        className="w-full flex justify-center p-4 hover:bg-darkfantasy-secondary/80"
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
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
      <div className={`mt-4 p-2 flex flex-col ${isOpen ? '' : 'items-center'}`}>
        {isOpen && (
          <h3 className="text-darkfantasy-highlight font-darkfantasy-heading text-sm mb-2">
            Dice
          </h3>
        )}
        <div className="flex flex-col gap-2">
          <div className={`grid ${isOpen ? 'grid-cols-4' : 'grid-cols-1'} gap-1`}>
            {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'].slice().reverse().map((die) => (
              <button
                key={die}
                onClick={() => {
                  if (diceBox) {
                    diceBox.roll(`1${die}`);
                  }
                }}
                disabled={!diceBox}
                className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-2 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow disabled:opacity-50 text-xs font-darkfantasy ${
                  isOpen ? '' : 'w-10 h-10 flex items-center justify-center'
                }`}
                aria-label={`Roll ${die}`}
              >
                {die}
              </button>
            ))}
          </div>
          <div className={`flex gap-4 mt-2 ${isOpen ? '' : 'flex-col'}`}>
            <button
              onClick={clearDice}
              disabled={!diceBox}
              className={`bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-2 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow disabled:opacity-50 flex items-center justify-center text-xs font-darkfantasy ${
                isOpen ? 'w-26' : 'w-10 h-10'
              }`}
              aria-label="Clear dice"
            >
              <Trash2 size={isOpen ? 14 : 16} />
              {isOpen && <span className="ml-1">Clear</span>}
            </button>
            <input
              type="color"
              value={diceColor}
              onChange={(e) => setDiceColor(e.target.value)}
              className={`bg-darkfantasy-secondary rounded border-darkfantasy hover:shadow-darkfantasy-glow ${
                isOpen ? 'w-8 h-8' : 'w-10 h-10'
              }`}
              aria-label="Change dice color"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;