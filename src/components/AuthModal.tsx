"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { FaGithub, FaCheckCircle } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, mode = 'login', onSuccess }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setLoginSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginSuccess(false);
    setLoading(true);
    
    try {
      const authUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8080';
      const endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      console.log(`🔗 Attempting ${currentMode} to:`, `${authUrl}${endpoint}`);
      
      const body = currentMode === 'login' 
        ? { email, password }
        : { name, email, password };
      
      const res = await fetch(`${authUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      console.log('📡 Response status:', res.status);
      
      const contentType = res.headers.get("content-type") || "";
      
      if (!res.ok) {
        const errorText = contentType.includes("application/json")
          ? (await res.json()).error || `${currentMode} failed`
          : await res.text();
        console.error(`❌ ${currentMode} failed:`, errorText);
        throw new Error(errorText);
      }
      
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error('❌ Unexpected response format:', text);
        throw new Error("Unexpected response format from server");
      }
      
      const data = await res.json();
      console.log(`✅ ${currentMode} successful, token received:`, !!data.token);
      
      if (data.token) {
        localStorage.setItem("token", data.token);
        setLoginSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          router.push("/dashboard");
        }, 1500);
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      console.error(`❌ ${currentMode} error:`, err);
      setError(message);
    } finally {
      if (!loginSuccess) setLoading(false);
    }
  };

  const handleGithubAuth = () => {
    signIn('github', { callbackUrl: '/dashboard' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-[#1a1446]">
            {currentMode === 'login' ? 'Login to TradeMinutes' : 'Sign up for TradeMinutes'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Loading Overlay */}
        {(loading || loginSuccess) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              {!loginSuccess ? (
                <LoadingSpinner size="lg" text={`${currentMode === 'login' ? 'Logging in' : 'Signing up'}...`} />
              ) : (
                <>
                  <FaCheckCircle className="text-5xl text-[#22c55e] animate-pop" />
                  <span className="text-lg font-semibold text-[#22c55e]">
                    {currentMode === 'login' ? 'Login' : 'Sign up'} successful!
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${loading || loginSuccess ? 'blur-sm pointer-events-none' : ''}`}>
          <p className="text-gray-500 mb-6">
            {currentMode === 'login' 
              ? 'Connect with your community and exchange skills for time credits!'
              : 'Join the community and start exchanging skills for time credits!'
            }
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          {/* GitHub Auth */}
          <button
            onClick={handleGithubAuth}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-full py-3 bg-white hover:bg-gray-50 transition-colors text-[#1a1446] font-medium text-lg mb-4"
          >
            <FaGithub className="text-2xl" /> 
            {currentMode === 'login' ? 'Sign in' : 'Sign up'} with GitHub
          </button>
          
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="px-3 text-gray-400 text-sm">
              or {currentMode === 'login' ? 'Sign in' : 'Sign up'} with Email
            </span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {currentMode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1 text-[#1a1446]">
                  Full Name<span className="text-[#22c55e]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white rounded-full border border-gray-200 px-5 py-3 focus:border-[#22c55e] outline-none text-[#1a1446] placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-[#1a1446]">
                Email Address<span className="text-[#22c55e]">*</span>
              </label>
              <div className="flex items-center bg-white rounded-full border border-gray-200 px-5 py-3 focus-within:border-[#22c55e]">
                <FiMail className="text-xl text-[#22c55e] mr-3" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#1a1446] placeholder-gray-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-[#1a1446]">
                Password<span className="text-[#22c55e]">*</span>
              </label>
              <div className="flex items-center bg-white rounded-full border border-gray-200 px-5 py-3 focus-within:border-[#22c55e]">
                <FiLock className="text-xl text-[#22c55e] mr-3" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#1a1446] placeholder-gray-400"
                  required
                  disabled={loading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(v => !v)} 
                  className="ml-2 text-gray-400 hover:text-[#22c55e]"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {currentMode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-[#1a1446]">
                  <input type="checkbox" className="mr-2 accent-[#22c55e]" /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-sm text-[#22c55e] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold rounded-full py-3 transition-colors duration-150 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (currentMode === 'login' ? "Logging in..." : "Signing up...") 
                : (currentMode === 'login' ? "Login to TradeMinutes" : "Sign up for TradeMinutes")
              }
            </button>
          </form>

          {/* Mode Switch */}
          <p className="text-center text-sm mt-6 text-[#1a1446]">
            {currentMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setCurrentMode(currentMode === 'login' ? 'signup' : 'login')}
              className="text-[#22c55e] hover:underline font-medium"
            >
              {currentMode === 'login' ? 'Sign up for TradeMinutes' : 'Login to TradeMinutes'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
} 