/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    const { error } = await signUp({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      setError(error.message);
      console.error('Registration error:', error.message);
    } else {
      navigate('/login', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-darkfantasy-neutral text-center font-darkfantasy animate-pulse-darkfantasy">
        Forging your legend...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="bg-darkfantasy-tertiary p-8 rounded-lg shadow-darkfantasy w-full max-w-md border-darkfantasy-dark">
        <h1 className="text-3xl font-darkfantasy-heading text-darkfantasy-accent mb-6 text-center tracking-tight">
          Forge Your Legend
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Your name in the saga..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Username"
            />
          </div>
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Your password..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-darkfantasy-secondary text-darkfantasy-neutral py-3 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Register"
          >
            Join the Saga
          </button>
        </form>
        <p className="mt-4 text-center text-darkfantasy-neutral text-sm font-darkfantasy">
          Already bound to the realm?{' '}
          <Link
            to="/login"
            className="text-darkfantasy-highlight hover:text-darkfantasy-accent hover:underline transition-all duration-300"
            aria-label="Login"
          >
            Return to the Annals
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;