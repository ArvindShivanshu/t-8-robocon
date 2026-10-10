import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import MandatesSection from './components/MandatesSection';
import ArenaSimulator from './components/ArenaSimulator';
import KinematicsEngine from './components/KinematicsEngine';
import SubsystemsSection from './components/SubsystemsSection';
import CadGallery from './components/CadGallery';
import SpecificationsFaq from './components/SpecificationsFaq';
import TeamSection from './components/TeamSection';
import ScrollVelocity from './components/ScrollVelocity';
import TechDivider from './components/TechDivider';
import Footer from './components/Footer';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Central telemetry state (always accessible, displayed continuously)
  const [telemetry, setTelemetry] = useState({
    x: 0,              // mm
    y: 0,              // mm
    theta: 0,          // degrees
    distance: 0.0,     // meters
    velocity: 0.0,     // m/s
    payload: 5.0,      // kg
    motionState: 'IDLE',
    source: 'STANDBY',
  });

  // Theme effect on HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'dark' ? 'blueprint' : 'dark'));
  };

  // Scroll listener for calculating 0..1 progress through hero and page
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const ratio = totalScroll > 0 ? currentScroll / totalScroll : 0;
      setScrollProgress(ratio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update telemetry from either 3D Canvas or Arena Simulator
  const handleTelemetryUpdate = useCallback((newData) => {
    setTelemetry((prev) => ({
      ...prev,
      ...newData,
    }));
  }, []);

  // Reset local datum origin
  const handleResetOrigin = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      x: 0,
      y: 0,
      theta: 0,
      motionState: 'ZERO_RESET',
      source: 'OPERATOR_COMMAND'
    }));
  }, []);

  // Tare odometer distance
  const handleTareDistance = useCallback(() => {
    setTelemetry((prev) => ({
      ...prev,
      distance: 0,
    }));
  }, []);

  // Set payload weight (0.0 to 5.0 kg)
  const handleSetPayload = useCallback((kg) => {
    setTelemetry((prev) => ({
      ...prev,
      payload: Math.max(0, Math.min(5.0, kg)),
    }));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-root">
      {/* Navigation Bar */}
      <Navbar 
        currentTheme={currentTheme} 
        onToggleTheme={toggleTheme} 
        telemetryData={telemetry}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section with 3D CAD Twin that moves on scroll */}
        <HeroSection 
          onTelemetryUpdate={handleTelemetryUpdate}
          currentTheme={currentTheme}
          scrollProgress={scrollProgress}
        />

        {/* React Bits: Kinetic Scroll Velocity Typography Divider */}
        <ScrollVelocity 
          texts={[
            '4-WHEEL 45° HOLONOMIC OMNI • 360° TRANSLATIONAL AGILITY • 5.0 KG PAYLOAD CAPACITY •',
            '100HZ EKF SENSOR FUSION • ZERO TURNING RADIUS • DIGITAL TWIN TELEMETRY •'
          ]}
          velocity={32}
        />

        {/* Problem Statement 8 Directives */}
        <MandatesSection />

        {/* Warehouse Arena & Manual Drive Simulator */}
        <ArenaSimulator 
          onTelemetryUpdate={handleTelemetryUpdate}
          currentTheme={currentTheme}
        />

        {/* 4-Wheel 45° Omni Kinematics Math Engine */}
        <KinematicsEngine />

        {/* Minimalist Architectural Divider */}
        <TechDivider label="02 // MODULAR SUBSYSTEMS ARCHITECTURE" />

        {/* Engineering Architecture & Subsystems */}
        <SubsystemsSection />

        {/* CAD Blueprints & Archives Gallery */}
        <CadGallery />

        {/* Minimalist Architectural Divider */}
        <TechDivider label="03 // PERFORMANCE SPECIFICATIONS" />

        {/* Technical Specs */}
        <SpecificationsFaq />

        {/* Engineering Team */}
        <TeamSection />
      </main>

      {/* Footer */}
      <Footer onScrollTop={scrollToTop} />
    </div>
  );
}
