import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchFilterSort from '../components/SearchFilterSort';
import { Skeleton } from '../components/Skeleton';
import { Plus, X, DollarSign, Tag, Wrench, Fuel, Car, Trash2 } from 'lucide-react';

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newExpense, setNewExpense] = useState({
    category: 'Toll',
    amount: '',
    date: '',
    vehicleId: '',
    description: '',
  });

  const [summary, setSummary] = useState({
    Fuel: 0,
    Maintenance: 0,
    Toll: 0,
    Other: 0,
    Total: 0,
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const expenseList = await api.get('/expenses');
      setExpenses(expenseList);

      const sumData = await api.get('/expenses/summary');
      setSummary(sumData);

      const vehicleList = await api.get('/vehicles');
      setVehicles(vehicleList);

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch expense sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    try {
      setLoading(true);
      await api.post('/expenses', {
        category: newExpense.category,
        amount: Number(newExpense.amount),
        date: newExpense.date || new Date(),
        vehicleId: newExpense.vehicleId || null,
        description: newExpense.description,
      });
      setShowCreateModal(false);
      
      // Reset form
      setNewExpense({
        category: 'Toll',
        amount: '',
        date: '',
        vehicleId: '',
        description: '',
      });

      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create expense record.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      setLoading(true);
      await api.delete(`/expenses/${id}`);
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete expense.');
      setLoading(false);
    }
  };

  // Filter & Sort logic
  const filteredExpenses = expenses
    .filter((exp) => {
      const matchSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter ? exp.category === categoryFilter : true;
      const matchVehicle = vehicleFilter ? exp.vehicle?._id === vehicleFilter : true;
      return matchSearch && matchCategory && matchVehicle;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-high') return b.amount - a.amount;
      if (sortBy === 'amount-low') return a.amount - b.amount;
      return 0;
    });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Fuel':
        return <Fuel size={16} style={{ color: 'rgb(var(--color-success))' }} />;
      case 'Maintenance':
        return <Wrench size={16} style={{ color: 'rgb(var(--color-secondary))' }} />;
      case 'Toll':
        return <Car size={16} style={{ color: 'rgb(var(--color-info))' }} />;
      case 'Other':
      default:
        return <Tag size={16} style={{ color: 'rgb(var(--color-warning))' }} />;
    }
  };

  const activeFilters = [
    {
      name: 'category',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { label: 'All Categories', value: '' },
        { label: 'Fuel', value: 'Fuel' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Toll', value: 'Toll' },
        { label: 'Other', value: 'Other' },
      ],
    },
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
    { label: 'Newest Logged', value: 'newest' },
    { label: 'Oldest Logged', value: 'oldest' },
    { label: 'Highest Amount', value: 'amount-high' },
    { label: 'Lowest Amount', value: 'amount-low' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
            Expense Operations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Record general highway tolls, structural upkeep, gas refuels, and mock other expenses.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> Record Expense
        </Button>
      </div>

      {/* Summary KPI Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
        <Card title="Total Fuel" subtitle="Gas Refills" style={{ padding: '16px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--color-success))' }}>${summary.Fuel.toLocaleString()}</span>
        </Card>
        <Card title="Maintenance" subtitle="Repairs & Tuning" style={{ padding: '16px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--color-secondary))' }}>${summary.Maintenance.toLocaleString()}</span>
        </Card>
        <Card title="Total Tolls" subtitle="Road Clearances" style={{ padding: '16px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--color-info))' }}>${summary.Toll.toLocaleString()}</span>
        </Card>
        <Card title="Other Fees" subtitle="Registration & Custom" style={{ padding: '16px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'rgb(var(--color-warning))' }}>${summary.Other.toLocaleString()}</span>
        </Card>
        <Card title="Total Overhead" subtitle="Net Expenditures" style={{ padding: '16px', border: '1px solid rgba(var(--color-primary), 0.3)', background: 'rgba(99,102,241,0.06)' }}>
          <span style={{ fontSize: '22px', fontWeight: 800 }} className="text-gradient-primary">${summary.Total.toLocaleString()}</span>
        </Card>
      </div>

      {/* Filters */}
      <SearchFilterSort
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search description..."
        filters={activeFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={sortOptions}
      />

      {/* Records table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton height="50px" />
          <Skeleton height="50px" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '50px' }}>
          <DollarSign size={40} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
          <h3 style={{ margin: 0 }}>No expenses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>
            Modify filters or tap "Record Expense" to write custom items.
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Vehicle Link</th>
                  <th>Expense Date</th>
                  <th>Recorded Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: '14px', display: 'block' }}>{exp.description}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getCategoryIcon(exp.category)}
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{exp.category}</span>
                      </div>
                    </td>
                    <td>
                      {exp.vehicle ? (
                        <div>
                          <span style={{ fontSize: '13px', display: 'block' }}>{exp.vehicle.make} {exp.vehicle.model}</span>
                          <span className="badge badge-info" style={{ fontSize: '8px', padding: '2px 4px', marginTop: '2px' }}>{exp.vehicle.licensePlate}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '12px' }}>Common Fleet</span>
                      )}
                    </td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, fontSize: '15px' }}>${exp.amount.toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDelete(exp._id)}
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
                ))}
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
                <DollarSign size={20} style={{ color: 'rgb(var(--color-primary))' }} /> Record Expense
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Expense Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="form-input"
                >
                  <option value="Toll">Road Tolls</option>
                  <option value="Other">Other Expenses / Fees</option>
                </select>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Fuel and Maintenance expenses are automatically generated when logging those logs.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Cost Amount ($)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="e.g. 35"
                    className="form-input"
                    required
                    min="1"
                  />
                </div>
                <div className="form-group" style={{ flexGrow: 1 }}>
                  <label className="form-label">Expense Date</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Associated Vehicle (Optional)</label>
                <select
                  value={newExpense.vehicleId}
                  onChange={(e) => setNewExpense({ ...newExpense, vehicleId: e.target.value })}
                  className="form-input"
                >
                  <option value="">None (Common Overhead)</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.make} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Expense Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g. Bay Bridge toll, registration renewal"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Log Expense
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
