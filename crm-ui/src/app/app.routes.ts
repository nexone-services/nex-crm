import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/components/layout/main-layout.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'leads',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/leads/leads-list/leads-list.component').then(m => m.LeadsListComponent)
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./features/leads/lead-form/lead-form.component').then(m => m.LeadFormComponent)
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () => import('./features/leads/lead-form/lead-form.component').then(m => m.LeadFormComponent)
                    }
                ]
            },
            {
                path: 'contacts',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/contacts/contacts-list/contacts-list.component').then(m => m.ContactsListComponent)
                    },
                    {
                        path: ':id',
                        loadComponent: () => import('./features/contacts/contact-details/contact-details.component').then(m => m.ContactDetailsComponent)
                    }
                ]
            },
            {
                path: 'deals',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('./features/deals/deals-list/deals-list.component').then(m => m.DealsListComponent)
                    },
                    {
                        path: 'new',
                        loadComponent: () => import('./features/deals/deal-form/deal-form.component').then(m => m.DealFormComponent)
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () => import('./features/deals/deal-form/deal-form.component').then(m => m.DealFormComponent)
                    }
                ]
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
