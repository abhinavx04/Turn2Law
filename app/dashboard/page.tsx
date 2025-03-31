"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase/client"; // Updated import path
import { LawyerRegistrationForm } from "@/components/LawyerRegistrationForm";
import Link from "next/link";

export default function DashboardClient() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [isLawyer, setIsLawyer] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sample search suggestions
  const helpTopics = [
    "How to create a case?",
    "How to contact a lawyer?",
    "Legal document templates",
    "Payment issues",
    "Privacy policy"
  ];

  // Fetch user profile and lawyer status
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.replace('/sign-in');
          return;
        }

        const isLawyerRole = session.user?.user_metadata?.role === 'lawyer';
        setIsLawyer(isLawyerRole);

        if (isLawyerRole) {
          const { data: profile } = await supabase
            .from('lawyers')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          setLawyerProfile(profile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        router.replace('/sign-in');
      }
    };

    fetchProfile();
  }, [router]);

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      setSuggestions(helpTopics.filter(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-teal-400">Dashboard</div>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <Bell
              className="w-6 h-6 cursor-pointer hover:text-gray-400"
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            />
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 shadow-lg rounded-lg p-3 z-50">
                <p className="text-sm font-medium text-gray-300">No new notifications</p>
              </div>
            )}
          </div>

          {/* Messages Icon */}
          <Mail
            className="w-6 h-6 cursor-pointer hover:text-gray-400"
            onClick={() => router.push("/messages")}
          />

          {/* Profile Icon */}
          <div className="relative" ref={profileRef}>
            <User
              className="w-6 h-6 cursor-pointer hover:text-gray-400"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            />
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 shadow-lg rounded-lg p-3 z-50">
                <ul className="text-sm space-y-2">
                  <li
                    className="hover:bg-gray-700 p-2 rounded cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    Profile
                  </li>
                  <li
                    className="hover:bg-gray-700 p-2 rounded cursor-pointer"
                    onClick={() => router.push("/settings")}
                  >
                    Settings
                  </li>
                  <li
                    className="hover:bg-red-600 p-2 rounded cursor-pointer text-red-300"
                    onClick={() => router.push("/logout")}
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {isLawyer && !lawyerProfile ? (
          <div className="space-y-6 w-full max-w-2xl">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-teal-400">Complete Your Lawyer Profile</h1>
              <p className="text-gray-400">
                Fill out the form below to create your lawyer profile and start accepting consultations.
              </p>
            </div>
            <LawyerRegistrationForm />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-4 text-teal-400">How can we help you?</h1>

            {/* Search Box */}
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full p-3 border rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <ul className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg z-50">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="p-2 hover:bg-gray-700 cursor-pointer text-gray-300"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setSuggestions([]);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
