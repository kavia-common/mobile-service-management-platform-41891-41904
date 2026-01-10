import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// PUBLIC_INTERFACE
export default function Services() {
  /** Browse services catalog. */
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.listServices();
        setItems(data || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="stack gap16">
      <div className="pageHeader">
        <div>
          <h2>Services</h2>
          <p className="muted">Pick a service and request help in minutes.</p>
        </div>
      </div>

      {err ? <div className="alert">{err}</div> : null}
      {loading ? <div className="muted">Loading services…</div> : null}

      <div className="grid3">
        {items.map((s) => (
          <div key={s.id} className="card">
            <div className="cardTop">
              <div className="pill">{s.category}</div>
              <div className="price">{formatPrice(s.price_cents)}</div>
            </div>
            <h3 className="cardTitle">{s.name}</h3>
            <p className="muted">{s.description}</p>
            <div className="cardBottom">
              <div className="muted small">{s.duration_minutes} min</div>
              <Link className="button buttonPrimary" to={`/services/${s.id}`}>View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
