import { InputComponent } from '../components/input/input.component';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [RouterModule, InputComponent, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class RegisterComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }
}
