import { Routes } from '@angular/router';
import { ListarUsuarioComponent } from './pages/usuarios/listar-usuario/listar-usuario.component';
import { LoginComponent } from './pages/login/login/login.component';
import { ReseteoContrasenaComponent } from './pages/login/reseteo-contrasena/reseteo-contrasena.component';
import { ListarProveedorComponent } from './pages/proveedor/listar-proveedor/listar-proveedor.component';
import { ListarCaiRangoComponent } from './pages/caiRango/listar-cai-rango/listar-cai-rango.component';
import { ListarResumenFacturasComponent } from './pages/Facturas/listar-resumen-facturas/listar-resumen-facturas.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './pages/home/home/home.component';
import { EvaluacionFacturasComponent } from './pages/Facturas/evaluacion-facturas/evaluacion-facturas.component';
import { ReporteFacturasComponent } from './pages/reportes/reporte-facturas/reporte-facturas.component';
import { ReportesHomeComponent } from './pages/reportes/reportes-home/reportes-home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'reseteo-contrasena', component: ReseteoContrasenaComponent, canActivate: [AuthGuard], },
  { path: 'usuarios/listar', component: ListarUsuarioComponent, canActivate: [AuthGuard],  },
  { path: 'proveedor/listar', component: ListarProveedorComponent, canActivate: [AuthGuard]  },
  { path: 'proveedorCaiRango/listar/:idProveedor', component: ListarCaiRangoComponent, canActivate: [AuthGuard]  },
  { path: 'resumenFactura', component: ListarResumenFacturasComponent, canActivate: [AuthGuard]  },
  { path: 'evaluacion/facturas', component: EvaluacionFacturasComponent, canActivate: [AuthGuard]  },
  { path: 'reportes/home', component: ReportesHomeComponent, canActivate: [AuthGuard] },
  { path: 'reportes/facturas', component: ReporteFacturasComponent, canActivate: [AuthGuard] },



 { path: '**', redirectTo: 'login' }

];
