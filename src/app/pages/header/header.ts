import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { NgClass } from '@angular/common';
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userFullName = signal('');
  farmName = signal('');
  batchCode = signal('');
  batchStatus = signal(false);
  selectedBatch = signal<any>(null);

  readonly router = inject(Router);

  constructor() {
    let profile = Utility.getProfile();
    let farms = Utility.getFarms();
    let batches = Utility.getBatches();
    this.selectedBatch.set(batches.filter((b: any) => b.isDefaultBatch == true));
    this.userFullName.set(profile?.userFullName);
    this.farmName.set(farms[0]?.farmName);
    this.batchCode.set(this.selectedBatch()[0]?.batchCode);
    this.batchStatus.set(this.selectedBatch()[0]?.batchStatus);

    // console.log("Username", this.userFullName());
    // console.log("Farms", this.farmName());
    // console.log("selected batch", this.batchCode());
  }


  logout() {
    Utility.clearAll();
    this.router.navigate(['/login']);
  }

}
