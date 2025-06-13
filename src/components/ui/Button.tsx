import { FaArrowRight } from 'react-icons/fa';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  href?: string;
  className?: string;
}

export default function Button({ children, variant = 'primary', href, className = '' }: ButtonProps) {
  const baseStyles = "group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105";
  
  const variants = {
    primary: "bg-white text-blue-700",
    secondary: "border-2 border-white text-white hover:bg-white hover:text-blue-700"
  };

  const buttonContent = (
    <>
      {children}
      <FaArrowRight className="transform group-hover:translate-x-1 transition-transform" />
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${baseStyles} ${variants[variant]} ${className}`}>
        {buttonContent}
      </a>
    );
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`}>
      {buttonContent}
    </button>
  );
} 