import React, { ReactNode, useState } from "react";


export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}