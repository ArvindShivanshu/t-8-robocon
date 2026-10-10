import React from 'react';
import './TeamSection.css';

const teamMembers = [
  {
    id: 'member-1',
    name: 'Team Member 1',
    role: 'Autonomous Systems',
    specialty: 'Perception Lead',
    image: '/assets/team/team_member_1.png',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-2',
    name: 'Team Member 2',
    role: 'Robotics Architecture',
    specialty: 'Systems Lead',
    image: '/assets/team/team_member_2.png',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-3',
    name: 'Team Member 3',
    role: 'Embedded Hardware',
    specialty: 'Power & Circuitry',
    image: '/assets/team/team_member_3.png',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-4',
    name: 'Team Member 4',
    role: 'Mechanical CAD',
    specialty: 'Kinematics & Chassis',
    image: '/assets/team/team_member_4.png',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
  {
    id: 'member-5',
    name: 'Team Member 5',
    role: 'Controls & Firmware',
    specialty: 'Motor Driver Logic',
    image: '/assets/team/team_member_5.png',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com',
  },
];

export default function TeamSection() {
  return (
    <section className="team-section-root" id="team">
      {/* Background ambient lighting */}
      <div className="team-ambient-glow" />

      <div className="container team-container">
        {/* Section Header Matching User Reference */}
        <div className="team-header-center">
          <h2 className="team-title-headline">Your Team, Our Passion</h2>
          <p className="team-description-text">
            There are many variations of available but the majority have
            suffered alteration in some form.
          </p>
        </div>

        {/* 4 Cards in One Row */}
        <div className="team-grid-row">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-member-card">
              <div className="team-photo-wrap">
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
                  {/* X / Twitter Icon */}
                  <a
                    href={member.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-social-btn"
                    aria-label={`${member.name} on X`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

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
                      width="14"
                      height="14"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.54a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
