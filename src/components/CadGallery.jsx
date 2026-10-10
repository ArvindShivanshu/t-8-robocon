import React, { useState } from 'react';
import { 
  Maximize2, 
  X, 
  ExternalLink, 
  Info, 
  Layers, 
  Compass, 
  Wrench,
  CheckCircle2
} from 'lucide-react';
import './CadGallery.css';

export default function CadGallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryItems = [
    {
      id: 'bottom',
      title: 'Underside Chassis & 45° Omni Drivetrain',
      tag: 'KINEMATICS VIEW // 4-MOTOR OMNI-DRIVE',
      image: '/assets/cad/cad-bottom-view.png',
      caption: 'Direct bottom CAD view displaying the four high-torque DC planetary geared motors mounted at symmetrical 45° angles with double-row omni wheels and structural gussets.',
      annotations: [
        '4x 45° Motor mounts for holonomic translation',
        'Double-row omni-wheels with rubber barrel rollers',
        'Reinforced aluminum perimeter & cross-frame rails',
        'Plywood mounting deck for vibration isolation'
      ]
    },
    {
      id: 'side',
      title: 'Side Elevation & Payload Risers',
      tag: 'STRUCTURAL ELEVATION // 15KG CARGO BIN',
      image: '/assets/cad/cad-side-view.png',
      caption: 'Side elevation CAD view showing the elevated sheet metal cargo bin mounted on 4 cylindrical load-bearing risers, with the electronics controller deck nestled below.',
      annotations: [
        '4x Load-bearing vertical cylindrical risers',
        'Upper sheet-metal containment bin (15kg capacity)',
        'Electronics PCB deck with low center of gravity',
        'Clean ground clearance over warehouse floor seams'
      ]
    },
    {
      id: 'isometric',
      title: 'Full Platform Assembly Isometric',
      tag: 'SYSTEM INTEGRATION // COMPLETE DIGITAL TWIN',
      image: '/assets/cad/cad-isometric-view.png',
      caption: 'Isometric perspective rendering illustrating the full integration of the omnidirectional chassis, motor drive, structural risers, and warehouse cargo payload receptacle.',
      annotations: [
        'Zero-radius in-place rotation envelope',
        'Modular payload bin for quick manual cargo loading',
        'Balanced mass distribution to avoid wheel slip',
        'Designed specifically for restricted workspace aisles'
      ]
    }
  ];

  return (
    <section className="gallery-section-root" id="gallery">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">Engineering Blueprints & Schematics</h2>
          <p className="section-subtitle">
            Authentic CAD digital twin models, 45° omni kinematic layout, and structural load elevations.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {galleryItems.map((item) => (
            <div 
              key={item.id} 
              className="gallery-card glass-card"
              onClick={() => setSelectedImage(item)}
            >
              <div className="gallery-img-wrapper">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="gallery-img"
                  loading="lazy"
                />
                <div className="gallery-hover-overlay">
                  <div className="inspect-pill mono">
                    <Maximize2 size={14} />
                    <span>INSPECT BLUEPRINT</span>
                  </div>
                </div>
              </div>

              <div className="gallery-card-body">
                <span className="gallery-tag mono">{item.tag}</span>
                <h3 className="gallery-card-title">{item.title}</h3>
                <p className="gallery-card-desc">{item.caption}</p>

                <div className="gallery-annotations-list">
                  {item.annotations.slice(0, 2).map((ann, idx) => (
                    <div key={idx} className="annotation-pill mono">
                      <CheckCircle2 size={12} className="ann-icon" />
                      <span>{ann}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-backdrop" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <div className="lightbox-title-group">
                <span className="lightbox-tag mono">{selectedImage.tag}</span>
                <h3 className="lightbox-title">{selectedImage.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedImage(null)} 
                className="lightbox-close-btn"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="lightbox-body">
              <div className="lightbox-img-pane">
                <img src={selectedImage.image} alt={selectedImage.title} className="lightbox-img" />
              </div>

              <div className="lightbox-info-pane">
                <span className="info-pane-label mono">// DESIGN RATIONALE</span>
                <p className="info-pane-caption">{selectedImage.caption}</p>

                <span className="info-pane-label mono">// KEY ENGINEERING FEATURES</span>
                <div className="lightbox-features-list">
                  {selectedImage.annotations.map((ann, idx) => (
                    <div key={idx} className="lightbox-feat-item">
                      <CheckCircle2 size={15} className="feat-check" />
                      <span>{ann}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
