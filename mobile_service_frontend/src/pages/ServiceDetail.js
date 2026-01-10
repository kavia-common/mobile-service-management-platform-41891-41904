import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getAuthToken } from '../api/client';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// PUBLIC_INTERFACE
export default function ServiceDetail() {
  /** Service detail + request flow (requires login). */
  const { id } = useParams();
  const nav = useNavigate();
  const [service, setService] = useState(null);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getService(id);
        setService(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [id]);

  async function requestService() {
    setErr(null);
    setMsg(null);
    if (!getAuthToken()) {
      nav('/login');
      return;
    }
    try {
      await api.createOrder({ service_id: Number(id), notes });
      setMsg('Request submitted. Track it in your dashboard.');
      setNotes('');
    } catch (e) {
      setErr(e.message);
    }
  }

  if (err) return <div className="alert">{err}</div>;
  if (!service) return <div className="muted">Loading…</div>;

  return (
    <div className="stack gap16">
      <div className="crumbs">
        <Link className="link" to="/services">← Back to services</Link>
      </div>

      <div className="card">
        <div className="cardTop">
          <div className="pill">{service.category}</div>
          <div className="price">{formatPrice(service.price_cents)}</div>
        </div>
        <h2 className="cardTitle">{service.name}</h2>
        <p className="muted">{service.description}</p>
        <div className="row gap12 wrap">
          <div className="metaBox">
            <div className="metaLabel">Duration</div>
            <div className="metaValue">{service.duration_minutes} min</div>
          </div>
          <div className="metaBox">
            <div className="metaLabel">Status</div>
            <div className="metaValue">Available</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Request this service</h3>
        <p className="muted small">Add optional notes (device model, issues, preferred time).</p>
        <textarea
          className="textarea"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Example: iPhone 13, screen cracked top-right. Prefer after 5pm."
        />
        <div className="row gap12 wrap">
          <button className="button buttonPrimary" onClick={requestService}>Request service</button>
          <Link className="button buttonGhost" to="/dashboard">Go to dashboard</Link>
        </div>
        {msg ? <div className="notice">{msg}</div> : null}
        {err ? <div className="alert">{err}</div> : null}
      </div>
    </div>
  );
}
