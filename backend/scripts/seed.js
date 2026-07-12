import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Maintenance.deleteMany();
    await FuelLog.deleteMany();
    await Expense.deleteMany();
    console.log('Cleared existing collections.');

    // 1. Seed Drivers
    const drivers = await Driver.insertMany([
      {
        name: 'David Miller',
        email: 'david.miller@transitops.com',
        licenseNumber: 'DL-9823412',
        licenseExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
        rating: 4.8,
        safetyScore: 95,
        tripsCompleted: 142,
        fuelEfficiencyScore: 92,
      },
      {
        name: 'Sarah Connor',
        email: 'sarah.connor@transitops.com',
        licenseNumber: 'DL-5321098',
        licenseExpiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now (Expiring soon!)
        rating: 4.9,
        safetyScore: 98,
        tripsCompleted: 210,
        fuelEfficiencyScore: 89,
      },
      {
        name: 'James Rodriguez',
        email: 'james.rod@transitops.com',
        licenseNumber: 'DL-7612984',
        licenseExpiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (Expired!)
        rating: 4.2,
        safetyScore: 78,
        tripsCompleted: 88,
        fuelEfficiencyScore: 76,
      },
      {
        name: 'Emily Watson',
        email: 'emily.w@transitops.com',
        licenseNumber: 'DL-1098234',
        licenseExpiryDate: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000), // > 1 year from now
        rating: 4.6,
        safetyScore: 90,
        tripsCompleted: 115,
        fuelEfficiencyScore: 84,
      },
    ]);
    console.log(`Seeded ${drivers.length} drivers.`);

    // 2. Seed Vehicles
    const vehicles = await Vehicle.insertMany([
      {
        licensePlate: 'TX-781A',
        make: 'Volvo',
        model: 'VNL 860',
        year: 2021,
        status: 'Available',
        odometer: 142300,
        fuelCapacity: 300,
        healthScore: 92,
        lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        type: 'Truck',
        fuelType: 'Diesel',
      },
      {
        licensePlate: 'CA-902B',
        make: 'Ford',
        model: 'Transit Cargo Van',
        year: 2022,
        status: 'In Shop', // matches the active maintenance we will seed
        odometer: 64100,
        fuelCapacity: 95,
        healthScore: 58, // Low Health Score
        lastMaintenanceDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // over 90 days
        nextMaintenanceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),  // missed next maintenance
        type: 'Van',
        fuelType: 'Gasoline',
      },
      {
        licensePlate: 'NY-440C',
        make: 'Tesla',
        model: 'Semi',
        year: 2023,
        status: 'Available',
        odometer: 28500,
        fuelCapacity: 500, // Equivalent unit
        healthScore: 98,
        lastMaintenanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        type: 'Truck',
        fuelType: 'Electric',
      },
      {
        licensePlate: 'FL-551D',
        make: 'Hino',
        model: '195 Reefer',
        year: 2020,
        status: 'Available',
        odometer: 198000,
        fuelCapacity: 150,
        healthScore: 78,
        lastMaintenanceDate: new Date(Date.now() - 105 * 24 * 60 * 60 * 1000), // overdue
        nextMaintenanceDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),  // overdue
        type: 'Reefer',
        fuelType: 'Diesel',
      },
    ]);
    console.log(`Seeded ${vehicles.length} vehicles.`);

    // 3. Seed Fuel Logs & Expenses
    const fuelLogsData = [
      {
        vehicle: vehicles[0]._id, // Volvo
        logs: [
          { date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), fuelAmount: 220, cost: 352, distance: 980, odometer: 140200, fuelType: 'Diesel' },
          { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), fuelAmount: 240, cost: 384, distance: 1050, odometer: 141250, fuelType: 'Diesel' },
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), fuelAmount: 215, cost: 344, distance: 950, odometer: 142200, fuelType: 'Diesel' },
        ]
      },
      {
        vehicle: vehicles[1]._id, // Ford Van
        logs: [
          { date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), fuelAmount: 70, cost: 105, distance: 580, odometer: 63100, fuelType: 'Gasoline' },
          { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), fuelAmount: 75, cost: 112, distance: 620, odometer: 63720, fuelType: 'Gasoline' },
        ]
      },
      {
        vehicle: vehicles[3]._id, // Hino Reefer
        logs: [
          { date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), fuelAmount: 110, cost: 176, distance: 510, odometer: 196800, fuelType: 'Diesel' },
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), fuelAmount: 120, cost: 192, distance: 550, odometer: 197350, fuelType: 'Diesel' },
          { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), fuelAmount: 115, cost: 184, distance: 530, odometer: 197880, fuelType: 'Diesel' },
        ]
      }
    ];

    for (const group of fuelLogsData) {
      for (const log of group.logs) {
        const fuelLog = new FuelLog(log);
        await fuelLog.save();

        // Create matching fuel expense
        const expense = new Expense({
          category: 'Fuel',
          amount: log.cost,
          date: log.date,
          vehicle: group.vehicle,
          description: `Fuel Log: Filled ${log.fuelAmount}L. Odometer: ${log.odometer}`,
          referenceId: fuelLog._id,
        });
        await expense.save();
      }
    }
    console.log('Seeded fuel logs and matching fuel expenses.');

    // 4. Seed Maintenance & Maintenance Expenses
    const maintenanceData = [
      {
        vehicle: vehicles[0]._id, // Volvo
        description: 'Scheduled Engine Tune-up & Filter Swap',
        type: 'Routine',
        cost: 450,
        status: 'Completed',
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
        priority: 'Medium',
        notes: 'Oil changed, spark plugs checked. Air and cabin filters swapped.',
      },
      {
        vehicle: vehicles[1]._id, // Ford Van
        description: 'Brake Rotor and Caliper Repair',
        type: 'Repair',
        cost: 850,
        status: 'In Progress',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        priority: 'High',
        notes: 'Grinding noises reported. Rotor replacements in progress.',
      },
      {
        vehicle: vehicles[2]._id, // Tesla Semi
        description: 'Regular High Voltage Battery Diagnostics',
        type: 'Inspection',
        cost: 150,
        status: 'Completed',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        priority: 'Low',
        notes: 'Battery health measured at 99.1%. Cooling circuits verified.',
      },
      {
        vehicle: vehicles[3]._id, // Hino Reefer
        description: 'Refrigeration unit compressor replacement',
        type: 'Repair',
        cost: 1400,
        status: 'Scheduled',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: 'High',
        notes: 'Refrigerant temperature drift detected during trips. Urgently scheduled.',
      }
    ];

    for (const maint of maintenanceData) {
      const maintenance = new Maintenance(maint);
      await maintenance.save();

      // Create matching maintenance expense ONLY if completed
      if (maint.status === 'Completed') {
        const expense = new Expense({
          category: 'Maintenance',
          amount: maint.cost,
          date: maint.endDate,
          vehicle: maint.vehicle,
          description: `Maintenance Completed: ${maint.description} (${maint.type})`,
          referenceId: maintenance._id,
        });
        await expense.save();
      }
    }
    console.log('Seeded maintenance logs and matching completed maintenance expenses.');

    // 5. Seed Toll & Other general expenses
    const otherExpenses = [
      { category: 'Toll', amount: 45, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), vehicle: vehicles[0]._id, description: 'Interstate toll passage FL-GA' },
      { category: 'Toll', amount: 30, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), vehicle: vehicles[1]._id, description: 'Bay Area bridge crossing' },
      { category: 'Toll', amount: 80, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), vehicle: vehicles[0]._id, description: 'Express lane transit toll' },
      { category: 'Other', amount: 120, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), vehicle: vehicles[2]._id, description: 'Vehicle registration renewal fee' },
      { category: 'Other', amount: 200, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), vehicle: vehicles[3]._id, description: 'Refrigerant container chemical refill' },
    ];
    await Expense.insertMany(otherExpenses);
    console.log('Seeded other expenses (Toll/Other).');

    console.log('Database seeding completed successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
