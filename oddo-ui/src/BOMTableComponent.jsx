import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  List, 
  Grid,
  Save,
  ArrowLeft,
  FileText
} from 'lucide-react';
import MasterMenuNavbar from './components/MasterMenuNavbar';
import ProfileNavbar from './components/ProfileNavbar';
import { bomService, productService } from './services/api';

const BOMTableComponent = ({ onNavigate, onMenuStateChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [bomItems, setBomItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    finishedProduct: '',
    finishedProductId: '',
    reference: '',
    version: '1.0',
    components: [],
    operations: []
  });

  // Fetch BOMs from backend
  useEffect(() => {
    fetchBOMs();
  }, []);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const response = await bomService.getAll();
      if (response.success) {
        setBomItems(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch BOMs');
      }
    } catch (error) {
      console.error('Error fetching BOMs:', error);
      setError('Failed to fetch BOMs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bomItems_static = [
    {
      id: 1,
      finishedProduct: 'Drawer',
      reference: '[3001]'
    }
  ];

  const filteredItems = bomItems.filter(item =>
    item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewBOM = () => {
    setShowForm(true);
  };

  const handleSave = () => {
    console.log('Saving BOM:', formData);
    // Handle save logic here
    setShowForm(false);
    setFormData({
      finishedProduct: '',
      reference: '',
      components: [],
      operations: []
    });
  };

  const handleBack = () => {
    setShowForm(false);
  };

  const [components, setComponents] = useState([]);
  const [operations, setOperations] = useState([]);

  const addComponent = () => {
    setComponents([...components, {
      id: Date.now(),
      product: '',
      quantity: '',
      units: ''
    }]);
  };

  const addOperation = () => {
    setOperations([...operations, {
      id: Date.now(),
      operation: '',
      workCenter: '',
      expectedDuration: ''
    }]);
  };

  const updateComponent = (id, field, value) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const updateOperation = (id, field, value) => {
    setOperations(operations.map(op => 
      op.id === id ? { ...op, [field]: value } : op
    ));
  };

  if (showForm) {
    return (
      <div className="bg-white min-h-screen">
        {/* Form Header */}
        <div className="bg-gray-800 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Back
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save
              </button>
            </div>
            <h1 className="text-xl font-semibold">Bill of Materials</h1>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Left Side - Main BOM Form */}
            <div className="border border-gray-300 rounded-lg p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="BOM-000001"
                    className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Finished Product</label>
                    <select className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500">
                      <option value="">Select from stock ledger</option>
                      <option value="table">Wooden Table</option>
                      <option value="chair">Office Chair</option>
                      <option value="drawer">Drawer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                  <select className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500">
                    <option value="">Select Unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="units">Units</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    maxLength="8"
                    className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Max 8 characters"
                  />
                </div>
              </div>

              {/* Work Orders Section */}
              <div className="border-t border-gray-300 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Orders</h3>
                
                {/* Components */}
                <div className="mb-6">
                  <div className="bg-gray-100 px-3 py-2 mb-2 border">
                    <span className="font-medium text-gray-900">Components</span>
                  </div>
                  <div className="border border-gray-300 p-4">
                    {components.map((component) => (
                      <div key={component.id} className="grid grid-cols-3 gap-4 mb-3">
                        <select 
                          value={component.product}
                          onChange={(e) => updateComponent(component.id, 'product', e.target.value)}
                          className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Product</option>
                          <option value="wood_legs">Wooden Legs</option>
                          <option value="wood_top">Wooden Top</option>
                          <option value="screws">Screws</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Quantity"
                          min="0"
                          step="0.1"
                          value={component.quantity}
                          onChange={(e) => updateComponent(component.id, 'quantity', e.target.value)}
                          className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Units"
                          value={component.units}
                          onChange={(e) => updateComponent(component.id, 'units', e.target.value)}
                          className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    <button 
                      onClick={addComponent}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add a product
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Manufacturing Order Form */}
            <div className="border border-gray-300 rounded-lg p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="MO-000001"
                    className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500 bg-gray-50"
                    readOnly
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Finished Product</label>
                    <select className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500">
                      <option value="">Select from stock ledger</option>
                      <option value="table">Wooden Table</option>
                      <option value="chair">Office Chair</option>
                      <option value="drawer">Drawer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                  <select className="w-full border-b border-gray-300 px-0 py-2 focus:outline-none focus:border-blue-500">
                    <option value="">Select Unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="units">Units</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>

              {/* Components and Operations Section */}
              <div className="border-t border-gray-300 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Components */}
                  <div>
                    <div className="bg-gray-100 px-3 py-2 mb-2 border">
                      <span className="font-medium text-gray-900">Components</span>
                    </div>
                    <div className="border border-gray-300 p-3 min-h-[120px]">
                      {/* Components will be populated from left side */}
                      <div className="text-gray-500 text-sm">
                        Components will populate based on BOM selection
                      </div>
                    </div>
                  </div>
                  
                  {/* Operations */}
                  <div>
                    <div className="bg-gray-100 px-3 py-2 mb-2 border">
                      <div className="grid grid-cols-2 gap-4">
                        <span className="font-medium text-gray-900">Operations</span>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <span>Work Center</span>
                          <span>Expected Duration</span>
                        </div>
                      </div>
                    </div>
                    <div className="border border-gray-300 p-3 min-h-[120px]">
                      {operations.map((operation) => (
                        <div key={operation.id} className="grid grid-cols-2 gap-2 mb-2 text-sm">
                          <select
                            value={operation.workCenter}
                            onChange={(e) => updateOperation(operation.id, 'workCenter', e.target.value)}
                            className="border border-gray-300 px-2 py-1 rounded text-xs"
                          >
                            <option value="">Select Work Center</option>
                            <option value="assembly">Assembly Line A</option>
                            <option value="paint">Paint Floor</option>
                            <option value="packaging">Packaging Line</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Duration (mins)"
                            min="0"
                            value={operation.expectedDuration}
                            onChange={(e) => updateOperation(operation.id, 'expectedDuration', e.target.value)}
                            className="border border-gray-300 px-2 py-1 rounded text-xs"
                          />
                        </div>
                      ))}
                      <button 
                        onClick={addOperation}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
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
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Single Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left: Master Menu */}
          <div className="flex items-center space-x-4">
            <MasterMenuNavbar 
              onNavigate={onNavigate} 
              onMenuStateChange={onMenuStateChange}
              currentModule="bom" 
            />
            
            {/* New Button */}
            <button 
              onClick={handleNewBOM}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>

          {/* Center: Bills of Materials Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Bills of Materials</span>
          </div>

          {/* Right: Search + View Controls + Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by finished product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <List className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <Grid className="h-5 w-5" />
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

      {/* Table Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={fetchBOMs}
              className="ml-2 text-red-800 hover:text-red-900 underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading BOMs...</span>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Finished Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Components
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {item.product?.sku || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.reference || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.version || '1.0'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.components?.length || 0} components
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredItems.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {searchTerm ? 'No BOMs found matching your search' : 'No BOMs found'}
                  </p>
                  <button 
                    onClick={handleNewBOM}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Create your first BOM
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BOMTableComponent;