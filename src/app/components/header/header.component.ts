import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(public auth: AuthService) { }

}
