
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
  );
};

export default FileUpload;
