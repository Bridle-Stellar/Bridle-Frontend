import { useMemo, useState } from 'react'
import { ErrorState } from '../components/common/ErrorState'
import { LoadingState } from '../components/common/LoadingState'
import { SpendOverTimeChart } from '../components/transactions/SpendOverTimeChart'
import { TransactionFilters, type FilterState } from '../components/transactions/TransactionFilters'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { useStats } from '../hooks/useStats'
import { useTransactions } from '../hooks/useTransactions'

const PAGE_SIZE = 20

export function TransactionsPage() {
  const [filters, setFilters] = useState<FilterState>({})
  const [offset, setOffset] = useState(0)

  const params = useMemo(() => ({ ...filters, limit: PAGE_SIZE, offset }), [filters, offset])
  const transactions = useTransactions(params)
  const stats = useStats({ start_date: filters.start_date, end_date: filters.end_date, bucket: 'day' })

  function handleFiltersChange(next: FilterState) {
    setFilters(next)
    setOffset(0)
  }

  const token = transactions.data?.items[0]?.token ?? 'native'

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-ink">Transaction history</h1>

      {stats.isLoading ? (
        <LoadingState label="Loading chart…" />
      ) : stats.isError ? (
        <ErrorState message="Couldn't load the spend chart." onRetry={() => stats.refetch()} />
      ) : (
        stats.data && <SpendOverTimeChart buckets={stats.data.over_time} token={token} />
      )}

      <TransactionFilters value={filters} onChange={handleFiltersChange} />

      {transactions.isLoading ? (
        <LoadingState label="Loading transactions…" />
      ) : transactions.isError ? (
        <ErrorState message={transactions.error instanceof Error ? transactions.error.message : undefined} onRetry={() => transactions.refetch()} />
      ) : (
        transactions.data && <TransactionTable page={transactions.data} onPageChange={setOffset} />
      )}
    </div>
  )
}
