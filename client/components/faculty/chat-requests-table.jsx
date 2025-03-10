"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Search,
  Check,
  X,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "@/lib/axios";

export default function ChatRequestsTable() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([
    { id: "createdAt", desc: true }
  ]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const searchQuery = useDebounce(searchInputValue, 500);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  // Define columns for the table
  const columns = [
    {
      accessorKey: "student.name",
      header: ({ column }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3 h-8"
          >
            <span>Student</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatarUrl} alt={student.name} />
              <AvatarFallback>
                {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{student.name}</span>
              <span className="text-xs text-muted-foreground">{student.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "student.studentInfo.studentId",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          <span>Student ID</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const studentInfo = row.original.student.studentInfo;
        return (
          <div className="flex flex-col">
            <span>{studentInfo?.studentId || "N/A"}</span>
            <span className="text-xs text-muted-foreground">
              {studentInfo?.department?.alias || ""} - {studentInfo?.batch || ""}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-3 h-8"
        >
          <span>Requested</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return format(new Date(row.original.createdAt), "MMM d, yyyy h:mm a");
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const chatId = row.original.id;
        const isProcessing = processingId === chatId;
        
        const handleApprove = async () => {
          setProcessingId(chatId);
          try {
            await axios.post(`/chat/approve/${chatId}`);
            toast.success("Chat request approved");
            fetchRequests(); // Refresh the list
          } catch (error) {
            console.error("Error approving chat request:", error);
            toast.error("Failed to approve chat request");
          } finally {
            setProcessingId(null);
          }
        };
        
        const handleReject = async () => {
          setProcessingId(chatId);
          try {
            await axios.post(`/chat/reject/${chatId}`);
            toast.success("Chat request rejected");
            fetchRequests(); // Refresh the list
          } catch (error) {
            console.error("Error rejecting chat request:", error);
            toast.error("Failed to reject chat request");
          } finally {
            setProcessingId(null);
          }
        };
        
        const handleViewProfile = () => {
          const studentId = row.original.student.id;
          router.push(`/profile/${studentId}`);
        };
        
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="h-8 gap-1"
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Check className="h-4 w-4 text-green-500" />
              )}
              <span>Approve</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={isProcessing}
              className="h-8 gap-1"
            >
              {isProcessing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span>Reject</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewProfile}>
                  View Student Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  // Fetch chat requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Convert table pagination to API pagination (0-indexed to 1-indexed)
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      
      // Get sort parameters
      const sortColumn = sorting[0]?.id || "createdAt";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";
      
      // Map column IDs to API sort fields
      const sortByMap = {
        "student.name": "studentName",
        "student.studentInfo.studentId": "studentId",
        "createdAt": "createdAt"
      };
      
      const sortBy = sortByMap[sortColumn] || "createdAt";
      
      const response = await axios.get("/chat/requests/pending", {
        params: {
          page,
          limit,
          sortBy,
          sortOrder,
          search: searchQuery
        }
      });
      
      setData(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalRequests(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching chat requests:", error);
      toast.error("Failed to load chat requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests when pagination, sorting, or search changes
  useEffect(() => {
    fetchRequests();
  }, [pagination.pageIndex, pagination.pageSize, sorting, searchQuery]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInputValue(value);
    // Reset to first page when searching
    table.setPageIndex(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchInputValue}
              onChange={handleSearch}
              className="pl-8 w-[300px]"
            />
          </div>
          
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {totalRequests} total requests
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className="py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-muted"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {searchInputValue
                    ? "No matching chat requests found"
                    : "No pending chat requests"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pagination.pageIndex + 1} of {Math.max(totalPages, 1)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || loading}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 