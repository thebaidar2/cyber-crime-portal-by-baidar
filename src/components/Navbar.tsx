import React, { useState, useEffect } from 'react';
import { Shield, Search, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';
import { userActivitiesService } from '../services/userActivities';

interface NavbarProps {
  onOpenSubmit: () => void;
  onOpenTrack: () => void;
  onOpenProfile: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSubmit,
  onOpenTrack,
  onOpenProfile,
  user
}) => {
  const [activityCount, setActivityCount] = useState(0);

  useEffect(() => {
    setActivityCount(userActivitiesService.getActivities().length);
    const handleUpdate = () => {
      setActivityCount(userActivitiesService.getActivities().length);
    };
    window.addEventListener('ccpb_activities_updated', handleUpdate);
    return () => window.removeEventListener('ccpb_activities_updated', handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3.5 select-none"
          title="Cyber Crime Portal by Baidar"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 transition-all">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wider uppercase text-neutral-100 leading-tight">
              CYBER CRIME PORTAL
            </span>
            <span className="text-[11px] font-mono tracking-widest text-neutral-400">
              BY BAIDAR
            </span>
          </div>
        </div>

        {/* Center Nav Links (Balanced & Symmetrical) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <a href="#about" className="transition-colors hover:text-white py-1">About</a>
          <a href="#services" className="transition-colors hover:text-white py-1">Services</a>
          <a href="#how-it-works" className="transition-colors hover:text-white py-1">Protocol</a>
          <a href="#contact" className="transition-colors hover:text-white py-1">Helpline</a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* User Profile & Activities Button ("user apni profile pe tap kr k apni activities mai wo dekh sakta hai") */}
          <button
            onClick={onOpenProfile}
            className="h-10 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs font-mono font-semibold text-neutral-200 transition-colors hover:border-cyan-500/50 hover:bg-neutral-800 focus:outline-none shadow-sm"
            title="User Profile & Activities Vault"
          >
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-neutral-800 flex items-center justify-center border border-neutral-700 text-cyan-400 overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5 text-neutral-300" />
                )}
              </div>
              <span className="hidden sm:inline">
                {user ? (user.displayName || user.email?.split('@')[0]) : 'Profile'}
              </span>
            </div>
            {activityCount > 0 && (
              <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/40">
                {activityCount}
              </span>
            )}
          </button>

          {/* Track Request Button */}
          <button
            onClick={onOpenTrack}
            className="h-10 flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 text-xs font-semibold text-neutral-200 transition-colors hover:border-neutral-500 hover:bg-neutral-800 focus:outline-none"
          >
            <Search className="h-4 w-4 text-neutral-400" />
            <span className="hidden sm:inline">Track</span> Status
          </button>

          {/* Submit Request Button */}
          <button
            onClick={onOpenSubmit}
            className="h-10 flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 text-xs font-bold uppercase tracking-wider text-neutral-950 transition-colors hover:bg-neutral-300 focus:outline-none shadow-sm"
          >
            Submit Incident
          </button>
        </div>
      </div>
    </header>
  );
};
