import React, { useState } from "react";
import { Camera, Ban, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  onSuccess: (data: string) => void;
  onCancel: () => void;
  meetupId?: string;
}

const QRScanner = ({ onSuccess, onCancel, meetupId }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  
  // In a real implementation, we would use a library like 'react-qr-reader'
  // For this demo, we'll simulate scanning with a button press
  
  const handleScan = () => {
    setScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      setScanning(false);
      
      // Simulate successful scan with meetup ID if provided,
      // otherwise generate a random ID
      const scannedData = meetupId 
        ? `meetup_${meetupId}`
        : `meetup_${Math.random().toString(36).substring(2, 8)}`;
      
      toast({
        title: "QR Code Scanned",
        description: "Event check-in successful!",
      });
      
      onSuccess(scannedData);
    }, 1500);
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-6">
      <div className="relative w-full max-w-xs aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
        {scanning ? (
          <div className="animate-pulse">
            <Camera className="h-16 w-16 text-primary opacity-50" />
          </div>
        ) : (
          <Camera className="h-16 w-16 text-primary/40" />
        )}
        
        {/* Scanner overlay */}
        <div className="absolute inset-0 border-2 border-primary/30 rounded-lg" />
        <div className="absolute w-full h-1 bg-primary/30 animate-scanner" />
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Position the QR code in the center of the scanner
      </p>
      
      <div className="flex gap-3 w-full">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          <Ban className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          className="flex-1"
          onClick={handleScan}
          disabled={scanning}
        >
          <Check className="mr-2 h-4 w-4" />
          {scanning ? "Scanning..." : "Scan"}
        </Button>
      </div>
    </div>
  );
};

export default QRScanner;
