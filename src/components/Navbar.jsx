import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Layers, 
  Compass, 
  Gamepad2, 
  Activity, 
  FileText, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ currentTheme, onToggleTheme, telemetryData }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cad');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // detect active section
      const sections = ['cad', 'mandates', 'simulator', 'kinematics', 'subsystems', 'gallery', 'specs'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'cad', label: '3D Digital Twin' },
    { id: 'mandates', label: 'Problem 8' },
    { id: 'simulator', label: 'Arena Sim' },
    { id: 'kinematics', label: 'Kinematics' },
    { id: 'subsystems', label: 'Subsystems' },
    { id: 'gallery', label: 'CAD Gallery' },
    { id: 'specs', label: 'Tech Specs' },
  ];

  const scrollTo = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar-root ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand */}
        <div className="nav-brand" onClick={() => scrollTo('cad')}>
          <div className="brand-badge">
            <span className="brand-code">T-8</span>
            <div className="brand-pulse"></div>
          </div>
          <div className="brand-meta">
            <span className="brand-title">ROBOCON</span>
            <span className="brand-sub">OMNI-CARRIER 5K</span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="nav-status-pill">
          <span className="status-dot"></span>
          <span className="status-text mono">ODOM_LIVE</span>
          <span className="status-separator">|</span>
          <span className="status-metric mono">
            θ: {Math.round(telemetryData?.theta || 0)}°
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
            >
              {link.label}
              {activeSection === link.id && <span className="nav-link-indicator" />}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            title={currentTheme === 'dark' ? 'Switch to Technical Blueprint' : 'Switch to Dark Void'}
            id="theme-toggle-button"
          >
            <Layers size={16} />
            <span className="theme-toggle-text">
              {currentTheme === 'dark' ? 'BLUEPRINT' : 'DARK VOID'}
            </span>
          </button>

          {/* Quick Drive Button */}
          <button
            onClick={() => scrollTo('simulator')}
            className="nav-drive-btn"
            id="nav-drive-button"
          >
            <Gamepad2 size={16} />
            <span>MANUAL DRIVE</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-toggle-btn"
            aria-label="Toggle menu"
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-header">
            <span className="mono">// NAVIGATION INDEX</span>
            <span className="mobile-sys-badge">T-8 HOLONOMIC</span>
          </div>
          <div className="mobile-links">
            {navLinks.map((link, idx) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`mobile-link-item ${activeSection === link.id ? 'active' : ''}`}
              >
                <span className="mobile-link-idx mono">0{idx + 1}</span>
                <span className="mobile-link-name">{link.label}</span>
                <ChevronRight size={16} className="mobile-link-arrow" />
              </button>
            ))}
          </div>
          <div className="mobile-drawer-footer">
            <button onClick={onToggleTheme} className="mobile-theme-btn">
              <Layers size={16} />
              <span>{currentTheme === 'dark' ? 'Blueprint Mode' : 'Dark Void Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
