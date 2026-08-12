import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Shield, AlertTriangle, ArrowRight, Check, X, Mail, Eye, EyeOff } from 'lucide-react';
import { FalconShieldLogo } from './LandingPage';
import CyberGlobe3D from './CyberGlobe3D';
import { auth } from '../lib/supabase';

interface LoginFormProps {
  onLoginSuccess: (token: string, user: { username: string; role: string }) => void;
  onBack: () => void;
}

export default function LoginForm({ onLoginSuccess, onBack }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    auth.getUser().then(user => {
      if (user) {
        // User is already authenticated, redirect to dashboard
        redirectToDashboard();
      }
    });
  }, []);

  const redirectToDashboard = () => {
    setSuccess('✅ Authentication successful! Redirecting to AI HoneyBot Dashboard...');
    
    const dashboardUrls = [
      'http://127.0.0.1:5173/',
      'http://localhost:5173/',
      'http://127.0.0.1:5174/',
      'http://localhost:5174/'
    ];
    const dashboardUrl = dashboardUrls[0];

    // Call success callback with mock data
    onLoginSuccess('supabase_token', { username: email, role: 'user' });

    setTimeout(() => {
      window.location.href = dashboardUrl;
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        // Sign up new user
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        const { data, error: signUpError } = await auth.signUp(email, password);
        
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess('✅ Account created successfully! Check your email for verification.');
          // Auto switch to sign in after 2 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setSuccess('');
          }, 2000);
        }
      } else {
        // Sign in existing user
        const { data, error: signInError } = await auth.signIn(email, password);
        
        if (signInError) {
          setError(signInError.message);
        } else if (data.user) {
          // Successful login
          redirectToDashboard();
        }
      }
    } catch (err) {
      setError('Connection to authentication server failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-gray-200 font-sans flex flex-col lg:flex-row relative overflow-hidden" id="login-container">
      {/* Cyber Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#081528_1px,transparent_1px),linear-gradient(to_bottom,#081528_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none"></div>
      
      {/* Soft background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[160px] rounded-full pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[160px] rounded-full pointer-events-none"></div>

      {/* XSZO Brand Header / Close Button */}
      <div 
        className="absolute top-8 left-8 flex items-center gap-3 cursor-pointer z-20 hover:opacity-80 transition-opacity" 
        onClick={onBack}
        id="login-close-button"
      >
        <div className="w-6 h-6 border border-cyan-500/30 flex items-center justify-center rounded bg-cyan-950/20">
          <X className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <span className="text-[11px] font-black tracking-[0.25em] text-white">XSZO</span>
      </div>

      {/* Left Column: Rotating Globe, Shield & Core Pillars */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-[62%] flex-col justify-between p-12 relative border-r border-cyan-950/25 z-10 select-none">
        
        {/* Spacer to push visual down */}
        <div></div>

        {/* Central visual layout */}
        <div className="flex flex-col items-center justify-center relative w-full py-8">
          <div className="relative flex justify-center items-center h-[460px] w-full max-w-[450px]">
            {/* Ambient visual background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            {/* 3D Canvas Rotating Globe */}
            <div className="w-full h-full">
              <CyberGlobe3D />
            </div>

            {/* Floating metrics badges */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Badge 1: AI Defense Active */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-[8%] left-[2%] pointer-events-auto"
              >
                <div className="bg-[#02040a]/95 backdrop-blur-md border border-cyan-500/25 px-3.5 py-2.5 rounded-xl text-left font-mono text-[9px] tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <span className="text-[8px] text-gray-500 block uppercase font-bold">AI DEFENSE</span>
                  <span className="text-[11px] font-black uppercase mt-0.5 block text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] tracking-widest">ACTIVE</span>
                </div>
              </motion.div>

              {/* Badge 2: Threat Analysis */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-[22%] right-[2%] pointer-events-auto"
              >
                <div className="bg-[#02040a]/95 backdrop-blur-md border border-cyan-500/25 px-3.5 py-2.5 rounded-xl text-left font-mono text-[9px] tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <span className="text-[8px] text-gray-500 block uppercase font-bold">THREAT ANALYSIS</span>
                  <span className="text-[11px] font-black uppercase mt-0.5 block text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] tracking-widest">98.7%</span>
                </div>
              </motion.div>

              {/* Badge 3: System Integrity */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-[28%] left-[-2%] pointer-events-auto"
              >
                <div className="bg-[#02040a]/95 backdrop-blur-md border border-cyan-500/25 px-3.5 py-2.5 rounded-xl text-left font-mono text-[9px] tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <span className="text-[8px] text-gray-500 block uppercase font-bold">SYSTEM INTEGRITY</span>
                  <span className="text-[11px] font-black uppercase mt-0.5 block text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] tracking-widest">SECURE</span>
                </div>
              </motion.div>

              {/* Badge 4: AI Core Online */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-[20%] right-[-2%] pointer-events-auto"
              >
                <div className="bg-[#02040a]/95 backdrop-blur-md border border-cyan-500/25 px-3.5 py-2.5 rounded-xl text-left font-mono text-[9px] tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <span className="text-[8px] text-gray-500 block uppercase font-bold">AI CORE</span>
                  <span className="text-[11px] font-black uppercase mt-0.5 block text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] tracking-widest">ONLINE</span>
                </div>
              </motion.div>

              {/* Badge 5: Defense Mode Active */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-[2%] left-[30%] pointer-events-auto"
              >
                <div className="bg-[#02040a]/95 backdrop-blur-md border border-cyan-500/25 px-4.5 py-2.5 rounded-xl text-left font-mono text-[9px] tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.6)]">
                  <span className="text-[8px] text-gray-500 block uppercase font-bold">DEFENSE MODE</span>
                  <span className="text-[11px] font-black uppercase mt-0.5 block text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] tracking-widest">ACTIVE</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Text block matching Reference 2 */}
        <div className="space-y-2 mt-auto text-left pl-6" id="login-welcome-headline">
          <h2 className="text-4xl md:text-[2.75rem] font-black tracking-tight text-white leading-none font-sans uppercase">
            WELCOME TO XSZO
          </h2>
          <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">
            AI DEFENSIVE SYSTEM
          </p>
          <div className="flex gap-6 pt-2 text-[10px] font-mono tracking-[0.2em] font-bold text-cyan-400">
            <span>SECURE</span>
            <span>INTELLIGENT</span>
            <span>ADAPTIVE</span>
          </div>
        </div>

      </div>

      {/* Right Column: Beautiful Login Card Form */}
      <div className="w-full lg:w-2/5 xl:w-[38%] flex flex-col justify-center items-center p-6 md:p-12 z-10 bg-[#02040a]/75 backdrop-blur-md">
        <div className="w-full max-w-md space-y-8" id="login-right-inner">
          
          {/* Header Title block */}
          <div className="text-left space-y-2.5">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-sans tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-gray-500 font-sans">
              {isSignUp ? 'Join the XSZO defensive network.' : 'Access the XSZO defensive environment.'}
            </p>
          </div>

          {/* Error/Success Alert Display */}
          {(error || success) && (
            <div className={`p-4 border rounded-xl text-xs flex items-start gap-2.5 animate-pulse ${
              error.includes('✅') 
                ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                : 'bg-red-950/40 border-red-800/40 text-red-400'
            }`} id="login-error-alert">
              {error.includes('✅') ? (
                <Check className="w-4.5 h-4.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {error.includes('✅') ? 'Success:' : 'Access Denied:'}
                </span> {error.replace('✅ ', '')}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" id="login-form">
            {/* Email field */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 font-bold tracking-[0.25em] block uppercase">EMAIL</label>
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#05070e] border border-cyan-950 rounded-xl py-3.5 px-4 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all font-mono"
                placeholder="operator@xszo.ai"
                id="login-username-input"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-gray-500 font-bold tracking-[0.25em] block uppercase">PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#05070e] border border-cyan-950 rounded-xl py-3.5 px-4 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all font-mono"
                placeholder="••••••••"
                id="login-password-input"
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-gray-500 font-bold tracking-[0.25em] block uppercase">CONFIRM PASSWORD</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#05070e] border border-cyan-950 rounded-xl py-3.5 px-4 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all font-mono"
                  placeholder="••••••••"
                  id="login-confirm-password-input"
                />
              </div>
            )}

            {/* Options layout */}
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 text-xs text-gray-400 select-none cursor-pointer">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400' : 'border-gray-800 bg-[#05070e]'}`}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  {rememberMe && <Check className="w-2.5 h-2.5" />}
                </div>
                <span>Remember me</span>
              </label>

              {!isSignUp ? (
                <span 
                  className="text-gray-500 hover:text-cyan-400 cursor-pointer font-mono text-[11px] transition-colors" 
                  onClick={() => { setEmail('operator@xszo.ai'); setPassword('admin'); }}
                >
                  Forgot password?
                </span>
              ) : (
                <span className="text-transparent text-[11px]">.</span>
              )}
            </div>

            {/* Submit button with Outline Border styling matching reference */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-transparent hover:bg-cyan-500/10 text-white rounded-xl text-xs font-mono font-bold tracking-widest border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              id="login-submit-button"
            >
              {isLoading ? (
                <span className="w-4 h-4 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin"></span>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          {/* Bottom Footer block link */}
          <div className="text-center text-xs text-gray-500 font-mono pt-4 border-t border-cyan-950/40">
            {!isSignUp ? (
              <>
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-cyan-400 hover:underline cursor-pointer font-bold"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-cyan-400 hover:underline cursor-pointer font-bold"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
