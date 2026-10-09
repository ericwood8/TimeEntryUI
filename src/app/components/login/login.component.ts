import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  userName = '';
  password = '';
  message = '';
  busy = false;

  constructor(private auth: AuthService, private router: Router) { }

  signIn(): void {
    this.message = '';
    this.busy = true;
    this.auth.login(this.userName, this.password).subscribe({
      next: () => {
        this.busy = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.busy = false;
        this.password = '';
        if (error.status === 429) { this.message = 'Too many tries. Wait a minute and try again.'; }
        else if (error.status === 401) { this.message = 'The user name or password is not right.'; }
        else { this.message = 'Could not sign in right now.'; }
      }
    });
  }
}
