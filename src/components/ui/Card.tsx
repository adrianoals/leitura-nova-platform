import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`group bg-gradient-to-br from-white to-brand-blue/5 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-brand-blue/10 ${className}`}>
      {children}
    </div>
  );
} 