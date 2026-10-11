import React from 'react';
import './TeamSection.css';

const teamMembers = [
  {
    id: 'member-1',
    name: 'Sneha Mishra',
    role: 'MCSOCD',
    image: '/assets/team/team_member_1.png',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-2',
    name: 'Swarli Sonawane',
    role: 'SAMBED',
    image: '/assets/team/team_member_2.png',
    linkedin: 'https://www.linkedin.com/in/swarali-sonawane-498ab041b?utm_source=share_via&utm_content=profile&utm_medium=member_ios',
  },
  {
    id: 'member-3',
    name: 'Sreyash Asutosh Sahu',
    role: 'SIESED',
    image: '/assets/team/team_member_3.png',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-4',
    name: 'Siddharth Tripathi',
    role: 'SPACED',
    image: '/assets/team/team_member_4.png',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-5',
    name: 'Shaik Raphy Azli',
    role: 'SAMBED',
    image: '/assets/team/team_member_5.png',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-6',
    name: 'Rayan Raphy',
    role: 'SPACED',
    image: '/assets/team/team_member_6.png',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-7',
    name: 'Shivanshu Gupta',
    role: 'WebDev',
    image: '/assets/team/team_member_7.png',
    linkedin: 'https://www.linkedin.com/in/shivanshu-gupta-arvind/',
  },
];

// Helper to render an individual team member card
const renderMemberCard = (member, keyPrefix) => (
  <div key={`${keyPrefix}-${member.id}`} className={`team-member-card team-card-${member.id}`}>
    <div className="team-photo-wrap">
      {/* Person Portrait Cutout */}
      <img
        src={member.image}
        alt={member.name}
        className="team-photo-img"
        loading="lazy"
      />
      <div className="team-photo-vignette" />
    </div>

    {/* Floating Frosted Bottom Pill Overlay */}
    <div className="team-floating-pill">
      <div className="team-info-col">
        <h3 className="team-member-name">{member.name}</h3>
        <p className="team-member-role">{member.role}</p>
      </div>

      <div className="team-socials-row">
        {/* LinkedIn Icon */}
        <a
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="team-social-btn"
          aria-label={`${member.name} on LinkedIn`}
        >
          <svg
            viewBox="0 0 24 24"
            width="13"
            height="13"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
          </svg>
        </a>
      </div>
    </div>
  </div>
);

export default function TeamSection() {
  // 14 members per track ensures wide coverage on all screen resolutions
  const trackMembers = [...teamMembers, ...teamMembers];

  return (
    <section className="team-section-root" id="team">
      {/* Background ambient lighting */}
      <div className="team-ambient-glow" />

      <div className="container team-header-container">
        {/* Section Header */}
        <div className="team-header-center">
          <h2 className="team-title-headline">The Minds Behind the Machine</h2>
          <p className="team-description-text">
            Collegiate engineers across mechanical kinematics, embedded architecture,
            autonomous navigation, and telemetry—united to pioneer the Mark-VIII platform.
          </p>
        </div>
      </div>

      {/* Auto-moving Single Row Infinite Carousel (Right to Left, Pauses on Hover) */}
      <div className="team-carousel-wrapper">
        <div className="team-carousel-track">
          {trackMembers.map((member, idx) =>
            renderMemberCard(member, `track1-${idx}`)
          )}
        </div>
        <div className="team-carousel-track" aria-hidden="true">
          {trackMembers.map((member, idx) =>
            renderMemberCard(member, `track2-${idx}`)
          )}
        </div>
      </div>
    </section>
  );
}
