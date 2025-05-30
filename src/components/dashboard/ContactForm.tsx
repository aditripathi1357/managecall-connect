import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CountryCodeSelect from "@/components/CountryCodeSelect";

type ContactCategory = "general" | "doctor" | "real_estate";

interface Contact {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: ContactCategory;
  source?: string;
  userId?: string;
}

interface ContactFormProps {
  selectedCategory: ContactCategory;
  addContact: (contact: Contact) => void;
}

const ContactForm = ({ selectedCategory, addContact }: ContactFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setCountryCode("+1");
  };

  // Function to send contact data to different external APIs based on category
  const sendContactToExternalAPI = async (contactData: { 
    name: string; 
    email: string; 
    countryCode: string; 
    phone: string;
    category: ContactCategory;
  }) => {
    try {
      let apiUrl = "";
      let apiName = "";
      
      // Define different API endpoints for each category
      switch(contactData.category) {
        case "general":
          apiUrl = "https://jsonplaceholder.typicode.com/posts"; // General contacts API
          apiName = "General Contacts API";
          break;
        case "doctor":
          apiUrl = "https://jsonplaceholder.typicode.com/comments"; // Medical contacts API
          apiName = "Medical Contacts API";
          break;
        case "real_estate":
          apiUrl = "https://jsonplaceholder.typicode.com/albums"; // Real estate contacts API
          apiName = "Real Estate Contacts API";
          break;
        default:
          apiUrl = "https://jsonplaceholder.typicode.com/users"; // Default API
          apiName = "Default Contacts API";
      }
      
      console.log(`Sending ${contactData.category} data to API:`, contactData);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: contactData.name,
          email: contactData.email,
          phone: contactData.countryCode + contactData.phone,
          category: contactData.category
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);
      return true;
    } catch (error) {
      console.error(`Error sending ${contactData.category} data to external API:`, error);
      return false;
    }
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
      
      // Create a new contact object with unique ID
      const newContact: Contact = {
        id: Date.now().toString(), // Use timestamp as a unique ID
        name,
        email,
        countryCode,
        phone,
        category: selectedCategory,
        source: "Manual entry",
        userId: user?.id // Add user ID if authenticated
      };
      
      // Add to list of displayed contacts via parent component
      addContact(newContact);

      // Prepare data for external API
      const apiData = {
        name,
        email,
        countryCode,
        phone,
        category: selectedCategory
      };
      
      // Send data to external API based on category
      const apiSent = await sendContactToExternalAPI(apiData);
      
      if (!apiSent) {
        toast({
          variant: "default",
          title: "API notification",
          description: `Contact added locally but failed to send to ${selectedCategory} API`,
        });
      } else {
        toast({
          variant: "default",
          title: "API notification",
          description: `Contact data sent to ${selectedCategory} API successfully`,
        });
      }

      if (!user) {
        toast({
          variant: "default",
          title: "Contact added locally",
          description: "Please login to save contacts to the database",
        });
        resetForm();
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
        .from(tableName as any)
        .insert([{ 
          name, 
          email, 
          country_code: countryCode,
          phone,
          user_id: user.id
        }]);
      
      if (error) {
        console.error("Supabase error:", error);
        toast({
          variant: "default",
          title: "Contact added locally only",
          description: "Unable to save to database: " + error.message,
        });
      } else {
        toast({
          title: "Contact added",
          description: `The contact has been added to the ${selectedCategory} database`,
        });
      }
      
      // Reset form regardless of database success
      resetForm();
      
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "There was an error adding the contact",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Add New Contact</CardTitle>
        <CardDescription>
          Enter contact details for the {selectedCategory.replace('_', ' ')} database.
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
  );
};

export default ContactForm;