'use client';

import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallPrompt() {
  const { canInstall, isIOS, showPrompt, promptInstall, dismissPrompt } = useInstallPrompt();

  if (!showPrompt) {
    return null;
  }

  if (isIOS) {
    // iOS users get different component
    return <IOSInstallInstructions onDismiss={dismissPrompt} />;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1c2a31] border border-white/10 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Install Event Wallet</h3>
          <p className="text-[#9db0b9] text-sm">
            Install the app for the best experience at live events.
          </p>
        </div>
        <button
          onClick={dismissPrompt}
          className="text-[#9db0b9] hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      {canInstall && (
        <button
          onClick={promptInstall}
          className="mt-3 w-full bg-[#13a4ec] hover:bg-[#0d7db3] text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Install App
        </button>
      )}
    </div>
  );
}

function IOSInstallInstructions({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#1c2a31] border border-white/10 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Install Event Wallet</h3>
          <p className="text-[#9db0b9] text-sm mb-3">
            Tap the Share button and select &quot;Add to Home Screen&quot;.
          </p>
          <div className="flex items-center gap-2 text-sm text-[#9db0b9]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span>Open in Safari</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-[#9db0b9] hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
