
import React from 'react';
import { Label } from '@/components/ui/label';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  columns?: boolean;
}

/**
 * A reusable component for form sections with optional title
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description,
  children, 
  className = "",
  columns = false
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div>
          <h3 className="text-md font-medium text-gray-700">{title}</h3>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className={columns 
        ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" 
        : "space-y-4"
      }>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
