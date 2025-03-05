'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // Dynamically import the library to avoid SSR issues
    const loadQRScanner = async () => {
      try {
        // Import the library only on client side
        const Html5QrcodeScanner = (await import('html5-qrcode')).Html5QrcodeScanner;
        
        // Initialize QR Scanner
        const qrScanner = new Html5QrcodeScanner('reader', {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        });

        setScanner(qrScanner);

        qrScanner.render(
          (result) => {
            qrScanner.clear();
            setScanResult(result);
            
            try {
              // Parse the QR data
              const orderData = JSON.parse(result);
              verifyOrder(orderData);
            } catch (error) {
              toast.error('Invalid QR code format');
              resetScanner(qrScanner);
            }
          }, 
          (error) => {
            console.warn(error);
          }
        );
      } catch (error) {
        console.error("Error loading QR scanner:", error);
        toast.error("Failed to initialize QR scanner");
      }
    };

    loadQRScanner();

    // Clean up on component unmount
    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  const verifyOrder = async (orderData) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/order/verify', {
        verificationData: orderData
      });
      
      setOrderDetails(response.data.order);
      toast.success(`Order #${orderData.orderId} verified successfully!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
      resetScanner();
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setOrderDetails(null);
    
    // Re-initialize the scanner
    if (scanner) {
      scanner.clear();
      scanner.render(
        (result) => {
          scanner.clear();
          setScanResult(result);
          
          try {
            const orderData = JSON.parse(result);
            verifyOrder(orderData);
          } catch (error) {
            toast.error('Invalid QR code format');
            resetScanner();
          }
        }, 
        (error) => {
          console.warn(error);
        }
      );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Scan Order QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          {!scanResult ? (
            <div className="flex flex-col items-center">
              <div id="reader" className="w-full"></div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Position the QR code in front of the camera to verify an order
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderDetails ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800">Order Verified!</h3>
                  <p className="text-sm text-green-700">Order #{orderDetails.id}</p>
                  <p className="text-sm text-green-700">
                    Meal: {orderDetails.meal.name}
                  </p>
                  <p className="text-sm text-green-700">
                    Quantity: {orderDetails.quantity}
                  </p>
                  <p className="text-sm text-green-700">
                    Status: {orderDetails.status}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800">Verifying...</h3>
                  <p className="text-sm text-yellow-700">Please wait</p>
                </div>
              )}
              <Button 
                onClick={resetScanner} 
                className="w-full"
                disabled={loading}
              >
                Scan Another Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}