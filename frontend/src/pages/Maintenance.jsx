import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchFilterSort from '../components/SearchFilterSort';
import { Skeleton } from '../components/Skeleton';
import { Plus, X, Calendar, Wrench, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';

const MaintenancePage = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState(null);

  // Form states
  const [newMaint, setNewMaint] = useState({
    vehicleId: '',
    description: '',
    type: 'Routine',
    priority: 'Medium',
    notes: '',
  });

  const [closeData, setCloseData] = useState({
    cost: '',
    notes: '',
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const maintList = await api.get('/maintenance');
      setMaintenances(maintList);
      
      const vehicleList = await api.get('/vehicles');
      setVehicles(vehicleList);
      if (vehicleList.length > 0) {
        setNewMaint((prev) => ({ ...prev, vehicleId: vehicleList[0]._id }));
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch maintenance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMaint.description) return;
    try {
      setLoading(true);
      await api.post('/maintenance', {
        ...newMaint,
        status: 'In Progress', // automatically sets vehicle to In Shop
      });
      setShowCreateModal(false);
      setNewMaint({
        vehicleId: vehicles[0]?._id || '',
        description: '',
        type: 'Routine',
        priority: 'Medium',
        notes: '',
      });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create maintenance log.');
      setLoading(false);
    }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    if (!selectedMaint) return;
    try {
      setLoading(true);
      await api.put(`/maintenance/${selectedMaint._id}/close`, {
        cost: Number(closeData.cost) || 0,
        notes: closeData.notes,
      });
      setShowCloseModal(false);
      setSelectedMaint(null);
      setCloseData({ cost: '', notes: '' });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to close maintenance log.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      setLoading(true);
      await api.delete(`/maintenance/${id}`);
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete maintenance.');
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const filteredMaintenances = maintenances
    .filter((m) => {
      const matchSearch =
        m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${m.vehicle?.make} ${m.vehicle?.model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter ? m.status === statusFilter : true;
      const matchPriority = priorityFilter ? m.priority === priorityFilter : true;
      return matchSearch && matchStatus && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'cost-high') return b.cost - a.cost;
      if (sortBy === 'cost-low') return a.cost - b.cost;
      return 0;
    });

  const activeFilters = [
    {
      name: 'status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: '' },
        { label: 'Scheduled', value: 'Scheduled' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
      ],
    },
    {
      name: 'priority',
      value: priorityFilter,
      onChange: setPriorityFilter,
      options: [
        { label: 'All Priorities', value: '' },
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
      ],
    },
  ];

  const sortOptions = [
    { label: 'Newest Logged', value: 'newest' },
    { label: 'Oldest Logged', value: 'oldest' },
    { label: 'Highest Cost', value: 'cost-high' },
    { label: 'Lowest Cost', value: 'cost-low' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
            Vehicle Maintenance Logs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Schedule inspections, coordinate active repairs, and close logs to record costs.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Log Maintenance
        </Button>
      </div>

      {/* Search / Filters / Sorting */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search description or vehicle license plate..."
        filters={activeFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
      />

      {/* Records Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton height="50px" />
          <Skeleton height="50px" />
          <Skeleton height="50px" />
        </div>
      ) : filteredMaintenances.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
          <Wrench size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
          <h3 style={{ margin: 0 }}>No maintenance logs found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Adjust your filters or add a new maintenance record to begin.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service Details</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Time Elapsed</th>
                  <th>Recorded Cost</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaintenances.map((m) => {
                  const isClosed = m.status === 'Completed';
                  return (
                    <tr key={m._id}>
                      <td>
                        <span style={{ fontWeight: 600, display: 'block' }}>
                          {m.vehicle ? `${m.vehicle.make} ${m.vehicle.model}` : 'N/A'}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '9px', marginTop: '4px' }}>
                          {m.vehicle?.licensePlate || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500, fontSize: '14px', display: 'block' }}>{m.description}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                          Type: {m.type} {m.notes ? `• Note: "${m.notes}"` : ''}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          m.priority === 'High' ? 'badge-danger' : m.priority === 'Medium' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {m.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          m.status === 'Completed' ? 'badge-success' : m.status === 'In Progress' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', display: 'block' }}>
                          Start: {new Date(m.startDate).toLocaleDateString()}
                        </span>
                        {m.endDate && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                            End: {new Date(m.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {isClosed ? `$${m.cost.toLocaleString()}` : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Ongoing</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {!isClosed && (
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setSelectedMaint(m);
                                setShowCloseModal(true);
                              }}
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              Close Service
                            </Button>
                          )}
                          <button
                            onClick={() => handleDelete(m._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'var(--transition-smooth)',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.color = 'rgb(var(--color-danger))')}
                            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wrench size={20} style={{ color: 'rgb(var(--color-primary))' }} /> Log Maintenance
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Assign Vehicle</label>
                <select
                  value={newMaint.vehicleId}
                  onChange={(e) => setNewMaint({ ...newMaint, vehicleId: e.target.value })}
                  className="form-input"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.licensePlate}) - Status: {v.status}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Vehicle will be transitioned to 'In Shop' automatically.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select
                  value={newMaint.type}
                  onChange={(e) => setNewMaint({ ...newMaint, type: e.target.value })}
                  className="form-input"
                >
                  <option value="Routine">Routine Inspection / Service</option>
                  <option value="Repair">Urgent Repair</option>
                  <option value="Inspection">Safety / State Inspection</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={newMaint.priority}
                  onChange={(e) => setNewMaint({ ...newMaint, priority: e.target.value })}
                  className="form-input"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description of Issues / Work</label>
                <input
                  type="text"
                  value={newMaint.description}
                  onChange={(e) => setNewMaint({ ...newMaint, description: e.target.value })}
                  placeholder="e.g. 50k mile engine check, brake pad replacement"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  value={newMaint.notes}
                  onChange={(e) => setNewMaint({ ...newMaint, notes: e.target.value })}
                  placeholder="Mechanic name, spare parts needed..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log & Send To Shop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLOSE MODAL */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={20} style={{ color: 'rgb(var(--color-success))' }} /> Close Service Log
              </h2>
              <button onClick={() => setShowCloseModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleClose}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Closing Work For:</span>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{selectedMaint?.description}</span>
                <span style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  Vehicle: {selectedMaint?.vehicle?.make} {selectedMaint?.vehicle?.model} ({selectedMaint?.vehicle?.licensePlate})
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Actual Maintenance Cost ($)</label>
                <input
                  type="number"
                  value={closeData.cost}
                  onChange={(e) => setCloseData({ ...closeData, cost: e.target.value })}
                  placeholder="e.g. 450"
                  className="form-input"
                  required
                  min="0"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  This amount will be automatically recorded in expenses.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Resolution / Closing Notes</label>
                <textarea
                  value={closeData.notes}
                  onChange={(e) => setCloseData({ ...closeData, notes: e.target.value })}
                  placeholder="Details of repairs completed, resolution status..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowCloseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Resolve & Make Available
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
