import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Truck, Hash, ShieldAlert, Navigation, Settings } from 'lucide-react';

const VehicleForm = ({ initialData = null, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: '',
    maxCapacity: '',
    odometer: '',
    acquisitionCost: '',
    region: '',
    status: 'Available',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        registrationNumber: initialData.registrationNumber || '',
        type: initialData.type || '',
        maxCapacity: initialData.maxCapacity || '',
        odometer: initialData.odometer || '',
        acquisitionCost: initialData.acquisitionCost || '',
        region: initialData.region || '',
        status: initialData.status || 'Available',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Vehicle Name is required';
    
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration Number is required';
    } else if (!/^[A-Z0-9- ]+$/i.test(formData.registrationNumber)) {
      newErrors.registrationNumber = 'Registration must be alphanumeric (dashes/spaces allowed)';
    }

    if (!formData.type.trim()) newErrors.type = 'Vehicle Type is required';
    
    if (!formData.maxCapacity) {
      newErrors.maxCapacity = 'Capacity is required';
    } else if (isNaN(formData.maxCapacity) || parseFloat(formData.maxCapacity) <= 0) {
      newErrors.maxCapacity = 'Capacity must be a positive number';
    }

    if (formData.odometer === '') {
      newErrors.odometer = 'Odometer reading is required';
    } else if (isNaN(formData.odometer) || parseFloat(formData.odometer) < 0) {
      newErrors.odometer = 'Odometer must be a non-negative number';
    }

    if (formData.acquisitionCost === '') {
      newErrors.acquisitionCost = 'Acquisition Cost is required';
    } else if (isNaN(formData.acquisitionCost) || parseFloat(formData.acquisitionCost) < 0) {
      newErrors.acquisitionCost = 'Acquisition Cost must be a non-negative number';
    }

    if (!formData.region.trim()) newErrors.region = 'Operating Region is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        maxCapacity: parseFloat(formData.maxCapacity),
        odometer: parseFloat(formData.odometer),
        acquisitionCost: parseFloat(formData.acquisitionCost),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Vehicle Name"
          name="name"
          placeholder="e.g. Ford Transit Super"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          icon={Truck}
        />

        <Input
          label="Registration Number"
          name="registrationNumber"
          placeholder="e.g. FL-902-TX"
          value={formData.registrationNumber}
          onChange={handleChange}
          error={errors.registrationNumber}
          required
          icon={Hash}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            Vehicle Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border ${
              errors.type ? 'border-red-500/80 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
            } bg-white dark:bg-dark-900`}
          >
            <option value="">Select Type</option>
            <option value="Semi Truck">Semi Truck</option>
            <option value="Box Truck">Box Truck</option>
            <option value="Flatbed">Flatbed</option>
            <option value="Cargo Van">Cargo Van</option>
            <option value="Refrigerated Box">Refrigerated Box</option>
          </select>
          {errors.type && <span className="text-xs text-red-500 font-medium">{errors.type}</span>}
        </div>

        <Input
          label="Maximum Capacity (Tons)"
          name="maxCapacity"
          type="number"
          step="0.1"
          placeholder="e.g. 15.5"
          value={formData.maxCapacity}
          onChange={handleChange}
          error={errors.maxCapacity}
          required
          icon={ShieldAlert}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Odometer Reading (Miles)"
          name="odometer"
          type="number"
          placeholder="e.g. 120500"
          value={formData.odometer}
          onChange={handleChange}
          error={errors.odometer}
          required
          icon={Settings}
        />

        <Input
          label="Acquisition Cost ($)"
          name="acquisitionCost"
          type="number"
          placeholder="e.g. 45000"
          value={formData.acquisitionCost}
          onChange={handleChange}
          error={errors.acquisitionCost}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Operating Region"
          name="region"
          placeholder="e.g. Midwest, North-East"
          value={formData.region}
          onChange={handleChange}
          error={errors.region}
          required
          icon={Navigation}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
            Current Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-900"
          >
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {initialData ? 'Update Vehicle' : 'Create Vehicle'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
