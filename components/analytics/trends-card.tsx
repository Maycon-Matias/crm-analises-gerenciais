"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendsCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  formatValue?: (value: number) => string;
  isLoading?: boolean;
}

export function TrendsCard({
  title,
  currentValue,
  previousValue,
  formatValue = (value) => value.toLocaleString("pt-BR"),
  isLoading = false,
}: TrendsCardProps) {
  const calculateChange = () => {
    if (previousValue === 0) return { percentage: 0, isPositive: true };
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const change = calculateChange();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {formatValue(currentValue)}
            </div>
            <div className="text-sm text-gray-500">
              vs {formatValue(previousValue)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {change.percentage > 0 ? (
              change.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )
            ) : (
              <Minus className="h-4 w-4 text-gray-400" />
            )}
            <Badge
              variant={change.isPositive ? "default" : "secondary"}
              className={`${
                change.isPositive 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}
            >
              {change.isPositive ? "+" : ""}
              {change.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
