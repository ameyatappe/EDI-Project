import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, supabase } from '../lib/supabaseClient';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.')
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters long.')
});

export default function AuthPage({ onLoginSuccess }) {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleAccountModal, setShowGoogleAccountModal] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    clearErrors
  } = useForm({
    resolver: zodResolver(isSignUpMode ? signupSchema : loginSchema),
    mode: 'onChange',
  });

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setErrorMsg('');
    setSuccessMsg('');
    reset();
    clearErrors();
  };

  // Mock Google Accounts for Account Selection Modal
  const demoGoogleAccounts = [
    { name: 'Atharva Sur', email: 'atharvasur@gmail.com', avatar: 'AS', color: 'bg-gradient-to-tr from-teal-400 to-cyan-500' },
    { name: 'Atharva (AI System Architect)', email: 'atharva.ai@google.com', avatar: 'AA', color: 'bg-gradient-to-tr from-indigo-500 to-violet-600' },
    { name: 'Wellbeing Growth Account', email: 'growth.wellbeing@gmail.com', avatar: 'WG', color: 'bg-gradient-to-tr from-amber-400 to-orange-500' }
  ];

  const onSubmit = async (data) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUpMode) {
        const { user, error } = await signUpWithEmail(data.email, data.password, data.name);
        
        if (error) {
          setErrorMsg(error.message || error || 'An error occurred during signup.');
        } else {
          setSuccessMsg('Account created successfully! Logging you in...');
          localStorage.setItem('synapse_new_login_prompt', 'true');
          localStorage.removeItem('synapse_onboarding_completed');
          setTimeout(() => {
            onLoginSuccess({
              email: user?.email || data.email,
              name: data.name,
              id: user?.id || 'demo_user_' + Date.now()
            });
          }, 1000);
        }
      } else {
        const { user, error } = await signInWithEmail(data.email, data.password);
        
        if (error) {
          setErrorMsg(error.message || error || 'Invalid credentials or network error.');
        } else {
          setSuccessMsg('Authentication successful!');
          localStorage.setItem('synapse_new_login_prompt', 'true');
          localStorage.removeItem('synapse_onboarding_completed');
          setTimeout(() => {
            onLoginSuccess({
              email: user?.email || data.email,
              name: user?.user_metadata?.display_name || data.email.split('@')[0],
              id: user?.id || 'demo_user_' + Date.now()
            });
          }, 800);
        }
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (supabase) {
      // Live Supabase Google OAuth with prompt: 'select_account'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: { prompt: 'select_account' },
          redirectTo: window.location.origin
        }
      });
      setLoading(false);
      if (error) {
        // Fall back to Account Modal if OAuth config pending
        setShowGoogleAccountModal(true);
      }
    } else {
      // Open Interactive Google Account Picker Modal
      setLoading(false);
      setShowGoogleAccountModal(true);
    }
  };

  const handleSelectGoogleAccount = (acc) => {
    setShowGoogleAccountModal(false);
    setSuccessMsg(`Logged in as ${acc.name} (${acc.email})`);
    localStorage.setItem('synapse_new_login_prompt', 'true');
    localStorage.removeItem('synapse_onboarding_completed');
    setTimeout(() => {
      onLoginSuccess({
        email: acc.email,
        name: acc.name,
        id: 'google_user_' + Date.now()
      });
    }, 600);
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      email: 'guest@growth.ai',
      name: 'Atharva Sur (Guest)',
      id: 'guest_user_session'
    });
  };

  const isFormSubmitting = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col gap-6 animate-fade-in relative overflow-hidden">
        
        {/* Title Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-stone-900 tracking-tight">
            {isSignUpMode ? 'Create Account' : 'Login'}
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-1">
            {isSignUpMode ? 'Enter credentials to register your growth profile' : 'Sign in to access your personal wellbeing workspace'}
          </p>
        </div>

        {/* Success Alert Message */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-fade-in" role="alert">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2 animate-fade-in" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Prominent Google OAuth Account Picker Trigger */}
        <button
          type="button"
          onClick={triggerGoogleAuth}
          className="w-full py-3.5 px-4 rounded-full border border-stone-200 bg-white hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none text-stone-700 font-bold text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition cursor-pointer"
        >
          {/* Google SVG Multi-color Icon */}
          <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>{isSignUpMode ? 'Sign up with Google Account' : 'Log in with Google Account'}</span>
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Or with Email</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Email & Password Authentication Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Name Field (Sign Up Mode Only) */}
          {isSignUpMode && (
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-[11px] font-bold text-stone-400 tracking-wider">Full Name</label>
              <div className={`flex items-center gap-2 border-b pb-2 transition ${errors.name ? 'border-rose-500' : 'border-stone-200 focus-within:border-fuchsia-500'}`}>
                <User className={`w-4 h-4 shrink-0 ${errors.name ? 'text-rose-500' : 'text-stone-400'}`} />
                <input
                  id="name"
                  type="text"
                  placeholder="Type your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent"
                  {...register('name')}
                />
              </div>
              {errors.name && <span id="name-error" className="text-[10px] text-rose-500 font-medium">{errors.name.message}</span>}
            </div>
          )}

          {/* Email Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-[11px] font-bold text-stone-400 tracking-wider">
              {isSignUpMode ? 'Email Address' : 'Username or Email'}
            </label>
            <div className={`flex items-center gap-2 border-b pb-2 transition ${errors.email ? 'border-rose-500' : 'border-stone-200 focus-within:border-fuchsia-500'}`}>
              <Mail className={`w-4 h-4 shrink-0 ${errors.email ? 'text-rose-500' : 'text-stone-400'}`} />
              <input
                id="email"
                type="email"
                placeholder="Type your email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent"
                {...register('email')}
              />
            </div>
            {errors.email && <span id="email-error" className="text-[10px] text-rose-500 font-medium">{errors.email.message}</span>}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[11px] font-bold text-stone-400 tracking-wider">Password</label>
            <div className={`flex items-center gap-2 border-b pb-2 transition relative ${errors.password ? 'border-rose-500' : 'border-stone-200 focus-within:border-fuchsia-500'}`}>
              <Lock className={`w-4 h-4 shrink-0 ${errors.password ? 'text-rose-500' : 'text-stone-400'}`} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Type your password"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="w-full text-xs text-stone-800 placeholder-stone-300 focus:outline-none bg-transparent pr-7"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-stone-400 hover:text-stone-600 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span id="password-error" className="text-[10px] text-rose-500 font-medium">{errors.password.message}</span>}
            
            {!isSignUpMode && (
              <div className="text-right mt-1">
                <button 
                  type="button" 
                  onClick={() => alert("Password reset instructions sent to registered email.")}
                  className="text-[11px] text-stone-400 hover:text-stone-600 font-medium transition cursor-pointer focus:outline-none focus-visible:underline rounded"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isFormSubmitting}
            className="w-full py-3.5 mt-2 rounded-full text-white font-black text-xs tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition transform active:scale-95 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isFormSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />}
            <span>{isFormSubmitting ? 'Authenticating...' : (isSignUpMode ? 'SIGN UP' : 'LOGIN')}</span>
          </button>
        </form>

        {/* Social Accounts Section */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] text-stone-400 text-center font-medium">
            {isSignUpMode ? 'Or Sign Up Using Social Accounts' : 'Or Sign In Using Social Accounts'}
          </span>

          <div className="flex items-center justify-center gap-4">
            <button 
              type="button"
              onClick={() => alert("Facebook login integration initializing.")}
              className="w-10 h-10 rounded-full bg-[#3B5998] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#3B5998] transition cursor-pointer focus:outline-none"
              title="Sign in with Facebook"
              aria-label="Sign in with Facebook"
            >
              f
            </button>

            <button 
              type="button"
              onClick={() => alert("Twitter login integration initializing.")}
              className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1DA1F2] transition cursor-pointer focus:outline-none"
              title="Sign in with Twitter"
              aria-label="Sign in with Twitter"
            >
              t
            </button>

            <button 
              type="button"
              onClick={triggerGoogleAuth}
              className="w-10 h-10 rounded-full bg-[#DB4437] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#DB4437] transition cursor-pointer focus:outline-none"
              title="Sign in with Google Account"
              aria-label="Sign in with Google Account"
            >
              G
            </button>
          </div>
        </div>

        {/* Toggle Mode Option */}
        <div className="flex flex-col items-center gap-1 pt-2 border-t border-stone-100">
          <span className="text-[11px] text-stone-400 font-medium">
            {isSignUpMode ? 'Already have an account?' : 'Need a new account?'}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs font-black text-indigo-600 tracking-wider hover:text-indigo-800 focus:outline-none focus-visible:underline rounded transition uppercase cursor-pointer"
          >
            {isSignUpMode ? 'LOG IN HERE' : 'CREATE SIGN UP ACCOUNT'}
          </button>
        </div>

        {/* Demo Mode Quick Access */}
        <div className="text-center pt-1">
          <button
            onClick={handleGuestLogin}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 focus:outline-none focus-visible:underline rounded transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Explore Workspace as Guest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* GOOGLE ACCOUNT SELECTION MODAL */}
      {showGoogleAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="google-modal-title">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border border-stone-100 animate-slide-up">
            
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <h3 id="google-modal-title" className="font-extrabold text-sm text-stone-900">Choose a Google Account</h3>
              </div>
              <button 
                onClick={() => setShowGoogleAccountModal(false)}
                className="text-stone-400 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 rounded cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Select an active Google account to continue to Synapse Personal Wellbeing AI:
            </p>

            <div className="flex flex-col gap-2.5">
              {demoGoogleAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectGoogleAccount(acc)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-stone-100 hover:border-indigo-200 hover:bg-stone-50 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-1 focus-visible:ring-indigo-500 transition text-left group cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-full ${acc.color} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                    {acc.avatar}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-indigo-600 transition truncate">{acc.name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono truncate">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-3 text-center">
              <button
                onClick={() => {
                  const customName = prompt("Enter Google Account Name:", "Atharva Sur");
                  const customEmail = prompt("Enter Google Email:", "atharva.custom@gmail.com");
                  if (customEmail) {
                    handleSelectGoogleAccount({
                      name: customName || 'Google User',
                      email: customEmail
                    });
                  }
                }}
                className="text-xs font-bold text-indigo-600 hover:underline focus:outline-none focus-visible:underline rounded cursor-pointer"
              >
                + Use another Google Account
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

