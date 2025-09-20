import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle, ArrowLeft } from 'lucide-react';

const ManufacturingOrderConfirmed = ({ onNavigate, orderData = {} }) => {
  console.log('ManufacturingOrderConfirmed received orderData:', orderData);
  const [status, setStatus] = useState('Confirmed');
  const [formData, setFormData] = useState({
    reference: orderData?.reference || 'MO-000001',
    finishedProduct: orderData?.finishedProduct || '',
    quantity: orderData?.quantity || '',
    billOfMaterial: orderData?.billOfMaterial || '',
    scheduleDate: orderData?.scheduleDate || '',
    assignee: orderData?.assignee || ''
  });
  
  const [workOrders, setWorkOrders] = useState(orderData?.workOrders || [
    {
      id: 'WO-001',
      operation: 'Assembly-1',
      workCenter: 'Work Center -1',
      duration: '60:00',
      realDuration: '00:00',
      status: 'To Do',
      isTimerRunning: false
    }
  ]);

  // Timers for work orders - using useRef for persistence across renders
  const timersRef = useRef({});

  const handleProduce = () => {
    console.log('Produce button clicked, changing status to Done');
    
    // Change status to Done
    setStatus('Done');
    
    // Update all work orders to Done status and stop all timers
    setWorkOrders(prevWorkOrders => 
      prevWorkOrders.map(wo => {
        // Stop timer for each work order
        if (wo.isTimerRunning) {
          stopTimer(wo.id);
        }
        // Set all work orders to Done status
        return { ...wo, status: 'Done', isTimerRunning: false };
      })
    );
    
    // Stop all timers explicitly
    const timerIds = Object.keys(timersRef.current);
    console.log(`Stopping all ${timerIds.length} timers:`, timerIds);
    
    timerIds.forEach(timerId => {
      console.log(`Stopping timer: ${timerId}`);
      clearInterval(timersRef.current[timerId]);
      delete timersRef.current[timerId];
    });
  };

  const handleStart = () => {
    // Change status to In-Progress
    setStatus('In-Progress');
    
    // Start the first work order that's not done
    const firstNotDoneWO = workOrders.find(wo => wo.status !== 'Done');
    if (firstNotDoneWO) {
      handleWorkOrderAction('start', firstNotDoneWO.id);
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked, changing status to Cancelled');
    
    // Change status to Cancelled
    setStatus('Cancelled');
    
    // Stop all timers and update work orders
    setWorkOrders(prevWorkOrders => 
      prevWorkOrders.map(wo => {
        // Stop timer for each work order
        if (wo.isTimerRunning) {
          stopTimer(wo.id);
        }
        // Keep current work order status but stop timers
        return { ...wo, isTimerRunning: false };
      })
    );
    
    // Stop all timers explicitly
    const timerIds = Object.keys(timersRef.current);
    console.log(`Stopping all ${timerIds.length} timers:`, timerIds);
    
    timerIds.forEach(timerId => {
      console.log(`Stopping timer: ${timerId}`);
      clearInterval(timersRef.current[timerId]);
      delete timersRef.current[timerId];
    });
  };

  const handleBack = () => {
    onNavigate('dashboard');
  };

  const handleAddLine = () => {
    // Don't add lines if cancelled or done
    if (status === 'Cancelled' || status === 'Done') {
      return;
    }
    
    const newId = `WO-${String(workOrders.length + 1).padStart(3, '0')}`;
    const newWorkOrder = {
      id: newId,
      operation: '',
      workCenter: '',
      duration: '00:00',
      realDuration: '00:00',
      status: 'To Do',
      isTimerRunning: false
    };
    
    setWorkOrders([...workOrders, newWorkOrder]);
  };

  const startTimer = (workOrderId) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId);
    if (!workOrder) return;
    
    // Clear any existing interval
    if (timersRef.current[workOrderId]) {
      clearInterval(timersRef.current[workOrderId]);
    }
    
    // Parse the current realDuration (format: MM:SS)
    let [minutes, seconds] = workOrder.realDuration.split(':').map(Number);
    
    console.log(`Starting timer for work order: ${workOrderId}`);
    
    // Start the interval
    timersRef.current[workOrderId] = setInterval(() => {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
      }
      
      // Update the workOrder's realDuration
      const newDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      setWorkOrders(prev => 
        prev.map(wo => 
          wo.id === workOrderId 
            ? { ...wo, realDuration: newDuration } 
            : wo
        )
      );
    }, 1000);
  };
  
  const pauseTimer = (workOrderId) => {
    if (timersRef.current[workOrderId]) {
      console.log(`Pausing timer for work order: ${workOrderId}`);
      clearInterval(timersRef.current[workOrderId]);
    }
  };
  
  const stopTimer = (workOrderId) => {
    if (timersRef.current[workOrderId]) {
      console.log(`Stopping timer for work order: ${workOrderId}`);
      clearInterval(timersRef.current[workOrderId]);
      delete timersRef.current[workOrderId];
    }
  };
  
  // Update form data when orderData changes
  useEffect(() => {
    if (orderData) {
      setFormData({
        reference: orderData.reference || 'MO-000001',
        finishedProduct: orderData.finishedProduct || '',
        quantity: orderData.quantity || '',
        billOfMaterial: orderData.billOfMaterial || '',
        scheduleDate: orderData.scheduleDate || '',
        assignee: orderData.assignee || ''
      });
      
      // Update work orders if they exist in orderData
      if (orderData.workOrders) {
        setWorkOrders(orderData.workOrders);
      }
    }
  }, [orderData]);

  // Clean up all timers on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up timers');
      Object.values(timersRef.current).forEach(timer => clearInterval(timer));
    };
  }, []);
  
  const handleWorkOrderAction = (action, workOrderId) => {
    // Handle timer actions first
    switch (action) {
      case 'start':
        startTimer(workOrderId);
        break;
      case 'pause':
        pauseTimer(workOrderId);
        break;
      case 'done':
        stopTimer(workOrderId);
        break;
      default:
        break;
    }
    
    // Update work orders and check if all are done
    setWorkOrders(currentWorkOrders => {
      const updatedWorkOrders = currentWorkOrders.map(wo => {
        if (wo.id === workOrderId) {
          switch (action) {
            case 'start':
              return { ...wo, status: 'In-Progress', isTimerRunning: true };
            case 'pause':
              return { ...wo, isTimerRunning: false };
            case 'done':
              return { ...wo, status: 'Done', isTimerRunning: false };
            default:
              return wo;
          }
        }
        return wo;
      });
      
      // Check if all are now done
      const allDone = updatedWorkOrders.every(wo => wo.status === 'Done');
      if (allDone && updatedWorkOrders.length > 0) {
        setStatus('To Close');
      }
      
      return updatedWorkOrders;
    });
  };

  const getStatusClass = (statusName) => {
    if (status === statusName) {
      switch (statusName) {
        case 'Draft': return 'bg-red-600 text-white';
        case 'Confirmed': return 'bg-black text-white';
        case 'In-Progress': return 'bg-yellow-600 text-white';
        case 'To Close': return 'bg-orange-600 text-white';
        case 'Done': return 'bg-green-600 text-white';
        case 'Cancelled': return 'bg-gray-600 text-white';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800 border-r border-white';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Manufacturing Order</h1>
            
            <div className="flex border-b border-gray-200 pb-2">
              {status !== 'Cancelled' && (
                <>
                  <button 
                    onClick={handleProduce}
                    disabled={status !== 'To Close' && status !== 'In-Progress'}
                    className="px-6 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium mr-2"
                  >
                    Produce
                  </button>
                  <button 
                    onClick={handleStart}
                    disabled={status !== 'Confirmed'}
                    className="px-6 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium mr-2"
                  >
                    Start
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={status === 'Done' || status === 'Cancelled'}
                    className="px-6 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium mr-2"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button 
                onClick={handleBack}
                className="px-6 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 font-medium"
              >
                Back
              </button>
              
              <div className="ml-auto">
                {status !== 'Cancelled' ? (
                  <div className="flex border border-gray-200">
                    <div className={`px-4 py-2 ${getStatusClass('Draft')}`}>
                      Draft
                    </div>
                    <div className={`px-4 py-2 ${getStatusClass('Confirmed')}`}>
                      Confirmed
                    </div>
                    <div className={`px-4 py-2 ${getStatusClass('In-Progress')}`}>
                      In-Progress
                    </div>
                    <div className={`px-4 py-2 ${getStatusClass('To Close')}`}>
                      To Close
                    </div>
                    <div className={`px-4 py-2 ${getStatusClass('Done')}`}>
                      Done
                    </div>
                    <div className={`px-4 py-2 ${getStatusClass('Cancelled')}`}>
                      Cancelled
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-2 bg-gray-600 text-white rounded">
                    Cancelled
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-red-300 rounded mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col mb-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="border-2 border-dashed border-red-600 rounded-md p-2">
                    <p className="text-red-600 font-medium">{formData.reference}</p>
                  </div>
                  <div>
                    <p className="text-xs text-red-600">Always auto generate, when clicked on new</p>
                    <p className="text-xs text-red-600">and number would follow the sequence</p>
                  </div>
                </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-600 mb-1">
                        Finished product <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="finishedProduct"
                        value={formData.finishedProduct}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-600 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          readOnly
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <span className="ml-2">Units</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-600 mb-1">
                        Bill of Material
                      </label>
                      <input
                        type="text"
                        name="billOfMaterial"
                        value={formData.billOfMaterial}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-600 mb-1">
                        Schedule Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="scheduleDate"
                        value={formData.scheduleDate}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-red-600 mb-1">
                        Assignee
                      </label>
                      <input
                        type="text"
                        name="assignee"
                        value={formData.assignee}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="border-r border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 text-center border-b border-gray-200 py-2 text-red-600">Components</h2>
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
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-sm">{wo.operation}</td>
                          <td className="py-2 text-sm">{wo.workCenter}</td>
                          <td className="py-2 text-sm">{wo.duration}</td>
                        </tr>
                      ))}
                      {workOrders.length === 0 && (
                        <tr>
                          <td colSpan="3" className="py-4 text-center text-sm text-gray-500">
                            Components will be populated from Bill of Material
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4 text-center border-b border-gray-200 py-2 text-red-600">Work Orders</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-700">Real Duration</th>
                          <th className="text-left py-2 text-sm font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workOrders.map((wo, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-2 text-sm">{wo.realDuration}</td>
                            <td className="py-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <span>{wo.status}</span>
                                {wo.status !== 'Done' && status !== 'Cancelled' && (
                                  <>
                                    {!wo.isTimerRunning ? (
                                      <button 
                                        onClick={() => handleWorkOrderAction('start', wo.id)}
                                        className="p-1 bg-green-500 text-white rounded"
                                        title="Start Timer"
                                      >
                                        <Play size={16} />
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => handleWorkOrderAction('pause', wo.id)}
                                        className="p-1 bg-yellow-500 text-white rounded"
                                        title="Pause Timer"
                                      >
                                        <Pause size={16} />
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => handleWorkOrderAction('done', wo.id)}
                                      className="p-1 bg-green-600 text-white rounded"
                                      title="Mark as Done"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {workOrders.length === 0 && (
                          <tr>
                            <td colSpan="2" className="py-4 text-center text-sm text-gray-500">
                              No work orders available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={handleAddLine}
                    disabled={status === 'Cancelled' || status === 'Done'}
                    className={`mt-4 text-sm font-medium ${status === 'Cancelled' || status === 'Done' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-500'}`}
                  >
                    Add a line
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

export default ManufacturingOrderConfirmed;