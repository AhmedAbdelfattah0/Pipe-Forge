import { NgModule } from '@angular/core';

import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  InputComponent,
  ToggleComponent,
} from './components';

@NgModule({
  imports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent,
    ToggleComponent,
  ],
  exports: [
    ButtonComponent,
    InputComponent,
    CardComponent,
    BadgeComponent,
    ToggleComponent,
  ],
})
export class SharedModule {}
