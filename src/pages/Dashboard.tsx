
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/dashboard/ContactForm";
import FileUpload from "@/components/dashboard/FileUpload";
import { supabase } from "@/integrations/supabase/client";

type ContactCategory = "general" | "doctor" | "real_estate";

interface Contact {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: string;
  source?: string;
  userId?: string; // Add userId to track which user the contact belongs to
}

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>("general");
  const [countryCode, setCountryCode] = useState("+1");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Check if user is authenticated and get user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    
    getUserId();
    
    // Set up auth state listener to update when user logs in/out
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setContacts([]);
          setUploadedFiles([]);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load contacts from localStorage when component mounts or when user changes
  useEffect(() => {
    if (currentUser) {
      // Use a user-specific key for storing contacts
      const userSpecificKey = `contacts_${currentUser}`;
      const savedContacts = localStorage.getItem(userSpecificKey);
      
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      } else {
        // Initialize empty contacts array for new users
        setContacts([]);
        localStorage.setItem(userSpecificKey, JSON.stringify([]));
      }
      
      const savedFiles = localStorage.getItem(`uploadedFiles_${currentUser}`);
      if (savedFiles) {
        setUploadedFiles(JSON.parse(savedFiles));
      } else {
        setUploadedFiles([]);
      }
    }
  }, [currentUser]);

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (currentUser && contacts.length >= 0) {
      // Store contacts with a user-specific key
      const userSpecificKey = `contacts_${currentUser}`;
      localStorage.setItem(userSpecificKey, JSON.stringify(contacts));
    }
  }, [contacts, currentUser]);
  
  // Save uploaded files to localStorage whenever they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`uploadedFiles_${currentUser}`, JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles, currentUser]);

  // Function to add a new contact
  const addContact = (newContact: Contact) => {
    if (currentUser) {
      // Ensure the contact has the current user ID
      const contactWithUserId = {
        ...newContact,
        userId: currentUser
      };
      setContacts(prevContacts => [...prevContacts, contactWithUserId]);
    }
  };

  // Function to add uploaded file
  const addUploadedFile = (fileName: string) => {
    setUploadedFiles(prevFiles => [...prevFiles, fileName]);
  };

  // Function to add multiple contacts (for imports)
  const addImportedContacts = (newContacts: Contact[]) => {
    if (currentUser) {
      // Add user ID to each imported contact
      const contactsWithUserId = newContacts.map(contact => ({
        ...contact,
        userId: currentUser
      }));
      setContacts(prevContacts => [...prevContacts, ...contactsWithUserId]);
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Contact form - left side, 1/3 width */}
                  <div className="md:col-span-1">
                    <ContactForm 
                      selectedCategory={category as ContactCategory} 
                      addContact={addContact}
                    />
                  </div>
                  
                  {/* Contact list and file upload - right side, 2/3 width */}
                  <div className="md:col-span-2">
                    <FileUpload 
                      selectedCategory={category as ContactCategory} 
                      defaultCountryCode={countryCode}
                      contacts={contacts}
                      uploadedFiles={uploadedFiles}
                      addUploadedFile={addUploadedFile}
                      addImportedContacts={addImportedContacts}
                    />
                  </div>
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
