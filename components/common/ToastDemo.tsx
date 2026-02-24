'use client'

import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

export function ToastDemo() {
  const { toast } = useToast()

  const handleClick = () => {
    toast({
      title: 'Action Successful',
      description: 'Your transaction was completed.',
    })
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      Show Toast
    </Button>
  )
}
