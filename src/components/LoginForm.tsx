// Login form (styled in form.css). Sends the credentials to POST /api/v1/sessions.
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { LoginErrors, LoginFormValues } from '../types';
import { loginApi } from '../api/auth';

export interface LoggedInUser {
  id: number;
  name: string;
  email: string;
}

interface LoginFormProps {
  onLogin?: (user: LoggedInUser) => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_VALUES: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

function validate(values: LoginFormValues): LoginErrors {
  const errors: LoginErrors = {};
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }
  return errors;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, type, value, checked } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 1. Check the fields in the browser first
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus('idle');
      setMessage('');
      return;
    }

    // 2. Loading
    setStatus('loading');
    setMessage('');

    try {
      // 3. Ask the server
      const data = await loginApi(values.email.trim(), values.password);

      // "Keep me signed in" ON -> localStorage, OFF -> sessionStorage
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      const storage = values.remember ? localStorage : sessionStorage;
      storage.setItem('token', data.token);

      // 4. Success, then show the Welcome screen
      setStatus('success');
      setMessage(`Welcome, ${data.user.name}!`);
      setTimeout(() => onLogin?.(data.user), 700);
    } catch (err) {
      // 5. Error: "Invalid email or password." or a network message
      setStatus('error');
      setMessage(
        err instanceof TypeError
          ? 'Cannot reach the server. Please try again.'
          : err instanceof Error
            ? err.message
            : 'Login failed.'
      );
    }
  }

  const busy = status === 'loading' || status === 'success';

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
            inputMode="email"
            autoComplete="email"
            placeholder="name@school.edu.ph"
            value={values.email}
            onChange={handleChange}
            disabled={busy}
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
              disabled={busy}
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
              disabled={busy}
            />
            <span>Keep me signed in</span>
          </label>
          <a className="link" href="#forgot">
            Forgot password?
          </a>
        </div>

        <button type="submit" className="btn btn--primary" disabled={busy}>
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>

        {status === 'loading' && (
          <p className="form-status" role="status">
            Loading...
          </p>
        )}
        {status === 'success' && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}
        {status === 'error' && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}
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
