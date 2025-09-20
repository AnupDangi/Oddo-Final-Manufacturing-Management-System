import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Package, 
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Search,
  List,
  Kanban,
  Settings
} from 'lucide-react';
import MasterMenuNavbar from './components/MasterMenuNavbar';
import ProfileNavbar from './components/ProfileNavbar';

const ManufacturingOrdersComponent = ({ onNavigate, onMenuStateChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    product: '',
    quantity: '',
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    assignee: '',
    description: '',
    bomId: '',
    workCenter: ''
  });

  const manufacturingOrders = [
    {
      id: 'MO-000001',
      reference: 'MO-000001',
      product: 'Dining Table',
      startDate: 'Tomorrow',
      finishedProduct: 'Dining Table',
      componentStatus: 'Not Available',
      quantity: 5.00,
      unit: 'Units',
      status: 'Draft',
      state: 'Confirmed',
      priority: 'High',
      dueDate: '2024-01-25',
      assignee: 'John Doe',
      progress: 0,
      description: 'Premium wooden dining table with oak finish',
      bomId: 'BOM001',
      workCenter: 'Assembly Line A'
    },
    {
      id: 'MO-000002',
      reference: 'MO-000002',
      product: 'Drawer',
      startDate: 'Yesterday',
      finishedProduct: 'Drawer',
      componentStatus: 'Available',
      quantity: 2.00,
      unit: 'Units',
      status: 'In Progress',
      state: 'In Progress',
      priority: 'Medium',
      dueDate: '2024-01-30',
      assignee: 'Jane Smith',
      progress: 45,
      description: 'Wooden drawer with metal slides',
      bomId: 'BOM002',
      workCenter: 'Assembly Line B'
    },
    {
      id: 'MO-000003',
      reference: 'MO-000003',
      product: 'Office Chair',
      startDate: '2024-01-20',
      finishedProduct: 'Office Chair',
      componentStatus: 'Available',
      quantity: 10.00,
      unit: 'Units',
      status: 'Confirmed',
      state: 'Confirmed',
      priority: 'Low',
      dueDate: '2024-01-22',
      assignee: 'Mike Johnson',
      progress: 0,
      description: 'Ergonomic office chair',
      bomId: 'BOM003',
      workCenter: 'Assembly Line A'
    }
  ];

  const bomOptions = [
    { id: 'BOM001', name: 'Wooden Table BOM' },
    { id: 'BOM002', name: 'Office Chair BOM' },
    { id: 'BOM003', name: 'Dining Set BOM' }
  ];

  const workCenterOptions = [
    'Assembly Line A',
    'Assembly Line B',
    'Paint Floor',
    'Packaging Line',
    'Quality Control'
  ];

  const assigneeOptions = [
    'John Doe',
    'Jane Smith',
    'Mike Johnson',
    'Sarah Wilson',
    'David Brown'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateOrder = () => {
    setModalMode('create');
    setFormData({
      id: `MO${String(manufacturingOrders.length + 1).padStart(3, '0')}`,
      product: '',
      quantity: '',
      priority: 'Medium',
      startDate: '',
      dueDate: '',
      assignee: '',
      description: '',
      bomId: '',
      workCenter: ''
    });
    setShowModal(true);
  };

  const handleSaveOrder = () => {
    console.log('Saving order:', formData);
    setShowModal(false);
  };

  const filteredOrders = manufacturingOrders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab || order.state === activeTab;
    const matchesSearch = searchQuery === '' || 
      order.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.finishedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.componentStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.startDate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleTabFilter = (tabName) => {
    setActiveTab(tabName);
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      'Planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'On Hold': 'bg-red-100 text-red-800 border-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Create Manufacturing Order</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <input
                  type="text"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveOrder}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Create Order</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Master Menu */}
          <div className="flex items-center space-x-4">
            <MasterMenuNavbar 
              onNavigate={onNavigate} 
              currentModule="manufacturing-orders" 
              onMenuStateChange={onMenuStateChange}
            />
            
            {/* New Button */}
            <button 
              onClick={handleCreateOrder}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>

          {/* Center: Manufacturing Orders Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Manufacturing Orders</span>
          </div>

          {/* Right: Search + View Controls + Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders, products, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Kanban className="h-5 w-5" />
              </button>
            </div>
            
            {/* Profile */}
            <ProfileNavbar 
              onNavigate={onNavigate} 
              onMenuStateChange={onMenuStateChange}
            />
          </div>
        </div>
      </div>

      {/* Third Row: My and All Sections */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex space-x-8">
          <div className="flex-1">
            <h3 className="text-gray-700 font-medium mb-3">My</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleTabFilter('Confirmed')}
                className={`px-3 py-1 border rounded text-sm hover:bg-gray-200 ${
                  activeTab === 'Confirmed' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                Confirmed <span className="ml-1 px-1 bg-gray-200 rounded text-xs">7</span>
              </button>
              <button 
                onClick={() => handleTabFilter('In Progress')}
                className={`px-3 py-1 border rounded text-sm hover:bg-gray-200 ${
                  activeTab === 'In Progress' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                In Progress <span className="ml-1 px-1 bg-gray-200 rounded text-xs">1</span>
              </button>
              <button 
                onClick={() => handleTabFilter('Late')}
                className={`px-3 py-1 border rounded text-sm ${
                  activeTab === 'Late' 
                    ? 'bg-red-200 border-red-400 text-red-800' 
                    : 'bg-red-100 border-red-300 text-red-700'
                }`}
              >
                Late <span className="ml-1 px-1 bg-red-200 rounded text-xs">3</span>
              </button>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-gray-700 font-medium mb-3">All</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => handleTabFilter('All')}
                className={`px-3 py-1 border rounded text-sm hover:bg-gray-200 ${
                  activeTab === 'All' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                All <span className="ml-1 px-1 bg-gray-200 rounded text-xs">37</span>
              </button>
              <button 
                onClick={() => handleTabFilter('Draft')}
                className={`px-3 py-1 border rounded text-sm hover:bg-gray-200 ${
                  activeTab === 'Draft' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                Draft <span className="ml-1 px-1 bg-gray-200 rounded text-xs">2</span>
              </button>
              <button 
                onClick={() => handleTabFilter('Confirmed')}
                className={`px-3 py-1 border rounded text-sm hover:bg-gray-200 ${
                  activeTab === 'Confirmed' 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                Confirmed <span className="ml-1 px-1 bg-gray-200 rounded text-xs">7</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Manufacturing Orders Table */}
      <div className="flex-1 p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finished Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    State
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer text-sm font-medium">
                        {order.reference}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.finishedProduct}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.componentStatus === 'Available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.componentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.state === 'Confirmed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : order.state === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal />
    </div>
  );
};

export default ManufacturingOrdersComponent;