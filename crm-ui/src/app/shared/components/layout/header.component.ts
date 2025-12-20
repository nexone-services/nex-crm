import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-[1600px] mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-2">
            <div class="bg-white p-1.5 rounded-lg">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 class="text-xl font-extrabold tracking-tight">CRM SaaS</h1>
          </div>
          
          <nav class="hidden lg:flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-white/10" class="px-4 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors">Dashboard</a>
            <a routerLink="/leads" routerLinkActive="bg-white/10" class="px-4 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors">Leads</a>
            <a routerLink="/contacts" routerLinkActive="bg-white/10" class="px-4 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors">Contacts</a>
            <a routerLink="/deals" routerLinkActive="bg-white/10" class="px-4 py-2 rounded-lg font-medium hover:bg-white/5 transition-colors">Deals</a>
          </nav>
        </div>

        <div class="flex items-center gap-6">
          <div class="hidden sm:flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm border-2 border-indigo-400">
              {{ (currentUser$ | async)?.username?.substring(0, 1)?.toUpperCase() || 'U' }}
            </div>
            <span class="font-medium text-sm">{{ (currentUser$ | async)?.username }}</span>
          </div>
          <button (click)="logout()" class="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-semibold transition-all cursor-pointer">
            Logout
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
  }
}
