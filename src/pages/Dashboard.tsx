
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/dashboard/ContactForm";
import FileUpload from "@/components/dashboard/FileUpload";

type ContactCategory = "general" | "doctor" | "real_estate";

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>("general");
  const [countryCode, setCountryCode] = useState("+1");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Contact Management Dashboard</h1>
          
          <Tabs defaultValue="general" onValueChange={(value) => setSelectedCategory(value as ContactCategory)}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
              <TabsTrigger value="real_estate">Real Estate</TabsTrigger>
            </TabsList>
            
            {["general", "doctor", "real_estate"].map((category) => (
              <TabsContent key={category} value={category}>
                <div className="grid md:grid-cols-2 gap-8">
                  <ContactForm selectedCategory={category as ContactCategory} />
                  <FileUpload 
                    selectedCategory={category as ContactCategory} 
                    defaultCountryCode={countryCode}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
