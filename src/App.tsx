/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, testConnection, loginWithGoogle, logoutUser } from './firebase';
import { api, SubmitResponse } from './services/api';
import { WebsiteContent, SocialLink } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { RequestFormSection } from './components/RequestFormSection';
import { ContactSection } from './components/ContactSection';
import { SocialLinksSection } from './components/SocialLinksSection';
import { Footer } from './components/Footer';
import { RequestConfirmationModal } from './components/RequestConfirmationModal';
import { TrackRequestModal } from './components/TrackRequestModal';
import { UserProfileActivitiesModal } from './components/UserProfileActivitiesModal';
import { CookieConsentModal } from './components/CookieConsentModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Modal controls
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<SubmitResponse | null>(null);
  const [trackInitialData, setTrackInitialData] = useState<{ id: string; token: string }>({ id: '', token: '' });

  // Selected Service for pre-filling
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | undefined>(undefined);

  // Admin authentication state
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');

  // Auto-launch Cookie Consent Popup upon entering website
  useEffect(() => {
    const hasConsented = localStorage.getItem('ccpb_cookie_consent');
    if (!hasConsented) {
      const timer = setTimeout(() => {
        setShowCookieModal(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Secret URL listener for hidden admin access strictly via /iran.php
  useEffect(() => {
    // URL Path detector: /iran.php, #iran.php, etc.
    const checkAdminTrigger = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('iran.php') || hash.includes('iran.php') || hash === '#admin' || search.includes('admin=true')) {
        setShowAdminLogin(true);
      }
    };

    window.addEventListener('hashchange', checkAdminTrigger);
    window.addEventListener('popstate', checkAdminTrigger);
    checkAdminTrigger();

    return () => {
      window.removeEventListener('hashchange', checkAdminTrigger);
      window.removeEventListener('popstate', checkAdminTrigger);
    };
  }, []);

  // Test Firestore Connection & Load Content
  useEffect(() => {
    testConnection();

    // Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Check existing stored admin session in sessionStorage
    const storedToken = sessionStorage.getItem('ccpb_admin_token');
    const storedUser = sessionStorage.getItem('ccpb_admin_user');
    if (storedToken && storedUser) {
      api.checkAdminSession(storedToken).then((valid) => {
        if (valid) {
          setAdminToken(storedToken);
          setAdminUsername(storedUser);
        } else {
          sessionStorage.removeItem('ccpb_admin_token');
          sessionStorage.removeItem('ccpb_admin_user');
        }
      });
    }

    loadPortalContent();

    return () => unsubscribe();
  }, []);

  const loadPortalContent = async () => {
    try {
      setLoadingContent(true);
      const res = await api.getContent();
      setContent(res.content);
      setSocialLinks(res.socialLinks);
    } catch (err) {
      console.error('Failed to load initial website content:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleOpenSubmit = () => {
    const el = document.getElementById('submit-request');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (category: string) => {
    setSelectedServiceCategory(category);
    handleOpenSubmit();
  };

  const handleFormSubmitted = (data: SubmitResponse) => {
    setConfirmationData(data);
  };

  const handleTrackFromConfirmation = (requestId: string, token: string) => {
    setConfirmationData(null);
    setTrackInitialData({ id: requestId, token });
    setShowTrackModal(true);
  };

  const handleAdminLoginSuccess = (token: string, user: string) => {
    setAdminToken(token);
    setAdminUsername(user);
    sessionStorage.setItem('ccpb_admin_token', token);
    sessionStorage.setItem('ccpb_admin_user', user);
  };

  const handleAdminLogout = () => {
    if (adminToken) {
      api.adminLogout(adminToken);
    }
    setAdminToken(null);
    sessionStorage.removeItem('ccpb_admin_token');
    sessionStorage.removeItem('ccpb_admin_user');
  };

  // If Admin is logged in, show the comprehensive, colorful, symmetrical Admin Dashboard
  if (adminToken) {
    return (
      <AdminDashboard
        token={adminToken}
        adminUsername={adminUsername}
        onLogout={handleAdminLogout}
        onRefreshPublicContent={loadPortalContent}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Custom Landing Page Theme Background (Picture or Video from Admin) */}
      {content?.theme && content.theme.type !== 'default' && content.theme.mediaUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {content.theme.type === 'video' ? (
            <video
              src={content.theme.mediaUrl}
              autoPlay
              loop={content.theme.loop !== false}
              muted={content.theme.muted !== false}
              playsInline
              style={{ filter: `blur(${content.theme.blurAmount || 0}px)` }}
              className="w-full h-full object-cover scale-105"
            />
          ) : (
            <img
              src={content.theme.mediaUrl}
              alt="Landing Page Background Theme"
              style={{ filter: `blur(${content.theme.blurAmount || 0}px)` }}
              className="w-full h-full object-cover scale-105"
            />
          )}
          {/* Calibrated Dark Contrast Overlay */}
          <div
            className="absolute inset-0 bg-neutral-950 transition-opacity"
            style={{ opacity: content.theme.overlayOpacity ?? 0.7 }}
          />
        </div>
      )}

      {/* Top Monochrome Nav (Strictly No Admin Link) */}
      <Navbar
        onOpenSubmit={handleOpenSubmit}
        onOpenTrack={() => {
          setTrackInitialData({ id: '', token: '' });
          setShowTrackModal(true);
        }}
        onOpenProfile={() => setShowProfileModal(true)}
        user={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
      />

      {/* Main Landing Page Content (Symmetrical, Cleanly Proportioned) */}
      <main className="relative z-10 flex-1">
        {content ? (
          <>
            <HeroSection
              content={content}
              onOpenSubmit={handleOpenSubmit}
              onOpenTrack={() => {
                setTrackInitialData({ id: '', token: '' });
                setShowTrackModal(true);
              }}
            />

            <AboutSection content={content} />

            <ServicesSection
              services={content.services}
              onSelectService={handleSelectService}
            />

            <HowItWorksSection />

            <RequestFormSection
              initialCategory={selectedServiceCategory}
              onSuccess={handleFormSubmitted}
              userId={currentUser?.uid}
            />

            <ContactSection content={content} />

            <SocialLinksSection socialLinks={socialLinks} />
          </>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <div className="flex items-center gap-3 font-mono text-sm text-neutral-400">
              <span className="h-4 w-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              <span>INITIALIZING SECURE GATEWAY...</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Strictly No Admin Link) */}
      {content && (
        <Footer
          content={content}
          onOpenTrack={() => {
            setTrackInitialData({ id: '', token: '' });
            setShowTrackModal(true);
          }}
          onOpenCookieSettings={() => setShowCookieModal(true)}
        />
      )}

      {/* Modals */}
      {confirmationData && (
        <RequestConfirmationModal
          data={confirmationData}
          onClose={() => setConfirmationData(null)}
          onTrackNow={handleTrackFromConfirmation}
        />
      )}

      <TrackRequestModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
        initialRequestId={trackInitialData.id}
        initialAccessToken={trackInitialData.token}
      />

      {/* User Profile & Activities Modal ("user apni profile pe tap kr k apni activities mai wo dekh sakta hai") */}
      <UserProfileActivitiesModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
        onTrackCase={(requestId, token) => {
          setTrackInitialData({ id: requestId, token });
          setShowTrackModal(true);
        }}
      />

      {/* Cookie Consent & Management Popup */}
      <CookieConsentModal
        isOpen={showCookieModal}
        onClose={() => setShowCookieModal(false)}
      />

      {/* Hidden Admin Login Modal (Accessible strictly via /iran.php) */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => {
          setShowAdminLogin(false);
          if (window.location.pathname.toLowerCase().includes('iran.php')) {
            window.history.replaceState(null, '', '/');
          }
        }}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
}
