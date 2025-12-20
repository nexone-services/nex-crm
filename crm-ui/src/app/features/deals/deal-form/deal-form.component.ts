import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, finalize, of } from 'rxjs';
import { DealsService } from '../deals.service';
import { ContactsService } from '../../contacts/contacts.service';
import { DealStage, Contact } from '../../../shared/models';

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Edit Deal' : 'Create New Deal' }}</h1>
        <button class="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer" (click)="goBack()">
          Cancel
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium">{{ isEditMode ? 'Loading deal...' : 'Loading contacts...' }}</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-6" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <form [formGroup]="dealForm" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6" *ngIf="!loading()">
        <div class="space-y-2">
          <label for="name" class="block text-sm font-semibold text-gray-700">Deal Name *</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            [class.border-red-500]="dealForm.get('name')?.invalid && dealForm.get('name')?.touched"
            placeholder="e.g., Enterprise License Deal"
          />
          <div class="text-red-500 text-xs font-medium mt-1" *ngIf="dealForm.get('name')?.invalid && dealForm.get('name')?.touched">
            Deal name is required
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="amount" class="block text-sm font-semibold text-gray-700">Amount *</label>
            <input
              id="amount"
              type="number"
              formControlName="amount"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="dealForm.get('amount')?.invalid && dealForm.get('amount')?.touched"
              placeholder="0.00"
              step="0.01"
            />
            <div class="text-red-500 text-xs font-medium mt-1" *ngIf="dealForm.get('amount')?.invalid && dealForm.get('amount')?.touched">
              Amount is required and must be positive
            </div>
          </div>

          <div class="space-y-2">
            <label for="stage" class="block text-sm font-semibold text-gray-700">Stage *</label>
            <select
              id="stage"
              formControlName="stage"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option *ngFor="let stage of dealStages" [value]="stage">{{ stage }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <label for="contactId" class="block text-sm font-semibold text-gray-700">Contact *</label>
          <select
            id="contactId"
            formControlName="contactId"
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
            [class.border-red-500]="dealForm.get('contactId')?.invalid && dealForm.get('contactId')?.touched"
          >
            <option value="">Select a contact</option>
            <option *ngFor="let contact of contacts()" [value]="contact.id">
              {{ contact.firstName }} {{ contact.lastName }} ({{ contact.email }})
            </option>
          </select>
          <div class="text-red-500 text-xs font-medium mt-1" *ngIf="dealForm.get('contactId')?.invalid && dealForm.get('contactId')?.touched">
            Contact is required
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="button" class="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors" (click)="goBack()">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" [disabled]="dealForm.invalid || submitting()">
            {{ submitting() ? 'Saving...' : (isEditMode ? 'Update Deal' : 'Create Deal') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class DealFormComponent implements OnInit {
  dealForm: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = false;
  dealId: string | null = null;
  dealStages = Object.values(DealStage);
  contacts = signal<Contact[]>([]);

  constructor(
    private fb: FormBuilder,
    private dealsService: DealsService,
    private contactsService: ContactsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dealForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      stage: [DealStage.OPEN, Validators.required],
      contactId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.dealId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.dealId;

    this.initializeForm();
  }

  initializeForm(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const contactsReq = this.contactsService.getContacts({ page: 0, size: 1000 });
    const dealReq = this.isEditMode && this.dealId
      ? this.dealsService.getDeal(this.dealId)
      : of(null);

    forkJoin({
      contacts: contactsReq,
      deal: dealReq
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ contacts, deal }) => {
          this.contacts.set(contacts.content);
          if (deal) {
            this.dealForm.patchValue({
              name: deal.name,
              amount: deal.amount,
              stage: deal.stage,
              contactId: deal.contactId
            });
          }
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to initialize form');
        }
      });
  }


  onSubmit(): void {
    if (this.dealForm.invalid) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request = this.isEditMode && this.dealId
      ? this.dealsService.updateDeal(this.dealId, this.dealForm.value)
      : this.dealsService.createDeal(this.dealForm.value);

    request
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/deals']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to save deal');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/deals']);
  }
}
