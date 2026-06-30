import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateLoginPopup = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      ></motion.div>

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X size={20} className="text-slate-500" />
        </button>

        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isRegistering 
                ? 'Join thousands of job seekers today' 
                : 'Please enter your details to sign in'}
            </p>
          </div>

          {/* Social Login */}
          <button className="w-full py-4 px-6 border-2 border-slate-100 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 transition-all font-bold text-slate-700 mb-6">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {isRegistering && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                </div>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-800"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-800"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Password" 
                className="w-full pl-12 pr-14 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-800"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isRegistering && (
              <div className="flex justify-end">
                <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                  Forgot Password?
                </button>
              </div>
            )}

            <button className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center space-x-2">
              <span>{isRegistering ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 font-medium">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-indigo-600 font-bold hover:underline decoration-2 underline-offset-4"
              >
                {isRegistering ? 'Sign In' : 'Create One Now'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CandidateLoginPopup;
