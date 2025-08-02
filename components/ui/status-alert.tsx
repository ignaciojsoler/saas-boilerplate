import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { STATUS_MESSAGES } from "@/lib/constants";

interface StatusAlertProps {
  status: 'success' | 'error' | 'pending' | null;
  customMessages?: {
    success?: string;
    error?: string;
    pending?: string;
  };
}

export function StatusAlert({ status, customMessages }: StatusAlertProps) {
  if (!status) return null;

  const messages = {
    success: customMessages?.success || STATUS_MESSAGES.SUCCESS,
    error: customMessages?.error || STATUS_MESSAGES.ERROR,
    pending: customMessages?.pending || STATUS_MESSAGES.PENDING,
  };

  const alertConfig = {
    success: {
      className: "border-green-200 bg-green-50",
      icon: CheckCircle,
      iconClassName: "text-green-600",
      descriptionClassName: "text-green-800",
    },
    error: {
      className: "border-red-200 bg-red-50",
      icon: XCircle,
      iconClassName: "text-red-600",
      descriptionClassName: "text-red-800",
    },
    pending: {
      className: "border-yellow-200 bg-yellow-50",
      icon: AlertCircle,
      iconClassName: "text-yellow-600",
      descriptionClassName: "text-yellow-800",
    },
  };

  const config = alertConfig[status];
  const Icon = config.icon;

  return (
    <Alert className={config.className}>
      <Icon className={`h-4 w-4 ${config.iconClassName}`} />
      <AlertDescription className={config.descriptionClassName}>
        {messages[status]}
      </AlertDescription>
    </Alert>
  );
} 