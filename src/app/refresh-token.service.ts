import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Tokens } from './tokens.interface';
import { tap } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class RefreshTokenService {
	tokens$ = new BehaviorSubject<Tokens>({ access_token: null, refresh_token: null });
	getTokens(): Tokens {
		return this.tokens$.getValue();
	}

	constructor(private http: HttpClient) {}

	getNewTokens(): Observable<Tokens> {
		const tokens = this.getTokens();
		return this.http.post<Tokens>('http://localhost:8080/refresh_token', tokens).pipe(
			tap(tokens => {
				console.log(tokens);
				this.tokens$.next(tokens);
			})
		);
	}

	getInitialTokens(): Observable<Tokens> {
		return this.http.get<Tokens>('http://localhost:8080/').pipe(
			tap(tokens => {
				console.log(tokens);
				this.tokens$.next(tokens);
			})
		);
	}

	tryProtectedRoute(): Observable<any> {
		const { access_token } = this.getTokens();
		return this.http
			.post<any>('http://localhost:8080/protected_route', { access_token })
			.pipe(
				tap(tokens => {
					console.log(tokens);
				})
			);
	}
}
