"use client";
import React, { useState } from "react"; // 1. Import useState
import { useRouter } from "next/navigation";
import { defaultFranchise } from "@/lib/data";
import { createFranchise } from "@/lib/actions/blog";
import { FranchiseFormSchemaType } from "@/lib/schema";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { toast } from "sonner";
import FranchisePage from "@/components/FranchisePage";
export default function Page() {
  const router = useRouter();
  
  // 2. Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Regular expression for validating email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onHandleSubmit = async (data: FranchiseFormSchemaType) => {
    // 3. Start loading
    setIsLoading(true);

    // Validate email format before sending data
    if (!emailRegex.test(data.email)) {
      toast("email verification failed", {
        description: "Please enter a valid email address.",
        action: {
          label: "Try Again",
          onClick: () => {
            router.push("/"); 
          },
        },
      });
      setIsLoading(false); // Stop loading if validation fails
      return; 
    }

    try {
      const result = await createFranchise(data);

      console.log("Admission query  submission result:", result);
      if (!result) {
        throw new Error("No response received from server.");
      }

      const parsedResult = result as PostgrestSingleResponse<null>;
      console.log(parsedResult);
      const { error } = parsedResult;

      if (error?.message) {
        toast("Error submitting form ", {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{error.message}</code>
            </pre>
          ),
        });
        setIsLoading(false); // Stop loading on API error
      } else {
        toast("successfully added the email 🎉", {
          description: data.email,
        });
        router.push("/thankyou");
        // Note: We leave isLoading as true here to prevent double-clicks 
        // while the page redirects.
      }
    } catch (error) {
      console.error("Error occurred while handling submit:", error);
      toast("Error submitting email", {
        description:
          "An error occurred while submitting your data. Please try again.",
      });
      setIsLoading(false); // Stop loading on catch error
    }
  };

  return (
    <div className="bg-neutral-950">
      < FranchisePage onHandleSubmit={onHandleSubmit} 
                defaultFranchise={defaultFranchise} 
                isLoading={isLoading} />
    </div>
  );
}