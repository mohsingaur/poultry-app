import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);
  userFullName = signal('');
  farmName = signal('');
  batchCode = signal('');

  constructor() {
    let profile = Utility.getProfile();
    let farms = Utility.getFarms();
    let batches = Utility.getBatches();
    let selectedBatch = batches.filter((b: any) => b.isDefaultBatch == true);
    this.userFullName.set(profile?.userFullName);
    this.farmName.set(farms[0]?.farmName);
    this.batchCode.set(selectedBatch[0]?.batchCode);

    // console.log("Username", this.userFullName());
    // console.log("Farms", this.farmName());
    // console.log("selected batch", this.batchCode());
  }

  logout() {
    Utility.clearAll();
    this.router.navigate(['/login']);
  }

}
