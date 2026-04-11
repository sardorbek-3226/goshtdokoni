import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-4 md:p-8">
        <Outlet />
      </main>
      <footer className="p-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
        Go'shtPro ERP © 2026. All rights reserved.
      </footer>
    </div>
  );
}