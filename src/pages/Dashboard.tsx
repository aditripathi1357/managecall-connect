
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/dashboard/ContactForm";
import FileUpload from "@/components/dashboard/FileUpload";

type ContactCategory = "general" | "doctor" | "real_estate";

interface Contact {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: string;
  source?: string;
}

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>("general");
  const [countryCode, setCountryCode] = useState("+1");
  const [contacts, setContacts] = useState<Contact[]>([]);
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

  // Function to add a new contact
  const addContact = (newContact: Contact) => {
    setContacts(prevContacts => [...prevContacts, newContact]);
  };

  // Function to add uploaded file
  const addUploadedFile = (fileName: string) => {
    setUploadedFiles(prevFiles => [...prevFiles, fileName]);
  };

  // Function to add multiple contacts (for imports)
  const addImportedContacts = (newContacts: Contact[]) => {
    setContacts(prevContacts => [...prevContacts, ...newContacts]);
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
