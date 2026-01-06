
import React from 'react';

interface DetailsFieldProps {
  label: string;
  value: string | number | null;
}

const DetailsField = ({ label, value }: DetailsFieldProps) => {
  if (value === null || value === '') return null;
  
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
};

export default DetailsField;
