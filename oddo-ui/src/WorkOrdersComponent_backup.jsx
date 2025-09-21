import React, { useState, useEffect } from 'react';
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
import { workOrderService } from './services/api';

const WorkOrdersComponent = ({ onNavigate, onMenuStateChange }) => {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch work orders from backend
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrderService.getAll();
      if (response.success) {
        setWorkOrders(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch work orders');
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
      setError('Failed to fetch work orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.operation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.workCenter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleWorkOrderAction = (orderId, action) => {
    setWorkOrders(prev => prev.map(order => {
      if (order._id === orderId || order.id === orderId) {
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

          {/* Right: Search + View Controls */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md ${viewMode === 'kanban' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <Kanban className="h-5 w-5" />
              </button>
            </div>
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
          
          {/* Loading and Error States */}
          {loading && (
            <div className="p-6 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Loading work orders...</p>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={fetchWorkOrders}
                  className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Table Content */}
          {!loading && !error && (
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual Duration
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        {searchQuery ? 'No work orders found matching your search.' : 'No work orders available.'}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.operation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.workCenter?.name || order.workCenter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.product?.name || order.finishedProduct}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.expectedDuration || order.expected_duration || 0} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.actualDuration || order.actual_duration || 0} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${order.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{order.progress || 0}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {order.status === 'To Do' && (
                              <button 
                                onClick={() => handleWorkOrderAction(order._id || order.id, 'start')}
                                className="p-1 text-green-600 hover:text-green-900"
                                title="Start"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {order.status === 'In Progress' && (
                              <>
                                <button 
                                  onClick={() => handleWorkOrderAction(order._id || order.id, 'pause')}
                                  className="p-1 text-yellow-600 hover:text-yellow-900"
                                  title="Pause"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleWorkOrderAction(order._id || order.id, 'complete')}
                                  className="p-1 text-blue-600 hover:text-blue-900"
                                  title="Complete"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {order.status === 'Paused' && (
                              <button 
                                onClick={() => handleWorkOrderAction(order._id || order.id, 'start')}
                                className="p-1 text-green-600 hover:text-green-900"
                                title="Resume"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
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