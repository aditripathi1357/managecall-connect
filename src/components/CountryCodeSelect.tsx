
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countryCodes = [
  { code: "+1", country: "US" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+86", country: "CN" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+81", country: "JP" },
  { code: "+7", country: "RU" },
  { code: "+55", country: "BR" },
  { code: "+52", country: "MX" },
  { code: "+27", country: "ZA" },
  { code: "+82", country: "KR" },
  { code: "+39", country: "IT" },
  { code: "+34", country: "ES" },
];

interface CountryCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const CountryCodeSelect = ({ value, onValueChange }: CountryCodeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[90px]">
        <SelectValue placeholder={countryCodes[0].code} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {countryCodes.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} {country.country}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;
