
import React from 'react';
import { Label } from '@/components/ui/label';

interface FormSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A reusable component for form sections with optional title
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h3 className="text-md font-medium text-gray-700">{title}</h3>}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
