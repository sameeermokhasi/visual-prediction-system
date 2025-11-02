import React, { useState } from 'react';
import axios from 'axios';
import { FiUserPlus, FiUser, FiLock, FiMail, FiBriefcase, FiCalendar, FiLoader } from 'react-icons/fi';
import AuthBackground from './AuthBackground';

const API_URL = 'http://localhost:8000';

const SignupPage = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [establishedDate, setEstablishedDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/users/`, {
        email,
        password,
        company: {
          name: companyName,
          established_date: establishedDate,
        },
      });
      onSignupSuccess();
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error('Signup error:', err);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <AuthBackground />
      <div className="max-w-md w-full mx-auto z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create an Account</h1>
          <p className="text-gray-600">Join VisionAI and start automating your quality control</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <FiMail className="absolute top-3 left-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute top-3 left-3 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FiBriefcase className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FiCalendar className="absolute top-3 left-3 text-gray-400" />
              <input
                type="date"
                placeholder="Established Date"
                value={establishedDate}
                onChange={(e) => setEstablishedDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <>
                    <FiUserPlus className="mr-2" />
                    Sign Up
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
