import React, { useState } from 'react';
import { 
  Search, 
  List, 
  Kanban,
  Play,
  Pause,
  Square,
  CheckCircle,
  Clock,
  Settings,
  Package,
  Plus
} from 'lucide-react';
import MasterMenuNavbar from './components/MasterMenuNavbar';


const WorkOrdersComponent = ({ onNavigate, onMenuStateChange }) => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([
    {
      id: 'WO-001',
      operation: 'Assembly-1',
      workCenter: 'Work Center -1',
      finishedProduct: 'Dining Table',
      expectedDuration: '60.00',
      realDuration: '00.00',
      status: 'To Do',
      progress: 0,
      manufacturingOrder: 'MO-000001'
    },
    {
      id: 'WO-002',
      operation: 'Painting-1',
      workCenter: 'Paint Floor',
      finishedProduct: 'Office Chair',
      expectedDuration: '30.00',
      realDuration: '15.00',
      status: 'In Progress',
      progress: 50,
      manufacturingOrder: 'MO-000002'
    },
    {
      id: 'WO-003',
      operation: 'Packaging-1',
      workCenter: 'Packaging Line',
      finishedProduct: 'Drawer',
      expectedDuration: '20.00',
      realDuration: '20.00',
      status: 'Done',
      progress: 100,
      manufacturingOrder: 'MO-000003'
    }
  ]);

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.workCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.finishedProduct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleWorkOrderAction = (orderId, action) => {
    setWorkOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        switch(action) {
          case 'start':
            return { ...order, status: 'In Progress' };
          case 'pause':
            return { ...order, status: 'Paused' };
          case 'complete':
            return { ...order, status: 'Done', progress: 100 };
          default:
            return order;
        }
      }
      return order;
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'To Do':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'In Progress':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'Paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'Done':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Square className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'To Do':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              onMenuStateChange={onMenuStateChange}
              currentModule="work-orders" 
            />
          </div>

          {/* Center: Work Orders Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Work Orders</span>
          </div>

          {/* Right: Search + View Controls + Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search operation, work center, product, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all duration-200 btn-smooth ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-all duration-200 btn-smooth ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Kanban className="h-5 w-5" />
              </button>
            </div>
            
            {/* Profile Removed */}
          </div>
        </div>
      </div>

      {/* Main Content: Work Orders Table */}
      <div className="flex-1 p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Populate all work orders added to manufacturing order
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Center
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finished Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Real Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.operation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.workCenter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.finishedProduct}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.expectedDuration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.realDuration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{order.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {order.status === 'To Do' && (
                          <button
                            onClick={() => handleWorkOrderAction(order.id, 'start')}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Start Work Order"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'In Progress' && (
                          <>
                            <button
                              onClick={() => handleWorkOrderAction(order.id, 'pause')}
                              className="text-yellow-600 hover:text-yellow-800 p-1 rounded"
                              title="Pause Work Order"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleWorkOrderAction(order.id, 'complete')}
                              className="text-green-600 hover:text-green-800 p-1 rounded"
                              title="Complete Work Order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {order.status === 'Paused' && (
                          <button
                            onClick={() => handleWorkOrderAction(order.id, 'start')}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Resume Work Order"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Settings className="w-8 h-8 text-gray-400" />
                        <p>No work orders found</p>
                        <p className="text-sm">Work orders will appear here when manufacturing orders are created</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Work Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{workOrders.length}</p>
              </div>
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {workOrders.filter(order => order.status === 'In Progress').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-green-600">
                  {workOrders.filter(order => order.status === 'Done').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-600">
                  {workOrders.filter(order => order.status === 'To Do').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrdersComponent;