
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import * as XLSX from 'xlsx';

type ContactCategory = "general" | "doctor" | "real_estate";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      let tableName = "";
      switch (selectedCategory) {
        case "general":
          tableName = "general_contacts";
          break;
        case "doctor":
          tableName = "doctor_contacts";
          break;
        case "real_estate":
          tableName = "real_estate_contacts";
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .insert([{ 
          name, 
          email, 
          country_code: countryCode,
          phone,
          user_id: user.id
        }]);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Contact added",
        description: `The contact has been added to the ${selectedCategory} database.`,
      });
      
      // Clear form
      setName("");
      setEmail("");
      setPhone("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "There was an error adding the contact",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const binaryStr = event.target?.result;
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);
          
          let tableName = "";
          switch (selectedCategory) {
            case "general":
              tableName = "general_contacts";
              break;
            case "doctor":
              tableName = "doctor_contacts";
              break;
            case "real_estate":
              tableName = "real_estate_contacts";
              break;
          }
          
          // Validate data
          const validData = data.filter((row: any) => 
            row.name && row.email && row.phone
          ).map((row: any) => {
            let phoneDigitsOnly = String(row.phone).replace(/\D/g, '').slice(0, 10);
            let rowCountryCode = row.country_code || countryCode;
            
            return {
              name: row.name,
              email: row.email,
              country_code: rowCountryCode,
              phone: phoneDigitsOnly,
              user_id: user.id
            };
          });
          
          if (validData.length === 0) {
            toast({
              variant: "destructive",
              title: "Invalid data",
              description: "The Excel file does not contain valid data. Please ensure it includes name, email, and phone columns.",
            });
            return;
          }
          
          // Insert data in batches of 100
          const batchSize = 100;
          for (let i = 0; i < validData.length; i += batchSize) {
            const batch = validData.slice(i, i + batchSize);
            const { error } = await supabase
              .from(tableName)
              .insert(batch);
            
            if (error) {
              throw error;
            }
          }
          
          toast({
            title: "File processed",
            description: `Successfully added ${validData.length} contacts to the ${selectedCategory} database.`,
          });
          
          // Clear file input
          e.target.value = '';
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Processing failed",
            description: error.message || "Failed to process the Excel file",
          });
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "File read error",
          description: "There was an error reading the Excel file",
        });
        setIsUploading(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading the file",
      });
      setIsUploading(false);
    }
  };

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
                  {/* Contact Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Contact</CardTitle>
                      <CardDescription>
                        Enter contact details for the {category.replace('_', ' ')} database.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="flex gap-2">
                            <CountryCodeSelect 
                              value={countryCode}
                              onValueChange={setCountryCode}
                            />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="1234567890"
                              value={phone}
                              onChange={handlePhoneChange}
                              required
                              className="flex-1"
                              maxLength={10}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Enter up to 10 digits
                          </p>
                        </div>
                        
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Add Contact"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                  
                  {/* File Upload */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bulk Import</CardTitle>
                      <CardDescription>
                        Upload an Excel file to import multiple contacts at once.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="excel-file">Excel File</Label>
                          <Input
                            id="excel-file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            The Excel file should have columns named: name, email, and phone
                          </p>
                        </div>
                        
                        <div className="h-[143px] flex items-center justify-center">
                          {isUploading ? (
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                              <p>Processing file...</p>
                            </div>
                          ) : (
                            <div className="text-center text-gray-500">
                              <p>Upload an Excel file to import contacts</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
