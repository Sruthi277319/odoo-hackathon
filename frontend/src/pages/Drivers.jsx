import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Search from '../components/common/Search';
import Filter from '../components/common/Filter';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import DriverForm from '../components/drivers/DriverForm';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

const Drivers = () => {
  // Query States
  const [drivers, setDrivers] = useState([]);
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
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch drivers function
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/drivers', {
        params: {
          page: currentPage,
          limit: 8,
          search,
          status: statusFilter,
          sortBy,
          sortOrder,
        },
      });
      setDrivers(response.data.drivers || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Fetch drivers error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

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

  // Create or Update driver
  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (selectedDriver) {
        // Edit driver
        const response = await api.put(`/drivers/${selectedDriver._id}`, data);
        toast.success(response.data.message || 'Driver updated successfully');
      } else {
        // Add new driver
        const response = await api.post('/drivers', data);
        toast.success(response.data.message || 'Driver created successfully');
      }
      setIsFormOpen(false);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error('Submit driver error:', error);
      toast.error(error.response?.data?.message || 'Failed to save driver details');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete driver
  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;
    setSubmitting(true);
    try {
      const response = await api.delete(`/drivers/${driverToDelete._id}`);
      toast.success(response.data.message || 'Driver deleted successfully');
      setIsDeleteOpen(false);
      setDriverToDelete(null);
      fetchDrivers();
    } catch (error) {
      console.error('Delete driver error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete driver');
    } finally {
      setSubmitting(false);
    }
  };

  // Column definitions
  const columns = [
    {
      header: 'Driver Name',
      accessor: 'name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{val}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{row.phoneNumber}</span>
        </div>
      ),
    },
    {
      header: 'License Number',
      accessor: 'licenseNumber',
      render: (val) => <code className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-dark-900 font-mono text-slate-700 dark:text-slate-300">{val}</code>,
    },
    {
      header: 'Category',
      accessor: 'category',
    },
    {
      header: 'License Expiry',
      accessor: 'expiryDate',
      render: (val) => {
        const dateObj = new Date(val);
        const expired = dateObj < new Date();
        return (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className={expired ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>
              {dateObj.toLocaleDateString()}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Safety Score',
      accessor: 'safetyScore',
      render: (val) => {
        const color = val >= 90 ? 'text-emerald-500' : val >= 75 ? 'text-amber-500' : 'text-red-550';
        return <span className={`font-bold ${color}`}>{val} / 100</span>;
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        const styles = {
          Available: 'bg-emerald-50 text-emerald-650 border-emerald-200/50 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10',
          'On Trip': 'bg-primary-50 text-primary-650 border-primary-200/50 dark:bg-primary-500/5 dark:text-primary-400 dark:border-primary-500/10',
          'Off Duty': 'bg-slate-100 text-slate-650 border-slate-200 dark:bg-dark-900 dark:text-slate-400 dark:border-slate-800',
          Suspended: 'bg-red-50 text-red-650 border-red-200/50 dark:bg-red-500/5 dark:text-red-400 dark:border-red-500/10',
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
              setSelectedDriver(row);
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
              setDriverToDelete(row);
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
            Drivers Module
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage corporate drivers, view details, track safety scores and license statuses.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => {
            setSelectedDriver(null);
            setIsFormOpen(true);
          }}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Add Driver
        </Button>
      </div>

      {/* Query Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl glass-panel">
        <Search
          value={search}
          onChange={handleSearchChange}
          placeholder="Search drivers..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-3">
          <Filter
            options={[
              { label: 'Available', value: 'Available' },
              { label: 'On Trip', value: 'On Trip' },
              { label: 'Off Duty', value: 'Off Duty' },
              { label: 'Suspended', value: 'Suspended' },
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
              onClick={() => handleSort('safetyScore')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'safetyScore' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Safety Score {sortBy === 'safetyScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('expiryDate')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'expiryDate' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Expiry Date {sortBy === 'expiryDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <Table
        columns={columns}
        data={drivers}
        isLoading={loading}
        emptyMessage="No drivers registered"
        emptySubMessage="Try clearing filters or add a new driver to populate the team list."
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
        title={selectedDriver ? 'Edit Driver Details' : 'Register New Driver'}
        size="lg"
      >
        <DriverForm
          initialData={selectedDriver}
          onSubmit={handleFormSubmit}
          isLoading={submitting}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDriverToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Driver"
        message={`Are you sure you want to delete driver ${driverToDelete?.name}? This action is permanent.`}
        confirmText="Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};

export default Drivers;
