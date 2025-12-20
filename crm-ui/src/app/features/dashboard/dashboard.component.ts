import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { DashboardStats } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium whitespace-nowrap overflow-hidden">Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-4" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" *ngIf="!loading() && stats()">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Leads</h3>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.totalLeads }}</p>
          <p class="text-xs text-gray-500 mt-2">All leads in your pipeline</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Open Deals</h3>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.openDeals }}</p>
          <p class="text-xs text-gray-500 mt-2">Active deals in progress</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Won Deals</h3>
          <p class="text-3xl font-bold text-gray-900">{{ stats()?.wonDeals }}</p>
          <p class="text-xs text-gray-500 mt-2">Successfully closed deals</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ formatCurrency(stats()?.totalRevenue || 0) }}</p>
          <p class="text-xs text-gray-500 mt-2">Revenue from won deals</p>
        </div>
      </div>

      <div *ngIf="!loading()">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button class="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:bg-indigo-600 hover:text-white group transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer" routerLink="/leads/new">
            <svg class="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="font-semibold text-gray-700 group-hover:text-white transition-colors">Create Lead</span>
          </button>

          <button class="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:bg-indigo-600 hover:text-white group transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer" routerLink="/deals/new">
            <svg class="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="font-semibold text-gray-700 group-hover:text-white transition-colors">Create Deal</span>
          </button>

          <button class="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:bg-indigo-600 hover:text-white group transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer" routerLink="/leads">
            <svg class="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span class="font-semibold text-gray-700 group-hover:text-white transition-colors">View All Leads</span>
          </button>

          <button class="flex flex-col items-center gap-3 p-6 bg-white border border-gray-200 rounded-xl hover:bg-indigo-600 hover:text-white group transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer" routerLink="/contacts">
            <svg class="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="font-semibold text-gray-700 group-hover:text-white transition-colors">View Contacts</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.dashboardService.getDashboardStats()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (stats) => {
          this.stats.set(stats);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load dashboard stats');
        }
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
}
