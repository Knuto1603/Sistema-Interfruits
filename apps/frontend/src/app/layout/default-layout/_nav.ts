import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'NEW'
    },
    attributes: {
      roles: ['ROLE_ADMIN', 'ROLE_USER','KNUTO_ROLE'] // Todos pueden ver el dashboard
    }

  },
  {
    title: true,
    name: 'Recepción',
    attributes: {
      roles: ['ROLE_ADMIN', 'ROLE_RECEPCIÓN','KNUTO_ROLE'] // Todos pueden ver el dashboard
    }
  },
  {
    name:'Configuraciones',
    url:'/sign-in',
    iconComponent: { name: 'cil-settings' }
  },
  {
    name:'Productor',
    url:'/sign-in',

  },
  {
    title: true,
    name: 'Trazabilidad',
    attributes: {
      roles: ['ROLE_ADMIN', 'ROLE_TRAZABILIDAD','KNUTO_ROLE'] // Todos pueden ver el dashboard
    }
  },
  {
    name:'Configuraciones',
    url:'/sign-in',
    iconComponent: { name: 'cil-settings' }
  },
  {
    title: true,
    name: 'Seguridad',
    attributes:{
      roles: ['KNUTO_ROLE']
    }
  },
  {
    name:'Usuarios',
    url:'/security/user',
    iconComponent: { name: 'cil-user' }
  },
  {
    name:'Roles',
    url:'/security/role',
    iconComponent: { name: 'cil-lock-locked' }
  },
  {
    name:'Parametros',
    url:'parametro',
    iconComponent: { name: 'cil-lock-locked' }
  }
];
