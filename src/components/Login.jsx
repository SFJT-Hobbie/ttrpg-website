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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkfantasy-background text-darkfantasy-neutral text-center font-darkfantasy animate-pulse-darkfantasy">
        Unveiling the annals...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="bg-darkfantasy-tertiary p-8 rounded-lg shadow-darkfantasy w-full max-w-md border-darkfantasy-dark">
        <h1 className="text-3xl font-darkfantasy-heading text-darkfantasy-accent mb-6 text-center tracking-tight">
          Enter the Realm
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Email"
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
              placeholder="Your password..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-darkfantasy-secondary text-darkfantasy-neutral py-3 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Login"
          >
            Cross the Threshold
          </button>
        </form>
        <p className="mt-4 text-center text-darkfantasy-neutral text-sm font-darkfantasy">
          Yet to join the saga?{' '}
          <Link
            to="/register"
            className="text-darkfantasy-highlight hover:text-darkfantasy-accent hover:underline transition-all duration-300"
            aria-label="Register"
          >
            Inscribe Your Name
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;