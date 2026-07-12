import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { User, ShieldCheck, Phone, Award, Calendar } from 'lucide-react';

const DriverForm = ({ initialData = null, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    category: '',
    expiryDate: '',
    phoneNumber: '',
    safetyScore: 100,
    status: 'Available',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Format date for <input type="date"> (YYYY-MM-DD)
      let formattedDate = '';
      if (initialData.expiryDate) {
        const dateObj = new Date(initialData.expiryDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      }

      setFormData({
        name: initialData.name || '',
        licenseNumber: initialData.licenseNumber || '',
        category: initialData.category || '',
        expiryDate: formattedDate,
        phoneNumber: initialData.phoneNumber || '',
        safetyScore: initialData.safetyScore !== undefined ? initialData.safetyScore : 100,
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Driver Name is required';
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License Number is required';
    } else if (!/^[A-Z0-9- ]+$/i.test(formData.licenseNumber)) {
      newErrors.licenseNumber = 'License Number must be alphanumeric';
    }

    if (!formData.category.trim()) newErrors.category = 'License Category is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry Date is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';

    if (formData.safetyScore === '') {
      newErrors.safetyScore = 'Safety Score is required';
    } else {
      const score = parseFloat(formData.safetyScore);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.safetyScore = 'Safety Score must be between 0 and 100';
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
        safetyScore: parseFloat(formData.safetyScore),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Driver Name"
          name="name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          icon={User}
        />

        <Input
          label="License Number"
          name="licenseNumber"
          placeholder="e.g. DL-2049581-TX"
          value={formData.licenseNumber}
          onChange={handleChange}
          error={errors.licenseNumber}
          required
          icon={ShieldCheck}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-semibold text-slate-650 dark:text-slate-400">
            License Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full py-2.5 px-3 rounded-lg text-sm transition-all glass-input border ${
              errors.category ? 'border-red-500/80 focus:border-red-500' : 'border-slate-200 dark:border-slate-800'
            } bg-white dark:bg-dark-900`}
          >
            <option value="">Select Category</option>
            <option value="CDL Class A">CDL Class A</option>
            <option value="CDL Class B">CDL Class B</option>
            <option value="CDL Class C">CDL Class C</option>
            <option value="Standard Operator">Standard Operator</option>
          </select>
          {errors.category && <span className="text-xs text-red-500 font-medium">{errors.category}</span>}
        </div>

        <Input
          label="License Expiry Date"
          name="expiryDate"
          type="date"
          value={formData.expiryDate}
          onChange={handleChange}
          error={errors.expiryDate}
          required
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          name="phoneNumber"
          placeholder="e.g. +1 (555) 019-2834"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={errors.phoneNumber}
          required
          icon={Phone}
        />

        <Input
          label="Safety Score (0 - 100)"
          name="safetyScore"
          type="number"
          min="0"
          max="100"
          placeholder="100"
          value={formData.safetyScore}
          onChange={handleChange}
          error={errors.safetyScore}
          required
          icon={Award}
        />
      </div>

      <div className="flex flex-col gap-1.5 w-full sm:w-1/2">
        <label htmlFor="status" className="text-xs font-semibold text-slate-655 dark:text-slate-400">
          Driver Status
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
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/40">
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {initialData ? 'Update Driver' : 'Create Driver'}
        </Button>
      </div>
    </form>
  );
};

export default DriverForm;
