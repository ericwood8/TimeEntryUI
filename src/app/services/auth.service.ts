import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthUser, LoginResponse } from '../models/auth';

const storageKey = 'timeentry.auth';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private session = signal<LoginResponse | null>(this.restore());

    readonly user = computed<AuthUser | null>(() => this.session()?.user ?? null);
    readonly isLoggedIn = computed(() => this.session() != null);

    constructor(private http: HttpClient, private router: Router) { }

    get token(): string | null {
        return this.session()?.token ?? null;
    }

    login(userName: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>('api/auth/login', { userName, password }).pipe(
            tap(response => {
                this.session.set(response);
                // sessionStorage: the sign-in ends when the tab closes
                sessionStorage.setItem(storageKey, JSON.stringify(response));
            })
        );
    }

    logout(): void {
        this.session.set(null);
        sessionStorage.removeItem(storageKey);
        this.router.navigate(['/login']);
    }

    private restore(): LoginResponse | null {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (!saved) { return null; }
            const response = JSON.parse(saved) as LoginResponse;
            if (new Date(response.expiresUtc).getTime() <= Date.now()) {
                sessionStorage.removeItem(storageKey);
                return null;
            }
            return response;
        } catch {
            return null;
        }
    }
}
