import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadUserFromToken();
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    logout(): void {
        localStorage.removeItem(environment.jwtTokenKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(environment.jwtTokenKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    hasRole(role: string): boolean {
        const user = this.currentUserSubject.value;
        return user?.roles.includes(role) || false;
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.currentUserSubject.value;
        return roles.some(role => user?.roles.includes(role)) || false;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem(environment.jwtTokenKey, response.token);
        const user: User = {
            id: response.tenantId,
            username: response.username,
            email: response.email,
            roles: response.roles,
            tenantId: response.tenantId
        };
        this.currentUserSubject.next(user);
    }

    private loadUserFromToken(): void {
        const token = this.getToken();
        if (token) {
            try {
                const payload = this.decodeToken(token);
                const user: User = {
                    id: payload.sub,
                    username: payload.sub,
                    email: payload.email || '',
                    roles: payload.roles || [],
                    tenantId: payload.tenantId || ''
                };
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Failed to decode token', error);
                this.logout();
            }
        }
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
