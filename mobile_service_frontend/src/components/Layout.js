import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAuthToken, setAuthToken } from '../api/client';

// PUBLIC_INTERFACE
export default function Layout({ children }) {
  /** App shell with top nav + responsive container. */
  const isAuthed = !!getAuthToken();

  return (
    <div className="appShell">
      <header className="topBar">
        <div className="topBarInner">
          <Link to="/" className="brand">
            <span className="brandMark">MS</span>
            <span className="brandText">Mobile Services</span>
          </Link>

          <nav className="nav">
            <NavLink className="navLink" to="/services">Services</NavLink>
            <NavLink className="navLink" to="/dashboard">Dashboard</NavLink>
          </nav>

          <div className="actions">
            {!isAuthed ? (
              <div className="authLinks">
                <NavLink className="button buttonGhost" to="/login">Log in</NavLink>
                <NavLink className="button buttonPrimary" to="/signup">Sign up</NavLink>
              </div>
            ) : (
              <button
                className="button buttonGhost"
                onClick={() => {
                  setAuthToken(null);
                  window.location.href = '/';
                }}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="content">
        {children}
      </main>

      <footer className="footer">
        <div className="footerInner">
          <span>Ocean Professional • Mobile Service Management</span>
          <a className="footerLink" href="/docs" target="_blank" rel="noreferrer">API Docs</a>
        </div>
      </footer>
    </div>
  );
}
