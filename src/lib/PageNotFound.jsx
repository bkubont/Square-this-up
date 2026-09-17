import { Link } from 'react-router-dom';
export default function PageNotFound() {
  return <div className="p-12 text-center"><h1 className="text-2xl font-bold">Page not found</h1><Link to="/" className="mt-4 inline-block underline">Return home</Link></div>;
}
