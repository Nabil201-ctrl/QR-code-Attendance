import { QueryClientProvider } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import { queryClient } from '../utils/queryClient';

export default function AdminLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}