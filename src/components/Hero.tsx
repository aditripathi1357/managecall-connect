
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-16 flex items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 bg-subtle-pattern opacity-30 pointer-events-none" />
      
      <div className="container px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8 max-w-xl animate-fade-in">
            <div>
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-primary mb-6 animate-fade-in-up">
                <span className="rounded-full w-2 h-2 bg-primary mr-2"></span>
                Simplified Call Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance mb-4 animate-fade-in-up delay-100">
                Track Every Call, <br />Unlock Every Insight
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md animate-fade-in-up delay-200">
                The intelligent platform for tracking, analyzing, and optimizing 
                your business calls to enhance customer experience and drive growth.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up delay-300">
              <Link to="/signup">
                <Button className="w-full sm:w-auto px-8 py-6 text-base rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/#features">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-base rounded-full border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block h-[600px] animate-fade-in-up delay-300">
            <div className="absolute top-0 right-0 w-full h-full">
              <div className="relative w-full h-full">
                <div className="absolute top-10 right-10 glass-card p-6 rounded-xl animate-subtle-scale shadow-elevated max-w-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-primary text-xl font-semibold">87%</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Conversion Increase</h3>
                      <p className="text-sm text-muted-foreground">Year over year growth</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-primary rounded-full"></div>
                  </div>
                </div>

                <div className="absolute top-1/2 left-0 glass-card p-6 rounded-xl animate-subtle-scale shadow-elevated" style={{ animationDelay: "2s" }}>
                  <div className="flex flex-col space-y-2 max-w-xs">
                    <h3 className="font-medium">Call Analytics</h3>
                    <p className="text-sm text-muted-foreground">Gain insights from every customer interaction</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-lg font-semibold">245</div>
                        <div className="text-xs">New Calls</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-lg font-semibold">92%</div>
                        <div className="text-xs">Answered</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-20 right-20 glass-card p-6 rounded-xl animate-subtle-scale shadow-elevated" style={{ animationDelay: "4s" }}>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold">+12%</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Customer Satisfaction</h3>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-fade-in" style={{ animationDelay: "1s" }}>
        <div className="flex flex-col items-center">
          <span className="text-sm text-muted-foreground mb-2">Scroll to explore</span>
          <div className="w-5 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
