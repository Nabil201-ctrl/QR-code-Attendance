import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/queryClient';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <nav style={{ padding: 10, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
          <h2>Admin Panel</h2>
          <button onClick={onLogout}>Logout</button>
        </nav>
        <main style={{ padding: 20 }}>
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}