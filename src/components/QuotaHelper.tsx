import { AlertCircle, Clock, Zap, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QuotaHelperProps {
  onTryAgain?: () => void
}

export default function QuotaHelper({ onTryAgain }: QuotaHelperProps) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-800 flex items-center text-lg">
          <Clock className="h-5 w-5 mr-2" />
          AI Service Temporarily Limited
        </CardTitle>
        <CardDescription className="text-blue-700">
          Our AI service has reached its free usage limits. Here's what you can do:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <Zap className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Wait & Retry (Recommended)</h4>
              <p className="text-sm text-gray-600 mt-1">
                Free tier limits reset every 24 hours. Try again later today or tomorrow.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Use Demo Analysis</h4>
              <p className="text-sm text-gray-600 mt-1">
                We've provided realistic sample results below that show how our AI typically analyzes skills gaps.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-200">
            <ExternalLink className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">Get Your Own API Key</h4>
              <p className="text-sm text-gray-600 mt-1">
                Create a free Google AI Studio account for your personal usage limits.
              </p>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-1 inline-flex items-center"
              >
                Get Free API Key
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          {onTryAgain && (
            <Button 
              onClick={onTryAgain}
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <Zap className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>
        
        <div className="text-xs text-blue-600 bg-blue-100 rounded-lg p-3">
          <strong>Why this happens:</strong> We use Google's free AI service which has daily usage limits. 
          This helps us keep our platform accessible while providing high-quality AI analysis.
        </div>
      </CardContent>
    </Card>
  )
}