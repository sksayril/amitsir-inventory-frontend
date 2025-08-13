import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LogIn } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="Enter your email"
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>

      <p className="text-center text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Sign up here
        </button>
      </p>
    </form>
  );
};