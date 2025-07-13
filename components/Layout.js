'use client';

import Head from 'next/head';
import Navbar from './Navbar';
import TestEffect from './TestEffect';

export default function Layout({ children, title = 'Your Shop' }) {
  return (
    <>
      <TestEffect />
      <Head>
        <title>{title}</title>
        <meta name="description" content="Your one-stop shop for all your needs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-cyberpunk-bg">
        <Navbar />
        <main>{children}</main>
        {/* Footer */}
        <footer className="bg-cyberpunk-surface border-t border-cyberpunk-neonBlue mt-12 shadow-neon">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-cyberpunk-neonPink tracking-wider uppercase">About</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">About Us</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">Careers</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyberpunk-neonPink tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">Help Center</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">Contact Us</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyberpunk-neonPink tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#" className="text-base text-cyberpunk-neonBlue hover:text-cyberpunk-neonPink transition-colors">Terms of Service</a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-cyberpunk-neonPink tracking-wider uppercase">Newsletter</h3>
                <p className="mt-4 text-base text-cyberpunk-neonBlue">Subscribe to our newsletter for the latest updates.</p>
                <form className="mt-4">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="min-w-0 flex-1 px-4 py-2 border border-cyberpunk-neonBlue rounded-l-md focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink focus:border-cyberpunk-neonPink bg-cyberpunk-surface text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyberpunk-neonPink text-cyberpunk-bg rounded-r-md hover:bg-cyberpunk-neonBlue hover:text-cyberpunk-bg focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink focus:ring-offset-2 font-nexus font-bold shadow-neon transition-colors"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="mt-8 border-t border-cyberpunk-neonBlue pt-8">
              <p className="text-base text-cyberpunk-neonPurple text-center font-nexus tracking-widest" style={{letterSpacing: '0.15em', textShadow: '0 0 8px #a259ff'}}>
                © 2024 NEXUS. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 