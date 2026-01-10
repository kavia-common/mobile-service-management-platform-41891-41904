import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

// PUBLIC_INTERFACE
export default function Home() {
  /** Landing page with quick CTA and highlights. */
  const [seedMsg, setSeedMsg] = useState(null);

  useEffect(() => {
    // No-op: keep landing lightweight
  }, []);

  async function seedDemo() {
    try {
      const res = await api.seed();
      setSeedMsg(res?.message || 'Seeded demo data');
    } catch (e) {
      setSeedMsg(e.message);
    }
  }

  return (
    <div className="stack gap24">
      <section className="hero">
        <div className="heroText">
          <h1>Fast, professional help for your mobile device</h1>
          <p className="muted">
            Browse services, request assistance, and track progress from your dashboard.
          </p>
          <div className="row gap12 wrap">
            <Link to="/services" className="button buttonPrimary">Browse services</Link>
            <Link to="/dashboard" className="button buttonGhost">Go to dashboard</Link>
            <button className="button buttonSecondary" onClick={seedDemo}>Seed demo data</button>
          </div>
          {seedMsg ? <div className="notice">{seedMsg}</div> : null}
          <p className="muted small">
            Demo admin: admin@example.com / admin123 (after seeding)
          </p>
        </div>

        <div className="heroCard">
          <div className="miniCard">
            <div className="miniTitle">Popular</div>
            <div className="miniValue">Screen Replacement</div>
            <div className="miniHint">Quality parts • Warranty</div>
          </div>
          <div className="miniCard">
            <div className="miniTitle">Quick</div>
            <div className="miniValue">SIM & eSIM Setup</div>
            <div className="miniHint">Carrier settings • Activation</div>
          </div>
          <div className="miniCard">
            <div className="miniTitle">Trusted</div>
            <div className="miniValue">Battery Replacement</div>
            <div className="miniHint">Better performance</div>
          </div>
        </div>
      </section>
    </div>
  );
}
