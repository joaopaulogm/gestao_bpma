
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  to: string;
  className?: string;
}

const Card = ({ title, subtitle, icon: Icon, to, className }: CardProps) => {
  return (
    <Link 
      to={to}
      className={cn(
        "bg-white border border-fauna-border rounded-lg p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-md animate-slide-up",
        className
      )}
    >
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white border border-fauna-border">
        <Icon className="h-8 w-8 text-fauna-blue" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-fauna-blue text-lg">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </Link>
  );
};

export default Card;
