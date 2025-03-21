
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-subtle'
          : 'bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between mx-auto">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-primary"
        >
          <Phone className="w-6 h-6" />
          <span className="text-xl font-medium tracking-tight">CallTrack</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/#features"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Features
          </Link>
          <Link
            to="/#pricing"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/#contact"
            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="outline" className="rounded-full px-6">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="default" className="rounded-full px-6 bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-morphism p-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-4 mb-4">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors px-4 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="text-foreground hover:text-primary transition-colors px-4 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#pricing"
              className="text-foreground hover:text-primary transition-colors px-4 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/#contact"
              className="text-foreground hover:text-primary transition-colors px-4 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Log In
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
