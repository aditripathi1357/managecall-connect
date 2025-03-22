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
        .from(tableName)
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
    <div className="flex flex-col md:flex-row gap-6">
      {/* Form section */}
      <div className="md:w-1/2">
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
      </div>
      
      {/* Contact list section - now larger */}
      <div className="md:w-1/2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Contact List</CardTitle>
            <CardDescription>
              All contacts ({contacts.length})
              {uploadedFiles.length > 0 && ` • Files uploaded: ${uploadedFiles.length}`}
            </CardDescription>
            {contacts.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (confirm("Are you sure you want to clear all contacts?")) {
                    setContacts([]);
                    toast({
                      title: "Contacts cleared",
                      description: "All contacts have been removed from the list.",
                    });
                  }
                }}
                className="mt-2"
              >
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {contacts.length === 0 && uploadedFiles.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No contacts or files added yet</p>
            ) : (
              <div className="space-y-4">
                {/* Display uploaded files */}
                {uploadedFiles.length > 0 && (
                  <Card className="shadow-sm bg-gray-50">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Uploaded Files</h3>
                      <div className="space-y-1">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="text-sm bg-white p-2 rounded border">
                            {file}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Display contacts - no remove button */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{contact.name}</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {contact.category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">{contact.email}</div>
                            <div className="text-sm text-gray-600">{contact.countryCode} {contact.phone}</div>
                            {contact.source && (
                              <div className="text-xs text-gray-500 italic">
                                {contact.source}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactForm;