import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { Car } from '../types';
import { Repeat, X, ArrowLeft, Users, Fuel, Settings, Shield, Zap, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Compare() {
  const [comparedCars, setComparedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComparedCars = async () => {
    const compareList: string[] = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (compareList.length === 0) {
      setComparedCars([]);
      setLoading(false);
      return;
    }

    const snap = await getDocs(collection(db, 'cars'));
    const allCars = snap.docs.map(d => ({ id: d.id, ...d.data() } as Car));
    const filtered = allCars.filter(c => compareList.includes(c.id));
    setComparedCars(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchComparedCars();
  }, []);

  const removeFromCompare = (id: string) => {
    const compareList: string[] = JSON.parse(localStorage.getItem('compareList') || '[]');
    const newList = compareList.filter(itemId => itemId !== id);
    localStorage.setItem('compareList', JSON.stringify(newList));
    setComparedCars(comparedCars.filter(c => c.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const features = [
    { label: 'Brand', key: 'brand', icon: Info },
    { label: 'Price/Day', key: 'pricePerDay', icon: Zap, format: (val: any) => `₹${val}` },
    { label: 'Fuel Type', key: 'fuelType', icon: Fuel },
    { label: 'Seats', key: 'seats', icon: Users },
    { label: 'Transmission', key: 'transmission', icon: Settings },
    { label: 'Status', key: 'status', icon: Shield, format: (val: any) => <span className="capitalize">{val}</span> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/cars" className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to fleet
      </Link>

      <div className="flex items-center space-x-4 mb-12">
        <div className="p-3 bg-indigo-50 rounded-2xl">
          <Repeat className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Compare Cars</h1>
          <p className="text-gray-500 font-medium mt-1">Side-by-side comparison to help you choose the best</p>
        </div>
      </div>

      {comparedCars.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No cars to compare</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Select up to 4 cars from our fleet to compare their features.</p>
          <Link
            to="/cars"
            className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Go to Cars
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-8 text-left w-1/5 bg-gray-50/50">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Model Specs</p>
                </th>
                {comparedCars.map(car => (
                  <th key={car.id} className="p-8 text-center relative border-l border-gray-100 min-w-[200px]">
                    <button
                      onClick={() => removeFromCompare(car.id)}
                      className="absolute top-4 right-4 p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <img
                      src={car.imageUrl || `https://picsum.photos/seed/${car.name}/400/250`}
                      alt={car.name}
                      className="w-full h-32 object-cover rounded-xl mb-4"
                    />
                    <h3 className="font-black text-gray-900">{car.name}</h3>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-8 font-bold text-gray-500 bg-gray-50/30">
                    <div className="flex items-center space-x-2">
                      <feature.icon className="h-4 w-4 text-gray-400" />
                      <span>{feature.label}</span>
                    </div>
                  </td>
                  {comparedCars.map(car => (
                    <td key={car.id} className="p-8 text-center font-bold text-gray-900 border-l border-gray-100">
                      {feature.format ? feature.format((car as any)[feature.key]) : (car as any)[feature.key]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="p-8 bg-gray-50/30"></td>
                {comparedCars.map(car => (
                  <td key={car.id} className="p-8 text-center border-l border-gray-100">
                    <Link
                      to={`/cars/${car.id}`}
                      className="inline-block w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                      Rent Now
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
