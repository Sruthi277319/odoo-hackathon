import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Search from '../components/common/Search';
import Filter from '../components/common/Filter';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import TripForm from '../components/trips/TripForm';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, CheckCircle, Navigation, Ban, ArrowRight } from 'lucide-react';

const Trips = () => {
  // Query States
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  
  // Status transition states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    trip: null,
    targetStatus: '',
    title: '',
    message: '',
    variant: 'primary',
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch vehicles and drivers for selector dropdowns
  const fetchResources = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.get('/vehicles', { params: { limit: 100 } }),
        api.get('/drivers', { params: { limit: 100 } }),
      ]);
      setVehicles(vehiclesRes.data.vehicles || []);
      setDrivers(driversRes.data.drivers || []);
    } catch (error) {
      console.error('Fetch resources error:', error);
      toast.error('Failed to load vehicle and driver catalogs');
    }
  };

  // Fetch trips function
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/trips', {
        params: {
          page: currentPage,
          limit: 8,
          search,
          status: statusFilter,
          sortBy,
          sortOrder,
        },
      });
      setTrips(response.data.trips || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Fetch trips error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTrips();
    fetchResources();
  }, [fetchTrips]);

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

  // Create or Update trip
  const handleFormSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (selectedTrip) {
        // Edit trip
        const response = await api.put(`/trips/${selectedTrip._id}`, data);
        toast.success(response.data.message || 'Trip updated successfully');
      } else {
        // Add new trip
        const response = await api.post('/trips', data);
        toast.success(response.data.message || 'Trip created successfully');
      }
      setIsFormOpen(false);
      setSelectedTrip(null);
      fetchTrips();
      fetchResources(); // Status of vehicle/driver might have updated
    } catch (error) {
      console.error('Submit trip error:', error);
      toast.error(error.response?.data?.message || 'Failed to save trip details');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete trip
  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    setSubmitting(true);
    try {
      const response = await api.delete(`/trips/${tripToDelete._id}`);
      toast.success(response.data.message || 'Trip deleted successfully');
      setIsDeleteOpen(false);
      setTripToDelete(null);
      fetchTrips();
      fetchResources();
    } catch (error) {
      console.error('Delete trip error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete trip');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger status transition
  const handleStatusTransition = async () => {
    const { trip, targetStatus } = confirmDialog;
    if (!trip) return;
    setSubmitting(true);
    try {
      const response = await api.put(`/trips/${trip._id}`, { status: targetStatus });
      toast.success(response.data.message || `Trip status updated to ${targetStatus}`);
      setConfirmDialog({ ...confirmDialog, isOpen: false, trip: null });
      fetchTrips();
      fetchResources();
    } catch (error) {
      console.error('Status transition error:', error);
      toast.error(error.response?.data?.message || `Failed to change trip status to ${targetStatus}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Column definitions
  const columns = [
    {
      header: 'Route',
      accessor: 'source',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.source}
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {row.destination}
          </div>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle',
      render: (v) => v ? (
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-350">{v.name}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono mt-0.5">{v.registrationNumber}</span>
        </div>
      ) : <span className="text-red-500 font-bold">Unassigned</span>,
    },
    {
      header: 'Driver',
      accessor: 'driver',
      render: (d) => d ? (
        <span className="font-medium text-slate-700 dark:text-slate-350">{d.name}</span>
      ) : <span className="text-red-500 font-bold">Unassigned</span>,
    },
    {
      header: 'Cargo Weight',
      accessor: 'cargoWeight',
      render: (val) => `${val} t`,
    },
    {
      header: 'Distance',
      accessor: 'distance',
      render: (val) => `${val} mi`,
    },
    {
      header: 'Revenue',
      accessor: 'revenue',
      render: (val) => `$${val.toLocaleString()}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => {
        const styles = {
          Draft: 'bg-slate-100 text-slate-650 border-slate-200 dark:bg-dark-900 dark:text-slate-400 dark:border-slate-800',
          Dispatched: 'bg-primary-50 text-primary-650 border-primary-200/50 dark:bg-primary-500/5 dark:text-primary-400 dark:border-primary-500/10',
          Completed: 'bg-emerald-50 text-emerald-650 border-emerald-200/50 dark:bg-emerald-500/5 dark:text-emerald-400 dark:border-emerald-500/10',
          Cancelled: 'bg-red-50 text-red-650 border-red-200/50 dark:bg-red-500/5 dark:text-red-400 dark:border-red-500/10',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold border rounded-full ${styles[val] || styles.Draft}`}>
            {val}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (_, row) => {
        const isDraft = row.status === 'Draft';
        const isDispatched = row.status === 'Dispatched';

        return (
          <div className="flex gap-1 items-center">
            {isDraft && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      trip: row,
                      targetStatus: 'Dispatched',
                      title: 'Dispatch Trip',
                      message: `Are you sure you want to dispatch this trip? This will set vehicle ${row.vehicle?.name} and driver ${row.driver?.name} to "On Trip".`,
                      variant: 'primary',
                    })
                  }
                  className="px-2.5 py-1 !text-[10px]"
                >
                  Dispatch
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTrip(row);
                    setIsFormOpen(true);
                  }}
                  className="!p-1.5 text-slate-500 hover:text-primary-650 dark:hover:text-primary-400"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {isDispatched && (
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      trip: row,
                      targetStatus: 'Completed',
                      title: 'Complete Trip',
                      message: `Mark this trip as Completed? This will release vehicle ${row.vehicle?.name} and driver ${row.driver?.name} back to "Available".`,
                      variant: 'primary',
                    })
                  }
                  className="!p-1 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-500/5 dark:hover:border-emerald-500/10"
                >
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfirmDialog({
                      isOpen: true,
                      trip: row,
                      targetStatus: 'Cancelled',
                      title: 'Cancel Trip',
                      message: `Cancel this dispatched trip? This will revert vehicle ${row.vehicle?.name} and driver ${row.driver?.name} back to "Available".`,
                      variant: 'danger',
                    })
                  }
                  className="!p-1 text-red-500 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/5 dark:hover:border-red-500/10"
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </div>
            )}

            {(row.status === 'Completed' || row.status === 'Cancelled') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTripToDelete(row);
                  setIsDeleteOpen(true);
                }}
                className="!p-1.5 text-slate-500 hover:text-red-650 dark:hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Trips Module
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch trucks, track distance & revenues, manage transit safety validations.
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => {
            setSelectedTrip(null);
            setIsFormOpen(true);
          }}
          icon={Plus}
          className="self-start sm:self-auto"
        >
          Create Trip
        </Button>
      </div>

      {/* Query Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 rounded-2xl glass-panel">
        <Search
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by location, vehicle or driver..."
          className="w-full sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-3">
          <Filter
            options={[
              { label: 'Draft', value: 'Draft' },
              { label: 'Dispatched', value: 'Dispatched' },
              { label: 'Completed', value: 'Completed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
            selectedValue={statusFilter}
            onChange={handleStatusChange}
            label="Status"
          />

          <div className="flex items-center gap-1 bg-white/50 dark:bg-dark-900/30 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5">
            <button
              onClick={() => handleSort('revenue')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'revenue' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Revenue {sortBy === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('cargoWeight')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'cargoWeight' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Weight {sortBy === 'cargoWeight' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('distance')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sortBy === 'distance' ? 'bg-primary-600 text-white dark:bg-primary-500' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-900'
              }`}
            >
              Distance {sortBy === 'distance' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <Table
        columns={columns}
        data={trips}
        isLoading={loading}
        emptyMessage="No trips dispatched"
        emptySubMessage="Verify that vehicles and drivers are available, then create a trip."
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
        title={selectedTrip ? 'Edit Trip Scheduling' : 'Create New Transit Trip'}
        size="lg"
      >
        <TripForm
          initialData={selectedTrip}
          vehicles={vehicles}
          drivers={drivers}
          onSubmit={handleFormSubmit}
          isLoading={submitting}
        />
      </Modal>

      {/* Status Action Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false, trip: null })}
        onConfirm={handleStatusTransition}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.targetStatus}
        variant={confirmDialog.variant}
        isLoading={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setTripToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip Log"
        message={`Are you sure you want to delete this trip log to ${tripToDelete?.destination}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={submitting}
      />
    </div>
  );
};

export default Trips;
