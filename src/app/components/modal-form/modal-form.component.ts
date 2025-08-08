import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-form',
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent {
  @Input() title = '';
  @Input() model: any = {};
  @Input() fields: { key: string; label: string; type?: 'text'|'number'|'datetime-local'|'email' }[] = [];
  @Input() visible = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
}
