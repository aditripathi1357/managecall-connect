
import { Phone, BarChart, Users, Clock, Search, Shield } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: string;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div className={`bg-white rounded-xl p-6 shadow-subtle hover:shadow-elevated transition-all duration-500 animate-fade-in-up ${delay}`}>
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Logging",
      description:
        "Automatically record and organize all incoming and outgoing calls with detailed information.",
      delay: "delay-100",
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Advanced Analytics",
      description:
        "Generate comprehensive reports on call volume, duration, and performance metrics.",
      delay: "delay-200",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Management",
      description:
        "Assign roles and permissions to team members for effective collaboration.",
      delay: "delay-300",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-time Monitoring",
      description:
        "Track and analyze calls as they happen with live dashboards and alerts.",
      delay: "delay-100",
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Call Search",
      description:
        "Quickly find specific calls using advanced search filters and parameters.",
      delay: "delay-200",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Platform",
      description:
        "Enterprise-grade security measures to protect your sensitive call data.",
      delay: "delay-300",
    },
  ];

  return (
    <section id="features" className="page-section bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="section-heading">Features designed for efficiency</h2>
          <p className="section-subheading">
            Our comprehensive call tracking platform offers all the tools you need to 
            monitor, analyze, and optimize your business communications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
