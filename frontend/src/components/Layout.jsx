import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Wrench,
  Fuel,
  DollarSign,
  TrendingUp,
  FileBarChart,
  Cpu,
  Sun,
  Moon,
  Truck,
  Menu,
  X,
  User,
  ShieldCheck
} from 'lucide-react';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Analytics', path: '/', icon: TrendingUp },
    { name: 'Smart Features', path: '/smart-features', icon: Cpu },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Fuel Logs', path: '/fuel', icon: Fuel },
    { name: 'Expenses', path: '/expenses', icon: DollarSign },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
  ];

  return (
    <div className="app-container">
      {/* Sidebar for Desktop */}
      <aside className={`sidebar glass-sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        borderRight: '1px solid var(--border-glass)',
      }}>
        <div>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))',
              borderRadius: '8px',
              padding: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Truck size={22} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '18px', display: 'block', fontFamily: 'var(--font-heading)' }} className="text-gradient-primary">
                TransitOps
              </span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--text-muted)' }}>
                Pro Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--border-radius-md)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))'
                      : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(var(--color-primary), 0.25)' : 'none',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div>
          {/* Active System Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: 'var(--border-radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-glass)',
            marginBottom: '16px',
          }}>
            <ShieldCheck size={16} style={{ color: 'rgb(var(--color-success))' }} />
            <div>
              <span style={{ fontSize: '11px', display: 'block', fontWeight: 600 }}>Auth Engine Active</span>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>MERN Standard Integr.</span>
            </div>
          </div>

          {/* Theme and Profile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}>
                <User size={16} />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>Staff Admin</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Operations</span>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        {/* Mobile Header */}
        <header className="mobile-header glass-header" style={{
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-glass)',
          width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck style={{ color: 'rgb(var(--color-primary))' }} />
            <span style={{ fontWeight: 800, fontSize: '18px', fontFamily: 'var(--font-heading)' }} className="text-gradient-primary">
              TransitOps
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Panel Overlay */}
        {mobileMenuOpen && (
          <div style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--bg-app)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '12px',
          }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: 'var(--border-radius-md)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    color: isActive ? 'white' : 'var(--text-main)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))'
                      : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)',
                  }}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Inject Children Content */}
        {children}
      </main>

      {/* CSS adjustments for layouts */}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            display: none !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .main-content {
            padding-top: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
