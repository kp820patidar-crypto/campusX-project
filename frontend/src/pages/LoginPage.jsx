import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle2, KeyRound, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isNewlyRegistered = searchParams.get('registered') === 'true';
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  // Quick fill demo student
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-600 items-center justify-center text-white mb-3 shadow-md shadow-indigo-200">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Log In to CampusX
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your student credentials to access your campus marketplace
          </p>
        </div>

        {/* Notice if redirected from registration */}
        {isNewlyRegistered && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Account created successfully!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                As per our security policy, please log in with your new credentials to continue.
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              College Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aarav.sharma@iitb.ac.in"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Section for Evaluators */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Profiles (For Testing):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('aarav.sharma@iitb.ac.in', 'password123')}
              className="p-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-left transition-colors"
            >
              <p className="font-bold text-slate-800">Aarav (IIT Bombay)</p>
              <p className="text-[10px] text-slate-500">Student • Seller</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya.patel@du.ac.in', 'password123')}
              className="p-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-left transition-colors"
            >
              <p className="font-bold text-slate-800">Priya (Delhi Univ)</p>
              <p className="text-[10px] text-slate-500">Student • Buyer</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('rohan.verma@bits.ac.in', 'password123')}
              className="p-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-xl text-left transition-colors"
            >
              <p className="font-bold text-slate-800">Rohan (BITS Pilani)</p>
              <p className="text-[10px] text-slate-500">Student • Mechanical</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@campusx.edu', 'password123')}
              className="p-2 border border-amber-200 bg-amber-50/40 hover:bg-amber-50 rounded-xl text-left transition-colors"
            >
              <p className="font-bold text-amber-900">Admin Moderator</p>
              <p className="text-[10px] text-amber-700">Campus Moderator</p>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

