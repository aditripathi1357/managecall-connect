import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

type ContactCategory = "general" | "doctor" | "real_estate";

interface FileUploadProps {
  selectedCategory: ContactCategory;
  defaultCountryCode: string;
}

const FileUpload = ({ selectedCategory, defaultCountryCode }: FileUploadProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

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
      const fileName = file.name;
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
            let rowCountryCode = row.country_code || defaultCountryCode;
            
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
          
          // Add contacts to the contact list (using the window function from ContactForm)
          if (window.addImportedContacts) {
            const importedContacts = validData.map((item: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: item.name,
              email: item.email,
              countryCode: item.country_code,
              phone: item.phone,
              category: selectedCategory,
              source: `Imported from ${fileName}`
            }));
            
            window.addImportedContacts(importedContacts);
            
            // Also add the file name to the uploaded files list
            if (window.addUploadedFile) {
              window.addUploadedFile(fileName);
            }
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
            description: `Successfully added ${validData.length} contacts from ${fileName} to the ${selectedCategory} database.`,
          });
          
          // Clear file input
          e.target.value = '';
        } catch (error: any) {
          console.error("Error processing file:", error);
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
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "There was an error uploading the file",
      });
      setIsUploading(false);
    }
  };

  return (
    <div style={{ float: "right", marginRight: "20px" }}>
      <Card className="w-80">
        <CardHeader className="py-2">
          <CardTitle className="text-md">Bulk Import</CardTitle>
          <CardDescription className="text-xs">
            Upload an Excel file to import multiple contacts at once.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="excel-file" className="whitespace-nowrap text-sm">Excel File:</Label>
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="text-sm h-8"
              />
            </div>
            <p className="text-xs text-gray-500">
              Required columns: name, email, and phone
            </p>
            
            <div className="h-12 flex items-center justify-center">
              {isUploading ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-1"></div>
                  <p className="text-xs">Processing...</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-xs">Upload Excel file to import contacts</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Declare global window interface with our custom functions
declare global {
  interface Window {
    addUploadedFile?: (fileName: string) => void;
    addImportedContacts?: (contacts: any[]) => void;
  }
}

export default FileUpload;