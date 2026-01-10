import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeQuery } from '../config/neon';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Edit,
  Calendar,
  User,
  Building,
  CheckCircle,
  Clock,
  FileQuestion
} from 'lucide-react';

/**
 * ContractManager - List and manage label contracts
 *
 * Features:
 * - List all contracts with filtering
 * - View contract details
 * - Create new contract (links to ContractBuilder)
 * - Status tracking
 */
export default function ContractManager({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userId = user?.id || user?.uid || user?.userId;

  useEffect(() => {
    if (!userId) return;
    fetchContracts();
  }, [userId, filterStatus]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      let query = `
        SELECT
          c.id,
          c.contract_type,
          c.status,
          c.created_at,
          c.effective_date,
          c.expiration_date,
          c.advance_amount,
          c.royalty_rate,
          c.label_signed,
          c.artist_signed,
          c.artist_id,
          label.username as label_name,
          artist.username as artist_name,
          sp_label.display_name as label_display_name,
          sp_artist.display_name as artist_display_name
        FROM contracts c
        JOIN clerk_users label ON c.label_id = label.id
        LEFT JOIN clerk_users artist ON c.artist_id = artist.id
        LEFT JOIN profiles sp_label ON sp_label.user_id = label.id
        LEFT JOIN profiles sp_artist ON sp_artist.user_id = artist.id
        WHERE c.label_id = $1
      `;

      const params = [userId];

      if (filterStatus !== 'all') {
        query += ' AND c.status = $2';
        params.push(filterStatus);
      }

      query += ' ORDER BY c.created_at DESC';

      const result = await executeQuery(query, params);
      setContracts(result || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContractTypeLabel = (type) => {
    const labels = {
      recording_360: '360 Recording Deal',
      recording_traditional: 'Traditional Recording',
      distribution: 'Distribution Deal',
      publishing: 'Publishing Agreement',
      licensing: 'Licensing Deal',
      management: 'Management Contract',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
      case 'review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileQuestion className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      signed: 'bg-green-100 text-green-800',
      amended: 'bg-purple-100 text-purple-800',
      expired: 'bg-red-100 text-red-800',
      terminated: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.draft;
  };

  const filteredContracts = contracts.filter(contract => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.artist_display_name?.toLowerCase().includes(searchLower) ||
      contract.artist_name?.toLowerCase().includes(searchLower) ||
      getContractTypeLabel(contract.contract_type).toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-2 text-gray-600">Manage artist contracts and agreements</p>
        </div>
        <button
          onClick={() => navigate('/labels/contracts/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Contract
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="review">In Review</option>
              <option value="sent">Sent</option>
              <option value="signed">Signed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'Create your first contract to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/labels/contracts/new')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Contract
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Effective Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Royalty Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signatures
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/labels/contracts/${contract.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {getContractTypeLabel(contract.contract_type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {contract.artist_display_name || contract.artist_name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getContractTypeLabel(contract.contract_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(contract.status)}`}>
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.effective_date ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(contract.effective_date).toLocaleDateString()}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.advance_amount
                        ? `$${contract.advance_amount.toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contract.royalty_rate ? `${contract.royalty_rate}%` : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center text-xs ${contract.label_signed ? 'text-green-600' : 'text-gray-400'}`}>
                          <Building className="h-3 w-3 mr-1" />
                          Label
                        </div>
                        <div className={`flex items-center text-xs ${contract.artist_signed ? 'text-green-600' : 'text-gray-400'}`}>
                          <User className="h-3 w-3 mr-1" />
                          Artist
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Total Contracts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{contracts.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Active Contracts</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {contracts.filter(c => c.status === 'signed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600">Pending Signatures</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {contracts.filter(c => !c.label_signed || !c.artist_signed).length}
          </p>
        </div>
      </div>
    </div>
  );
}
