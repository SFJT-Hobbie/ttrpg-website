import { useAuth } from '../AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Logout error:', error.message);
    }
    navigate('/login', { replace: true });
  };

  const handleCancelLogout = () => {
    navigate('/characters', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="bg-darkfantasy-tertiary p-8 rounded-lg shadow-darkfantasy w-full max-w-md text-center border-darkfantasy-dark">
        <h1 className="text-3xl font-darkfantasy-heading text-darkfantasy-accent mb-6 tracking-tight">
          Sever the Bond
        </h1>
        <p className="text-darkfantasy-neutral text-sm font-darkfantasy mb-6">
          Are you certain you wish to depart this realm?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmLogout}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Confirm logout"
          >
            Yes
          </button>
          <button
            onClick={handleCancelLogout}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Cancel logout"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;