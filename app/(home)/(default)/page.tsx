
import Navbar from '@/app/navbar/navbar';
import ErpCrmHome from '@/components/ErpCrmHome';

export default function Page() {
  return (
    <div className="w-full bg-slate-50 text-slate-900 min-h-screen">
      <Navbar />
      <ErpCrmHome />
    </div>
  );
}

