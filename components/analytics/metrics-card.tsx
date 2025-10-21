"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  description?: string;
}

export function MetricsCard({
  title,
  value,
  icon: Icon,
  change,
  isLoading = false,
  variant = "default",
  description,
}: MetricsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "danger":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 ${getVariantStyles()}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={`h-4 w-4 ${getIconColor()}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            )}
          </div>
          {change && (
            <Badge
              variant={change.isPositive ? "default" : "secondary"}
              className={`${
                change.isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {change.isPositive ? "+" : ""}
              {change.value.toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
