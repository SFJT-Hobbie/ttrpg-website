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

  if (loading) return <div className="text-darkfantasy-neutral text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3c2f2f]">
      <div className="bg-darkfantasy-primary p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-6 text-center">
          Register
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
              required
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-darkfantasy-secondary text-darkfantasy-neutral py-2 rounded hover:bg-[#3c2f2f] font-darkfantasy"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-darkfantasy-neutral text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-darkfantasy-highlight hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;