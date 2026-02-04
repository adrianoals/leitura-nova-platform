import { IconType } from 'react-icons';

export interface Service {
  icon: IconType;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
}

export interface Differentiator {
  icon: IconType;
  title: string;
  description: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon?: IconType;
  color?: string;
} 