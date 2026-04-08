import * as React from "react";
import { cn } from "@/lib/utils";

export const AvaxIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cn("text-[#E84142]", className)}
    {...props}
  >
    <path d="M11.99,0.36,6.34,11.65l-1.9,3.5H9.61l2.38-4.38,2.38,4.38h5.17l-1.9-3.5Z" />
    <path d="M4.44,15.15,9.61,6.05l-2.3-4.22L2.5,11.65Z" />
    <path d="M14.39,6.05,19.56,15.15,22.4,10.05,16.69,1.83Z" />
    <path d="M9.61,16.85l2.38,4.38,2.38-4.38-2.38-4.38Z" />
  </svg>
);
