import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray } from '@angular/forms';

import 'rxjs/add/operator/debounceTime';

import { Customer } from './customer';

/** Cross-field validator */
function emailMatcher(c: AbstractControl) {
  const emailControl = c.get('email');
  const confirmControl = c.get('confirmEmail');
  if (!confirmControl.value && confirmControl.touched) {
    return { 'required': true };
  }
  if (emailControl.pristine || confirmControl.pristine) {
    return null;
  }
  if (emailControl.value === confirmControl.value) {
    return null;
  }
  return { 'match': true };

  // if (!confirmControl.value && confirmControl.touched) {
  //   return { 'required': true };
  // }
  // if (confirmControl.value !== emailControl.value) {
  //   return { 'match': true };
  // }
  // return null;
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

/**
 * Custom validator returning null OR a key/value pair - where the key is the name of the broken validation rule and the value is true.
 * A custom validator always takes an AbstractControl parameter (which is satisfied by either a FormControl or a FormGroup being validated).
 */
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

  get addressArray(): FormArray {
    return <FormArray>this.customerForm.get('addressArray'); // Casts as a <FormArray>.  Otherwise, the type would be an AbstractControl.
  }

  emailValidationMessage: string;
  private emailValidationMessages = {
    required: 'Please enter your email address.',
    pattern: 'Please enter a valid email address.'
  };

  confirmEmailValidationMessage: string;
  private confirmEmailValidationMessages = {
    required: 'Please confirm your email address.',
    match: 'The confirmation does not match the email address.'
  };

  firstNameValidationMessage: string;
  private firstNameValidationMessages = {
    required: 'Please enter your first name.',
    minlength: 'The first name must be longer than 3 characters.'
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
      addressArray: this.formBuilder.array([ this.buildAddressGroup() ])
    });

    this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value));

    const emailGroupControl = this.customerForm.get('emailGroup');
    emailGroupControl.valueChanges.subscribe(value => this.confirmEmailValidationMessage = this.getValidationMessage(emailGroupControl, this.confirmEmailValidationMessages));

    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.debounceTime(500).subscribe(value => this.emailValidationMessage = this.getValidationMessage(emailControl, this.emailValidationMessages));
    // emailControl.valueChanges.debounceTime(2000).subscribe(value => this.setEmailValidationMessage(emailControl));

    const firstNameControl = this.customerForm.get('firstName');
    firstNameControl.valueChanges.debounceTime(500).subscribe(value => this.firstNameValidationMessage = this.getValidationMessage(firstNameControl, this.firstNameValidationMessages));
    // * Note: There is also a statusChanges observable you can subscribe to which emits events on validation changes.

  }

  buildAddressGroup(): FormGroup {
    return this.formBuilder.group({
      addressType: 'home',
      street1: ['', Validators.required],
      street2: '',
      city: '',
      state: '',
      zip: '',
    });
  }

  addAddressGroup(): void {
    this.addressArray.push(this.buildAddressGroup());
  }

  onBlur(event, control: string) {
    // firstName:
    if (!event.target.value && control === 'firstName') {
      this.firstNameValidationMessage = this.getValidationMessage(this.customerForm.get(control), this.firstNameValidationMessages);
    }
    // emailGroup:
    if (!event.target.value && control === 'emailGroup') {
      console.log(`emailGroup blurred and touched: ${this.customerForm.get('emailGroup').touched} and valid: ${this.customerForm.get('emailGroup').valid}`);
      console.log(this.customerForm.get('emailGroup').errors);
      this.confirmEmailValidationMessage = this.getValidationMessage(this.customerForm.get(control), this.confirmEmailValidationMessages);
      console.log(this.confirmEmailValidationMessage);
    }
  }

  save(): void {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  populateTestData(): void {
    // Use patchValue when setting some of the FormGroup values.
    // Use setValue when setting them all.
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

  setEmailValidationMessage(c: AbstractControl): void {
    this.emailValidationMessage = '';
    if ((c.touched || c.dirty) && c.errors) {
      this.emailValidationMessage = Object.keys(c.errors).map(key => this.emailValidationMessages[key]).join(' ');
      // Note: The validation errors collection using the validation rule name as the key, as does our validationMessages structure.
    }
  }

  getValidationMessage(c: AbstractControl, messages: any): string {
    if ((c.touched || c.dirty) && c.errors) {
      return Object.keys(c.errors).map(key => messages[key]).join(' ');
      // Note: The validation errors collection using the validation rule name as the key, as does our validationMessages structure.
    }
    return '';
  }

}
