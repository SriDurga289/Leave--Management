// API service layer - point these to your Spring Boot backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export interface LeaveRecord {
  id: number;
  employeeName: string;
  leaveType: "SICK" | "CASUAL" | "EARNED" | "MATERNITY" | "PATERNITY";
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
}

export interface LeaveFormData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface LeaveAnalytics {
  totalLeaves: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: Record<string, number>;
}

// ---- Mock data for development (remove when backend is ready) ----
const mockLeaves: LeaveRecord[] = [
  { id: 1, employeeName: "Rahul Sharma", leaveType: "SICK", startDate: "2026-03-20", endDate: "2026-03-22", status: "APPROVED", reason: "Fever" },
  { id: 2, employeeName: "Priya Patel", leaveType: "CASUAL", startDate: "2026-03-25", endDate: "2026-03-26", status: "PENDING", reason: "Personal work" },
  { id: 3, employeeName: "Amit Kumar", leaveType: "EARNED", startDate: "2026-04-01", endDate: "2026-04-05", status: "PENDING", reason: "Family vacation" },
  { id: 4, employeeName: "Sneha Reddy", leaveType: "MATERNITY", startDate: "2026-04-10", endDate: "2026-07-10", status: "APPROVED" },
  { id: 5, employeeName: "Vikram Singh", leaveType: "SICK", startDate: "2026-03-15", endDate: "2026-03-16", status: "REJECTED", reason: "No medical certificate" },
  { id: 6, employeeName: "Anita Desai", leaveType: "CASUAL", startDate: "2026-03-28", endDate: "2026-03-28", status: "PENDING", reason: "Doctor appointment" },
  { id: 7, employeeName: "Rajesh Gupta", leaveType: "EARNED", startDate: "2026-05-01", endDate: "2026-05-10", status: "APPROVED", reason: "Travel" },
  { id: 8, employeeName: "Meera Nair", leaveType: "SICK", startDate: "2026-03-10", endDate: "2026-03-12", status: "APPROVED", reason: "Surgery recovery" },
  { id: 9, employeeName: "Karan Joshi", leaveType: "PATERNITY", startDate: "2026-06-01", endDate: "2026-06-15", status: "PENDING" },
  { id: 10, employeeName: "Divya Iyer", leaveType: "CASUAL", startDate: "2026-03-30", endDate: "2026-03-31", status: "PENDING", reason: "Wedding" },
  { id: 11, employeeName: "Rahul Sharma", leaveType: "CASUAL", startDate: "2026-04-15", endDate: "2026-04-16", status: "PENDING", reason: "Festival" },
  { id: 12, employeeName: "Priya Patel", leaveType: "SICK", startDate: "2026-02-10", endDate: "2026-02-11", status: "APPROVED", reason: "Cold" },
];

let nextId = 13;

// Toggle this to use real API calls
const USE_MOCK = true;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export const leaveApi = {
  async getAll(params?: {
    page?: number;
    size?: number;
    search?: string;
    leaveType?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PaginatedResponse<LeaveRecord>> {
    if (USE_MOCK) {
      await delay(300);
      let filtered = [...mockLeaves];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter((l) => l.employeeName.toLowerCase().includes(s));
      }
      if (params?.leaveType) {
        filtered = filtered.filter((l) => l.leaveType === params.leaveType);
      }
      if (params?.sortBy) {
        const dir = params.sortDir === "desc" ? -1 : 1;
        filtered.sort((a, b) => {
          const av = a[params.sortBy as keyof LeaveRecord] ?? "";
          const bv = b[params.sortBy as keyof LeaveRecord] ?? "";
          return av > bv ? dir : av < bv ? -dir : 0;
        });
      }
      const page = params?.page ?? 0;
      const size = params?.size ?? 5;
      const start = page * size;
      return {
        content: filtered.slice(start, start + size),
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        number: page,
        size,
      };
    }
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));
    if (params?.search) query.set("search", params.search);
    if (params?.leaveType) query.set("leaveType", params.leaveType);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortDir) query.set("sortDir", params.sortDir);
    const res = await fetch(`${API_BASE}/leaves?${query}`);
    if (!res.ok) throw new Error("Failed to fetch leaves");
    return res.json();
  },

  async create(data: LeaveFormData): Promise<LeaveRecord> {
    if (USE_MOCK) {
      await delay(300);
      if (!data.employeeName || !data.leaveType || !data.startDate || !data.endDate) {
        throw new Error("All fields are required");
      }
      if (new Date(data.endDate) < new Date(data.startDate)) {
        throw new Error("End date must be after start date");
      }
      const record: LeaveRecord = {
        id: nextId++,
        employeeName: data.employeeName,
        leaveType: data.leaveType as LeaveRecord["leaveType"],
        startDate: data.startDate,
        endDate: data.endDate,
        status: "PENDING",
        reason: data.reason,
      };
      mockLeaves.unshift(record);
      return record;
    }
    const res = await fetch(`${API_BASE}/leaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || "Failed to create leave");
    }
    return res.json();
  },

  async delete(id: number): Promise<void> {
    if (USE_MOCK) {
      await delay(200);
      const idx = mockLeaves.findIndex((l) => l.id === id);
      if (idx !== -1) mockLeaves.splice(idx, 1);
      return;
    }
    const res = await fetch(`${API_BASE}/leaves/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete leave");
  },

  async getAnalytics(): Promise<LeaveAnalytics> {
    if (USE_MOCK) {
      await delay(200);
      const byType: Record<string, number> = {};
      let pending = 0, approved = 0, rejected = 0;
      mockLeaves.forEach((l) => {
        byType[l.leaveType] = (byType[l.leaveType] || 0) + 1;
        if (l.status === "PENDING") pending++;
        else if (l.status === "APPROVED") approved++;
        else rejected++;
      });
      return { totalLeaves: mockLeaves.length, pending, approved, rejected, byType };
    }
    const res = await fetch(`${API_BASE}/leaves/analytics`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  },
};
