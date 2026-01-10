import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setAuthToken } from '../api/client';

// PUBLIC_INTERFACE
export default function Signup() {
  /** Signup page. */
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api.signup({ email, full_name: fullName, password });
      setAuthToken(res.access_token);
      nav('/dashboard');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authWrap">
      <div className="authCard">
        <h2>Create account</h2>
        <p className="muted">Request services and manage everything from one place.</p>

        {err ? <div className="alert">{err}</div> : null}

        <form className="stack gap12" onSubmit={submit}>
          <label className="label">
            Full name
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="label">
            Email
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="label">
            Password
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <button className="button buttonPrimary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <p className="muted small">
          Already have an account? <Link className="link" to="/login">Log in</Link>.
        </p>
      </div>
    </div>
  );
}
