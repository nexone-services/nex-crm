import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-indigo-600 p-6">
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-8">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-2">
            <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">CRM SaaS</h1>
          <p class="text-gray-500 font-medium">Create your account</p>
        </div>

        <!-- Error State -->
        <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" *ngIf="errorMessage">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm font-semibold">{{ errorMessage }}</span>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div class="space-y-1.5">
            <label for="username" class="block text-sm font-semibold text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched"
              placeholder="Enter your username"
            />
            <div class="text-red-500 text-xs font-medium" *ngIf="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
              Username is required
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="email" class="block text-sm font-semibold text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="email@example.com"
            />
            <div class="text-red-500 text-xs font-medium" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Valid email is required
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="password" class="block text-sm font-semibold text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              placeholder="Min 6 characters"
            />
            <div class="text-red-500 text-xs font-medium" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Password must be at least 6 characters
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="organizationName" class="block text-sm font-semibold text-gray-700">Organization Name</label>
            <input
              id="organizationName"
              type="text"
              formControlName="organizationName"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              [class.border-red-500]="registerForm.get('organizationName')?.invalid && registerForm.get('organizationName')?.touched"
              placeholder="Your organization"
            />
            <div class="text-red-500 text-xs font-medium" *ngIf="registerForm.get('organizationName')?.invalid && registerForm.get('organizationName')?.touched">
              Organization name is required
            </div>
          </div>

          <button type="submit" 
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2 cursor-pointer" 
            [disabled]="loading || registerForm.invalid">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="text-center pt-2">
          <p class="text-gray-500 text-sm font-medium">
            Already have an account? 
            <a routerLink="/login" class="text-indigo-600 hover:text-indigo-700 font-bold ml-1 transition-colors">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      organizationName: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.register(this.registerForm.value)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
        }
      });
  }
}
