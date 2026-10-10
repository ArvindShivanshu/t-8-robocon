import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  Zap,
  ShieldAlert
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ currentTheme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cad');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ['cad', 'timeline', 'mandates', 'subsystems', 'team', 'gallery', 'faq'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 250) {
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
    { id: 'cad', label: '3D CAD' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'mandates', label: 'Mandates' },
    { id: 'subsystems', label: 'Subsystems' },
    { id: 'team', label: 'Team' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'faq', label: 'FAQ' },
  ];

  const scrollTo = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`aaruush-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container-wrapper">
        <div className="nav-bar-inner">
          {/* Left Brand: Stark Industries / SRM Robocon */}
          <div className="nav-brand-lockup" onClick={() => scrollTo('cad')}>
            <div className="brand-arc-symbol">
              <Zap size={18} className="symbol-arc-core" />
            </div>
            <div className="brand-text-block">
              <span className="brand-org-name">STARK INDUSTRIES</span>
              <span className="brand-team-div">SRM ROBOCON</span>
            </div>
          </div>

          {/* Center Floating Pill Menu */}
          <nav className="nav-center-menu">
            <div className="nav-center-pill">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`nav-pill-item ${isActive ? 'active' : ''}`}
                    id={`nav-link-${link.id}`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="nav-link-dot" />}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Actions */}
          <div className="nav-right-actions">
            {/* Theme Toggle Utility Button */}
            <button
              onClick={onToggleTheme}
              className="aaruush-util-btn"
              title={currentTheme === 'blueprint' ? 'Switch to Stark Tactical' : 'Technical Blueprint Mode'}
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
            >
              <Settings size={16} />
            </button>

            {/* Stark Protocol CTA */}
            <div className="nav-action-lockup">
              <a
                href="#cad"
                onClick={(e) => { e.preventDefault(); scrollTo('cad'); }}
                className="aaruush-primary-btn stark-btn"
                id="nav-model-btn"
              >
                <span className="nav-pulse-beacon" />
                <span>MARK-VIII PROTOCOL</span>
              </a>
              <span className="nav-action-tag mono">*AVENGERS TECH '25</span>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="aaruush-mobile-btn"
              aria-label="Toggle Navigation Menu"
              id="mobile-nav-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="aaruush-mobile-drawer">
          <div className="mobile-drawer-inner">
            <span className="mobile-drawer-label mono">// AVENGERS PROTOCOL INDEX</span>
            <div className="mobile-links-list">
              {navLinks.map((link, idx) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`mobile-drawer-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="mobile-link-idx mono">0{idx + 1}</span>
                    <span className="mobile-link-text">{link.label}</span>
                    {isActive && <span className="mobile-active-tag mono">LIVE</span>}
                    <ChevronRight size={14} className="mobile-arrow" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
