import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Info, CheckCircle2 } from 'lucide-react';

export const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = 'Sign in with Google',
  disabled = false,
  className = '',
  hintEmail = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const gisContainerRef = useRef(null);

  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isConfigured =
    Boolean(rawClientId) &&
    !rawClientId.includes('your_google_client_id_here') &&
    rawClientId.endsWith('.apps.googleusercontent.com');

  // Load Google Identity Services (GIS) SDK
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGisLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGisLoaded(true);
    };
    script.onerror = () => {
      console.warn('Google Identity Services script failed to load.');
    };
    document.head.appendChild(script);
  }, []);

  // Initialize GIS and render official Google button when configured
  useEffect(() => {
    if (!gisLoaded || !isConfigured || !window.google?.accounts?.id || !gisContainerRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: rawClientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      gisContainerRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(gisContainerRef.current, {
        theme: 'filled_black',
        size: 'medium',
        type: 'standard',
        shape: 'pill',
        text: text.toLowerCase().includes('up') ? 'signup_with' : 'signin_with',
        logo_alignment: 'left',
        width: 240,
      });
    } catch (err) {
      console.error('Failed to initialize Google Accounts ID:', err);
    }
  }, [gisLoaded, isConfigured, rawClientId, text]);

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      onError?.('No credential returned from Google');
      return;
    }

    setLoading(true);
    try {
      await onSuccess?.(response.credential);
    } catch (err) {
      onError?.(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (disabled || loading) return;

    if (!isConfigured) {
      // Show configuration modal / prompt
      setShowConfigNotice(true);
      return;
    }

    // Attempt prompt if button click was triggered on container
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  const handleDemoSignIn = async () => {
    setShowConfigNotice(false);
    setLoading(true);
    try {
      // Use the hintEmail (logged-in customer's email) so email verification works correctly
      const email = hintEmail || 'demo.user@gmail.com';
      await onSuccess?.({
        token: 'demo_google_token_' + Date.now(),
        demoUser: {
          email,
          name: email.split('@')[0].replace(/[._]/g, ' '),
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
    } catch (err) {
      onError?.(err?.message || 'Demo Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`w-full flex justify-center items-center ${className}`}>
        {loading ? (
          <div className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-cyan-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Authenticating with Google...</span>
          </div>
        ) : isConfigured ? (
          /* Official Google Identity Services Button - minimized compact width */
          <div
            ref={gisContainerRef}
            className="flex justify-center items-center transition-all"
          />
        ) : (
          /* Styled Fallback / Config Guide Button - minimized compact width */
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || loading}
            className="inline-flex items-center justify-center gap-2.5 py-2 px-5 rounded-full text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all duration-200 shadow-sm hover:shadow-cyan-950/30 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            <svg
              className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>{text}</span>
          </button>
        )}
      </div>

      {/* Config Guide / Test Modal (shown when Client ID is missing) */}
      {showConfigNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Google OAuth Configuration
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Google Auth is implemented! To sign in with your real Google account, add your credentials:
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
              <div>
                <span className="text-cyan-400 font-semibold">1. backend/.env:</span>
                <p className="text-slate-400 truncate">
                  GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
                </p>
                <p className="text-slate-400 truncate">
                  GOOGLE_CLIENT_SECRET="your_secret_key"
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-cyan-400 font-semibold">2. frontend/.env:</span>
                <p className="text-slate-400 truncate">
                  VITE_GOOGLE_CLIENT_ID="your_client_id.apps.googleusercontent.com"
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Or test the individual flow immediately using the demo simulation below.</span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md cursor-pointer transition-all"
              >
                Test Google Sign-In Demo
              </button>
              <button
                type="button"
                onClick={() => setShowConfigNotice(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSignInButton;
