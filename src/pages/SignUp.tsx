
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must accept the terms and conditions",
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    try {
      // In a real app, this would be an API call to your registration endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show a success message and redirect
      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      });
      
      // This would typically navigate to a welcome screen or dashboard
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "There was an error creating your account",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-elevated p-8 animate-fade-in">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-medium mb-2">Create your account</h1>
              <p className="text-muted-foreground">
                Get started with CallTrack today
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="subtle-input w-full"
                    placeholder="John"
                  />
                </div>
                
                <div className="space-y-1">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="subtle-input w-full"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="subtle-input w-full"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="subtle-input w-full pr-10"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary hover:text-primary/90 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:text-primary/90 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 py-6 rounded-lg font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary/90 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
