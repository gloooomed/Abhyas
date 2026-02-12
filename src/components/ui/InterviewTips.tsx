import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { Lightbulb } from 'lucide-react'

interface InterviewTipsProps {
  tips?: string[]
}

const defaultTips = [
  'Use the STAR method (Situation, Task, Action, Result)',
  'Provide specific examples from your experience',
  'Ask clarifying questions if needed',
  'Take your time to think before responding',
  'Maintain a professional and confident tone',
]

/**
 * Memoized interview tips component.
 * Displays helpful tips during mock interviews.
 * Since tips rarely change, memoization prevents unnecessary re-renders.
 */
const InterviewTips = memo(function InterviewTips({
  tips = defaultTips,
}: InterviewTipsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          Interview Tips
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 space-y-2">
        {tips.map((tip, index) => (
          <p key={index}>• {tip}</p>
        ))}
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Only re-render if tips array reference or content changes
  if (prevProps.tips === nextProps.tips) return true
  if (!prevProps.tips || !nextProps.tips) return false
  if (prevProps.tips.length !== nextProps.tips.length) return false
  return prevProps.tips.every((tip, i) => tip === nextProps.tips?.[i])
})

export default InterviewTips
