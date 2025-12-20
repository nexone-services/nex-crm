import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { LeadsService } from '../leads.service';
import { LeadStatus } from '../../../shared/models';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode ? 'Edit Lead' : 'Create New Lead' }}</h1>
        <button class="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors cursor-pointer" (click)="goBack()">
          Cancel
        </button>
      </div>

      <!-- Loading State -->
      <div class="flex flex-col items-center justify-center p-12" *ngIf="loading()">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="mt-4 text-gray-500 font-medium">{{ isEditMode ? 'Loading lead...' : '' }}</p>
      </div>

      <!-- Error State -->
      <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 my-6" *ngIf="errorMessage()">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <span class="font-medium">{{ errorMessage() }}</span>
      </div>

      <form [formGroup]="leadForm" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6" *ngIf="!loading()">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="firstName" class="block text-sm font-semibold text-gray-700">First Name *</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="leadForm.get('firstName')?.invalid && leadForm.get('firstName')?.touched"
            />
            <div class="text-red-500 text-xs font-medium mt-1" *ngIf="leadForm.get('firstName')?.invalid && leadForm.get('firstName')?.touched">
              First name is required
            </div>
          </div>

          <div class="space-y-2">
            <label for="lastName" class="block text-sm font-semibold text-gray-700">Last Name *</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="leadForm.get('lastName')?.invalid && leadForm.get('lastName')?.touched"
            />
            <div class="text-red-500 text-xs font-medium mt-1" *ngIf="leadForm.get('lastName')?.invalid && leadForm.get('lastName')?.touched">
              Last name is required
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="email" class="block text-sm font-semibold text-gray-700">Email *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="leadForm.get('email')?.invalid && leadForm.get('email')?.touched"
            />
            <div class="text-red-500 text-xs font-medium mt-1" *ngIf="leadForm.get('email')?.invalid && leadForm.get('email')?.touched">
              Valid email is required
            </div>
          </div>

          <div class="space-y-2">
            <label for="phone" class="block text-sm font-semibold text-gray-700">Phone</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="company" class="block text-sm font-semibold text-gray-700">Company</label>
            <input
              id="company"
              type="text"
              formControlName="company"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div class="space-y-2">
            <label for="status" class="block text-sm font-semibold text-gray-700">Status *</label>
            <select
              id="status"
              formControlName="status"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
            >
              <option *ngFor="let status of leadStatuses" [value]="status">{{ status }}</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
          <button type="button" class="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors" (click)="goBack()">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" [disabled]="leadForm.invalid || submitting()">
            {{ submitting() ? 'Saving...' : (isEditMode ? 'Update Lead' : 'Create Lead') }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class LeadFormComponent implements OnInit {
  leadForm: FormGroup;
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  isEditMode = false;
  leadId: string | null = null;
  leadStatuses = Object.values(LeadStatus);

  constructor(
    private fb: FormBuilder,
    private leadsService: LeadsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.leadForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      status: [LeadStatus.NEW, Validators.required]
    });
  }

  ngOnInit(): void {
    this.leadId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.leadId;

    if (this.isEditMode && this.leadId) {
      this.loadLead(this.leadId);
    }
  }

  loadLead(id: string): void {
    this.loading.set(true);
    this.leadsService.getLead(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (lead) => {
          this.leadForm.patchValue({
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email,
            phone: lead.phone || '',
            company: lead.company || '',
            status: lead.status
          });
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to load lead');
        }
      });
  }

  onSubmit(): void {
    if (this.leadForm.invalid) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request = this.isEditMode && this.leadId
      ? this.leadsService.updateLead(this.leadId, this.leadForm.value)
      : this.leadsService.createLead(this.leadForm.value);

    request
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/leads']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to save lead');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/leads']);
  }
}
