'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Service {
  id: string
  name: string
  logo: string
  url: string
  displayName: string
}

const services: Service[] = [
  {
    id: 'carinfo',
    name: 'RC Details',
    displayName: 'CarInfo',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%281%29-eJ1JVt8gE03F4eqaGScH5Y84cQ9ASj.png',
    url: 'https://www.carinfo.app/rc-search',
  },
  {
    id: 'traffic',
    name: 'Bangalore Traffic Challan',
    displayName: 'Traffic Police',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%282%29-vyAATSgnq4JAC3FrAjIPix4aaMqAZn.png',
    url: 'https://kspapp.ksp.gov.in/ksp/api/traffic-challan',
  },
  {
    id: 'dl-status',
    name: 'Driving License Status',
    displayName: 'Parivahan Seva',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%284%29-Aq1FEohKWoYnBhUs025NwXfAkPBIc0.png',
    url: 'https://parivahan.gov.in/rcdlstatus/?pur_cd=101',
  },
  {
    id: 'challan',
    name: 'Parivahan Challan',
    displayName: 'Parivahan Seva',
    logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-removebg-preview%20%284%29-Aq1FEohKWoYnBhUs025NwXfAkPBIc0.png',
    url: 'https://echallan.parivahan.gov.in/index/accused-challan',
  },
]

interface InAppBrowserProps {
  url: string
  onClose: () => void
}

function InAppBrowser({ url, onClose }: InAppBrowserProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="w-full bg-white rounded-t-2xl h-full flex flex-col max-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0">
          <h2 className="text-sm font-medium text-foreground truncate flex-1 mr-4">External Service</h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close browser"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>
        
        {/* Browser */}
        <iframe
          src={url}
          className="flex-1 w-full border-0"
          title="External Service"
          allow="geolocation; microphone; camera"
        />
      </div>
    </div>
  )
}

export function ProductsPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showBrowser, setShowBrowser] = useState(false)
  const [confirmService, setConfirmService] = useState<Service | null>(null)

  const handleServiceClick = (service: Service) => {
    setConfirmService(service)
  }

  const handleConfirm = () => {
    if (confirmService) {
      setSelectedService(confirmService)
      setShowBrowser(true)
      setConfirmService(null)
    }
  }

  const handleClose = () => {
    setShowBrowser(false)
    setSelectedService(null)
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Access external services</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:bg-secondary transition-colors active:scale-95"
              aria-label={service.displayName}
            >
              <img
                src={service.logo}
                alt={service.displayName}
                className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
              />
              <span className="text-xs md:text-sm font-medium text-center text-foreground">
                {service.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-4 py-6 text-center border-t border-border mt-8">
        <p className="text-xs text-muted-foreground">
          These are third-party websites and are not affiliated with AutoTrackPro. More services will be added soon.
        </p>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmService} onOpenChange={() => setConfirmService(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Redirect to External Service</AlertDialogTitle>
          <AlertDialogDescription>
            You are being redirected to {confirmService?.displayName || 'a third-party website'}. This page will open inside AutoTrackPro.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Continue</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* In-App Browser */}
      {showBrowser && selectedService && (
        <InAppBrowser url={selectedService.url} onClose={handleClose} />
      )}
    </div>
  )
}
