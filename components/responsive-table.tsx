"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";

interface ResponsiveTableProps {
  headers: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  renderMobileCard?: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export function ResponsiveTable({
  headers,
  data,
  renderRow,
  renderMobileCard,
  className = "",
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const defaultMobileCard = (item: any, index: number) => (
    <Card key={index} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Cliente #{index + 1}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRow(index)}
          >
            {expandedRows.has(index) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {expandedRows.has(index) && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="font-medium capitalize">{key}:</span>
                <span className="text-muted-foreground">{String(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => renderRow(item, index))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.map((item, index) =>
          renderMobileCard ? renderMobileCard(item, index) : defaultMobileCard(item, index)
        )}
      </div>
    </div>
  );
} 