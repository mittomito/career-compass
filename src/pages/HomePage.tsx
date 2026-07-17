import { useMemo, useState } from 'react'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import CompanyCard from '../components/home/CompanyCard'
import HomeToolbar, { type SortKey, type StatusFilter, type TypeFilter } from '../components/home/HomeToolbar'
import OnboardingEmptyState from '../components/home/OnboardingEmptyState'
import TodayStrip from '../components/home/TodayStrip'
import { useCompanies } from '../hooks/useCompanies'
import { nextSchedule } from '../utils/events'

const FAR_FUTURE = 8_640_000_000_000_000 // 予定なしの企業を末尾に回すための番兵値

export default function HomePage() {
  const { companies, loading } = useCompanies()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statuses, setStatuses] = useState<StatusFilter>([])
  const [sort, setSort] = useState<SortKey>('next')

  const list = useMemo(() => {
    let result = [...companies]
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((c) =>
        `${c.name}${c.title}${c.memo}${c.industry}`.toLowerCase().includes(q),
      )
    }
    if (typeFilter !== 'all') result = result.filter((c) => c.type === typeFilter)
    if (statuses.length > 0) result = result.filter((c) => statuses.includes(c.status))

    const nextTime = (t?: { date: string }) => (t ? new Date(t.date).getTime() : FAR_FUTURE)
    if (sort === 'next') result.sort((a, b) => nextTime(nextSchedule(a)) - nextTime(nextSchedule(b)))
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
    return result
  }, [companies, query, typeFilter, statuses, sort])

  if (loading) {
    return <LoadingState label="企業データを読み込み中…" />
  }
  
  if (companies.length === 0) {
    return <OnboardingEmptyState />
  }

  return (
    <>
      <TodayStrip />
      <HomeToolbar
        query={query}
        onQuery={setQuery}
        typeFilter={typeFilter}
        onTypeFilter={setTypeFilter}
        statuses={statuses}
        onStatuses={setStatuses}
        sort={sort}
        onSort={setSort}
        resultCount={list.length}
        totalCount={companies.length}
      />
      {list.length === 0 ? (
        <EmptyState
          title="該当する企業がありません"
          description="検索条件やフィルターを変更してみてください。"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-3">
          {list.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </div>
      )}
    </>
  )
}