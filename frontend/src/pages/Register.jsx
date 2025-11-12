import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    phone: '',
    nextOfKin: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('nextOfKin.')) {
      const kinField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nextOfKin: {
          ...prev.nextOfKin,
          [kinField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <DollarSign className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join WE MZEE Investment Group
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your member account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700">
                    ID Number
                  </label>
                  <input
                    id="idNumber"
                    name="idNumber"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Next of Kin & Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Next of Kin</h3>
                
                <div>
                  <label htmlFor="nextOfKin.name" className="block text-sm font-medium text-gray-700">
                    Next of Kin Name
                  </label>
                  <input
                    id="nextOfKin.name"
                    name="nextOfKin.name"
                    type="text"
                    required
                    value={formData.nextOfKin.name}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="nextOfKin.relationship" className="block text-sm font-medium text-gray-700">
                    Relationship
                  </label>
                  <select
                    id="nextOfKin.relationship"
                    name="nextOfKin.relationship"
                    required
                    value={formData.nextOfKin.relationship}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nextOfKin.phone" className="block text-sm font-medium text-gray-700">
                    Next of Kin Phone
                  </label>
                  <input
                    id="nextOfKin.phone"
                    name="nextOfKin.phone"
                    type="tel"
                    required
                    value={formData.nextOfKin.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;