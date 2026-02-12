import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface InterviewProgressProps {
  currentQuestionIndex: number
  totalQuestions: number
}

/**
 * Memoized interview progress component.
 * Displays the progress bar and question count during mock interviews.
 * Prevents unnecessary re-renders when other interview state changes.
 */
const InterviewProgress = memo(function InterviewProgress({
  currentQuestionIndex,
  totalQuestions,
}: InterviewProgressProps) {
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Interview Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Questions</span>
            <span>
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Only re-render if question index or total changes
  return (
    prevProps.currentQuestionIndex === nextProps.currentQuestionIndex &&
    prevProps.totalQuestions === nextProps.totalQuestions
  )
})

export default InterviewProgress
