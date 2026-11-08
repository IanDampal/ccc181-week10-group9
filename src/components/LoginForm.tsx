// GIVEN FILE (styled in form.css by Member 3). Do not edit.
// The sign-in is a DEMO: nothing is sent to a server and nothing is saved.
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginErrors, LoginFormValues } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

function validate(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSignedInAs(Object.keys(nextErrors).length === 0 ? values.email : null);
  }

  return (
    <section className="login-card" aria-labelledby="login-title">
      <h2 id="login-title" className="login-card__title">
        Sign in
      </h2>
      <p className="login-card__subtitle">Use your school email to continue.</p>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">School email</label>
          <input
            id="email"
            name="email"
            type="email"
           import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginErrors, LoginFormValues } from '../types';
import { loginApi, getMeApi } from '../api/auth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

function validate(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Part 2 API States
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  // Check token on page refresh
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      getMeApi(token)
        .then((userData) => setUser(userData))
        .catch(() => {
          sessionStorage.removeItem('token');
        });
    }
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError('');
    
    // Part 1 local form validation runs first
    const nextErrors = validate(values);
    setErrors(nextErrors);
    
    if (Object.keys(nextErrors).length > 0) {
      return; // Stop if input is invalid
    }

    setLoading(true);

    try {
      // Call Part 2 backend API
      const data = await loginApi(values.email, values.password);
      sessionStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err: any) {
      setApiError(err.message || 'Cannot reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('token');
    setUser(null);
  }

  // PART 2 SUCCESS STATE: Welcome Screen
  if (user) {
    return (
      <section className="login-card" aria-labelledby="welcome-title">
        <h2 id="welcome-title" className="login-card__title">
          Welcome, {user.name}!
        </h2>
        <p className="login-card__subtitle">{user.email}</p>
        <button 
          type="button" 
          onClick={handleLogout} 
          className="btn btn--primary"
          style={{ minHeight: '48px', marginTop: '1.5rem', width: '100%' }}
        >
          Log out
        </button>
      </section>
    );
  }

  // PART 2 FORM VIEW (With Loading & Error States)
  return (
    <section className="login-card" aria-labelledby="login-title">
      <h2 id="login-title" className="login-card__title">
        Sign in
      </h2>
      <p className="login-card__subtitle">Use your school email to continue.</p>

      {/* API Network / Authentication Error Banner */}
      {apiError && (
        <div className="form-error" role="alert" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '4px', color: '#dc2626' }}>
          {apiError}
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">School email</label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@school.edu.ph"
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="form-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="password-row">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="btn btn--ghost toggle-password"
              aria-controls="password"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="form-error" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={values.remember}
              onChange={handleChange}
            />
            <span>Keep me signed in</span>
          </label>
          <a className="link" href="#forgot">
            Forgot password?
          </a>
        </div>

        <button type="submit" disabled={loading} className="btn btn--primary">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="login-card__divider">
        <span>or</span>
      </div>

      <div className="alt-actions">
        <button type="button" className="btn btn--secondary">
          Create account
        </button>
        <button type="button" className="btn btn--secondary">
          Continue as guest
        </button>
      </div>
    </section>
  );
}