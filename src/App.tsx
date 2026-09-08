import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ConnectWallet } from './components/onboarding/ConnectWallet'
import { LoadingState } from './components/common/LoadingState'
import { AppShell } from './components/layout/AppShell'
import { WalletProvider, useWallet } from './context/WalletContext'
import { OnboardingPage } from './pages/OnboardingPage'
import { OverviewPage } from './pages/OverviewPage'
import { PolicyPage } from './pages/PolicyPage'
import { SettingsPage } from './pages/SettingsPage'
import { TransactionsPage } from './pages/TransactionsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
})

function AuthGate() {
  const { status } = useWallet()

  if (status === 'checking') return <LoadingState label="Checking wallet…" />
  if (status !== 'connected') return <ConnectWallet />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <AuthGate />
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  )
}
