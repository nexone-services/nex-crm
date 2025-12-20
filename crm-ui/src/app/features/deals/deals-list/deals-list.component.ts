import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { DealsService } from '../deals.service';
import { Deal, PageResponse } from '../../../shared/models';

@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Deals</h1>
        <button class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer" routerLink="/deals/new">
          + New Deal
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium whitespace-nowrap overflow-hidden">Loading deals...</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-4" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" *ngIf="!loading() && deals() && deals()?.content?.length || 0 > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-gray-700">Deal Name</th>
                <th class="p-4 font-semibold text-gray-700">Amount</th>
                <th class="p-4 font-semibold text-gray-700">Stage</th>
                <th class="p-4 font-semibold text-gray-700">Contact</th>
                <th class="p-4 font-semibold text-gray-700">Created</th>
                <th class="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let deal of deals()?.content" class="hover:bg-gray-50/50 transition-colors">
                <td class="p-4 text-gray-900 font-medium">{{ deal.name }}</td>
                <td class="p-4 text-indigo-600 font-semibold">{{ formatCurrency(deal.amount) }}</td>
                <td class="p-4">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-blue-100 text-blue-700': deal.stage === 'OPEN',
                      'bg-green-100 text-green-700': deal.stage === 'WON',
                      'bg-red-100 text-red-700': deal.stage === 'LOST'
                    }">
                    {{ deal.stage }}
                  </span>
                </td>
                <td class="p-4 text-gray-600">{{ deal.contactName || deal.contactId }}</td>
                <td class="p-4 text-gray-600">{{ formatDate(deal.createdAt) }}</td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100" (click)="editDeal(deal.id)" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100" (click)="deleteDeal(deal.id)" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100" *ngIf="(deals()?.totalPages || 0) > 1">
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="previousPage()" [disabled]="currentPage() === 0">Previous</button>
          <span class="text-gray-600 font-medium text-sm">Page {{ currentPage() + 1 }} of {{ deals()?.totalPages }}</span>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="nextPage()" [disabled]="currentPage() >= (deals()?.totalPages || 0) - 1">Next</button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100" *ngIf="!loading() && deals() && deals()?.content?.length === 0">
        <div class="mb-6 flex justify-center text-gray-300">
           <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1a2.4 2.4 0 01.33 1.5M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1a2.4 2.4 0 01-.33-1.5M12 16v1" />
           </svg>
        </div>
        <p class="text-xl text-gray-600 font-medium mb-6">No deals found. Create your first deal to get started!</p>
        <button class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md" routerLink="/deals/new">Create Deal</button>
      </div>
    </div>
  `
})
export class DealsListComponent implements OnInit {
  deals = signal<PageResponse<Deal> | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);

  constructor(
    private dealsService: DealsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDeals();
  }

  loadDeals(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.dealsService.getDeals({
      page: this.currentPage(),
      size: this.pageSize(),
      sort: 'createdAt,desc'
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.deals.set(data);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load deals');
        }
      });
  }

  editDeal(id: string): void {
    this.router.navigate(['/deals', id, 'edit']);
  }

  deleteDeal(id: string): void {
    if (confirm('Are you sure you want to delete this deal?')) {
      this.dealsService.deleteDeal(id).subscribe({
        next: () => {
          this.loadDeals();
        },
        error: (error) => {
          alert('Failed to delete deal: ' + error.message);
        }
      });
    }
  }

  nextPage(): void {
    const currentDeals = this.deals();
    if (currentDeals && this.currentPage() < currentDeals.totalPages - 1) {
      this.currentPage.update(v => v + 1);
      this.loadDeals();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(v => v - 1);
      this.loadDeals();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
}
