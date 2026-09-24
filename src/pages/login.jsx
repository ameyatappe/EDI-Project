import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL !== undefined 
  ? import.meta.env.VITE_BACKEND_URL 
  : (import.meta.env.DEV ? 'http://localhost:8000' : '');

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // Validation states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isEmailTouched, setIsEmailTouched] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);
    
    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const validateEmail = (val) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val) return "Email is required";
        if (!regex.test(val)) return "Please enter a valid email address";
        return "";
    };

    const validatePassword = (val) => {
        if (!val) return "Password is required";
        if (val.length < 6) return "Password must be at least 6 characters";
        return "";
    };

    const handleEmailBlur = () => {
        setIsEmailTouched(true);
        setEmailError(validateEmail(email));
    };

    const handlePasswordBlur = () => {
        setIsPasswordTouched(true);
        setPasswordError(validatePassword(password));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        
        // Final validation before submit
        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        
        setEmailError(eErr);
        setPasswordError(pErr);
        setIsEmailTouched(true);
        setIsPasswordTouched(true);

        if (eErr || pErr || (!isLogin && !name)) {
            setError("Please correct the errors in the form before proceeding.");
            return;
        }

        setIsLoading(true);

        try {
            let response;

            if (isLogin) {
                // --- LOGIN LOGIC ---
                const formData = new URLSearchParams();
                formData.append("username", email);
                formData.append("password", password);

                response = await fetch(`${BACKEND_URL}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: formData,
                });
            } else {
                // --- SIGNUP LOGIC ---
                response = await fetch(`${BACKEND_URL}/api/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Authentication failed.");
            }

            setSuccess(isLogin ? "System Engaged! Welcome back." : "Identity registered! Welcome.");
            localStorage.setItem("agentic_token", data.access_token);

            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
        setSuccess("");
        setEmailError("");
        setPasswordError("");
        setIsEmailTouched(false);
        setIsPasswordTouched(false);
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
            
            {/* LEFT PANEL: Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden flex-col justify-center items-center p-12">
                {/* Floating Aura Background */}
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
                    className="absolute -top-[10%] -left-[10%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" 
                />
                <motion.div 
                    animate={{ rotate: -360, scale: [1, 1.1, 1] }} 
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }} 
                    className="absolute bottom-[0%] right-[0%] w-[35rem] h-[35rem] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" 
                />
                
                {/* Glassmorphism Branding Card */}
                <div className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-6">
                        <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4 leading-tight">
                        Personal Wellbeing AI
                    </h1>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                        Optimize your cognitive load, track dynamic aspirations, and prevent burnout with your intelligent growth curator.
                    </p>
                    
                    <ul className="space-y-4">
                        {[
                            "Real-time Burnout Shield & Cognitive Tracking",
                            "Generative 'Future Self' Trajectory Simulation",
                            "Dynamic Identity & Aspiration Radar"
                        ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-slate-200">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                                </div>
                                <span className="font-medium text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* RIGHT PANEL: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden bg-white">
                
                {/* Mobile only decorative background */}
                <div className="lg:hidden absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="lg:hidden absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }} 
                    className="w-full max-w-md relative z-10"
                >
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm">
                            {isLogin ? "Enter your credentials to access your dashboard." : "Sign up to begin your personalized growth journey."}
                        </p>
                    </div>

                    {/* Alert Banner */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
                                animate={{ opacity: 1, height: "auto", marginBottom: 24 }} 
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-r-xl flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">{success}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                        
                        {/* Name Field (Signup only) */}
                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    <div className="space-y-1.5 pb-5">
                                        <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 placeholder-slate-400"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className={`w-5 h-5 ${isEmailTouched && emailError ? 'text-rose-400' : 'text-slate-400'}`} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (isEmailTouched) setEmailError(validateEmail(e.target.value));
                                    }}
                                    onBlur={handleEmailBlur}
                                    placeholder="you@example.com"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border transition-all outline-none text-slate-900 placeholder-slate-400 ${
                                        isEmailTouched && emailError 
                                            ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20' 
                                            : isEmailTouched && !emailError && email.length > 0
                                                ? 'border-emerald-300 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                                                : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                                    }`}
                                />
                            </div>
                            {isEmailTouched && emailError && (
                                <p className="text-xs font-medium text-rose-500 pt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {emailError}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                {isLogin && (
                                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Forgot password?
                                    </a>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className={`w-5 h-5 ${isPasswordTouched && passwordError ? 'text-rose-400' : 'text-slate-400'}`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (isPasswordTouched) setPasswordError(validatePassword(e.target.value));
                                    }}
                                    onBlur={handlePasswordBlur}
                                    placeholder="••••••••"
                                    className={`w-full pl-11 pr-12 py-3 rounded-xl border transition-all outline-none text-slate-900 placeholder-slate-400 ${
                                        isPasswordTouched && passwordError 
                                            ? 'border-rose-300 bg-rose-50/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20' 
                                            : isPasswordTouched && !passwordError && password.length > 0
                                                ? 'border-emerald-300 bg-emerald-50/30 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                                                : 'border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {isPasswordTouched && passwordError && (
                                <p className="text-xs font-medium text-rose-500 pt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className={`w-full relative overflow-hidden bg-slate-900 text-white font-semibold py-3.5 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                isLoading ? 'opacity-80 shadow-none' : 'hover:shadow-indigo-500/25 hover:bg-indigo-600'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{isLogin ? "Authenticating..." : "Creating Account..."}</span>
                                </>
                            ) : (
                                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500 font-medium">OR</span>
                        </div>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 hover:border-slate-300 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Secondary Links */}
                    <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
                        <p className="text-slate-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-indigo-600 hover:text-indigo-500 hover:underline transition-all cursor-pointer"
                            >
                                {isLogin ? "Create an account" : "Sign in here"}
                            </button>
                        </p>
                        <a href="#" className="text-slate-500 hover:text-slate-800 transition-colors">
                            Explore as Guest
                        </a>
                    </div>

                </motion.div>
            </div>
        </div>
    );
}