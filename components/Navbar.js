'use client';

import Link from 'next/link';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { useLikes } from '../lib/LikesContext';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { uniqueCount } = useCart();
  const { user } = useAuth();
  const { likedProductIds } = useLikes();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="bg-cyberpunk-surface shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-3xl font-extrabold font-nexus tracking-widest text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] group-hover:text-cyberpunk-neonPink transition-colors duration-300" style={{letterSpacing: '0.2em', textShadow: '0 0 8px #00ffe7, 0 0 16px #ff00cb'}}>
                NEXUS
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <Link href="/products" className="px-3 py-1 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink font-nexus font-bold border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg shadow-neon transition-colors focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink mx-1">
                Products
              </Link>
              <Link href="/orders" className="px-3 py-1 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink font-nexus font-bold border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg shadow-neon transition-colors focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink mx-1">
                Orders
              </Link>
              <Link href="/categories" className="px-3 py-1 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink font-nexus font-bold border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg shadow-neon transition-colors focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink mx-1">
                Categories
              </Link>
            </div>
          </div>

          {/* Search, Cart, and User menu */}
          <div className="flex items-center">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors font-nexus shadow-neon border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink mx-1"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Liked Items */}
            <div className="relative mx-1">
              <Link href="/liked-items" className="p-2 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors font-nexus shadow-neon border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink flex items-center">
                <HeartIcon className="h-6 w-6" />
                {likedProductIds.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyberpunk-neonPink text-cyberpunk-neonBlue text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-nexus font-bold shadow-neon border border-cyberpunk-neonBlue" style={{letterSpacing: '0.05em', textShadow: '0 0 4px #00ffe7'}}>
                    {likedProductIds.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Cart */}
            <div className="relative mx-1">
              <Link href="/cart" className="p-2 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors font-nexus shadow-neon border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink flex items-center">
                <ShoppingCartIcon className="h-6 w-6" />
                {uniqueCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyberpunk-neonPink text-cyberpunk-neonBlue text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-nexus font-bold shadow-neon border border-cyberpunk-neonBlue" style={{letterSpacing: '0.05em', textShadow: '0 0 4px #00ffe7'}}>
                    {uniqueCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User menu - show profile if logged in, login if not */}
            <Link href={user ? "/profile" : "/login"} className="ml-3 p-2 text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors font-nexus shadow-neon border border-cyberpunk-neonBlue rounded bg-cyberpunk-bg focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink flex items-center mx-1">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-16 bg-cyberpunk-surface shadow-neon z-50 border-b-2 border-cyberpunk-neonBlue">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-cyberpunk-neonBlue rounded-l-md bg-cyberpunk-bg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyberpunk-neonBlue text-cyberpunk-bg rounded-r-md font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isSearchOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsProfileOpen(false);
            setIsSearchOpen(false);
          }}
        />
      )}
    </nav>
  );
} 