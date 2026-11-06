# Dulce Mirada · Sistema web de gestión de citas y servicios

Sistema web para el salón de belleza **Dulce Mirada** (Chepén, La Libertad, Perú), desarrollado como proyecto de Ingeniería de Software (UCV, Chepén 2026) con metodología **RUP**. Cubre los 22 requerimientos funcionales (RF01–RF22) y casos de uso (CU01–CU22) del informe, con tres roles: **administradora**, **cliente** y **personal de atención**.

## Cómo ejecutarlo

No necesita instalación ni compilación. Elige una opción:

- **Directo:** abre `index.html` en Google Chrome (doble clic).
- **Servidor local (recomendado):**
  ```bash
  npx serve .
  # o bien
  python -m http.server 8080
  ```
  y entra a `http://localhost:8080`.
- **GitHub Pages:** Settings → Pages → *Deploy from a branch* → `main` / `(root)`.

> Requiere conexión a Internet: Tailwind CSS, Font Awesome y Google Fonts se cargan desde CDN.

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administradora (Rosa Núñez) | `rnunez` | `admin123` |
| Personal de atención | `vmendoza` · `cvargas` · `lparedes` | `personal123` |
| Cliente | `mtorres` · `adiaz` · `fsanchez` · `kcabanillas` | `cliente123` |

La barra superior permite cambiar de rol al instante y el botón de la esquina restaura los datos originales.

## Estructura del proyecto

```
dulce-mirada/
├── index.html                      Estructura de la página y carga de scripts
├── css/
│   └── styles.css                  Estilos propios (complementan Tailwind)
├── js/
│   ├── config/
│   │   └── tailwind-config.js      Paleta y tipografías de Tailwind
│   ├── models/
│   │   └── entidades.js            Capa Entity: Usuario, Cliente, Personal, Servicio, Horario, Cita, Atencion, Reporte
│   ├── data/
│   │   └── database-service.js     Persistencia (localStorage) y datos semilla de Chepén
│   ├── controllers/                Capa Control (lógica de negocio)
│   │   ├── control-autenticacion.js   CU01–CU04, CU06
│   │   ├── control-clientes.js        CU08
│   │   ├── control-servicios.js       CU07, CU09
│   │   ├── control-horarios.js        CU10, CU11
│   │   ├── control-citas.js           CU12–CU17, CU20
│   │   └── control-atencion.js        CU19, CU21
│   ├── app/
│   │   └── dulce-mirada-app.js     Capa Boundary: núcleo (sesión, navegación, modales, avisos)
│   ├── views/                      Capa Boundary: pantallas por rol
│   │   ├── publico.js                 Portada, login, registro, recuperar contraseña
│   │   ├── cliente.js                 Panel, servicios, reservar cita, mis citas
│   │   ├── admin-panel.js             Estructura y panel del administrador
│   │   ├── admin-citas.js             Gestión de citas
│   │   ├── admin-clientes.js          Gestión de clientes
│   │   ├── admin-servicios.js         Gestión de servicios
│   │   ├── admin-horarios.js          Gestión de horarios
│   │   ├── admin-personal.js          Gestión de personal
│   │   ├── admin-reportes.js          Reportes
│   │   ├── personal.js                Agenda, estado de citas y registro de atención
│   │   └── ingenieria.js              Trazabilidad RF↔CU, script SQL y restauración de datos
│   └── main.js                     Arranque de la aplicación
└── database/
    └── dulce_mirada_sqlserver.sql  Script DDL para SQL Server (modelo relacional del diagrama de clases)
```

El orden de carga de los scripts en `index.html` importa (entidades → datos → controladores → app → vistas → `main.js`): son scripts clásicos que comparten el ámbito global, por eso la página también funciona abriéndola con doble clic (los módulos ES no cargan desde `file://`).

## Arquitectura

Sigue el patrón **Boundary – Control – Entity** del informe:

- **Entity** (`models/`): datos del dominio.
- **Control** (`controllers/`): reglas del negocio, validaciones y verificación de disponibilidad.
- **Boundary** (`app/` y `views/`): interfaces de cada actor y navegación.

## Persistencia

Esta versión guarda los datos en el `localStorage` del navegador, que simula la base de datos sin necesidad de servidor. El archivo `database/dulce_mirada_sqlserver.sql` contiene el modelo relacional para SQL Server previsto en el informe, listo para una futura conexión mediante una API.

## Tecnologías

HTML5 · CSS3 · JavaScript · Tailwind CSS · Font Awesome · SQL Server (script DDL).

## Equipo

Chiquinta Paredes, Jaime Roberto · Muñoz Cáceda, Azumi Yireth · Uceda Rivera, Astrid Tayri · Miranda Bustamante, Junior Alexander.
Docente: Ing. Joe Erick Flores Soriano. Universidad César Vallejo, Chepén, 2026.

## Licencia

MIT. Consulta `LICENSE`.
