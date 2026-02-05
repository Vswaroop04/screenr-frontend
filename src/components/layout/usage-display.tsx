'use client'

import { useEffect, useState } from 'react'
import { usageAPI, type UsageStatus } from '@/lib/screening-api'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Briefcase, FileText, Sparkles, Zap, Mail, MessageSquare } from 'lucide-react'

interface UsageDisplayProps {
  role: 'recruiter' | 'candidate'
}

export function UsageDisplay({ role }: UsageDisplayProps) {
  const [usage, setUsage] = useState<UsageStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  useEffect(() => {
    async function fetchUsage() {
      try {
        const data = await usageAPI.getUsageStatus()
        setUsage(data)
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return (
      <div className="px-3 py-4 border-t">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-2 bg-muted rounded"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!usage) return null

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'secondary'
      case 'pro':
        return 'default'
      case 'enterprise':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Unlimited' : limit.toString()
  }

  const calculateProgress = (used: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const getProgressColor = (used: number, limit: number) => {
    if (limit === -1) return 'bg-green-500'
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-primary'
  }

  return (
    <>
    <div className="px-3 py-4 border-t space-y-4">
      {/* Plan Badge with Upgrade Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Plan
          </span>
          <Badge variant={getPlanBadgeVariant(usage.planType)} className="capitalize">
            {usage.planType}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowUpgradeDialog(true)}
        >
          <Zap className="h-3 w-3 mr-1" />
          Upgrade Plan
        </Button>
      </div>

      {role === 'recruiter' ? (
        <>
          {/* Active Jobs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Active Jobs</span>
              </div>
              <span className="font-medium">
                {usage.activeJobsCount} / {formatLimit(usage.activeJobsLimit)}
              </span>
            </div>
            {usage.activeJobsLimit !== -1 && (
              <Progress
                value={calculateProgress(usage.activeJobsCount, usage.activeJobsLimit)}
                className="h-1.5"
              />
            )}
          </div>

          {/* Resumes This Month */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>Resumes</span>
              </div>
              <span className="font-medium">
                {usage.resumesUsedThisMonth} / {formatLimit(usage.resumesLimitThisMonth)}
              </span>
            </div>
            {usage.resumesLimitThisMonth !== -1 && (
              <Progress
                value={calculateProgress(usage.resumesUsedThisMonth, usage.resumesLimitThisMonth)}
                className="h-1.5"
              />
            )}
            {usage.resumesLimitThisMonth !== -1 && (
              <p className="text-xs text-muted-foreground">
                {usage.resumesRemaining} remaining this month
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Analyses This Month */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyses</span>
              </div>
              <span className="font-medium">
                {usage.analysesUsedThisMonth} / {formatLimit(usage.analysesLimitThisMonth)}
              </span>
            </div>
            {usage.analysesLimitThisMonth !== -1 && (
              <Progress
                value={calculateProgress(usage.analysesUsedThisMonth, usage.analysesLimitThisMonth)}
                className="h-1.5"
              />
            )}
            {usage.analysesLimitThisMonth !== -1 && (
              <p className="text-xs text-muted-foreground">
                {usage.analysesRemaining} remaining this month
              </p>
            )}
          </div>
        </>
      )}
    </div>

    {/* Upgrade Dialog */}
    <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            Get more out of Screenr with a premium plan. Contact us to discuss your needs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm">Premium Features Include:</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Unlimited resume uploads
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Unlimited active jobs
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Advanced analytics & insights
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Priority support
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Team collaboration features
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => window.location.href = 'mailto:product@screenr.co?subject=Upgrade%20Inquiry'}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Us via Email
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            We'll get back to you within 24 hours
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
