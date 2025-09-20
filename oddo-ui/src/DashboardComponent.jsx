import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';

const DashboardComponent = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const manufacturingOrders = [
    {
      id: 'MO001',
      product: 'Wooden Table',
      quantity: 10,
      status: 'In Progress',
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      assignee: 'John Doe',
      progress: 65,
      priority: 'High'
    },
    {
      id: 'MO002',
      product: 'Office Chair',
      quantity: 25,
      status: 'Planned',
      startDate: '2024-01-20',
      dueDate: '2024-01-30',
      assignee: 'Jane Smith',
      progress: 0,
      priority: 'Medium'
    },
    {
      id: 'MO003',
      product: 'Dining Set',
      quantity: 5,
      status: 'Done',
      startDate: '2024-01-10',
      dueDate: '2024-01-22',
      assignee: 'Mike Johnson',
      progress: 100,
      priority: 'Low'
    },
    {
      id: 'MO004',
      product: 'Coffee Table',
      quantity: 8,
      status: 'Canceled',
      startDate: '2024-01-18',
      dueDate: '2024-01-28',
      assignee: 'Sarah Wilson',
      progress: 25,
      priority: 'High'
    }
  ];

  const kpiData = [
    {
      title: 'Total Orders',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'In Progress',
      value: '8',
      change: '+5%',
      trend: 'up',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Completed',
      value: '15',
      change: '+8%',
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Delayed',
      value: '1',
      change: '-2%',
      trend: 'down',
      icon: AlertCircle,
      color: 'red'
    }
  ];

  const StatusBadge = ({ status }) => {
    const colors = {
      'Planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'Canceled': 'bg-red-100 text-red-800 border-red-200'
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

  const filteredOrders = manufacturingOrders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manufacturing Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your production operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={16} />
            <span>New Order</span>
          </button>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Calendar size={16} />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-100',
            yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            green: 'bg-green-50 text-green-600 border-green-100',
            red: 'bg-red-50 text-red-600 border-red-100'
          };
          
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{kpi.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'} ${kpi.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${colorClasses[kpi.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, products, assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="All">All Status</option>
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>Showing {filteredOrders.length} of {manufacturingOrders.length} orders</span>
          </div>
        </div>
      </div>

      {/* Manufacturing Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Manufacturing Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product & Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status & Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">Manufacturing Order</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{order.product}</div>
                      <div className="text-xs text-gray-500">Qty: {order.quantity} units</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <StatusBadge status={order.status} />
                      <PriorityBadge priority={order.priority} />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <ProgressBar progress={order.progress} />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">{order.progress}% Complete</span>
                        <span className="font-medium text-gray-700">{order.progress}/100</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>Start: {order.startDate}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>Due: {order.dueDate}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-semibold text-blue-600">
                          {order.assignee.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{order.assignee}</div>
                        <div className="text-xs text-gray-500">Manager</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 font-medium">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardComponent;