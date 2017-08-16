import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';

import { Customer } from './customer';

/** Cross-field validator */
function emailMatcher(c: AbstractControl) {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');
  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { 'match': true };
}

/** Custom validator with parameters using ValidatorFn */
function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    if (c.value !== undefined && (isNaN(c.value) || c.value < min || c.value > max)) {
      return { 'range': true }; // Returns the name of the failed validation rule with the value of true.
    }
    return null;
  }
}

/** Custom validator returning null OR a key/value pair - where the key is the name of the broken validation rule and the value is true. */
/*
function ratingRange(c: AbstractControl): { [key: string]: boolean } | null {
  if (c.value !== undefined && (isNaN(c.value) || c.value < 1 || c.value > 5)) {
    return { 'range': true }; // Returns the name of the failed validation rule with the value of true.
  }
  return null;
}
*/

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {

  // Set the data model which defines the data passed to and from a backend server.
  customer: Customer = new Customer();
  customerForm: FormGroup;
  emailMessage: string;

  private validationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email address.'
  };

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    // Create the form model (with defaults) with FormBuilder.
    this.customerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      emailGroup: this.formBuilder.group({
        email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+')]],
        confirmEmail: ['', Validators.required],
      }, { validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: ['', ratingRange(1, 5)],
      sendCatalog: true,
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
    });

    this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value));

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.debounceTime(2000).subscribe(value => this.setMessage(emailControl));

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

  /** Adjusting validation rules at run-time. */
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

  setMessage(c: AbstractControl): void {
    this.emailMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailMessage = Object.keys(c.errors).map(key => this.validationMessages[key]).join(' ');
      // Note: The validation errors collection using the validation rule name as the key, as does our validationMessages structure.
    }
  }

}
