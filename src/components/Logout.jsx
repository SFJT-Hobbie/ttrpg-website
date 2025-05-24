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
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-darkfantasy-primary p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-6">
          Confirm Logout
        </h1>
        <p className="text-darkfantasy-neutral mb-6">
          Are you sure you want to log out?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmLogout}
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#661318] font-darkfantasy"
          >
            Yes
          </button>
          <button
            onClick={handleCancelLogout}
            className="bg-darkfantasy-tertiary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#3c2f2f] font-darkfantasy"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

export default Logout;