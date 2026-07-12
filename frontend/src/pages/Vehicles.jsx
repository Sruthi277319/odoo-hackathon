import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Search from '../components/common/Search';
import Filter from '../components/common/Filter';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import VehicleForm from '../components/vehicles/VehicleForm';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

const Vehicles = () => {
  // Query States
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  // Modal & Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch vehicles function
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vehicles', {
        params: {
          page: currentPage,
          limit: 8,
          search,
          status: statusFilter,
          sortBy,
          sortOrder,
        },
      });
      setVehicles(response.data.vehicles || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Fetch vehicles error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Handle Search & Filter changes (Reset to Page 1)
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  // Toggle sorting fields
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Create or Update vehicle
  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (selectedVehicle) {
        // Edit vehicle
        const response = await api.put(`/vehicles/${selectedVehicle._id}`, data);
        toast.success(response.data.message || 'Vehicle updated successfully');
      } else {
        // Add new vehicle
        const response = await api.post('/vehicles', data);
        toast.success(response.data.message || 'Vehicle created successfully');
      }
      setIsFormOpen(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Submit vehicle error:', error);
      toast.error(error.response?.data?.message || 'Failed to save vehicle details');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete vehicle
  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return;
    setSubmitting(true);
    try {
      const response = await api.delete(`/vehicles/${vehicleToDelete._id}`);
      toast.success(response.data.message || 'Vehicle deleted successfully');
      setIsDeleteOpen(false);
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (error) {
      console.error('Delete vehicle error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  // Column definitions
  const columns = [
    {
      header: 'Vehicle Name',
      accessor: 'name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{row.type}</span>
        </div>
      ),
    },
    {
      header: 'Registration No.',
      accessor: 'registrationNumber',
      render: (val) => <code className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-dark-900 font-mono text-slate-700 dark:text-slate-300">{val}</code>,
    },
    {
      header: 'Capacity (Tons)',
      accessor: 'maxCapacity',
      render: (val) => `${val} t`,
    },
    {
      header: 'Odometer',
      accessor: 'odometer',
      render: (val) => `${val.toLocaleString()} mi`,
    },
    {
      header: 'Cost ($)',
      accessor: 'acquisitionCost',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      header: 'Region',
      accessor: 'region',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        const styles = {
          Available: 'bg-emerald-50 text-emerald-650 border-emerald-200/50 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10',
          'On Trip': 'bg-primary-50 text-primary-650 border-primary-200/50 dark:bg-primary-500/5 dark:text-primary-400 dark:border-primary-500/10',
          'In Shop': 'bg-amber-50 text-amber-650 border-amber-200/50 dark:bg-amber-500/5 dark:text-amber-400 dark:border-amber-500/10',
          Retired: 'bg-red-50 text-red-650 border-red-200/50 dark:bg-red-500/5 dark:text-red-400 dark:border-red-500/10',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold border rounded-full ${styles[val] || styles.Available}`}>
            {val}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedVehicle(row);
              setIsFormOpen(true);
            }}
            className="!p-1.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setVehicleToDelete(row);
              setIsDeleteOpen(true);
            }}
            className="!p-1.5 text-slate-500 hover:text-red-650 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Vehicles Module
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your fleet units, check statuses, and register vehicles.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => {
            setSelectedVehicle(null);
            setIsFormOpen(true);
          }}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Add Vehicle
        </Button>
      </div>

      {/* Query Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl glass-panel">
        <Search
          value={search}
          onChange={handleSearchChange}
          placeholder="Search vehicles..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-3">
          <Filter
            options={[
              { label: 'Available', value: 'Available' },
              { label: 'On Trip', value: 'On Trip' },
              { label: 'In Shop', value: 'In Shop' },
              { label: 'Retired', value: 'Retired' },
            ]}
            selectedValue={statusFilter}
            onChange={handleStatusChange}
            label="Status"
          />

          <div className="flex items-center gap-1 bg-white/50 dark:bg-dark-900/30 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5">
            <button
              onClick={() => handleSort('name')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'name' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('odometer')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'odometer' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Odometer {sortBy === 'odometer' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('maxCapacity')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'maxCapacity' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Capacity {sortBy === 'maxCapacity' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <Table
        columns={columns}
        data={vehicles}
        isLoading={loading}
        emptyMessage="No vehicles registered"
        emptySubMessage="Try clearing filters or add a new vehicle to populate the fleet list."
      />

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
        size="lg"
      >
        <VehicleForm
          initialData={selectedVehicle}
          onSubmit={handleFormSubmit}
          isLoading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message={`Are you sure you want to delete vehicle ${vehicleToDelete?.name} (${vehicleToDelete?.registrationNumber})? This operation is permanent.`}
        confirmText="Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};

export default Vehicles;
