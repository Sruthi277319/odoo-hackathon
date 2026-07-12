import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchFilterSort from '../components/SearchFilterSort';
import { Skeleton } from '../components/Skeleton';
import { Plus, X, Fuel, Trash2 } from 'lucide-react';

const FuelPage = () => {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newLog, setNewLog] = useState({
    vehicleId: '',
    date: '',
    fuelAmount: '',
    cost: '',
    distance: '',
    odometer: '',
    fuelType: 'Diesel',
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const logs = await api.get('/fuel');
      setFuelLogs(logs);

      const vehicleList = await api.get('/vehicles');
      setVehicles(vehicleList);
      if (vehicleList.length > 0) {
        setNewLog((prev) => ({
          ...prev,
          vehicleId: vehicleList[0]._id,
          odometer: vehicleList[0].odometer,
        }));
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch fuel log database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newLog.fuelAmount || !newLog.cost || !newLog.odometer) return;

    try {
      setLoading(true);
      await api.post('/fuel', {
        vehicleId: newLog.vehicleId,
        date: newLog.date || new Date(),
        fuelAmount: Number(newLog.fuelAmount),
        cost: Number(newLog.cost),
        distance: Number(newLog.distance) || 0,
        odometer: Number(newLog.odometer),
        fuelType: newLog.fuelType,
      });
      setShowCreateModal(false);
      
      // Reset form
      setNewLog({
        vehicleId: vehicles[0]?._id || '',
        date: '',
        fuelAmount: '',
        cost: '',
        distance: '',
        odometer: vehicles[0]?.odometer || 0,
        fuelType: 'Diesel',
      });
      
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit fuel log.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fuel log?')) return;
    try {
      setLoading(true);
      await api.delete(`/fuel/${id}`);
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete fuel log.');
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const filteredLogs = fuelLogs
    .filter((log) => {
      const matchSearch =
        log.vehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${log.vehicle?.make} ${log.vehicle?.model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVehicle = vehicleFilter ? log.vehicle?._id === vehicleFilter : true;
      return matchSearch && matchVehicle;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'cost-high') return b.cost - a.cost;
      if (sortBy === 'efficiency-high') {
        const effA = a.fuelAmount > 0 ? a.distance / a.fuelAmount : 0;
        const effB = b.fuelAmount > 0 ? b.distance / b.fuelAmount : 0;
        return effB - effA;
      }
      return 0;
    });

  const activeFilters = [
    {
      name: 'vehicle',
      value: vehicleFilter,
      onChange: setVehicleFilter,
      options: [
        { label: 'All Vehicles', value: '' },
        ...vehicles.map((v) => ({ label: `${v.make} (${v.licensePlate})`, value: v._id })),
      ],
    },
  ];

  const sortOptions = [
    { label: 'Newest Date', value: 'newest' },
    { label: 'Oldest Date', value: 'oldest' },
    { label: 'Highest Cost', value: 'cost-high' },
    { label: 'Highest Efficiency', value: 'efficiency-high' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
            Fuel Refill Logs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Monitor fuel costs, odometer changes, and track active mileage efficiency ratios.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Log Fuel Refill
        </Button>
      </div>

      {/* Filters */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search vehicle..."
        filters={activeFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
      />

      {/* Data table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton height="50px" />
          <Skeleton height="50px" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
          <Fuel size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
          <h3 style={{ margin: 0 }}>No fuel entries recorded</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Fill out a fuel log card to track vehicle mileage.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Refill Date</th>
                  <th>Fuel Quantity</th>
                  <th>Refill Cost</th>
                  <th>Trip Distance</th>
                  <th>Odometer Reading</th>
                  <th>Fuel Efficiency</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const efficiency = log.fuelAmount > 0 ? (log.distance / log.fuelAmount).toFixed(2) : '0';
                  return (
                    <tr key={log._id}>
                      <td>
                        <span style={{ fontWeight: 600, display: 'block' }}>
                          {log.vehicle ? `${log.vehicle.make} ${log.vehicle.model}` : 'N/A'}
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '9px', marginTop: '4px' }}>
                          {log.vehicle?.licensePlate || 'N/A'}
                        </span>
                      </td>
                      <td>{new Date(log.date).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontWeight: 500 }}>{log.fuelAmount} Liters</span>
                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Type: {log.fuelType}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'rgb(var(--color-primary))' }}>${log.cost.toLocaleString()}</td>
                      <td>{log.distance} KM</td>
                      <td>{log.odometer.toLocaleString()} KM</td>
                      <td>
                        <span className="badge badge-success" style={{ fontWeight: 700 }}>
                          {efficiency} KM/L
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleDelete(log._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '6px',
                              display: 'flex',
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
                <Fuel size={20} style={{ color: 'rgb(var(--color-primary))' }} /> Log Fuel Refill
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select
                  value={newLog.vehicleId}
                  onChange={(e) => {
                    const selectedVeh = vehicles.find((v) => v._id === e.target.value);
                    setNewLog({
                      ...newLog,
                      vehicleId: e.target.value,
                      odometer: selectedVeh ? selectedVeh.odometer : '',
                    });
                  }}
                  className="form-input"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Refill Date</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Fuel Quantity (Liters)</label>
                  <input
                    type="number"
                    value={newLog.fuelAmount}
                    onChange={(e) => setNewLog({ ...newLog, fuelAmount: e.target.value })}
                    placeholder="e.g. 50"
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Refill Cost ($)</label>
                  <input
                    type="number"
                    value={newLog.cost}
                    onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })}
                    placeholder="e.g. 80"
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    value={newLog.odometer}
                    onChange={(e) => setNewLog({ ...newLog, odometer: e.target.value })}
                    placeholder="e.g. 142300"
                    className="form-input"
                    required
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Trip Distance (KM)</label>
                  <input
                    type="number"
                    value={newLog.distance}
                    onChange={(e) => setNewLog({ ...newLog, distance: e.target.value })}
                    placeholder="e.g. 600"
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  value={newLog.fuelType}
                  onChange={(e) => setNewLog({ ...newLog, fuelType: e.target.value })}
                  className="form-input"
                >
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Electricity">Electricity</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Fuel Cost
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelPage;
