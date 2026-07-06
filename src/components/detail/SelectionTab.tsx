import type { Company } from '../../types'
import FlowEditor from './FlowEditor'
import InternshipPeriodsSection from './InternshipPeriodsSection'
import ScheduleSection from './ScheduleSection'

export default function SelectionTab({ company }: { company: Company }) {
  return (
    <>
      <FlowEditor company={company} />
      {company.type === 'インターン' && <InternshipPeriodsSection company={company} />}
      <ScheduleSection company={company} />
    </>
  )
}