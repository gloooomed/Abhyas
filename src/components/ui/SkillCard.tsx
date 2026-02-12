import { memo } from 'react'
import { CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

export type SkillType = 'missing' | 'improve' | 'strong'

export interface SkillCardProps {
  skill: string
  type: SkillType
  index?: number
}

const typeConfig = {
  missing: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
    iconColor: 'text-red-500',
  },
  improve: {
    icon: TrendingUp,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    dotColor: 'bg-yellow-500',
    iconColor: 'text-yellow-500',
  },
  strong: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
    iconColor: 'text-green-500',
  },
} as const

/**
 * Memoized skill card component for displaying individual skills.
 * Used in SkillsGapAnalysis to prevent unnecessary re-renders
 * when the skill list is updated.
 */
const SkillCard = memo(function SkillCard({
  skill,
  type,
}: SkillCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <li className={`flex items-center text-sm p-2 ${config.bgColor} rounded-lg`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full mr-3 flex-shrink-0`} />
      <span className={`font-medium ${config.textColor} flex-1`}>{skill}</span>
      <Icon className={`h-4 w-4 ${config.iconColor} flex-shrink-0`} />
    </li>
  )
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if skill or type changes
  return prevProps.skill === nextProps.skill && prevProps.type === nextProps.type
})

export default SkillCard
