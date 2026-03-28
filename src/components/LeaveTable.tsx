import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveApi } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, ArrowUpDown, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const LEAVE_TYPES = ["SICK", "CASUAL", "EARNED", "MATERNITY", "PATERNITY"];

const statusVariant = (status: string) => {
  switch (status) {
    case "APPROVED": return "default" as const;
    case "REJECTED": return "destructive" as const;
    default: return "secondary" as const;
  }
};

const LeaveTable = () => {
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortDir, setSortDir] = useState("desc");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leaves", { search, leaveType, page, sortBy, sortDir }],
    queryFn: () => leaveApi.getAll({ search, leaveType: leaveType || undefined, page, size: 5, sortBy, sortDir }),
  });

  const deleteMutation = useMutation({
    mutationFn: leaveApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leaveAnalytics"] });
      toast.success("Leave deleted");
    },
  });

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };

  const SortButton = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-1 font-medium hover:text-foreground transition-colors">
      {children}
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <Select value={leaveType} onValueChange={(v) => { setLeaveType(v === "ALL" ? "" : v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Leave Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Leave Types</SelectItem>
            {LEAVE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead><SortButton col="employeeName">Employee</SortButton></TableHead>
              <TableHead><SortButton col="leaveType">Type</SortButton></TableHead>
              <TableHead><SortButton col="startDate">Start Date</SortButton></TableHead>
              <TableHead><SortButton col="endDate">End Date</SortButton></TableHead>
              <TableHead><SortButton col="status">Status</SortButton></TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : !data?.content.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No leave records found</TableCell></TableRow>
            ) : (
              data.content.map((leave) => (
                <TableRow key={leave.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{leave.employeeName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{leave.leaveType}</Badge>
                  </TableCell>
                  <TableCell>{leave.startDate}</TableCell>
                  <TableCell>{leave.endDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(leave.status)}>{leave.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{leave.reason || "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(leave.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.number * data.size + 1}–{Math.min((data.number + 1) * data.size, data.totalElements)} of {data.totalElements}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: data.totalPages }, (_, i) => (
              <Button key={i} variant={i === page ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setPage(i)}>
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= data.totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;
