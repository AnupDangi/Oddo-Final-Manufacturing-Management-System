import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Plus, 
  User, 
  Factory, 
  MessageSquare, 
  AlertTriangle,
  Filter,
  Search,
  Edit,
  Eye
} from 'lucide-react';

const WorkOrdersComponent = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');

  const workOrders = [
    {
      id: 'WO001',
      operation: 'Assembly',
      moId: 'MO001',
      product: 'Wooden Table',
      workCenter: 'Assembly Line A',
      duration: '60 mins',
      status: 'In Progress',
      operator: 'John Doe',
      priority: 'High',
      startTime: '09:00 AM',
      estimatedEnd: '10:00 AM',
      actualTime: '45 mins',
      progress: 75,
      comments: [
        { id: 1, text: 'Material quality looks good', time: '09:15 AM', author: 'John Doe' },
        { id: 2, text: 'Assembly proceeding as planned', time: '09:30 AM', author: 'John Doe' }
      ],
      issues: []
    },
    {
      id: 'WO002',
      operation: 'Painting',
      moId: 'MO001',
      product: 'Wooden Table',
      workCenter: 'Paint Floor',
      duration: '30 mins',
      status: 'Planned',
      operator: 'Sarah Wilson',
      priority: 'High',
      startTime: '',
      estimatedEnd: '',
      actualTime: '',
      progress: 0,
      comments: [],
      issues: []
    },
    {
      id: 'WO003',
      operation: 'Packing',
      moId: 'MO001',
      product: 'Wooden Table',
      workCenter: 'Packaging Line',
      duration: '20 mins',
      status: 'Planned',
      operator: 'Mike Johnson',
      priority: 'High',
      startTime: '',
      estimatedEnd: '',
      actualTime: '',
      progress: 0,
      comments: [],
      issues: []
    },
    {
      id: 'WO004',
      operation: 'Assembly',
      moId: 'MO002',
      product: 'Office Chair',
      workCenter: 'Assembly Line B',
      duration: '45 mins',
      status: 'Done',
      operator: 'Jane Smith',
      priority: 'Medium',
      startTime: '08:00 AM',
      estimatedEnd: '08:45 AM',
      actualTime: '42 mins',
      progress: 100,
      comments: [
        { id: 3, text: 'Assembly completed successfully', time: '08:42 AM', author: 'Jane Smith' }
      ],
      issues: []
    },
    {
      id: 'WO005',
      operation: 'Quality Check',
      moId: 'MO002',
      product: 'Office Chair',
      workCenter: 'Quality Control',
      duration: '15 mins',
      status: 'On Hold',
      operator: 'David Brown',
      priority: 'Medium',
      startTime: '09:00 AM',
      estimatedEnd: '09:15 AM',
      actualTime: '',
      progress: 25,
      comments: [
        { id: 4, text: 'Found minor defect in seat padding', time: '09:05 AM', author: 'David Brown' }
      ],
      issues: [
        { id: 1, text: 'Seat padding defect needs rework', severity: 'Medium' }
      ]
    }
  ];

  const handleStartWorkOrder = (workOrderId) => {
    console.log('Starting work order:', workOrderId);
    // Logic to start work order
  };

  const handlePauseWorkOrder = (workOrderId) => {
    console.log('Pausing work order:', workOrderId);
    // Logic to pause work order
  };

  const handleCompleteWorkOrder = (workOrderId) => {
    console.log('Completing work order:', workOrderId);
    // Logic to complete work order
  };

  const handleAddComment = (workOrderId) => {
    setSelectedWorkOrder(workOrderId);
    setShowCommentModal(true);
  };

  const submitComment = () => {
    console.log('Adding comment to', selectedWorkOrder, ':', comment);
    setComment('');
    setShowCommentModal(false);
    setSelectedWorkOrder(null);
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesStatus = filterStatus === 'All' || wo.status === filterStatus;
    const matchesSearch = wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.operator.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const StatusBadge = ({ status }) => {
    const colors = {
      'Planned': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Done': 'bg-green-100 text-green-800 border-green-200',
      'On Hold': 'bg-red-100 text-red-800 border-red-200',
      'Paused': 'bg-orange-100 text-orange-800 border-orange-200'
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

  const ActionButton = ({ workOrder }) => {
    const { status, id } = workOrder;
    
    if (status === 'Planned') {
      return (
        <button
          onClick={() => handleStartWorkOrder(id)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <Play size={14} />
          <span>Start</span>
        </button>
      );
    }
    
    if (status === 'In Progress') {
      return (
        <div className="flex space-x-1">
          <button
            onClick={() => handlePauseWorkOrder(id)}
            className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
          >
            <Pause size={12} />
            <span>Pause</span>
          </button>
          <button
            onClick={() => handleCompleteWorkOrder(id)}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            <CheckCircle size={12} />
            <span>Complete</span>
          </button>
        </div>
      );
    }
    
    if (status === 'Paused') {
      return (
        <button
          onClick={() => handleStartWorkOrder(id)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <Play size={14} />
          <span>Resume</span>
        </button>
      );
    }
    
    return (
      <span className="text-xs text-gray-500 px-3 py-1.5">
        {status === 'Done' ? 'Completed' : status}
      </span>
    );
  };

  const CommentModal = () => {
    if (!showCommentModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Add Comment</h3>
            <button 
              onClick={() => setShowCommentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <div className="p-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment or notes..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowCommentModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Comment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">Manage operations and track progress</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus size={16} />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search work orders..."
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
                <option value="Paused">Paused</option>
                <option value="On Hold">On Hold</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkOrders.map((workOrder) => (
          <div key={workOrder.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Factory className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{workOrder.id}</h3>
                    <p className="text-sm text-gray-600">{workOrder.operation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={workOrder.status} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Manufacturing Order:</span>
                  <span className="text-sm font-medium text-blue-600">{workOrder.moId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product:</span>
                  <span className="text-sm font-medium text-gray-900">{workOrder.product}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Work Center:</span>
                  <span className="text-sm font-medium text-gray-900">{workOrder.workCenter}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-900">{workOrder.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  <PriorityBadge priority={workOrder.priority} />
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{workOrder.progress}%</span>
                </div>
                <ProgressBar progress={workOrder.progress} />
              </div>

              {/* Time Information */}
              {workOrder.startTime && (
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Started: {workOrder.startTime}</span>
                  </div>
                  {workOrder.estimatedEnd && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Est. End: {workOrder.estimatedEnd}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Operator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">{workOrder.operator}</span>
                </div>
                {workOrder.actualTime && (
                  <span className="text-xs text-gray-500">Actual: {workOrder.actualTime}</span>
                )}
              </div>

              {/* Comments and Issues */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MessageSquare className="w-3 h-3" />
                    <span>{workOrder.comments.length} comments</span>
                  </div>
                  {workOrder.issues.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-red-500">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{workOrder.issues.length} issues</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAddComment(workOrder.id)}
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Comment</span>
                  </button>
                  <button className="text-xs text-gray-500 hover:text-blue-600 flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>Details</span>
                  </button>
                </div>
                <ActionButton workOrder={workOrder} />
              </div>

              {/* Recent Comments */}
              {workOrder.comments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Recent Comments</h4>
                  <div className="space-y-2">
                    {workOrder.comments.slice(-2).map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-700">{comment.text}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{comment.author}</span>
                          <span className="text-xs text-gray-400">{comment.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {workOrder.issues.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-medium text-red-700 mb-2">Issues</h4>
                  <div className="space-y-2">
                    {workOrder.issues.map((issue) => (
                      <div key={issue.id} className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <p className="text-xs text-red-700">{issue.text}</p>
                        </div>
                        <span className="text-xs text-red-500 mt-1">Severity: {issue.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredWorkOrders.length === 0 && (
        <div className="text-center py-12">
          <Factory className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No work orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      <CommentModal />
    </div>
  );
};

export default WorkOrdersComponent;