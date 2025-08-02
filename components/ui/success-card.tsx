import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessCardProps {
  title: string;
  description: string;
  message: string;
}

export function SuccessCard({ title, description, message }: SuccessCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
} 