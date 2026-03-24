"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { TemplatesGallery } from "../components/TemplatesGallery";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

export default function TemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  return (
    <div className="w-full flex flex-col min-h-screen space-y-8 antialiased max-w-7xl mx-auto py-6">

      <TemplatesGallery companyId={companyId} />
    </div>
  );
}
