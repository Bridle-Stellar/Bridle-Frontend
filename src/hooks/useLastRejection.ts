import { useTransactions } from './useTransactions'

/** Most recent rejected transaction, if any — surfaced prominently on Overview per the brief: "a blocked spend the owner doesn't know about is a support problem waiting to happen." */
export function useLastRejection() {
  const query = useTransactions({ status: 'rejected', limit: 1 })
  return {
    ...query,
    data: query.data?.items[0] ?? null,
  }
}
