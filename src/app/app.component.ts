import { Component } from '@angular/core';
import { RefreshTokenService } from './refresh-token.service';

@Component({
	selector: 'app-root',
	template: `
		<button (click)="loginCall()">INITAL</button>
		<button (click)="refreshCall()">REFRESH</button>
		<button (click)="protectedCall()">PROTECTED</button>
	`,
	styles: []
})
export class AppComponent {
	constructor(private refreshTokenService: RefreshTokenService) {}

	bro() {}
	loginCall() {
		this.refreshTokenService.getInitialTokens().subscribe();
	}

	refreshCall() {
		this.refreshTokenService.getNewTokens().subscribe();
	}

	protectedCall() {
		this.refreshTokenService.tryProtectedRoute().subscribe();
	}
}
