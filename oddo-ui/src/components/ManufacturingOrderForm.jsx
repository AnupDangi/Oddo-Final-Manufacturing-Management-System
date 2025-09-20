import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const ManufacturingOrderForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    reference: 'MO-000001',
    finishedProduct: '',
    quantity: '',
    billOfMaterial: '',
    assignee: '',
    scheduleDate: ''
  });
  
  const [components, setComponents] = useState([]);
  const [workOrders, setWorkOrders] = useState([{
    id: 'WO-001',
    operation: 'Assembly-1',
    workCenter: 'Work Center -1',
    duration: '60:00',
    realDuration: '00:00',
    status: 'To Do',
    isTimerRunning: false
  }]);
  const [status, setStatus] = useState('Draft');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleConfirm = () => {
    // Prepare complete data with work orders
    const completeData = {
      ...formData,
      workOrders: workOrders
    };
    console.log('Manufacturing order confirmed:', completeData);
    // Navigate to the confirmed view with order data
    onNavigate('manufacturing-order-confirmed', { orderData: completeData });
  };

  const handleBack = () => {
    onNavigate('dashboard');
  };

  const handleAddProduct = () => {
    console.log('Adding product to components');
    // Implement product selection logic
  };

  const getStatusClass = (statusName) => {
    if (status === statusName) {
      switch (statusName) {
        case 'Draft': return 'bg-gray-800 text-white';
        case 'Confirmed': return 'bg-blue-600 text-white';
        case 'In-Progress': return 'bg-yellow-600 text-white';
        case 'To Close': return 'bg-orange-600 text-white';
        case 'Done': return 'bg-green-600 text-white';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Manufacturing Order</h1>
            
            <div className="flex space-x-2">
              <button 
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Confirm
              </button>
              <button 
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start space-x-4">
                  <div className="border-2 border-dashed border-red-400 rounded-md p-2">
                    <p className="text-red-600 font-medium">{formData.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Always auto generate, when clicked on new</p>
                    <p className="text-xs text-gray-500">and number would follow the sequence</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className={`px-4 py-2 rounded-md ${getStatusClass('Draft')}`}>
                    Draft
                  </button>
                  <button className={`px-4 py-2 rounded-md ${getStatusClass('Confirmed')}`}>
                    Confirmed
                  </button>
                  <button className={`px-4 py-2 rounded-md ${getStatusClass('In-Progress')}`}>
                    In-Progress
                  </button>
                  <button className={`px-4 py-2 rounded-md ${getStatusClass('To Close')}`}>
                    To Close
                  </button>
                  <button className={`px-4 py-2 rounded-md ${getStatusClass('Done')}`}>
                    Done
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Finished product <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="finishedProduct"
                      value={formData.finishedProduct}
                      onChange={handleInputChange}
                      placeholder="Select a product"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <span className="ml-2">Units</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill of Material
                    </label>
                    <input
                      type="text"
                      name="billOfMaterial"
                      value={formData.billOfMaterial}
                      onChange={handleInputChange}
                      placeholder="Select bill of material"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must have BOM for field to show, must be linked with the finished product.
                    </p>
                    <p className="text-xs text-gray-500">
                      It's list of materials is indexed here, should display all the required materials
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="scheduleDate"
                      value={formData.scheduleDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Date scheduled for when end to deliver date
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assignee
                    </label>
                    <input
                      type="text"
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleInputChange}
                      placeholder="Select assignee"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Drop down of user for selection, maximum field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border-r border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Components</h2>
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Components</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Availability</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">To Consume</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.length === 0 && (
                        <tr>
                          <td colSpan="4" className="py-4 text-center text-sm text-gray-500">
                            No components added yet
                          </td>
                        </tr>
                      )}
                      {components.map((component, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{component.name}</td>
                          <td className="py-2 text-sm">{component.availability}</td>
                          <td className="py-2 text-sm">{component.toConsume}</td>
                          <td className="py-2 text-sm">{component.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button 
                    onClick={handleAddProduct}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add a product
                  </button>
                </div>
              </div>
              
              <div>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Work Orders</h2>
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Operations</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Work Center</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrders.map((wo, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm">{wo.operation}</td>
                          <td className="py-2 text-sm">{wo.workCenter}</td>
                          <td className="py-2 text-sm">{wo.duration}</td>
                        </tr>
                      ))}
                      {workOrders.length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-sm text-gray-500">
                            No work orders available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <button 
                    onClick={() => {
                      const newId = `WO-${String(workOrders.length + 1).padStart(3, '0')}`;
                      const newWorkOrder = {
                        id: newId,
                        operation: 'Assembly-' + (workOrders.length + 1),
                        workCenter: 'Work Center -' + (workOrders.length + 1),
                        duration: '60:00',
                        realDuration: '00:00',
                        status: 'To Do',
                        isTimerRunning: false
                      };
                      setWorkOrders([...workOrders, newWorkOrder]);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Add a work order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturingOrderForm;