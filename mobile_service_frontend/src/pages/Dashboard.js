import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getAuthToken } from '../api/client';

function statusPill(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'completed') return 'pill pillSuccess';
  if (s === 'cancelled') return 'pill pillDanger';
  if (s === 'in_progress') return 'pill pillInfo';
  if (s === 'scheduled') return 'pill pillWarn';
  return 'pill';
}

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** User dashboard: profile + orders list. */
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      if (!getAuthToken()) {
        nav('/login');
        return;
      }
      try {
        const profile = await api.me();
        setMe(profile);
        const list = await api.listOrders();
        setOrders(list || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [nav]);

  return (
    <div className="stack gap16">
      <div className="pageHeader">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Track your service requests and updates.</p>
        </div>
        <Link className="button buttonPrimary" to="/services">Request a service</Link>
      </div>

      {err ? <div className="alert">{err}</div> : null}

      <div className="grid2">
        <div className="card">
          <h3>Your profile</h3>
          {!me ? (
            <div className="muted">Loading…</div>
          ) : (
            <div className="stack gap8">
              <div className="kv">
                <div className="k">Name</div>
                <div className="v">{me.full_name}</div>
              </div>
              <div className="kv">
                <div className="k">Email</div>
                <div className="v">{me.email}</div>
              </div>
              <div className="kv">
                <div className="k">Role</div>
                <div className="v">{me.role}</div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Quick actions</h3>
          <div className="stack gap12">
            <Link className="button buttonGhost" to="/services">Browse services</Link>
            <a className="button buttonGhost" href="http://localhost:3001/docs" target="_blank" rel="noreferrer">
              View API docs
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row spaceBetween wrap gap12">
          <h3>Your orders</h3>
          <div className="muted small">{orders.length} total</div>
        </div>

        {orders.length === 0 ? (
          <div className="empty">
            <div className="emptyTitle">No requests yet</div>
            <div className="muted">Browse services and submit your first request.</div>
            <Link className="button buttonPrimary" to="/services">Browse services</Link>
          </div>
        ) : (
          <div className="table">
            <div className="tableRow tableHead">
              <div>Service</div>
              <div>Status</div>
              <div className="hideSm">Created</div>
              <div className="right">Action</div>
            </div>
            {orders.map((o) => (
              <div key={o.id} className="tableRow">
                <div>
                  <div className="strong">{o.service?.name || `Service #${o.service_id}`}</div>
                  <div className="muted small">{o.notes ? o.notes : '—'}</div>
                </div>
                <div><span className={statusPill(o.status)}>{o.status}</span></div>
                <div className="hideSm muted small">{new Date(o.created_at).toLocaleString()}</div>
                <div className="right">
                  <Link className="button buttonGhost" to={`/services/${o.service_id}`}>View service</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
