// User and Authentication Models
export interface User {
    id: string;
    username: string;
    email: string;
    roles: string[];
    tenantId: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    email: string;
    roles: string[];
    tenantId: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    organizationName: string;
}

// Lead Models
export enum LeadStatus {
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    QUALIFIED = 'QUALIFIED',
    CONVERTED = 'CONVERTED',
    LOST = 'LOST'
}

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    status: LeadStatus;
    assignedToId?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeadRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    status: LeadStatus;
}

// Contact Models
export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ContactRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
}

// Deal Models
export enum DealStage {
    OPEN = 'OPEN',
    WON = 'WON',
    LOST = 'LOST'
}

export interface Deal {
    id: string;
    name: string;
    amount: number;
    stage: DealStage;
    contactId: string;
    contactName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DealRequest {
    name: string;
    amount: number;
    stage: DealStage;
    contactId: string;
}

// Pagination Models
export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface PageRequest {
    page: number;
    size: number;
    sort?: string;
}

// Dashboard Models
export interface DashboardStats {
    totalLeads: number;
    openDeals: number;
    wonDeals: number;
    totalRevenue: number;
}

export interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
}
