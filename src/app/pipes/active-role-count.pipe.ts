import { Pipe, PipeTransform } from '@angular/core';
import { Role } from '../models/dashboard.models';

@Pipe({
  name: 'activeRoleCount',
  standalone: true
})
export class ActiveRoleCountPipe implements PipeTransform {
  transform(roles: Role[]): number {
    return roles.filter(role => role.isActive).length;
  }
}
