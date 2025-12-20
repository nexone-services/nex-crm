import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LeadsService } from '../leads.service';
import { Lead, PageResponse } from '../../../shared/models';

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Leads</h1>
        <button class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer" routerLink="/leads/new">
          + New Lead
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium whitespace-nowrap overflow-hidden">Loading leads...</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-4" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" *ngIf="!loading() && leads() && leads()?.content?.length || 0 > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-gray-700">Name</th>
                <th class="p-4 font-semibold text-gray-700">Email</th>
                <th class="p-4 font-semibold text-gray-700">Company</th>
                <th class="p-4 font-semibold text-gray-700">Phone</th>
                <th class="p-4 font-semibold text-gray-700">Status</th>
                <th class="p-4 font-semibold text-gray-700">Created</th>
                <th class="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let lead of leads()?.content" class="hover:bg-gray-50/50 transition-colors">
                <td class="p-4 text-gray-900 font-medium">{{ lead.firstName }} {{ lead.lastName }}</td>
                <td class="p-4 text-gray-600">{{ lead.email }}</td>
                <td class="p-4 text-gray-600">{{ lead.company || '-' }}</td>
                <td class="p-4 text-gray-600">{{ lead.phone || '-' }}</td>
                <td class="p-4">
                  <span class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-blue-100 text-blue-700': lead.status === 'NEW',
                      'bg-orange-100 text-orange-700': lead.status === 'CONTACTED',
                      'bg-purple-100 text-purple-700': lead.status === 'QUALIFIED',
                      'bg-green-100 text-green-700': lead.status === 'CONVERTED',
                      'bg-red-100 text-red-700': lead.status === 'LOST'
                    }">
                    {{ lead.status }}
                  </span>
                </td>
                <td class="p-4 text-gray-600">{{ formatDate(lead.createdAt) }}</td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100" (click)="editLead(lead.id)" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-100" (click)="convertLead(lead.id)" title="Convert to Contact" *ngIf="lead.status !== 'CONVERTED'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                      </svg>
                    </button>
                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100" (click)="deleteLead(lead.id)" title="Delete">
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
        <div class="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100" *ngIf="(leads()?.totalPages || 0) > 1">
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="previousPage()" [disabled]="currentPage() === 0">Previous</button>
          <span class="text-gray-600 font-medium text-sm">Page {{ currentPage() + 1 }} of {{ leads()?.totalPages }}</span>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="nextPage()" [disabled]="currentPage() >= (leads()?.totalPages || 0) - 1">Next</button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100" *ngIf="!loading() && leads() && leads()?.content?.length === 0">
        <div class="mb-6 flex justify-center text-gray-300">
           <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
        </div>
        <p class="text-xl text-gray-600 font-medium mb-6">No leads found. Create your first lead to get started!</p>
        <button class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md" routerLink="/leads/new">Create Lead</button>
      </div>
    </div>
  `
})
export class LeadsListComponent implements OnInit {
  leads = signal<PageResponse<Lead> | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);

  constructor(
    private leadsService: LeadsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadLeads();
  }

  loadLeads(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.leadsService.getLeads({
      page: this.currentPage(),
      size: this.pageSize(),
      sort: 'createdAt,desc'
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.leads.set(data);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load leads');
        }
      });
  }

  editLead(id: string): void {
    this.router.navigate(['/leads', id, 'edit']);
  }

  convertLead(id: string): void {
    if (confirm('Are you sure you want to convert this lead to a contact?')) {
      this.leadsService.convertLead(id).subscribe({
        next: () => {
          alert('Lead converted successfully!');
          this.loadLeads();
        },
        error: (error) => {
          alert('Failed to convert lead: ' + error.message);
        }
      });
    }
  }

  deleteLead(id: string): void {
    if (confirm('Are you sure you want to delete this lead?')) {
      this.leadsService.deleteLead(id).subscribe({
        next: () => {
          this.loadLeads();
        },
        error: (error) => {
          alert('Failed to delete lead: ' + error.message);
        }
      });
    }
  }

  nextPage(): void {
    const currentLeads = this.leads();
    if (currentLeads && this.currentPage() < currentLeads.totalPages - 1) {
      this.currentPage.update(p => p + 1);
      this.loadLeads();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadLeads();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
