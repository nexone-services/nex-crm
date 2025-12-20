import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ContactsService } from '../contacts.service';
import { Contact, PageResponse } from '../../../shared/models';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Contacts</h1>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium whitespace-nowrap overflow-hidden">Loading contacts...</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-4" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" *ngIf="!loading() && contacts() && contacts()?.content?.length || 0 > 0">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-gray-700">Name</th>
                <th class="p-4 font-semibold text-gray-700">Email</th>
                <th class="p-4 font-semibold text-gray-700">Company</th>
                <th class="p-4 font-semibold text-gray-700">Phone</th>
                <th class="p-4 font-semibold text-gray-700">Created</th>
                <th class="p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let contact of contacts()?.content" class="hover:bg-gray-50/50 transition-colors">
                <td class="p-4 text-gray-900 font-medium">{{ contact.firstName }} {{ contact.lastName }}</td>
                <td class="p-4 text-gray-600">{{ contact.email }}</td>
                <td class="p-4 text-gray-600">{{ contact.company || '-' }}</td>
                <td class="p-4 text-gray-600">{{ contact.phone || '-' }}</td>
                <td class="p-4 text-gray-600">{{ formatDate(contact.createdAt) }}</td>
                <td class="p-4">
                  <div class="flex gap-2">
                    <button class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-100" (click)="viewContact(contact.id)" title="View Details">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </button>
                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-100" (click)="deleteContact(contact.id)" title="Delete">
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
        <div class="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-100" *ngIf="(contacts()?.totalPages || 0) > 1">
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="previousPage()" [disabled]="currentPage() === 0">Previous</button>
          <span class="text-gray-600 font-medium text-sm">Page {{ currentPage() + 1 }} of {{ contacts()?.totalPages }}</span>
          <button class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" (click)="nextPage()" [disabled]="currentPage() >= (contacts()?.totalPages || 0) - 1">Next</button>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100" *ngIf="!loading() && contacts() && contacts()?.content?.length === 0">
        <div class="mb-6 flex justify-center text-gray-300">
           <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
           </svg>
        </div>
        <p class="text-xl text-gray-600 font-medium whitespace-pre-wrap">No contacts found. Contacts are created when leads are converted.</p>
      </div>
    </div>
  `
})
export class ContactsListComponent implements OnInit {
  contacts = signal<PageResponse<Contact> | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentPage = signal(0);
  pageSize = signal(10);

  constructor(
    private contactsService: ContactsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.contactsService.getContacts({
      page: this.currentPage(),
      size: this.pageSize(),
      sort: 'createdAt,desc'
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.contacts.set(data);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load contacts');
        }
      });
  }

  viewContact(id: string): void {
    this.router.navigate(['/contacts', id]);
  }

  deleteContact(id: string): void {
    if (confirm('Are you sure you want to delete this contact?')) {
      this.contactsService.deleteContact(id).subscribe({
        next: () => {
          this.loadContacts();
        },
        error: (error) => {
          alert('Failed to delete contact: ' + error.message);
        }
      });
    }
  }

  nextPage(): void {
    const currentContacts = this.contacts();
    if (currentContacts && this.currentPage() < currentContacts.totalPages - 1) {
      this.currentPage.update(v => v + 1);
      this.loadContacts();
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update(v => v - 1);
      this.loadContacts();
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
