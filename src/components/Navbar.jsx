import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronRight
} from 'lucide-react';
import './Navbar.css';

export default function Navbar({ currentTheme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cad');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = ['cad', 'mandates', 'timeline', 'kinematics', 'subsystems', 'gallery', 'team'];
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
    { id: 'cad', label: 'Digital Twin' },
    { id: 'mandates', label: 'Mandates' },
    { id: 'timeline', label: 'Arena Sim' },
    { id: 'kinematics', label: 'Kinematics' },
    { id: 'subsystems', label: 'Subsystems' },
    { id: 'gallery', label: 'Blueprints' },
    { id: 'team', label: 'Specs & FAQ' },
  ];

  const scrollTo = (id) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    }
  };

  return (
    <header className={`terafab-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container-wrapper">
        <div className="nav-bar-inner">
          {/* Left Brand Wordmark */}
          <div className="nav-brand-lockup" onClick={() => scrollTo('cad')}>
            <span className="brand-logo-mark">T-8</span>
            <span className="brand-sep">/</span>
            <span className="brand-name">ROBOCON</span>
          </div>

          {/* Center Minimalist Links */}
          <nav className="nav-center-menu">
            <div className="nav-links-track">
              {navLinks.map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className={`nav-link-btn ${isActive ? 'active' : ''}`}
                    id={`nav-link-${link.id}`}
                  >
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Action */}
          <div className="nav-right-actions">
            <button
              onClick={() => scrollTo('timeline')}
              className="nav-cta-btn"
              id="nav-model-btn"
            >
              LAUNCH SIMULATOR
            </button>

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nav-mobile-btn"
              aria-label="Toggle Navigation Menu"
              id="mobile-nav-toggle"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer">
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
                  <ChevronRight size={14} className="mobile-arrow" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
