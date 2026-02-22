import { useState } from 'react';
import { Package, BarChart, Settings, Eye, Check, X, Phone } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

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
    { id: 'new', title: 'New Requests', color: 'blue' },
    { id: 'checking', title: 'Checking Stock', color: 'yellow' },
    { id: 'confirmed', title: 'Confirmed', color: 'green' },
    { id: 'packing', title: 'Packing', color: 'purple' },
    { id: 'ready', title: 'Ready', color: 'teal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-orange-600 text-white p-6 flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">MediSync</h2>
          <p className="text-orange-100 text-sm">Pharmacy Portal</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-orange-700 text-white' : 'text-orange-50 hover:bg-orange-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-orange-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              HP
            </div>
            <div>
              <div className="font-semibold">HealthPlus Pharmacy</div>
              <div className="text-sm text-orange-100">Manager</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {activeTab === 'queue' && !selectedOrder && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Prescription Queue</h1>
              <div className="flex gap-2">
                {['All', 'Urgent', 'Hospital Network'].map((filter) => (
                  <button
                    key={filter}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      filter === 'All'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-8">
              {columns.map((column) => (
                <div key={column.id} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{column.title}</h3>
                  <div className={`text-2xl font-bold text-${column.color}-600`}>
                    {orders.filter((o) => o.status === column.id).length}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{order.prescriptionId}</h3>
                        {order.urgency && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                            Urgent
                          </span>
                        )}
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full capitalize">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Patient: {order.patientName}</div>
                        <div>Doctor: {order.doctorName}</div>
                        <div>{order.hospital}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Received</div>
                      <div className="font-semibold text-gray-900">{order.receivedTime}</div>
                      <div className="text-sm text-gray-500 mt-2">Est. Value</div>
                      <div className="text-lg font-bold text-green-600">${order.estimatedValue.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">{order.medicineCount} medicines</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        <Check className="w-4 h-4" />
                        Confirm Stock
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
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
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
            >
              ← Back to Queue
            </button>

            {orders
              .filter((o) => o.id === selectedOrder)
              .map((order) => (
                <div key={order.id}>
                  <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">
                          Order {order.id} - {order.prescriptionId}
                        </h2>
                        <div className="text-gray-600 space-y-1">
                          <div>Patient: {order.patientName}</div>
                          <div>Doctor: {order.doctorName}</div>
                          <div>Hospital: {order.hospital}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Received</div>
                        <div className="font-semibold text-gray-900">{order.receivedTime}</div>
                        <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full capitalize">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4 text-gray-900">Medicine List & Stock Check</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Medicine
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Quantity
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Unit Price
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                Total
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {order.medicines.map((medicine, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium text-gray-900">{medicine.name}</td>
                                <td className="px-4 py-3 text-gray-700">{medicine.dosage}</td>
                                <td className="px-4 py-3 text-gray-700">{medicine.quantity}</td>
                                <td className="px-4 py-3 text-gray-700">
                                  ${(medicine.price / medicine.quantity).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-900">
                                  ${medicine.price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  {medicine.inStock ? (
                                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                                      <Check className="w-4 h-4" />
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                                      <X className="w-4 h-4" />
                                      Out of Stock
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-900">
                                Total Amount:
                              </td>
                              <td colSpan={2} className="px-4 py-3 font-bold text-xl text-green-600">
                                ${order.estimatedValue.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Update Status</label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none">
                        <option value="checking">Checking Stock</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packing">Packing</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ready in (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Notes to Patient</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        placeholder="Any special instructions or information"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors">
                        Update Status & Notify Patient
                      </button>
                      <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                        Generate Bill
                      </button>
                      <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
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
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Inventory Management</h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Items', value: '1,234', color: 'blue' },
                { label: 'Low Stock Alerts', value: '23', color: 'red' },
                { label: 'Expiring Soon', value: '8', color: 'yellow' },
                { label: 'Out of Stock', value: '5', color: 'gray' },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                  <div className={`text-4xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Medicine Stock</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Medicine</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Min Level</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expiry</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        name: 'Amoxicillin 500mg',
                        category: 'Antibiotic',
                        stock: 500,
                        min: 50,
                        expiry: '2027-12-31',
                        status: 'Available',
                      },
                      {
                        name: 'Paracetamol 650mg',
                        category: 'Analgesic',
                        stock: 1000,
                        min: 100,
                        expiry: '2027-06-30',
                        status: 'Available',
                      },
                      {
                        name: 'Metformin 850mg',
                        category: 'Antidiabetic',
                        stock: 300,
                        min: 50,
                        expiry: '2027-09-30',
                        status: 'Available',
                      },
                    ].map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3 text-gray-700">{item.category}</td>
                        <td className="px-4 py-3 text-gray-700">{item.stock}</td>
                        <td className="px-4 py-3 text-gray-700">{item.min}</td>
                        <td className="px-4 py-3 text-gray-700">{item.expiry}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
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