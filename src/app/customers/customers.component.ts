import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { Customer } from './customer';

// Custom validator
function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if (c.value !== undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { 'range': true }; // Returns the name of the failed validation rule with the value of true.
  }
  return null;
}

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  // Set the data model which defines the data passed to and from a backend server.
  customer: Customer = new Customer();
  customerForm: FormGroup;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    // Create the form model (with defaults).
    this.customerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
      phone: '',
      notification: 'email',
      rating: ['', ratingRange],
      sendCatalog: true,
    });
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  populateTestData(): void {
    // Use patchValue when setting some of the FormGroup values.  Use setValue when setting them all.
    this.customerForm.patchValue({
      firstName: 'Sutton',
      lastName: 'Yamanashi',
      // email: 'syamanashi@gmail.com',
      sendCatalog: false,
    });
  }

  setNotification(notifyVia: string): void {
    // Create a reference to the phone form control.
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required); // Set one or an array of validators.
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

}
