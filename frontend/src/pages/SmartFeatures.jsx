import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { Skeleton, CardSkeleton } from '../components/Skeleton';
import {
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Mail,
  Zap,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle,
  Wrench,
  Fuel,
  DollarSign
} from 'lucide-react';

const SmartFeatures = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  
  // Smart Feature states
  const [smartStats, setSmartStats] = useState({
    fleetHealthScore: 100,
    alerts: [],
    predictions: [],
  });

  // Recommender States
  const [recType, setRecType] = useState('');
  const [recFuel, setRecFuel] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Timeline States
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Notification States
  const [emailStatus, setEmailStatus] = useState(null);

  const fetchSmartDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/smart-features/dashboard');
      setSmartStats(res);
      
      const vList = await api.get('/vehicles');
      setVehicles(vList);
      if (vList.length > 0) {
        setSelectedVehicleId(vList[0]._id);
        fetchTimeline(vList[0]._id);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch smart predictions dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartDashboard();
  }, []);

  const fetchTimeline = async (vId) => {
    if (!vId) return;
    try {
      setTimelineLoading(true);
      const res = await api.get(`/smart-features/timeline/${vId}`);
      setTimeline(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleRecommend = async () => {
    try {
      setRecLoading(true);
      let query = '';
      if (recType) query += `?type=${recType}`;
      if (recFuel) query += `${query ? '&' : '?'}requiredFuelType=${recFuel}`;
      const res = await api.get(`/smart-features/recommendation${query}`);
      setRecommendations(res);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  };

  const triggerEmailReminder = async (driverId) => {
    try {
      setEmailStatus({ loading: true, message: null, success: false });
      const res = await api.post('/smart-features/license-reminder', { driverId });
      setEmailStatus({
        loading: false,
        message: res.message,
        success: true,
      });
      // Clear message after 4s
      setTimeout(() => setEmailStatus(null), 4000);
    } catch (err) {
      setEmailStatus({
        loading: false,
        message: 'Failed to send renewal warning email.',
        success: false,
      });
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton width="220px" height="28px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }} className="text-gradient-primary">
          Smart Suite & Predictions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
          Fleet diagnostics, license warnings, predictive maintenance scheduling, and vehicle assignment recommender.
        </p>
      </div>

      {/* Email Trigger alert notification status banner */}
      {emailStatus && (
        <div className="glass-card" style={{
          padding: '16px',
          borderLeft: `4px solid ${emailStatus.success ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))'}`,
          background: 'var(--bg-sidebar)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'modal-slide-in 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail style={{ color: emailStatus.success ? 'rgb(var(--color-success))' : 'rgb(var(--color-danger))' }} size={20} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              {emailStatus.loading ? 'Dispatching license reminder email...' : emailStatus.message}
            </span>
          </div>
        </div>
      )}

      {/* Top Split: Health Score, Alerts & Predictions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>
        {/* Health Score Widget */}
        <Card title="Fleet Health Index" subtitle="Aggregated fleet health score">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: '16px' }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `conic-gradient(rgb(var(--color-success)) ${smartStats.fleetHealthScore}%, rgba(255,255,255,0.05) ${smartStats.fleetHealthScore}%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--bg-app)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '38px', fontWeight: 800, fontFamily: 'var(--font-heading)' }} className="text-gradient-primary">
                  {smartStats.fleetHealthScore}
                </span>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Excellent
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Based on vehicle maintenance statuses, diagnostics scores, and dynamic risks.
            </p>
          </div>
        </Card>

        {/* Dynamic Alerts Dashboard */}
        <Card title="Urgent Risk Alerts" subtitle="Safety warnings, expiration notifications, and vehicle defects">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
            {smartStats.alerts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgb(var(--color-success))', padding: '20px', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--border-radius-md)' }}>
                <CheckCircle size={20} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>No risk alerts found. Fleet is operating cleanly.</span>
              </div>
            ) : (
              smartStats.alerts.map((alert, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--border-radius-md)',
                  background: alert.severity === 'High' ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
                  border: `1px solid ${alert.severity === 'High' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldAlert size={20} style={{ color: alert.severity === 'High' ? 'rgb(var(--color-danger))' : 'rgb(var(--color-warning))' }} />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px', display: 'block' }}>{alert.target}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{alert.message}</span>
                    </div>
                  </div>
                  {(alert.type === 'LICENSE_EXPIRING' || alert.type === 'EXPIRED_LICENSE') && (
                    <Button variant="secondary" onClick={() => triggerEmailReminder(alert.driverId)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Mail size={14} style={{ marginRight: '6px' }} /> Remind Driver
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Middle Grid: Recommender & Predictions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
        {/* Recommendation Tool */}
        <Card title="Smart Vehicle Recommendation" subtitle="Assign the optimal available vehicle based on health and fuel metrics">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flexGrow: 1 }}>
                <label className="form-label">Vehicle Type</label>
                <select value={recType} onChange={(e) => setRecType(e.target.value)} className="form-input">
                  <option value="">Any Type</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Reefer">Reefer</option>
                </select>
              </div>
              <div style={{ flexGrow: 1 }}>
                <label className="form-label">Required Fuel</label>
                <select value={recFuel} onChange={(e) => setRecFuel(e.target.value)} className="form-input">
                  <option value="">Any Fuel</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>
            <Button onClick={handleRecommend} disabled={recLoading}>
              <Zap size={16} /> {recLoading ? 'Calculating suitability...' : 'Evaluate Best Vehicles'}
            </Button>

            {/* Recommender Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {recommendations.length > 0 ? (
                recommendations.map((rec, index) => (
                  <div key={rec.vehicle._id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: 'var(--border-radius-md)',
                    background: index === 0 ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                    border: index === 0 ? '1px solid rgba(99,102,241,0.2)' : '1px solid var(--border-glass)',
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rec.vehicle.make} {rec.vehicle.model}
                        {index === 0 && <span className="badge badge-success" style={{ fontSize: '9px', padding: '2px 6px' }}>Recommended</span>}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Plate: {rec.vehicle.licensePlate} • Health: {rec.vehicle.healthScore}% • Efficiency: {rec.efficiency} KM/L
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'rgb(var(--color-primary))' }}>{rec.compositeScore}%</span>
                      <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-muted)' }}>Match Score</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '15px' }}>
                  Select filters above to find matching available vehicles.
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Maintenance Predictions */}
        <Card title="Maintenance Predictions" subtitle="Forecast of upcoming services based on health decay patterns">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {smartStats.predictions.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '30px' }}>
                All vehicles have good health. No predicted maintenances.
              </div>
            ) : (
              smartStats.predictions.map((pred) => (
                <div key={pred.vehicleId} style={{
                  padding: '14px',
                  borderRadius: 'var(--border-radius-md)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{pred.vehicleName}</span>
                      <span className="badge badge-info" style={{ marginLeft: '10px', fontSize: '9px' }}>{pred.licensePlate}</span>
                    </div>
                    <span className={`badge ${pred.urgency === 'High' ? 'badge-danger' : pred.urgency === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                      {pred.urgency} Urgency
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {pred.reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={12} style={{ color: 'rgb(var(--color-warning))' }} />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-glass)', paddingTop: '8px' }}>
                    <span>Estimated Service Odometer:</span>
                    <span style={{ fontWeight: 600 }}>{pred.predictedOdometerService} KM</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Timeline Section */}
      <Card title="Vehicle History Timeline Explorer" subtitle="Chronological tracking of odometer refills, inspections, starts, and closed service records">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Select Vehicle:</span>
          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value);
              fetchTimeline(e.target.value);
            }}
            className="form-input"
            style={{ maxWidth: '300px' }}
          >
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.make} {v.model} ({v.licensePlate})
              </option>
            ))}
          </select>
        </div>

        {timelineLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton height="50px" />
            <Skeleton height="50px" />
          </div>
        ) : timeline && timeline.events.length > 0 ? (
          <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--border-glass)', marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {timeline.events.map((evt, idx) => {
              const getIcon = () => {
                switch (evt.icon) {
                  case 'wrench':
                    return <Wrench size={14} style={{ color: 'rgb(var(--color-primary))' }} />;
                  case 'fuel':
                    return <Fuel size={14} style={{ color: 'rgb(var(--color-success))' }} />;
                  case 'dollar':
                    return <DollarSign size={14} style={{ color: 'rgb(var(--color-warning))' }} />;
                  case 'check':
                  case 'check-circle':
                  default:
                    return <CheckCircle size={14} style={{ color: 'rgb(var(--color-info))' }} />;
                }
              };

              return (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Timeline bullet dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-34px',
                    top: '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--bg-app)',
                    border: '2px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getIcon()}
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                      {new Date(evt.date).toLocaleString()}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '14px', marginTop: '2px', display: 'block' }}>{evt.title}</span>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>{evt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No history timeline events found for this vehicle.
          </div>
        )}
      </Card>
    </div>
  );
};

export default SmartFeatures;
