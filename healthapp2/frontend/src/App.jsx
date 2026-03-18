import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginForm from './components/Auth/LoginForm';
import PatientList from './components/Patients/PatientList';
import PatientDetail from './components/Patients/PatientDetail';
import AppointmentCalendar from './components/Scheduling/AppointmentCalendar';
import InvoiceList from './components/Billing/InvoiceList';
import InvoiceDetail from './components/Billing/InvoiceDetail';
import ScheduleMaster from './components/Reports/ScheduleMaster';
import FinanceMaster from './components/Reports/FinanceMaster';
import AuthMaster from './components/Reports/AuthMaster';
import ProviderPerformance from './components/Reports/ProviderPerformance';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/patients" replace />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="appointments" element={<AppointmentCalendar />} />
            <Route path="billing" element={<InvoiceList />} />
            <Route path="billing/:id" element={<InvoiceDetail />} />
            <Route path="reports/schedule" element={<ScheduleMaster />} />
            <Route path="reports/finance" element={<FinanceMaster />} />
            <Route path="reports/auth" element={<AuthMaster />} />
            <Route path="reports/performance" element={<ProviderPerformance />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
