import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Utility } from '../../utility/data-store';
import { ApiService } from '../../services/api-service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

  private apiService = inject(ApiService);
  batchId = signal(this.apiService.getDefaultBatch()?.batchId);

}
