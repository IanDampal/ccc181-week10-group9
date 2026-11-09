import { useEffect, useState } from 'react';
import { getMeApi } from './api/auth';
import Navbar from './components/Navbar';
import BrandPanel from './components/BrandPanel';
import LoginForm from './components/LoginForm';
import type { LoggedInUser } from './components/LoginForm';
import Footer from './components/Footer';

export default function App() {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  // On page refresh: if a token is saved, ask the server who we are
  useEffect(() => {
    const token =
      localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }
    getMeApi(token)
      .then((data) => setUser(data.user))
      .catch(() => {
        // expired or invalid token -> back to the login form
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      })
      .finally(() => setChecking(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  }

  // What shows next to the brand panel
  let panel;
  if (checking) {
    panel = (
      <section className="login-card">
        <p className="form-status" role="status">
          Loading...
        </p>
      </section>
    );
  } else if (user) {
    panel = (
      <section className="login-card" aria-labelledby="welcome-title">
        <h2 id="welcome-title" className="login-card__title">
          Welcome, {user.name}!
        </h2>
        <p className="login-card__subtitle">
          You are logged in as {user.email}.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleLogout}
        >
          Log out
        </button>
      </section>
    );
  } else {
    panel = <LoginForm onLogin={setUser} />;
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div className="login-layout">
          <BrandPanel />
          {panel}
        </div>
      </main>
      <Footer />
    </div>
  );
}
