'use client';

import { useState } from 'react';
import QRScanner from '@/components/QRScanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

export default function VerifyOrdersPage() {
  const [manualCode, setManualCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const handleManualVerify = async () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a verification code');
      return;
    }
    
    setVerifying(true);
    try {
      const response = await axios.post('/order/verify', {
        verificationData: manualCode.trim()
      });
      toast.success(`Order verified successfully!`);
      setManualCode(''); // Reset input
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Order Verification</h1>
      
      <Tabs defaultValue="scanner" className="max-w-md mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner">
          <QRScanner />
        </TabsContent>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Verification</CardTitle>
              <CardDescription>
                Enter the order verification code manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <Input
                  placeholder="Enter verification code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <Button 
                  onClick={handleManualVerify}
                  disabled={verifying || !manualCode.trim()}
                >
                  {verifying ? 'Verifying...' : 'Verify Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}