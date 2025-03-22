
import { useState } from "react";
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

const ContactForm = ({ selectedCategory }: ContactFormProps) => {
  const navigate = useNavigate();
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

  return (
    <Card>
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
