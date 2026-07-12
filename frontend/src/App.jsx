import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import Analytics from './pages/Analytics';
import SmartFeatures from './pages/SmartFeatures';
import MaintenancePage from './pages/Maintenance';
import FuelPage from './pages/Fuel';
import ExpensesPage from './pages/Expenses';
import ReportsPage from './pages/Reports';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Analytics />} />
            <Route path="/smart-features" element={<SmartFeatures />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/fuel" element={<FuelPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
