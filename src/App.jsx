import { Toaster } from "@/components/ui/toaster"
import ApiErrors from '@/components/ApiErrors';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { profileIsComplete } from '@/lib/profile';
import { api } from '@/api/client';

import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetail from '@/pages/ClientDetail';
import JobDetail from '@/pages/JobDetail';
import AllJobs from '@/pages/AllJobs';
import Schedule from '@/pages/Schedule';
import Money from '@/pages/Money';
import Estimates from '@/pages/Estimates';
import DocumentForm from '@/pages/DocumentForm';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

function JobInvoiceRedirect() {
  const { id } = useParams();
  const [to, setTo] = useState("");
  useEffect(() => {
    api.entities.Document.filter({ job_id: id }, "-created_date", 200).then((docs) => {
      const invoice = docs.find((doc) => doc.type === "invoice");
      setTo(invoice ? `/documents/${invoice.id}` : `/documents/new?type=invoice&job_id=${id}`);
    });
  }, [id]);
  if (!to) return <div className="p-8 text-slate-400">Loading invoice...</div>;
  return <Navigate to={to} replace />;
}

const AuthenticatedApp = () => {
  const { user, isLoadingAuth, authError, checkUserAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) return <div className="p-8 text-center"><p>{authError}</p><button className="underline" onClick={checkUserAuth}>Try again</button></div>;

  const incompleteProfile = Boolean(user && !profileIsComplete(user.profile));

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/settings" element={<AppLayout />}>
          <Route index element={<Settings />} />
        </Route>
        {incompleteProfile ? <Route path="*" element={<Navigate to="/settings?setup=1" replace />} /> : <>
          <Route path="/documents/new" element={<DocumentForm />} />
          <Route path="/documents/:id" element={<DocumentForm />} />
          <Route path="/jobs/:id/invoice" element={<JobInvoiceRedirect />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/jobs" element={<AllJobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/money" element={<Money />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/invoices" element={<Navigate to="/estimates?tab=invoice" replace />} />
          </Route>
        </>}
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <ApiErrors />
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
