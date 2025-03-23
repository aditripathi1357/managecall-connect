
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import ContactsTable from "./ContactsTable";

type ContactCategory = "general" | "doctor" | "real_estate";

interface FileUploadProps {
  selectedCategory: ContactCategory;
  defaultCountryCode: string;
}

interface ContactDetails {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: ContactCategory;
  source?: string;
}

const FileUpload = ({ selectedCategory, defaultCountryCode }: FileUploadProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [contacts, setContacts] = useState<ContactDetails[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Load contacts from localStorage when component mounts
  useEffect(() => {
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts);
      // Filter contacts by selected category
      const filteredContacts = parsedContacts.filter(
        (contact: ContactDetails) => contact.category === selectedCategory
      );
      setContacts(filteredContacts);
    }
    
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, [selectedCategory]);
  
  // Listen for external changes to contacts
  useEffect(() => {
    // Make this function accessible for the ContactForm component
    // @ts-ignore
    window.addImportedContacts = (newContacts: ContactDetails[]) => {
      setContacts(prevContacts => {
        const updatedContacts = [...prevContacts, ...newContacts];
        localStorage.setItem('contacts', JSON.stringify(updatedContacts));
        return updatedContacts;
      });
    };
    
    return () => {
      // @ts-ignore
      window.addImportedContacts = undefined;
    };
  }, []);
  
  // Save uploaded files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const extractContactsFromExcel = async (file: File): Promise<ContactDetails[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Assume first sheet
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Convert to JSON
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Skip header row and process data
          // Expected format: Name, Email, Phone (optional with country code)
          const contacts: ContactDetails[] = [];
          
          // Find header row and column indices
          const headerRow = jsonData.findIndex(row => 
            row.some((cell: string) => 
              typeof cell === 'string' && 
              (cell.toLowerCase().includes('name') || 
               cell.toLowerCase().includes('email') || 
               cell.toLowerCase().includes('phone'))
            )
          );
          
          if (headerRow === -1) {
            throw new Error('Could not find header row in Excel file');
          }
          
          const headers = jsonData[headerRow].map((h: string) => 
            typeof h === 'string' ? h.toLowerCase().trim() : ''
          );
          
          const nameIndex = headers.findIndex(h => h.includes('name'));
          const emailIndex = headers.findIndex(h => h.includes('email'));
          const phoneIndex = headers.findIndex(h => h.includes('phone'));
          
          if (nameIndex === -1 && emailIndex === -1 && phoneIndex === -1) {
            throw new Error('Could not find required columns (name, email, or phone)');
          }
          
          // Process data rows
          for (let i = headerRow + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const name = nameIndex !== -1 && row[nameIndex] ? String(row[nameIndex]).trim() : '';
            const email = emailIndex !== -1 && row[emailIndex] ? String(row[emailIndex]).trim() : '';
            let phone = phoneIndex !== -1 && row[phoneIndex] ? String(row[phoneIndex]).trim() : '';
            
            // Skip empty rows
            if (!name && !email && !phone) continue;
            
            // Extract country code or use default
            let countryCode = defaultCountryCode;
            
            // Simple heuristic: if phone starts with +, extract country code
            if (phone.startsWith('+')) {
              const match = phone.match(/^\+(\d+)/);
              if (match) {
                countryCode = '+' + match[1];
                phone = phone.replace(/^\+\d+\s*/, '');
              }
            }
            
            // Remove any non-digit characters from phone
            phone = phone.replace(/\D/g, '');
            
            contacts.push({
              id: Date.now() + '-' + i, // Generate a unique ID
              name,
              email,
              countryCode,
              phone,
              category: selectedCategory,
              source: `Imported from ${file.name}`
            });
          }
          
          resolve(contacts);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel file to upload.",
      });
      return;
    }
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        variant: "destructive",
        title: "Invalid file format",
        description: "Please upload an Excel file (.xlsx or .xls).",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Extract contacts from the Excel file
      const extractedContacts = await extractContactsFromExcel(file);
      
      if (extractedContacts.length === 0) {
        toast({
          variant: "destructive",
          title: "No contacts found",
          description: "The uploaded file did not contain any valid contacts.",
        });
        setIsUploading(false);
        return;
      }
      
      // Add to the list of displayed contacts
      setContacts(prevContacts => [...prevContacts, ...extractedContacts]);
      
      // Add to the list of uploaded files
      if (!uploadedFiles.includes(file.name)) {
        setUploadedFiles(prevFiles => [...prevFiles, file.name]);
      }
      
      // Store the contacts in localStorage
      const savedContacts = localStorage.getItem('contacts');
      const existingContacts = savedContacts ? JSON.parse(savedContacts) : [];
      const updatedContacts = [...existingContacts, ...extractedContacts];
      localStorage.setItem('contacts', JSON.stringify(updatedContacts));
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // If user is authenticated, upload to database
      if (user) {
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
        
        // Prepare data for database upload
        const dbContacts = extractedContacts.map(contact => ({
          name: contact.name,
          email: contact.email,
          country_code: contact.countryCode,
          phone: contact.phone,
          user_id: user.id
        }));
        
        // Insert into the appropriate table
        const { error } = await supabase
          .from(tableName as any)
          .insert(dbContacts);
        
        if (error) {
          console.error("Supabase error:", error);
          toast({
            variant: "default",
            title: "Contacts added locally only",
            description: "Unable to save to database: " + error.message,
          });
        } else {
          toast({
            title: "Upload successful",
            description: `${extractedContacts.length} contacts uploaded to the ${selectedCategory} database.`,
          });
        }
      } else {
        toast({
          variant: "default",
          title: "Contacts added locally",
          description: `${extractedContacts.length} contacts imported. Please login to save to database.`,
        });
      }
      
      // Reset the file input
      setFile(null);
      
      // @ts-ignore
      if (document.getElementById('file-upload')) {
        // @ts-ignore
        document.getElementById('file-upload').value = '';
      }
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading the file.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Contacts</CardTitle>
          <CardDescription>
            Upload Excel files to bulk import contacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload Excel File (.xlsx, .xls)</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            
            <Button
              onClick={handleUpload}
              disabled={isUploading || !file}
              className="w-full"
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </Button>
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Previously Uploaded Files:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {uploadedFiles.map((fileName, index) => (
                    <li key={index}>{fileName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{selectedCategory.replace('_', ' ')} Contacts</CardTitle>
          <CardDescription>
            List of contacts in the {selectedCategory.replace('_', ' ')} category.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactsTable contacts={contacts} />
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
