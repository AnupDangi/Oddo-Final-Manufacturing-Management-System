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
  Factory
} from 'lucide-react';

const ManufacturingOrdersComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedOrder, setSelectedOrder] = useState(null);
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
      id: 'MO001',
      product: 'Wooden Table',
      quantity: 10,
      status: 'In Progress',
      priority: 'High',
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      assignee: 'John Doe',
      progress: 65,
      description: 'Premium wooden dining table with oak finish',
      bomId: 'BOM001',
      workCenter: 'Assembly Line A'
    },
    {
      id: 'MO002',
      product: 'Office Chair',
      quantity: 25,
      status: 'Planned',
      priority: 'Medium',
      startDate: '2024-01-20',
      dueDate: '2024-01-30',
      assignee: 'Jane Smith',
      progress: 0,
      description: 'Ergonomic office chairs with lumbar support',
      bomId: 'BOM002',
      workCenter: 'Assembly Line B'
    },
    {
      id: 'MO003',
      product: 'Dining Set',
      quantity: 5,
      status: 'Done',
      priority: 'Low',
      startDate: '2024-01-10',
      dueDate: '2024-01-22',
      assignee: 'Mike Johnson',
      progress: 100,
      description: '6-seater dining set with matching chairs',
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

  const handleEditOrder = (order) => {
    setModalMode('edit');
    setSelectedOrder(order);
    setFormData({
      id: order.id,
      product: order.product,
      quantity: order.quantity,
      priority: order.priority,
      startDate: order.startDate,
      dueDate: order.dueDate,
      assignee: order.assignee,
      description: order.description,
      bomId: order.bomId,
      workCenter: order.workCenter
    });
    setShowModal(true);
  };

  const handleViewOrder = (order) => {
    setModalMode('view');
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleSaveOrder = () => {
    // Save logic here
    console.log('Saving order:', formData);
    setShowModal(false);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Are you sure you want to delete this manufacturing order?')) {
      console.log('Deleting order:', orderId);
    }
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

  const PriorityBadge = ({ priority }) => {
    const colors = {
      'High': 'bg-red-50 text-red-700 border-red-200',
      'Medium': 'bg-orange-50 text-orange-700 border-orange-200',
      'Low': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const ProgressBar = ({ progress }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${
          progress === 100 ? 'bg-green-500' : 
          progress >= 50 ? 'bg-blue-500' : 
          progress > 0 ? 'bg-yellow-500' : 'bg-gray-300'
        }`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  const Modal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {modalMode === 'create' ? 'Create Manufacturing Order' :
               modalMode === 'edit' ? 'Edit Manufacturing Order' :
               'Manufacturing Order Details'}
            </h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {modalMode === 'view' && selectedOrder ? (
              // View Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <p className="text-gray-900">{selectedOrder.product}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <p className="text-gray-900">{selectedOrder.quantity} units</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <PriorityBadge priority={selectedOrder.priority} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                      <p className="text-gray-900">{selectedOrder.assignee}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Center</label>
                      <p className="text-gray-900">{selectedOrder.workCenter}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress</label>
                      <div className="space-y-2">
                        <ProgressBar progress={selectedOrder.progress} />
                        <p className="text-sm text-gray-600">{selectedOrder.progress}% Complete</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.description}</p>
                </div>
              </div>
            ) : (
              // Create/Edit Mode
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id}
                      disabled={modalMode === 'edit'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                    <select
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Assignee</option>
                      {assigneeOptions.map(assignee => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Center</label>
                    <select
                      name="workCenter"
                      value={formData.workCenter}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Work Center</option>
                      {workCenterOptions.map(center => (
                        <option key={center} value={center}>{center}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BOM</label>
                  <select
                    name="bomId"
                    value={formData.bomId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select BOM</option>
                    {bomOptions.map(bom => (
                      <option key={bom.id} value={bom.id}>{bom.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter order description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {modalMode !== 'view' && (
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
                <span>{modalMode === 'create' ? 'Create Order' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all production orders</p>
        </div>
        <button 
          onClick={handleCreateOrder}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Manufacturing Order</span>
        </button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {manufacturingOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Factory className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                    <p className="text-sm text-gray-600">{order.product}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="text-sm font-medium text-gray-900">{order.quantity} units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <PriorityBadge priority={order.priority} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-medium text-gray-900">{order.progress}%</span>
                </div>
              </div>

              <div className="mb-4">
                <ProgressBar progress={order.progress} />
              </div>

              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Start: {order.startDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Due: {order.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">
                      {order.assignee.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{order.assignee}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleViewOrder(order)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                    title="Edit Order"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete Order"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal />
    </div>
  );
};

export default ManufacturingOrdersComponent;