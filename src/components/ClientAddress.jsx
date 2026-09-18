import { MapPin } from 'lucide-react';
import { addressLines, googleMapsUrl } from '@/lib/address';

export default function ClientAddress({ client }) {
  const lines = addressLines(client);
  if (!lines.length) return null;
  return <div className="flex items-start gap-2 text-sm text-slate-600">
    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    <div className="min-w-0 break-words">
      {lines.map((line, index) => <div key={index}>{line}</div>)}
      <a href={googleMapsUrl(client)} target="_blank" rel="noopener noreferrer" className="inline-block py-1 font-medium text-blue-700 underline hover:text-blue-900">Open in Google Maps</a>
    </div>
  </div>;
}
