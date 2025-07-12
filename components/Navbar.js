'use client';

import Link from 'next/link';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { uniqueCount } = useCart();
  const { user } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="text-3xl font-extrabold font-nexus tracking-widest text-cyberpunk-neonBlue drop-shadow-[0_0_8px_#00ffe7] group-hover:text-cyberpunk-neonPink transition-colors duration-300" style={{letterSpacing: '0.2em', textShadow: '0 0 8px #00ffe7, 0 0 16px #ff00cb'}}>
                NEXUS
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/products" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500">
                Products
              </Link>
              <Link href="/orders" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500">
                Orders
              </Link>
              <Link href="/categories" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-indigo-500">
                Categories
              </Link>
            </div>
          </div>

          {/* Search, Cart, and User menu */}
          <div className="flex items-center">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Cart */}
            <div className="relative">
              <Link href="/cart" className="p-2 text-gray-400 hover:text-gray-500">
                <ShoppingCartIcon className="h-6 w-6" />
                {uniqueCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold">
                    {uniqueCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User menu - show profile if logged in, login if not */}
            <Link href={user ? "/profile" : "/login"} className="ml-3 text-gray-400 hover:text-gray-500">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-16 bg-white shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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