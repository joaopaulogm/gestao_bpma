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
        "group bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
        "animate-slide-up",
        className
      )}
    >
      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/5 border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </Link>
  );
};

export default Card;
