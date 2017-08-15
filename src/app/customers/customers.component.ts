import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

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

  constructor() { }

  ngOnInit() {
    // Set the form model.
    this.customerForm = new FormGroup({
      firstName: new FormControl(),
      lastName: new FormControl(),
      email: new FormControl(),
      sendCatalog: new FormControl(true),
    });
  }

  save() {
    console.log(this.customerForm);
    console.log('Saved: ' + JSON.stringify(this.customerForm.value));
  }

  populateTestData() {
    // Use patchValue when setting some of the FormGroup values.  Use setValue when setting them all.
    this.customerForm.patchValue({
      firstName: 'Sutton',
      lastName: 'Yamanashi',
      // email: 'syamanashi@gmail.com',
      sendCatalog: false,
    });
  }

}
