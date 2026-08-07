import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminService } from '../../../services/admin.service';
import { SiteImage } from '../../../models/site-image.model';

interface SlotView extends SiteImage {
  label: string;
  preview: string;
  busy: boolean;
  error: string | null;
}

/** Human labels for the fixed slots the home page renders. */
const SLOT_LABELS: Record<string, string> = {
  'nails-1': 'Nails — photo 1',
  'nails-2': 'Nails — photo 2',
  'hair-1': 'Hair — photo 1',
  'hair-2': 'Hair — photo 2',
  'brows-1': 'Brows + Lashes — photo 1',
  'brows-2': 'Brows + Lashes — photo 2',
  'permanent-1': 'Permanent — photo 1',
  'permanent-2': 'Permanent — photo 2',
  'waxing-1': 'Waxing — photo 1',
  'waxing-2': 'Waxing — photo 2',
  'treatments-1': 'Hair treatments — photo 1',
  'treatments-2': 'Hair treatments — photo 2',
  'makeup-1': 'Make-up — photo 1',
  'makeup-2': 'Make-up — photo 2'
};

@Component({
  standalone: true,
  selector: 'app-site-images',
  imports: [CommonModule],
  template: `
    <div class="card" style="margin-bottom:12px;">
      <p style="margin:0;">
        These photos appear on the salon's home page. Upload a new file to replace one —
        the website updates within a few minutes. JPEG, PNG or WebP, up to 5 MB.
      </p>
    </div>

    <div class="card" *ngIf="slots.length">
      <div class="slot-grid">
        <div class="slot" *ngFor="let s of slots">
          <div class="slot-title">{{ s.label }}</div>

          <div class="thumb">
            <img *ngIf="s.uploaded" [src]="s.preview" alt="" />
            <span *ngIf="!s.uploaded" class="empty">No photo yet</span>
          </div>

          <input type="file" accept="image/jpeg,image/png,image/webp"
                 [disabled]="s.busy" (change)="onPick(s, $event)" />

          <div class="status" *ngIf="s.busy">Uploading…</div>
          <div class="status error" *ngIf="s.error">{{ s.error }}</div>
        </div>
      </div>
    </div>

    <div *ngIf="!slots.length && !loading" style="padding:16px;">Could not load the photo list</div>
    <div *ngIf="loading" style="padding:16px;">Loading…</div>
  `,
  styles: [`
    .slot-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:16px; }
    .slot { border:1px solid #eee; border-radius:8px; padding:12px; }
    .slot-title { font-weight:600; margin-bottom:8px; font-size:14px; }
    .thumb { height:160px; display:flex; align-items:center; justify-content:center;
             background:#fafafa; border-radius:6px; overflow:hidden; margin-bottom:8px; }
    .thumb img { width:100%; height:100%; object-fit:cover; }
    .empty { color:#999; font-size:13px; }
    .status { margin-top:6px; font-size:13px; color:#666; }
    .status.error { color:#e53935; }
    input[type=file] { width:100%; font-size:13px; }
  `]
})
export class SiteImagesComponent implements OnInit {
  slots: SlotView[] = [];
  loading = false;

  constructor(private api: AdminService) {}

  ngOnInit() {
    this.loading = true;
    this.api.getSiteImages().subscribe({
      next: images => {
        this.slots = images.map(i => ({
          ...i,
          label: SLOT_LABELS[i.slot] || i.slot,
          preview: this.bust(i.url),
          busy: false,
          error: null
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load site images:', err);
        this.loading = false;
      }
    });
  }

  onPick(slot: SlotView, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    slot.busy = true;
    slot.error = null;

    this.api.uploadSiteImage(slot.slot, file).subscribe({
      next: () => {
        slot.busy = false;
        slot.uploaded = true;
        // Same URL every time, so force the <img> to refetch the new file.
        slot.preview = this.bust(slot.url);
        input.value = '';
      },
      error: err => {
        slot.busy = false;
        slot.error = err?.status === 415 ? 'Only JPEG, PNG or WebP'
                   : err?.status === 413 ? 'File is larger than 5 MB'
                   : 'Upload failed';
        console.error('Upload failed:', err);
      }
    });
  }

  private bust(url: string): string {
    return `${url}?t=${Date.now()}`;
  }
}
