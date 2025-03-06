'use client';

import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import { Card } from './ui/card';

export default function QRScanner({ onSuccess, onError }) {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Create and render the QR scanner
    const scanner = new Html5QrcodeScanner(
      'reader', 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    
    const success = async (decodedText) => {
      // Stop scanning
      scanner.clear();
      setScanResult(decodedText);
      setIsScanning(false);
      
      try {
        console.log('QR code scanned:', decodedText);
        
        // Parse QR data
        let verificationCode;
        try {
          const qrData = JSON.parse(decodedText);
          verificationCode = qrData.verificationCode;
          console.log('Extracted verification code:', verificationCode);
        } catch (err) {
          console.error('Failed to parse QR data:', err);
          verificationCode = decodedText; // Use raw text as fallback
        }
        
        // Submit verification code to server - Make sure this matches your API route
        const response = await axios.post('/order/verify', {
          verificationData: verificationCode
        });
        
        console.log('Verification API response:', response.data);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          toast.success('Order verified successfully!');
        }
      } catch (error) {
        console.error('QR verification error:', error);
        
        // Call error callback
        if (onError) {
          onError(error);
        } else {
          toast.error(error.response?.data?.message || 'Failed to verify order');
        }
      }
    };
    
    const error = (err) => {
      console.warn(`QR Scanner error: ${err}`);
    };

    // Start scanning
    if (isScanning) {
      scanner.render(success, error);
    }

    // Cleanup on unmount
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (err) {
          console.error('Error clearing scanner:', err);
        }
      }
    };
  }, [onSuccess, onError, isScanning]);

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(true);
    window.location.reload(); // Simple way to restart the scanner
  };

  return (
    <Card className="p-4">
      {isScanning ? (
        <>
          <div className="mb-4 text-center text-sm text-muted-foreground">
            Position the QR code within the scanner area
          </div>
          <div id="reader" className="mx-auto"></div>
        </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Verification in progress...</p>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Scan Another Code
          </button>
        </div>
      )}
    </Card>
  );
}