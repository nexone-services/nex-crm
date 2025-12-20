import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ContactsService } from '../contacts.service';
import { Contact } from '../../../shared/models';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Contact Details</h1>
        <button class="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer" (click)="goBack()">
          Back to Contacts
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium whitespace-nowrap overflow-hidden">Loading contact...</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-6" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 divide-y divide-gray-50" *ngIf="!loading() && contact()">
        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Name</label>
          <span class="md:col-span-2 text-lg text-gray-900 font-medium">{{ contact()?.firstName }} {{ contact()?.lastName }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email</label>
          <span class="md:col-span-2 text-gray-700">{{ contact()?.email }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
          <span class="md:col-span-2 text-gray-700">{{ contact()?.phone || '-' }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</label>
          <span class="md:col-span-2 text-gray-700">{{ contact()?.company || '-' }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Created At</label>
          <span class="md:col-span-2 text-gray-600">{{ formatDate(contact()?.createdAt || '') }}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 py-4">
          <label class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Updated At</label>
          <span class="md:col-span-2 text-gray-600">{{ formatDate(contact()?.updatedAt || '') }}</span>
        </div>
      </div>
    </div>
  `
})
export class ContactDetailsComponent implements OnInit {
  contact = signal<Contact | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private contactsService: ContactsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContact(id);
    }
  }

  loadContact(id: string): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.contactsService.getContact(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.contact.set(data);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load contact');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/contacts']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  }
}
