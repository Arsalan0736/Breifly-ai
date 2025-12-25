import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
      } else {
        if (!formData.name.trim()) {
          toast.error("Please enter your name");
          setLoading(false);
          return;
        }
        await register(formData.email, formData.password, formData.name);
        toast.success("Account created successfully!");
      }
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.detail || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neo-black text-white p-12 flex-col justify-between">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12"
            data-testid="back-to-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-neo-lime border-2 border-neo-lime rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-neo-black" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-2xl">BrieflyAI</span>
          </div>

          <h1 className="text-4xl font-heading font-black mb-6">
            Turn conversations into
            <br />
            <span className="text-neo-lime">actionable briefs</span>
          </h1>

          <p className="text-white/70 text-lg max-w-md">
            Connect your Slack and Gmail, let AI extract requirements,
            and generate structured creative briefs in seconds.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 bg-neo-cyan/20 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-neo-cyan" />
            </div>
            <span>Connects with Gmail & Slack</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 bg-neo-lime/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-neo-lime" />
            </div>
            <span>AI-powered brief generation</span>
          </div>
          <div className="flex items-center gap-3 text-white/70">
            <div className="w-8 h-8 bg-neo-pink/20 rounded-lg flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-neo-pink" />
            </div>
            <span>Export to Asana, ClickUp, Sheets</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-neo-lime border-2 border-neo-black rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="font-heading font-bold text-xl">BrieflyAI</span>
          </div>

          <div className="neo-card">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-neo-black/60">
                {isLogin
                  ? "Sign in to continue to your dashboard"
                  : "Start generating briefs in minutes"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neo-black/40" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className="neo-input pl-11"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      data-testid="name-input"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neo-black/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="neo-input pl-11"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neo-black/40" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="neo-input pl-11"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    minLength={6}
                    data-testid="password-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="neo-button-accent w-full py-6 text-base"
                disabled={loading}
                data-testid="auth-submit-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : isLogin ? (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-neo-black/70 hover:text-neo-black font-medium"
                data-testid="toggle-auth-mode-btn"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          <p className="text-center text-neo-black/50 text-sm mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
