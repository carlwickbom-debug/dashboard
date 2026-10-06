import { useCallback, useEffect, useState } from 'react'
import type { DashboardDataProvider } from '../data/models'

export function useDashboardData<T>(provider: DashboardDataProvider<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await provider.load())
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Data source unavailable')
    } finally {
      setLoading(false)
    }
  }, [provider])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      setData(await provider.refresh())
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Data refresh failed')
    } finally {
      setRefreshing(false)
    }
  }, [provider])

  useEffect(() => {
    void load()
  }, [load])

  return { data, loading, error, refreshing, refresh }
}
