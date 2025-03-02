"use client";

import React, { useRef, useEffect, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { FormMessage } from './form';

export function CaptchaField({ onVerify, onExpire, error }) {
  const captchaRef = useRef(null);
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    // Get the site key from environment variables
    setSiteKey(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);
  }, []);

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-center py-2">
        {siteKey && (
          <HCaptcha
            ref={captchaRef}
            sitekey={siteKey}
            onVerify={onVerify}
            onExpire={onExpire || (() => onVerify(null))}
            size="normal"
          />
        )}
      </div>
      {error && <FormMessage>{error}</FormMessage>}
    </div>
  );
} 