import { useState, useEffect } from 'react';
import { Package, BarChart, Settings, Eye, Check, X, Phone, LogOut, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
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
    medicineName: string;
    dosage: string;
    quantity: number;
    totalPrice?: number;
    unitPrice?: number;
  }[];
}

interface InventoryItem {
  _id: string;
  medicine: string;
  stock: number;
  price: number;
  isAvailable: boolean;
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

  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ medicine: '', stock: 0, price: 0 });

  // Profile state
  const [profileMissing, setProfileMissing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      if (activeTab === 'queue' || !orders.length) {
        const response = await fetch(`${backendUrl}/pharmacy/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.requireProfileSetup || result.message === 'Pharmacy profile not found') {
          setProfileMissing(true);
          return;
        }

        if (result.success) {
          // Map backend orders to frontend interface
          const formattedOrders = result.data.orders.map((o: any) => ({
            id: o._id,
            prescriptionId: o.prescriptionId?.prescriptionId || 'Unknown',
            patientName: o.patientId ? `${o.patientId.firstName} ${o.patientId.lastName}` : 'Unknown Patient',
            doctorName: 'Doctor', // Not easily populated in this query immediately, simplify for now
            hospital: 'Network Hospital',
            medicineCount: o.items?.length || 0,
            urgency: false,
            receivedTime: new Date(o.createdAt).toLocaleTimeString(),
            estimatedValue: o.totalAmount || 0,
            status: o.status,
            medicines: o.items || []
          }));
          setOrders(formattedOrders);
        }
      }

      if (activeTab === 'inventory' || !inventory.length) {
        const response = await fetch(`${backendUrl}/pharmacy/inventory`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.requireProfileSetup || result.message === 'Pharmacy profile not found') {
          setProfileMissing(true);
          return;
        }

        if (result.success) {
          setInventory(result.data.inventory);
        }
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { id: 'new', title: 'New Requests', gradient: 'from-brand-500 to-brand-300' },
    { id: 'checking', title: 'Checking Stock', gradient: 'from-amber-500 to-yellow-500' },
    { id: 'confirmed', title: 'Confirmed', gradient: 'from-emerald-500 to-green-500' },
    { id: 'packing', title: 'Packing', gradient: 'from-purple-500 to-pink-500' },
    { id: 'ready', title: 'Ready', gradient: 'from-brand-300 to-teal-500' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 flex w-full flex-col md:flex-row">
        <Sidebar collapsible="icon" className="glass-sidebar border-r-0">
          <SidebarHeader className="p-6 pb-2">
            <div className="flex items-center justify-between group-data-[collapsible=icon]:hidden">
              <h2 className="text-2xl font-bold text-gradient font-display">MediSync</h2>
              <SidebarTrigger />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
              <SidebarTrigger />
            </div>
            <p className="text-orange-400/70 text-sm group-data-[collapsible=icon]:hidden">Pharmacy Portal</p>
          </SidebarHeader>

          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => {
                          setActiveTab(item.id);
                          setSelectedOrder(null);
                        }}
                        isActive={activeTab === item.id}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id
                          ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-brand-900 border border-orange-500/30'
                          : 'text-brand-700 hover:text-brand-900 hover:bg-brand-900/5'
                          }`}
                        style={{ height: 'auto' }}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-6 pt-2 border-t border-brand-900/10 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center gap-3 mb-4 group-data-[collapsible=icon]:justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-brand-900 font-semibold text-sm flex-shrink-0">
                HP
              </div>
              <div className="group-data-[collapsible=icon]:hidden overflow-hidden">
                <div className="font-semibold text-brand-900 text-sm truncate">HealthPlus Pharmacy</div>
                <div className="text-xs text-brand-500 truncate">Manager</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-brand-500 hover:text-red-400 rounded-lg transition-colors text-sm group-data-[collapsible=icon]:px-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="bg-transparent flex-1 flex flex-col w-full h-full">
          <header className="flex h-14 items-center gap-2 px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {profileMissing ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-brand-900 font-display mb-4">Profile Setup Required</h2>
                <p className="text-brand-700 max-w-md text-lg">
                  Your pharmacy profile has not been fully set up. Please contact an administrator or complete the registration steps to access the dashboard.
                </p>
              </div>
            ) : activeTab === 'queue' && !selectedOrder && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-brand-900 font-display">Prescription Queue</h1>
                  <div className="flex gap-2">
                    {['All', 'Urgent', 'Hospital Network'].map((filter) => (
                      <button
                        key={filter}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${filter === 'All'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-brand-900'
                          : 'bg-brand-900/5 text-brand-700 hover:bg-brand-900/10 border border-brand-900/10'
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
                      <h3 className="font-semibold text-brand-800 mb-1 text-sm">{column.title}</h3>
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
                            <h3 className="text-xl font-bold text-brand-900 font-display">{order.prescriptionId}</h3>
                            {order.urgency && (
                              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/30">
                                Urgent
                              </span>
                            )}
                            <span className="px-3 py-1 bg-brand-500/20 text-brand-700 text-sm font-semibold rounded-full border border-brand-500/30 capitalize">
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-brand-700 space-y-1">
                            <div>Patient: {order.patientName}</div>
                            <div>Doctor: {order.doctorName}</div>
                            <div>{order.hospital}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-brand-500 mb-1">Received</div>
                          <div className="font-semibold text-brand-900">{order.receivedTime}</div>
                          <div className="text-sm text-brand-500 mt-2">Est. Value</div>
                          <div className="text-lg font-bold text-emerald-400">${order.estimatedValue.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-brand-900/10">
                        <div className="text-sm text-brand-700">{order.medicineCount} medicines</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-brand-900 rounded-xl font-semibold hover:shadow-md transition-all duration-300"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-brand-900 rounded-xl font-semibold hover:shadow-md transition-all duration-300">
                            <Check className="w-4 h-4" />
                            Confirm Stock
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
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

            {!profileMissing && activeTab === 'queue' && selectedOrder && (
              <div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex items-center gap-2 text-brand-700 hover:text-orange-400 mb-6 transition-colors"
                >
                  ← Back to Queue
                </button>

                {orders
                  .filter((o) => o.id === selectedOrder)
                  .map((order) => (
                    <div key={order.id}>
                      <div className="glass-card p-8 mb-6">
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-brand-900/10">
                          <div>
                            <h2 className="text-2xl font-bold mb-4 text-brand-900 font-display">
                              Order {order.id} - {order.prescriptionId}
                            </h2>
                            <div className="text-brand-700 space-y-1">
                              <div>Patient: {order.patientName}</div>
                              <div>Doctor: {order.doctorName}</div>
                              <div>Hospital: {order.hospital}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-brand-500 mb-1">Received</div>
                            <div className="font-semibold text-brand-900">{order.receivedTime}</div>
                            <span className="inline-block mt-2 px-3 py-1 bg-brand-500/20 text-brand-700 text-sm font-semibold rounded-full border border-brand-500/30 capitalize">
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h3 className="text-lg font-bold mb-4 text-brand-900 font-display">Medicine List & Stock Check</h3>
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
                                    <td className="px-4 py-3 font-medium text-brand-900">{medicine.medicineName}</td>
                                    <td className="px-4 py-3">{medicine.dosage}</td>
                                    <td className="px-4 py-3">{medicine.quantity}</td>
                                    <td className="px-4 py-3">₹{((medicine.totalPrice || 0) / (medicine.quantity || 1)).toFixed(2)}</td>
                                    <td className="px-4 py-3 font-semibold text-brand-900">₹{(medicine.totalPrice || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                      {true ? (
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
                                <tr className="bg-brand-900/5">
                                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-brand-900">
                                    Total Amount:
                                  </td>
                                  <td colSpan={2} className="px-4 py-3 font-bold text-xl text-emerald-400">
                                    ₹{order.estimatedValue.toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-brand-800 mb-2">Update Status</label>
                          <select className="w-full px-4 py-3 glass-input">
                            <option value="checking">Checking Stock</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packing">Packing</option>
                            <option value="ready">Ready for Pickup</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-brand-800 mb-2">Ready in (minutes)</label>
                          <input
                            type="number"
                            defaultValue={30}
                            className="w-full px-4 py-3 glass-input"
                          />
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-brand-800 mb-2">Notes to Patient</label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-3 glass-input"
                            placeholder="Any special instructions or information"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 text-brand-900 py-3 rounded-xl font-semibold hover:shadow-md transition-all duration-300">
                            Update Status & Notify Patient
                          </button>
                          <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                            Generate Bill
                          </button>
                          <button className="px-6 py-3 bg-brand-900/5 text-brand-800 rounded-xl font-semibold hover:bg-brand-900/10 border border-brand-900/10 transition-colors">
                            Print Label
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!profileMissing && activeTab === 'inventory' && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-brand-900 font-display">Inventory Management</h1>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Total Items', value: inventory.length.toString(), gradient: 'from-brand-500 to-brand-300', glow: 'stat-card-blue' },
                    { label: 'Low Stock Alerts', value: inventory.filter(i => i.stock > 0 && i.stock < 20).length.toString(), gradient: 'from-red-500 to-pink-500', glow: 'stat-card-red' },
                    { label: 'Total Value', value: '₹' + inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), gradient: 'from-amber-500 to-yellow-500', glow: 'stat-card-yellow' },
                    { label: 'Out of Stock', value: inventory.filter(i => i.stock === 0 || !i.isAvailable).length.toString(), gradient: 'from-brand-500 to-brand-300', glow: '' },
                  ].map((stat, index) => (
                    <div key={index} className={`glass-card p-6 ${stat.glow}`}>
                      <div className="text-sm text-brand-700 mb-2">{stat.label}</div>
                      <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-brand-900 font-display">Medicine Stock</h2>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-brand-900 rounded-xl font-semibold hover:shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Medicine
                    </button>
                  </div>

                  {showAddForm && (
                    <div className="glass-card p-6 mb-6 border border-emerald-500/30">
                      <h3 className="text-lg font-bold text-brand-900 mb-4">Add New Item</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-brand-700 mb-1">Medicine Name</label>
                          <input type="text" className="w-full bg-slate-50 border border-brand-700 rounded-lg px-3 py-2 text-brand-900" value={newItem.medicine} onChange={e => setNewItem({ ...newItem, medicine: e.target.value })} />
                        </div>
                        <div>
                          <label className="block text-sm text-brand-700 mb-1">Stock Amount</label>
                          <input type="number" className="w-full bg-slate-50 border border-brand-700 rounded-lg px-3 py-2 text-brand-900" value={newItem.stock} onChange={e => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                          <label className="block text-sm text-brand-700 mb-1">Unit Price (₹)</label>
                          <input type="number" step="0.01" className="w-full bg-slate-50 border border-brand-700 rounded-lg px-3 py-2 text-brand-900" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <button
                          onClick={async () => {
                            if (!newItem.medicine) return;
                            const token = localStorage.getItem('token');
                            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                            await fetch(`${backendUrl}/pharmacy/inventory`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                              body: JSON.stringify(newItem)
                            });
                            setNewItem({ medicine: '', stock: 0, price: 0 });
                            setShowAddForm(false);
                            fetchData();
                          }}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-brand-900 font-semibold py-2 rounded-lg transition-colors"
                        >
                          Save Item
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="glass-table overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left">Medicine</th>
                          <th className="px-4 py-3 text-left">Stock</th>
                          <th className="px-4 py-3 text-left">Price</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan={5} className="text-center py-8 text-brand-700"><RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Loading...</td></tr>
                        ) : inventory.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-8 text-brand-700">No inventory found</td></tr>
                        ) : (
                          inventory.map((item) => (
                            <tr key={item._id}>
                              <td className="px-4 py-3 font-medium text-brand-900">{item.medicine}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  className="bg-slate-50 border border-brand-700 rounded px-2 py-1 w-20 text-brand-900"
                                  defaultValue={item.stock}
                                  onBlur={async (e) => {
                                    const newStock = parseInt(e.target.value);
                                    if (newStock === item.stock) return;
                                    const token = localStorage.getItem('token');
                                    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                    await fetch(`${backendUrl}/pharmacy/inventory/${item._id}`, {
                                      method: 'PUT',
                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ stock: newStock })
                                    });
                                    fetchData();
                                  }}
                                />
                              </td>
                              <td className="px-4 py-3">₹{item.price.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                {item.isAvailable ? (
                                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30">Available</span>
                                ) : (
                                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/30">Unavailable</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={async () => {
                                    const token = localStorage.getItem('token');
                                    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                    await fetch(`${backendUrl}/pharmacy/inventory/${item._id}`, {
                                      method: 'PUT',
                                      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ isAvailable: !item.isAvailable })
                                    });
                                    fetchData();
                                  }}
                                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${item.isAvailable ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                >
                                  Mark {item.isAvailable ? 'Unavailable' : 'Available'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}