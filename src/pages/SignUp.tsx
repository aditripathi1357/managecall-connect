
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
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
            
            <SignUpForm />

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
