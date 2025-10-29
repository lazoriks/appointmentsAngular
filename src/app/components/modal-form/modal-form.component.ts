import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email';
  required?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-modal-form',
  imports: [FormsModule], // NgIf/NgFor більше не потрібні
  styleUrls: ['./modal-form.component.scss'],
  template: `
  @if (open) {
    <div class="overlay" (click)="onClose()"></div>
    <div class="modal">
      <h3>{{ title }}</h3>
      <form (ngSubmit)="submit()">
        @for (let f of fields; track f.key) {
          <div>
            <label>{{ f.label }}</label>
            <input
              class="input"
              [type]="f.type || 'text'"
              [(ngModel)]="model[f.key]"
              [name]="f.key"
              [attr.required]="f.required ? '' : null"
            />
          </div>
        }
        <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
          <button type="button" class="btn" (click)="onClose()">Cancel</button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </div>
  }
  `
})
export class ModalFormComponent {
  @Input() open = false;
  @Input() title = 'Edit';
  @Input() fields: FieldConfig[] = [];
  @Input() model: any = {};
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  onClose() { this.close.emit(); }
  submit() { this.save.emit(this.model); }
}
