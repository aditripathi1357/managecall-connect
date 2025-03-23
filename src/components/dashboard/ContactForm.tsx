import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CountryCodeSelect from "@/components/CountryCodeSelect";
import { useNavigate } from "react-router-dom";

type ContactCategory = "general" | "doctor" | "real_estate";

interface ContactFormProps {
  selectedCategory: ContactCategory;
}

interface ContactDetails {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: ContactCategory;
  source?: string; // Added to track source of contact
}

const ContactForm = ({ selectedCategory }: ContactFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Load contacts from localStorage when component mounts
  useEffect(() => {
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);
  
  // Save uploaded files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

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
      // Create a new contact object with unique ID
      const newContact: ContactDetails = {
        id: Date.now().toString(), // Use timestamp as a unique ID
        name,
        email,
        countryCode,
        phone,
        category: selectedCategory,
        source: "Manual entry"
      };
      
      // Add to list of displayed contacts
      setContacts(prevContacts => [...prevContacts, newContact]);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "warning",
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
          variant: "warning",
          title: "Contact added locally only",
          description: "Unable to save to database: " + error.message,
        });
      } else {
        toast({
          title: "Contact added",
          description: `The contact has been added to the ${selectedCategory} database.`,
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

  // Function to add uploaded files to the list
  const addUploadedFile = (fileName: string) => {
    setUploadedFiles(prevFiles => [...prevFiles, fileName]);
  };
  
  // Make this function accessible for the FileUpload component
  // @ts-ignore
  window.addUploadedFile = addUploadedFile;
  
  // Make contacts setter accessible for the FileUpload component
  // @ts-ignore
  window.addImportedContacts = (newContacts: ContactDetails[]) => {
    setContacts(prevContacts => [...prevContacts, ...newContacts]);
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
