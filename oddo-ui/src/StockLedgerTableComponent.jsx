import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  List, 
  Grid,
  Save,
  ArrowLeft,
  Package
} from 'lucide-react';
import MasterMenuNavbar from './components/MasterMenuNavbar';
import ProfileNavbar from './components/ProfileNavbar';

const StockLedgerTableComponent = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    unitCost: '',
    unit: '',
    totalValue: '',
    onHand: '',
    freeToUse: '',
    incoming: '',
    outgoing: ''
  });

  const stockItems = [
    {
      id: 1,
      product: 'Dining Table',
      unitCost: 1200,
      unit: 'Unit',
      totalValue: 600000,
      onHand: 500,
      freeToUse: 270,
      incoming: 0,
      outgoing: 230
    },
    {
      id: 2,
      product: 'Drawer',
      unitCost: 100,
      unit: 'Unit',
      totalValue: 2000,
      onHand: 20,
      freeToUse: 20,
      incoming: 0,
      outgoing: 0
    }
  ];

  const filteredItems = stockItems.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate total value if unit cost and on hand are provided
    if (name === 'unitCost' || name === 'onHand') {
      const unitCost = name === 'unitCost' ? parseFloat(value) || 0 : parseFloat(formData.unitCost) || 0;
      const onHand = name === 'onHand' ? parseFloat(value) || 0 : parseFloat(formData.onHand) || 0;
      setFormData(prev => ({
        ...prev,
        totalValue: (unitCost * onHand).toString()
      }));
    }
  };

  const handleNewProduct = () => {
    setShowForm(true);
  };

  const handleSave = () => {
    console.log('Saving product:', formData);
    // Handle save logic here
    setShowForm(false);
    setFormData({
      product: '',
      unitCost: '',
      unit: '',
      totalValue: '',
      onHand: '',
      freeToUse: '',
      incoming: '',
      outgoing: ''
    });
  };

  const handleBack = () => {
    setShowForm(false);
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
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded flex items-center space-x-2"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    name="unitCost"
                    value={formData.unitCost}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Unit</option>
                    <option value="Unit">Unit</option>
                    <option value="Kg">Kg</option>
                    <option value="Liters">Liters</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Meters">Meters</option>
                  </select>
                  <div className="mt-2 text-xs text-gray-500">Selection Field</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Value
                  </label>
                  <input
                    type="number"
                    name="totalValue"
                    value={formData.totalValue}
                    readOnly
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-gray-50 focus:outline-none"
                  />
                  <div className="mt-2 text-xs text-gray-500">Readonly - on hand * unit cost</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    On Hand
                  </label>
                  <input
                    type="number"
                    name="onHand"
                    value={formData.onHand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Free to Use
                  </label>
                  <input
                    type="number"
                    name="freeToUse"
                    value={formData.freeToUse}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Outgoing
                  </label>
                  <input
                    type="number"
                    name="outgoing"
                    value={formData.outgoing}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incoming
                  </label>
                  <input
                    type="number"
                    name="incoming"
                    value={formData.incoming}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent focus:border-blue-500 focus:outline-none"
                  />
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
            <MasterMenuNavbar onNavigate={onNavigate} currentModule="stock-ledger" />
            
            {/* New Button */}
            <button 
              onClick={handleNewProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>

          {/* Center: Stock Ledger Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Stock Ledger</span>
          </div>

          {/* Right: Search + View Controls + Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
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
            <ProfileNavbar onNavigate={onNavigate} />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  On Hand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Free to Use
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incoming
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outgoing
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.product}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.unitCost} Rs
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.totalValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.onHand}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.freeToUse}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.incoming}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.outgoing}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockLedgerTableComponent;