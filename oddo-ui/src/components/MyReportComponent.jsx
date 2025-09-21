import React, { useState } from 'react';
import { Search, ChevronRight, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import MasterMenuNavbar from './MasterMenuNavbar';

const MyReportComponent = ({ onNavigate, onMenuStateChange }) => {
  console.log('MyReportComponent rendered');
  const [selectedRow, setSelectedRow] = useState(null);

  const workOrders = [
    {
      id: 1,
      operation: 'Assembly1',
      workCenter: 'Work Center -1',
      product: 'Dining Table',
      quantity: 3,
      expectedDuration: '180:00',
      realDuration: '00:00',
      status: 'To Do',
      statusColor: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: AlertCircle
    },
    {
      id: 2,
      operation: 'Assembly2',
      workCenter: 'Work Center -2',
      product: 'Office Chair',
      quantity: 5,
      expectedDuration: '120:00',
      realDuration: '85:00',
      status: 'In Progress',
      statusColor: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      icon: Clock
    },
    {
      id: 3,
      operation: 'Assembly3',
      workCenter: 'Work Center -1',
      product: 'Coffee Table',
      quantity: 2,
      expectedDuration: '90:00',
      realDuration: '92:00',
      status: 'Completed',
      statusColor: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: CheckCircle
    }
  ];

  const totalExpected = workOrders.reduce((sum, order) => {
    const [hours, minutes] = order.expectedDuration.split(':').map(Number);
    return sum + hours * 60 + minutes;
  }, 0);

  const totalReal = workOrders.reduce((sum, order) => {
    const [hours, minutes] = order.realDuration.split(':').map(Number);
    return sum + hours * 60 + minutes;
  }, 0);

  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(3, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (order) => (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${order.bgColor} ${order.statusColor} ${order.borderColor} border`}>
      <order.icon className="w-3 h-3 mr-1" />
      {order.status}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Master Menu */}
          <div className="flex items-center space-x-4">
            <MasterMenuNavbar 
              onNavigate={onNavigate} 
              onMenuStateChange={onMenuStateChange}
            />
          </div>

          {/* Center: Title */}
          <div className="flex items-center space-x-3">
            <span className="text-xl font-semibold text-gray-900">Work Orders Analysis</span>
          </div>

          {/* Right: Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search work orders..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              {/* Table Header */}
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
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expected Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Real Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {workOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedRow === order.id ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''
                    }`}
                    onClick={() => setSelectedRow(selectedRow === order.id ? null : order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-400 mr-2 transition-transform duration-200 ${
                            selectedRow === order.id ? 'rotate-90' : ''
                          }`} 
                        />
                        <span className="text-sm font-medium text-gray-900">{order.operation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.workCenter}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {order.expectedDuration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {order.realDuration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order)}
                    </td>
                  </tr>
                ))}

                {/* Empty rows for spacing */}
                {Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`empty-${index}`} className="h-16">
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4"></td>
                    ))}
                  </tr>
                ))}

                {/* Summary Row */}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">Total</span>
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                    {workOrders.reduce((sum, order) => sum + order.quantity, 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                    {formatDuration(totalExpected)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                    {formatDuration(totalReal)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{workOrders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workOrders.filter(order => order.status === 'To Do').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {workOrders.filter(order => order.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyReportComponent;
