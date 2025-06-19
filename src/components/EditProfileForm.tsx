"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormData {
  name: string;
  email: string;
  college: string;
  program: string;
  yearOfStudy: string;
  bio: string;
  phone: string;
  skills: string[];
}

interface ValidationErrors {
  name?: string;
  email?: string;
  college?: string;
  program?: string;
  yearOfStudy?: string;
  phone?: string;
}

export default function EditProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    college: '',
    program: '',
    yearOfStudy: '',
    bio: '',
    phone: '',
    skills: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [skillInput, setSkillInput] = useState('');

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        
        const data = await res.json();
        setFormData({
          name: data.Name || '',
          email: data.Email || '',
          college: data.College || '',
          program: data.Program || '',
          yearOfStudy: data.YearOfStudy || '',
          bio: data.Bio || '',
          phone: data.Phone || '',
          skills: Array.isArray(data.Skills) ? data.Skills : []
        });
      } catch (err) {
        setError('Failed to load profile data');
      }
    };

    fetchProfile();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // College validation
    if (!formData.college.trim()) {
      newErrors.college = 'College/University is required';
    }

    // Program validation
    if (!formData.program.trim()) {
      newErrors.program = 'Program/Major is required';
    }

    // Year of Study validation
    if (!formData.yearOfStudy.trim()) {
      newErrors.yearOfStudy = 'Year of Study is required';
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.name ? 'border-red-300' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.email ? 'border-red-300' : ''
            }`}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* College field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">College/University</label>
          <input
            type="text"
            value={formData.college}
            onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.college ? 'border-red-300' : ''
            }`}
          />
          {errors.college && <p className="mt-1 text-sm text-red-600">{errors.college}</p>}
        </div>

        {/* Program field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Program/Major</label>
          <input
            type="text"
            value={formData.program}
            onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.program ? 'border-red-300' : ''
            }`}
          />
          {errors.program && <p className="mt-1 text-sm text-red-600">{errors.program}</p>}
        </div>

        {/* Year of Study field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Year of Study</label>
          <input
            type="text"
            value={formData.yearOfStudy}
            onChange={(e) => setFormData(prev => ({ ...prev, yearOfStudy: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.yearOfStudy ? 'border-red-300' : ''
            }`}
          />
          {errors.yearOfStudy && <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy}</p>}
        </div>

        {/* Phone field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 ${
              errors.phone ? 'border-red-300' : ''
            }`}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Bio field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio (optional)</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
          />
        </div>

        {/* Skills field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-violet-600 hover:text-violet-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50 ${
            loading ? 'cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}