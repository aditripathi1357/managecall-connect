
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactDetails {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  category: "general" | "doctor" | "real_estate";
  source?: string;
}

interface ContactsTableProps {
  contacts: ContactDetails[];
}

const ContactsTable = ({ contacts }: ContactsTableProps) => {
  if (!contacts || contacts.length === 0) {
    return <div className="text-center py-4">No contacts added yet.</div>;
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Callback</TableHead>
            <TableHead>Summary</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {contact.countryCode} {contact.phone}
              </TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContactsTable;
