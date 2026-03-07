import { useState } from 'react';
import { Package, BarChart, Settings, Eye, Check, X, Phone, LogOut } from 'lucide-react';
import { useRouter } from '../components/Router';
import { useAuth } from '../context/AuthContext';

interface PrescriptionOrder {
  id: string;
  prescriptionId: string;
  patientName: string;
  doctorName: string;
  hospital: string;
  medicineCount: number;
  urgency: boolean;
  receivedTime: string;
  estimatedValue: number;
  status: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    inStock: boolean;
    price: number;
  }[];
}

export default function PharmacyDashboard() {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'queue', label: 'Prescription Queue', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const orders: PrescriptionOrder[] = [
    {
      id: 'ORD001',
      prescriptionId: 'RX001',
      patientName: 'John D.',
      doctorName: 'Dr. Sarah Johnson',
      hospital: 'City General Hospital',
      medicineCount: 2,
      urgency: false,
      receivedTime: '10 mins ago',
      estimatedValue: 12.5,
      status: 'packing',
      medicines: [
        { name: 'Amoxicillin 500mg', dosage: '500mg', quantity: 21, inStock: true, price: 10.5 },
        { name: 'Paracetamol 650mg', dosage: '650mg', quantity: 20, inStock: true, price: 2.0 },
      ],
    },
    {
      id: 'ORD002',
      prescriptionId: 'RX002',
      patientName: 'Jane S.',
      doctorName: 'Dr. Michael Chen',
      hospital: 'City General Hospital',
      medicineCount: 2,
      urgency: false,
      receivedTime: '25 mins ago',
      estimatedValue: 40.2,
      status: 'checking',
      medicines: [
        { name: 'Metformin 850mg', dosage: '850mg', quantity: 60, inStock: true, price: 18.0 },
        { name: 'Glimepiride 2mg', dosage: '2mg', quantity: 30, inStock: true, price: 22.2 },
      ],
    },
  ];

  const columns = [
    { id: 'new', title: 'New Requests', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'checking', title: 'Checking Stock', gradient: 'from-amber-500 to-yellow-500' },
    { id: 'confirmed', title: 'Confirmed', gradient: 'from-emerald-500 to-green-500' },
    { id: 'packing', title: 'Packing', gradient: 'from-purple-500 to-pink-500' },
    { id: 'ready', title: 'Ready', gradient: 'from-cyan-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 glass-sidebar p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
          <p className="text-orange-400/70 text-sm">Pharmacy Portal</p>
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedOrder(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-white border border-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              HP
            </div>
            <div>
              <div className="font-semibold text-white text-sm">HealthPlus Pharmacy</div>
              <div className="text-xs text-slate-500">Manager</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {activeTab === 'queue' && !selectedOrder && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white font-display">Prescription Queue</h1>
              <div className="flex gap-2">
                {['All', 'Urgent', 'Hospital Network'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${filter === 'All'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {columns.map((column) => (
                <div key={column.id} className="glass-card p-4">
                  <h3 className="font-semibold text-slate-300 mb-1 text-sm">{column.title}</h3>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${column.gradient} bg-clip-text text-transparent`}>
                    {orders.filter((o) => o.status === column.id).length}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="glass-card p-6 border-l-4 border-orange-500/50 hover:border-orange-400 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white font-display">{order.prescriptionId}</h3>
                        {order.urgency && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/30">
                            Urgent
                          </span>
                        )}
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30 capitalize">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <div>Patient: {order.patientName}</div>
                        <div>Doctor: {order.doctorName}</div>
                        <div>{order.hospital}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Received</div>
                      <div className="font-semibold text-white">{order.receivedTime}</div>
                      <div className="text-sm text-slate-500 mt-2">Est. Value</div>
                      <div className="text-lg font-bold text-emerald-400">${order.estimatedValue.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-sm text-slate-400">{order.medicineCount} medicines</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-glow-orange transition-all duration-300"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300">
                        <Check className="w-4 h-4" />
                        Confirm Stock
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors">
                        <Phone className="w-4 h-4" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'queue' && selectedOrder && (
          <div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-orange-400 mb-6 transition-colors"
            >
              ← Back to Queue
            </button>

            {orders
              .filter((o) => o.id === selectedOrder)
              .map((order) => (
                <div key={order.id}>
                  <div className="glass-card p-8 mb-6">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-white font-display">
                          Order {order.id} - {order.prescriptionId}
                        </h2>
                        <div className="text-slate-400 space-y-1">
                          <div>Patient: {order.patientName}</div>
                          <div>Doctor: {order.doctorName}</div>
                          <div>Hospital: {order.hospital}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500 mb-1">Received</div>
                        <div className="font-semibold text-white">{order.receivedTime}</div>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30 capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-white font-display">Medicine List & Stock Check</h3>
                      <div className="glass-table overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left">Medicine</th>
                              <th className="px-4 py-3 text-left">Dosage</th>
                              <th className="px-4 py-3 text-left">Quantity</th>
                              <th className="px-4 py-3 text-left">Unit Price</th>
                              <th className="px-4 py-3 text-left">Total</th>
                              <th className="px-4 py-3 text-left">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.medicines.map((medicine, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 font-medium text-white">{medicine.name}</td>
                                <td className="px-4 py-3">{medicine.dosage}</td>
                                <td className="px-4 py-3">{medicine.quantity}</td>
                                <td className="px-4 py-3">${(medicine.price / medicine.quantity).toFixed(2)}</td>
                                <td className="px-4 py-3 font-semibold text-white">${medicine.price.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                  {medicine.inStock ? (
                                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                                      <Check className="w-4 h-4" />
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-red-400 font-semibold">
                                      <X className="w-4 h-4" />
                                      Out of Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-white/5">
                              <td colSpan={4} className="px-4 py-3 text-right font-semibold text-white">
                                Total Amount:
                              </td>
                              <td colSpan={2} className="px-4 py-3 font-bold text-xl text-emerald-400">
                                ${order.estimatedValue.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Update Status</label>
                      <select className="w-full px-4 py-3 glass-input">
                        <option value="checking">Checking Stock</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packing">Packing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Ready in (minutes)</label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="w-full px-4 py-3 glass-input"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Notes to Patient</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 glass-input"
                        placeholder="Any special instructions or information"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-semibold hover:shadow-glow-orange transition-all duration-300">
                        Update Status & Notify Patient
                      </button>
                      <button className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors">
                        Generate Bill
                      </button>
                      <button className="px-6 py-3 bg-white/5 text-slate-300 rounded-xl font-semibold hover:bg-white/10 border border-white/10 transition-colors">
                        Print Label
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-white font-display">Inventory Management</h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Items', value: '1,234', gradient: 'from-blue-500 to-cyan-500', glow: 'stat-card-blue' },
                { label: 'Low Stock Alerts', value: '23', gradient: 'from-red-500 to-pink-500', glow: 'stat-card-red' },
                { label: 'Expiring Soon', value: '8', gradient: 'from-amber-500 to-yellow-500', glow: 'stat-card-yellow' },
                { label: 'Out of Stock', value: '5', gradient: 'from-slate-500 to-slate-400', glow: '' },
              ].map((stat, index) => (
                <div key={index} className={`glass-card p-6 ${stat.glow}`}>
                  <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 text-white font-display">Medicine Stock</h2>
              <div className="glass-table overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left">Medicine</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Min Level</th>
                      <th className="px-4 py-3 text-left">Expiry</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 500, min: 50, expiry: '2027-12-31', status: 'Available' },
                      { name: 'Paracetamol 650mg', category: 'Analgesic', stock: 1000, min: 100, expiry: '2027-06-30', status: 'Available' },
                      { name: 'Metformin 850mg', category: 'Antidiabetic', stock: 300, min: 50, expiry: '2027-09-30', status: 'Available' },
                    ].map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 font-medium text-white">{item.name}</td>
                        <td className="px-4 py-3">{item.category}</td>
                        <td className="px-4 py-3">{item.stock}</td>
                        <td className="px-4 py-3">{item.min}</td>
                        <td className="px-4 py-3">{item.expiry}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}