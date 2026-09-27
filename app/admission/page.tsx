"use client";

import React, { useState } from "react";
import AdmissionPage from "./Components/admissoncomponent";
import { useRouter } from "next/navigation";
import { defaultEmail } from "@/lib/data";
import { createEmail } from "@/lib/actions/blog";
import { EmailFormschemaType } from "@/lib/schema";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onHandleSubmit = async (data: EmailFormschemaType) => {
    setIsLoading(true);

    try {
      console.log("Submitting data:", data);
      // Direct call to your existing server action
      const result = await createEmail(data);
      console.log("Submission result:", result);

      if (result?.error) {
        toast.error("Error submitting form", {
          description: result.error.message || "Please check your connection.",
        });
        setIsLoading(false);
      } else {
        toast.success("Successfully submitted! 🎉", {
          description: `We'll contact you at ${data.email}`,
        });
        router.push("/thankyou");
      }
    } catch (error) {
      console.error("Submission catch error:", error);
      toast.error("Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <main>
      <AdmissionPage 
        onHandleSubmit={onHandleSubmit} 
        defaultEmail={defaultEmail} 
        isLoading={isLoading} 
      />
    </main>
  );
}