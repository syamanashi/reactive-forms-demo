import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Customer } from './customer';

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

  

}
