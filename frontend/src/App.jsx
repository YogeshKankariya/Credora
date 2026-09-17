import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { KYCProvider } from './context/KYCContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { RoleSelectionPage } from './pages/public/RoleSelectionPage';
import { LoginPage } from './pages/public/LoginPage';
import { SigninPage } from './pages/public/SigninPage';

// Customer Pages
import { CustomerOverview } from './pages/customer/CustomerOverview';
import { DigitalIdentity } from './pages/customer/DigitalIdentity';
import { KYCCredential } from './pages/customer/KYCCredential';
import { ShareCredential } from './pages/customer/ShareCredential';
import { CustomerHistory } from './pages/customer/CustomerHistory';
import { CustomerSettings } from './pages/customer/CustomerSettings';


// Bank Issuer Pages
import { IssuerOverview } from './pages/issuer/IssuerOverview';
import { CustomerList } from './pages/issuer/CustomerList';
import { KYCVerification } from './pages/issuer/KYCVerification';
import { IssueCredential } from './pages/issuer/IssueCredential';
import { IssuedCredentials } from './pages/issuer/IssuedCredentials';
import { RevocationsList } from './pages/issuer/RevocationsList';
import { IssuerActivity } from './pages/issuer/IssuerActivity';

// Bank Verifier Pages
import { VerifierOverview } from './pages/verifier/VerifierOverview';
import { VerifyCredential } from './pages/verifier/VerifyCredential';
import { VerifierHistory } from './pages/verifier/VerifierHistory';
import { TamperingDemo } from './pages/verifier/TamperingDemo';
import { TrustedIssuers } from './pages/verifier/TrustedIssuers';

function App() {
  return (
    <KYCProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Login */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<RoleSelectionPage />} />
            <Route path="/signin-page" element={<SigninPage />} />
            <Route path="/login-page" element={<LoginPage />} />
          </Route>

          {/* Customer / Individual Dashboard */}
          <Route path="/customer" element={<DashboardLayout />}>
            <Route index element={<CustomerOverview />} />
            <Route path="identity" element={<DigitalIdentity />} />
            <Route path="credential" element={<KYCCredential />} />
            <Route path="share" element={<ShareCredential />} />
            <Route path="history" element={<CustomerHistory />} />
            <Route path="settings" element={<CustomerSettings />} />
          </Route>

          {/* Bank Issuer Dashboard */}
          <Route path="/bank/issuer" element={<DashboardLayout />}>
            <Route index element={<IssuerOverview />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="kyc/:customerId" element={<KYCVerification />} />
            <Route path="issue/:customerId" element={<IssueCredential />} />
            <Route path="credentials" element={<IssuedCredentials />} />
            <Route path="revocations" element={<RevocationsList />} />
            <Route path="activity" element={<IssuerActivity />} />
          </Route>

          {/* Bank Verifier Dashboard */}
          <Route path="/bank/verifier" element={<DashboardLayout />}>
            <Route index element={<VerifierOverview />} />
            <Route path="verify" element={<VerifyCredential />} />
            <Route path="history" element={<VerifierHistory />} />
            <Route path="tampering" element={<TamperingDemo />} />
            <Route path="issuers" element={<TrustedIssuers />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </KYCProvider>
  );
}

export default App;
