import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { map, catchError, tap, exhaustMap, switchMap, filter, take } from 'rxjs/operators';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
	isRefreshing = false;
	refreshToken$ = new BehaviorSubject<string>(null);

	constructor(private refreshTokenService: RefreshTokenService) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError((e: HttpErrorResponse) => {
				console.log(e);
				if (e instanceof HttpErrorResponse && e.status === 401) {
					return this.handle401Error(req, next);
				} else {
					return throwError(e);
				}
			})
		);
	}

	handle401Error(req: HttpRequest<any>, next: HttpHandler) {
		console.log('handle401Error => ', req.url);
		if (!this.isRefreshing) {
			console.log('isRefreshing == false');
			this.isRefreshing = true;
			this.refreshToken$.next(null);

			return this.refreshTokenService.getNewTokens().pipe(
				exhaustMap(tokens => {
					this.isRefreshing = false;
					this.refreshToken$.next(tokens.access_token);
					return next.handle(this.requestWithToken(req, tokens.access_token));
				})
			);
		} else {
			console.log('isRefreshing == true');
			return this.refreshToken$.pipe(
				filter(token => token !== null),
				take(1),
				switchMap((token: string) => {
					return next.handle(this.requestWithToken(req, token));
				})
			);
		}
	}

	requestWithToken(req: HttpRequest<any>, token: string) {
		console.log('requestWithToken => ', token);
		return req.clone({
			setHeaders: {
				access_token: token
			}
		});
	}
}
