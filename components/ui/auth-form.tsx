import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AuthFormProps {
  title: string;
  description: string;
  children: React.ReactNode;
  submitText: string;
  isLoading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (e: any) => void;
  footerText?: string;
  footerLink?: {
    text: string;
    href: string;
    linkText: string;
  };
  className?: string;
}

export function AuthForm({
  title,
  description,
  children,
  submitText,
  isLoading = false,
  onSubmit,
  footerText,
  footerLink,
  className,
}: AuthFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              {children}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : submitText}
              </Button>
            </div>
            {footerText && footerLink && (
              <div className="mt-4 text-center text-sm">
                {footerText}{" "}
                <Link href={footerLink.href} className="underline underline-offset-4">
                  {footerLink.linkText}
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 