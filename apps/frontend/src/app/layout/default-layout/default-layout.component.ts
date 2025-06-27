import {Component, OnInit, signal} from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import {
  ContainerComponent, INavData,
  ShadowOnScrollDirective,
  SidebarBrandComponent,
  SidebarComponent,
  SidebarFooterComponent,
  SidebarHeaderComponent,
  SidebarNavComponent,
  SidebarToggleDirective,
  SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from './';
import { navItems } from './_nav';
import {NavigationService} from "@core/navigation/navigation.service";
import {finalize, Observable, take, filter, Subscription} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {LoadingComponent} from "@shared/component/loading-screen/loading-screen.component";

function isOverflown(element: HTMLElement) {
  return (
    element.scrollHeight > element.clientHeight ||
    element.scrollWidth > element.clientWidth
  );
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  standalone: true,
  imports: [
    SidebarComponent,
    SidebarHeaderComponent,
    SidebarBrandComponent,
    SidebarNavComponent,
    SidebarFooterComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective,
    ContainerComponent,
    DefaultFooterComponent,
    DefaultHeaderComponent,
    IconDirective,
    NgScrollbar,
    RouterOutlet,
    RouterLink,
    ShadowOnScrollDirective,
    AsyncPipe,
    LoadingComponent,
    NgIf
  ]
})
export class DefaultLayoutComponent implements OnInit {
  public navItems$: Observable<INavData[]>;
  public isLoading = signal<boolean>(false);

  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.isLoading.set(true)

    console.log('iniciando component');
    this.navItems$ = this.navigationService.filteredNavItems$;

    this.navItems$.pipe(
      filter(items => items.length > 0),
      take(1),
      finalize(() => this.isLoading.set(false))
    ).subscribe();
  }
}
