// --- Group Edit Page ---
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { AdminService } from '../../../services/admin.service';
import { GroupService } from '../../../models/group-service.model';


@Component({
standalone: true,
selector: 'app-group-edit',
imports: [CommonModule, FormsModule],
template: `
<div class="card" *ngIf="group">
<h2>Edit Group: {{ group.name }}</h2>


<label>Group Name</label>
<input [(ngModel)]="group.name" />


<label>Description</label>
<textarea [(ngModel)]="group.description"></textarea>


<button class="btn primary" (click)="save()">Save</button>
</div>
`,
styles: [`
.card { padding: 16px; max-width: 800px; margin: 16px auto; }
label { display: block; margin-top: 8px; font-weight: 600; }
input, textarea {
width: 100%;
padding: 6px;
margin-top: 2px;
box-sizing: border-box;
}
.btn { padding: 6px 12px; cursor: pointer; border-radius: 4px; margin-top: 12px; }
.btn.primary { background: #1976d2; color: white; }
`]
})
export class GroupEditComponent implements OnInit {
group!: GroupService;
private groupId!: number;


constructor(
private route: ActivatedRoute,
private api: AdminService,
private router: Router
) {}


ngOnInit() {
this.groupId = Number(this.route.snapshot.paramMap.get('id'));
this.api.getGroup(this.groupId).subscribe(g => this.group = g);
}


save() {
this.api.saveGroup(this.group).subscribe(() => {
this.router.navigate(['/dashboard']);
});
}
}
// --- End Group Edit Page ---