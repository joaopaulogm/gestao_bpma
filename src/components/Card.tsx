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

const Card = ({
  title,
  subtitle,
  icon: Icon,
  to,
  className
}: CardProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "group relative overflow-hidden rounded-2xl p-8 flex flex-col items-center justify-center gap-5",
        "bg-card backdrop-blur-xl",
        "border border-border",
        "shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      {/* Icon container */}
      <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 transition-all duration-300 group-hover:scale-105">
        <Icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
      </div>
      
      {/* Content */}
      <div className="relative text-center space-y-2">
        <h3 className="font-semibold text-foreground text-lg leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
};

export default Card;
