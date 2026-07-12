import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Navigation, MapPin, Scale, DollarSign, Truck, User, Milestone } from 'lucide-react';

const TripForm = ({
  initialData = null,
  vehicles = [],
  drivers = [],
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    cargoWeight: '',
    distance: '',
    vehicle: '',
    driver: '',
    revenue: '',
    status: 'Draft',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        source: initialData.source || '',
        destination: initialData.destination || '',
        cargoWeight: initialData.cargoWeight || '',
        distance: initialData.distance || '',
        vehicle: initialData.vehicle?._id || initialData.vehicle || '',
        driver: initialData.driver?._id || initialData.driver || '',
        revenue: initialData.revenue || '',
        status: initialData.status || 'Draft',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
        general: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.source.trim()) newErrors.source = 'Source location is required';
    if (!formData.destination.trim()) newErrors.destination = 'Destination location is required';
    
    if (!formData.cargoWeight) {
      newErrors.cargoWeight = 'Cargo weight is required';
    } else if (isNaN(formData.cargoWeight) || parseFloat(formData.cargoWeight) <= 0) {
      newErrors.cargoWeight = 'Cargo weight must be a positive number';
    }

    if (!formData.distance) {
      newErrors.distance = 'Distance is required';
    } else if (isNaN(formData.distance) || parseFloat(formData.distance) <= 0) {
      newErrors.distance = 'Distance must be a positive number';
    }

    if (!formData.revenue) {
      newErrors.revenue = 'Revenue is required';
    } else if (isNaN(formData.revenue) || parseFloat(formData.revenue) < 0) {
      newErrors.revenue = 'Revenue must be a non-negative number';
    }

    if (!formData.vehicle) newErrors.vehicle = 'Vehicle assignment is required';
    if (!formData.driver) newErrors.driver = 'Driver assignment is required';

    // Business Rules Verification
    const selectedVehicle = vehicles.find((v) => v._id === formData.vehicle);
    const selectedDriver = drivers.find((d) => d._id === formData.driver);

    if (selectedVehicle) {
      // 1. Retired Vehicle check
      if (selectedVehicle.status === 'Retired') {
        newErrors.vehicle = `Vehicle is Retired and cannot be assigned`;
      }
      
      // 2. Cargo Weight must not exceed capacity
      if (formData.cargoWeight && parseFloat(formData.cargoWeight) > selectedVehicle.maxCapacity) {
        newErrors.cargoWeight = `Weight (${formData.cargoWeight} tons) exceeds vehicle capacity of ${selectedVehicle.maxCapacity} tons`;
      }

      // 3. In Shop Vehicle assignment (if dispatched)
      if (formData.status === 'Dispatched' && selectedVehicle.status === 'In Shop') {
        newErrors.vehicle = `Vehicle is currently In Shop and cannot be dispatched`;
      }

      // 4. Vehicle already on trip check (if dispatched)
      if (formData.status === 'Dispatched' && selectedVehicle.status === 'On Trip') {
        // If we are editing, check if it is assigned to this trip
        const isCurrentlyAssigned = initialData && initialData.vehicle?._id === selectedVehicle._id && initialData.status === 'Dispatched';
        if (!isCurrentlyAssigned) {
          newErrors.vehicle = `Vehicle is currently On Trip on another active delivery`;
        }
      }
    }

    if (selectedDriver) {
      // 5. Suspended Driver check
      if (selectedDriver.status === 'Suspended') {
        newErrors.driver = `Driver is Suspended and cannot be assigned`;
      }

      // 6. Expired License check
      const expiry = new Date(selectedDriver.expiryDate);
      if (expiry < new Date()) {
        newErrors.driver = `Driver license is expired (Expired on ${expiry.toLocaleDateString()})`;
      }

      // 7. Driver already on trip check (if dispatched)
      if (formData.status === 'Dispatched' && selectedDriver.status === 'On Trip') {
        const isCurrentlyAssigned = initialData && initialData.driver?._id === selectedDriver._id && initialData.status === 'Dispatched';
        if (!isCurrentlyAssigned) {
          newErrors.driver = `Driver is currently On Trip on another active delivery`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        cargoWeight: parseFloat(formData.cargoWeight),
        distance: parseFloat(formData.distance),
        revenue: parseFloat(formData.revenue),
      });
    }
  };

  // Helper to get helper text for vehicle capability
  const getVehicleHelperText = () => {
    const selectedVehicle = vehicles.find((v) => v._id === formData.vehicle);
    if (!selectedVehicle) return '';
    return `Max Capacity: ${selectedVehicle.maxCapacity} tons | Status: ${selectedVehicle.status}`;
  };

  // Helper to get helper text for driver license
  const getDriverHelperText = () => {
    const selectedDriver = drivers.find((d) => d._id === formData.driver);
    if (!selectedDriver) return '';
    const expiry = new Date(selectedDriver.expiryDate).toLocaleDateString();
    return `License: ${selectedDriver.category} | Expiry: ${expiry} | Status: ${selectedDriver.status}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Source Location"
          name="source"
          placeholder="e.g. Dallas Yard A"
          value={formData.source}
          onChange={handleChange}
          error={errors.source}
          required
          icon={MapPin}
        />

        <Input
          label="Destination Location"
          name="destination"
          placeholder="e.g. Chicago Hub 4"
          value={formData.destination}
          onChange={handleChange}
          error={errors.destination}
          required
          icon={MapPin}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Cargo Weight (Tons)"
          name="cargoWeight"
          type="number"
          step="0.1"
          placeholder="e.g. 12.4"
          value={formData.cargoWeight}
          onChange={handleChange}
          error={errors.cargoWeight}
          required
          icon={Scale}
        />

        <Input
          label="Distance (Miles)"
          name="distance"
          type="number"
          placeholder="e.g. 965"
          value={formData.distance}
          onChange={handleChange}
          error={errors.distance}
          required
          icon={Milestone}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vehicle" className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            Assign Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            id="vehicle"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
            className={`w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border ${
              errors.vehicle ? 'border-red-500/80 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
            } bg-white dark:bg-dark-900`}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} ({v.registrationNumber}) - {v.status} (Cap: {v.maxCapacity}t)
              </option>
            ))}
          </select>
          {errors.vehicle && <span className="text-xs text-red-500 font-medium">{errors.vehicle}</span>}
          {getVehicleHelperText() && !errors.vehicle && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{getVehicleHelperText()}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="driver" className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            Assign Driver <span className="text-red-500">*</span>
          </label>
          <select
            id="driver"
            name="driver"
            value={formData.driver}
            onChange={handleChange}
            className={`w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border ${
              errors.driver ? 'border-red-500/80 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
            } bg-white dark:bg-dark-900`}
          >
            <option value="">Select Driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.status}) - Score: {d.safetyScore}/100
              </option>
            ))}
          </select>
          {errors.driver && <span className="text-xs text-red-500 font-medium">{errors.driver}</span>}
          {getDriverHelperText() && !errors.driver && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">{getDriverHelperText()}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Revenue ($)"
          name="revenue"
          type="number"
          placeholder="e.g. 2400"
          value={formData.revenue}
          onChange={handleChange}
          error={errors.revenue}
          required
          icon={DollarSign}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
            Trip Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900"
            disabled={initialData && (initialData.status === 'Completed' || initialData.status === 'Cancelled')}
          >
            <option value="Draft">Draft</option>
            <option value="Dispatched">Dispatched</option>
            {initialData && <option value="Completed">Completed</option>}
            {initialData && <option value="Cancelled">Cancelled</option>}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {initialData ? 'Update Trip' : 'Create Trip'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
