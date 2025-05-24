/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await signIn({ email, password });
    if (error) {
      setError(error.message);
      console.error('Login error:', error.message);
    } else {
      navigate('/characters', { replace: true });
    }
  };

  if (loading) return <div className="text-darkfantasy-neutral text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-darkfantasy-primary p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-6 text-center">
          Login
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-darkfantasy-secondary text-darkfantasy-neutral py-2 rounded hover:bg-[#3c2f2f] font-darkfantasy"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-darkfantasy-neutral text-sm">
          Don’t have an account?{' '}
          <Link to="/register" className="text-darkfantasy-highlight hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;