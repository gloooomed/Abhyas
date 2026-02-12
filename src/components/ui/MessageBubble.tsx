import { memo } from 'react'

interface MessageFeedback {
  strengths: string[]
  improvements: string[]
  suggestions: string[]
}

export interface MessageBubbleProps {
  id: string
  type: 'interviewer' | 'candidate'
  content: string
  timestamp: Date
  score?: number
  feedback?: MessageFeedback
}

/**
 * Memoized chat message bubble component.
 * Prevents unnecessary re-renders when the parent component updates
 * but the message content hasn't changed.
 */
const MessageBubble = memo(function MessageBubble({
  type,
  content,
  score,
}: MessageBubbleProps) {
  const isCandidate = type === 'candidate'

  return (
    <div className={`flex ${isCandidate ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCandidate
            ? 'bg-blue-600 text-white'
            : 'bg-white border text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {score !== undefined && (
          <div className="mt-2 text-xs opacity-75">
            Score: {score}/100
          </div>
        )}
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.content === nextProps.content &&
    prevProps.score === nextProps.score &&
    prevProps.type === nextProps.type
  )
})

export default MessageBubble
