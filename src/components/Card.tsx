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
        "bg-background/85 backdrop-blur-xl",
        "border border-primary/10",
        "shadow-[0_4px_24px_hsl(var(--primary)/0.06)]",
        "transition-all duration-300 ease-out",
        "hover:bg-background/95 hover:border-primary/20",
        "hover:shadow-[0_12px_40px_hsl(var(--primary)/0.12)]",
        "hover:-translate-y-1",
        "animate-fade-in",
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
      
      {/* Icon container */}
      <div className={cn(
        "relative h-16 w-16 flex items-center justify-center rounded-full",
        "bg-primary/8 border border-primary/12",
        "transition-all duration-300",
        "group-hover:bg-primary/12 group-hover:border-primary/20",
        "group-hover:scale-105"
      )}>
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
