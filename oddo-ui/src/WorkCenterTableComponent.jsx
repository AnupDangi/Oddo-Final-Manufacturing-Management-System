import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  List, 
  Grid, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Factory
} from 'lucide-react';
import MasterMenuNavbar from './components/MasterMenuNavbar';
import ProfileNavbar from './components/ProfileNavbar';
import { workCenterService } from './services/api';

const WorkCenterTableComponent = ({ onNavigate, onMenuStateChange }) => {
  console.log('WorkCenterTableComponent - Component mounted');
  console.log('WorkCenterTableComponent - onNavigate:', typeof onNavigate);
  console.log('WorkCenterTableComponent - onMenuStateChange:', typeof onMenuStateChange);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch work centers from backend
  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      const response = await workCenterService.getAll();
      if (response.success) {
        setWorkCenters(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch work centers');
      }
    } catch (error) {
      console.error('Error fetching work centers:', error);
      setError('Failed to fetch work centers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkCenters = workCenters.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewWorkCenter = () => {
    setShowNewModal(true);
  };

  const handleEdit = (workCenter) => {
    console.log('Edit work center:', workCenter);
  };

  const handleDelete = (workCenter) => {
    console.log('Delete work center:', workCenter);
  };

  const handleView = (workCenter) => {
    console.log('View work center:', workCenter);
  };

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
              currentModule="work-center" 
            />
            
            {/* New Button */}
            <button 
              onClick={handleNewWorkCenter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New</span>
            </button>
          </div>

          {/* Center: Work Center Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Work Center</span>
          </div>

          {/* Right: Search + View Controls + Profile */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search work centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
            
            {/* Profile */}
            <ProfileNavbar onNavigate={onNavigate} />
          </div>
        </div>
      </div>



      {/* Loading and Error States */}
      {loading && (
        <div className="p-6 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading work centers...</p>
        </div>
      )}

      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchWorkCenters}
              className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {!loading && !error && (
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Center
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost per hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
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
                {filteredWorkCenters.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No work centers found matching your search.' : 'No work centers available.'}
                    </td>
                  </tr>
                ) : (
                  filteredWorkCenters.map((workCenter) => (
                    <tr key={workCenter._id || workCenter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {workCenter.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${workCenter.costPerHour || workCenter.hourlyRate || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {workCenter.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {workCenter.capacity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          workCenter.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {workCenter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(workCenter)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(workCenter)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(workCenter)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Work Center Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">New Work Center</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Center Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter work center name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Hour
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter cost per hour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter capacity (e.g., 100 units/hour)"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save logic here
                  setShowNewModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkCenterTableComponent;