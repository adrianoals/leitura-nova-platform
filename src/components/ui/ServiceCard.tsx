import { IconType } from 'react-icons';

interface ServiceCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export default function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10">
        <Icon className="h-6 w-6 text-brand-blue" />
      </div>
      <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
} 