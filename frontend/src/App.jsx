import React from 'react';
HEAD
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
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />

            {/* Custom Styled Toast Toaster */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'glass-panel text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-850/50 text-xs font-medium rounded-xl p-3.5',
                style: {
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
ed1c99fe4af44587657213251c6f23c3b7c9de38

export default App;
