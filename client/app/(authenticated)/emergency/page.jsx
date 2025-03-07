"use client";

import { EmergencyAlert } from "@/components/emergency-alert";
import { Protected } from "@/components/ui/protected";

export default function EmergencyPage() {
  return (
    <Protected>
      <EmergencyAlert />
    </Protected>
  );
}