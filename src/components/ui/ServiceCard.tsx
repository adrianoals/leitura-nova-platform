import { IconType } from 'react-icons';
import Card from './Card';

interface ServiceCardProps {
  icon: IconType;
  title: string;
  description: string;
}

export default function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Card>
      <div className="text-blue-600 text-3xl mb-4 transform group-hover:scale-110 transition-transform">
        <Icon />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-blue-700">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
} 