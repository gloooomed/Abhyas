import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { Button } from './ui/button';

// Extend the window object to include the beforeinstallprompt event and MSStream
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Window {
    MSStream: unknown;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAPrompt() {
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const userAgent = window.navigator.userAgent || window.navigator.vendor;
    const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    setIsMobile(mobileCheck);

    // Check if iOS
    const iosCheck = /ipad|iphone|ipod/.test(userAgent.toLowerCase()) && !window.MSStream;
    setIsIOS(iosCheck);

    // Check if already installed / running in standalone mode
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && window.navigator.standalone === true);
    setIsStandalone(standaloneCheck);

    // Check if user has dismissed the prompt previously
    const hasDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';

    if (mobileCheck && !standaloneCheck && !hasDismissed) {
      if (iosCheck) {
        // For iOS, we just show the instructions prompt since beforeinstallprompt isn't supported
        // Delay slightly so it doesn't pop up instantly on first load
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    // For Android/Chrome: listen to the install prompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      if (!hasDismissed && mobileCheck) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // Clear the deferredPrompt so it can only be used once.
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Only render anything if we should show the prompt, and we are on a mobile device that isn't standalone
  if (!showPrompt || !isMobile || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 150, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 150, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-4 left-4 right-4 z-[999] bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-zinc-800"
      >
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-6">
          <div className="w-12 h-12 rounded-xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
            <img src="/logo.gif" alt="Abhyas Logo" className="w-8 h-8 object-contain" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              Install Abhyas App
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {isIOS 
                ? "Install our app for a better, full-screen experience."
                : "Install our app for quick access and a better experience."}
            </p>
            
            {isIOS && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg">
                <span className="flex items-center gap-1">1. Tap <Share size={14} className="text-blue-500" /></span>
                <span className="text-slate-300 dark:text-zinc-600">→</span>
                <span className="flex items-center gap-1">2. Select <PlusSquare size={14} className="text-slate-700 dark:text-slate-300" /> Add to Home Screen</span>
              </div>
            )}
          </div>

          {!isIOS && (
            <Button 
              onClick={handleInstallClick}
              className="w-full sm:w-auto sutera-button shrink-0"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
