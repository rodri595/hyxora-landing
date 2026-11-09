# Cerebro — campos de membresía en `GET /admin/users`

**Para:** Santiago · **Fecha:** 2026-11-09 · **Origen:** petición del cliente (Victor)

## Contexto

El cliente quiere importar los usuarios a su CRM desde **una sola tabla** (la de
Usuarios del admin), con estas columnas por usuario:

- Nombre completo
- Membresía (plan + estado)
- Desde cuándo es miembro
- Cuándo renovó por última vez
- Cuánto tiempo le queda

Todo tiene que venir **en cada fila de `GET /admin/users`**. No podemos hacer una
llamada por usuario a `/users/{privyId}/membership` para rellenar la tabla.

## Campos a añadir en cada fila de `GET /admin/users`

Ya vienen: `plan`, `membershipStatus`, `membershipRenewDate`.

| Campo | Tipo | Significado |
|---|---|---|
| `name` | string \| `null` | **Nuevo.** Nombre completo de la persona (nombre y apellidos), **no** el nombre de usuario: `username` y `twitterUsername` ya vienen y no sirven para el CRM. Ver la nota más abajo sobre de dónde sacarlo. |
| `membershipStartDate` | ISO \| `null` | Inicio de la membresía actual. El mismo valor que `user.membershipStartDate` en `/users/{privyId}/membership`. |
| `membershipLastRenewedAt` | ISO \| `null` | **Nuevo.** Fecha del último pago o renovación del periodo: el último `invoice.paid`, o el último evento `membership_renew_date` en `membership_events`. `null` si nunca ha renovado (está en su primer periodo). |
| `membershipInterval` | `"month"` \| `"year"` \| `null` | Periodicidad. |
| `membershipPaymentType` | string \| `null` | Canal de pago. |
| `cancelEffectiveDate` | ISO \| `null` | Fecha en que termina la membresía si el estado es `toCancel`. Sin esto, el "tiempo que le queda" de un usuario que cancela sale mal. |

### Ejemplo de fila

```json
{
  "privyId": "did:privy:abc123",
  "email": "user@example.com",
  "username": "teresag",
  "name": "Teresa Gil Claros",
  "plan": "Premium",
  "membershipStatus": "active",
  "membershipStartDate": "2026-03-14T10:22:00.000Z",
  "membershipLastRenewedAt": "2026-10-14T10:22:05.000Z",
  "membershipRenewDate": "2026-11-14T10:22:00.000Z",
  "membershipInterval": "month",
  "membershipPaymentType": "card",
  "cancelEffectiveDate": null
}
```

### Sobre `name`

Ahora mismo el admin no tiene el nombre de casi nadie: solo lo tenemos de quien
compró el NFT en la web founders (lo escribe al pagar). Ni `/users` ni app-api
traen un nombre.

- Si el backend de la app guarda el nombre completo en algún sitio que **no sea el
  KYC** (registro, perfil, Privy…), añádelo como `name`.
- Si solo existe en el KYC, **déjalo fuera** y avísanos: no queremos sacar datos del
  KYC en un archivo que se importa a un CRM.
- Si viene separado en nombre y apellidos, mejor un solo `name` con los dos juntos
  (o `firstName` + `lastName`, como te sea más fácil, pero dinos cuál).

## Aclaraciones que necesitamos

1. ¿`membershipRenewDate` es siempre la **próxima** fecha de cobro o fin del
   periodo actual? ¿Qué trae cuando el estado es `toCancel`, `suspended` o
   `cancelled`?
2. Si `membershipLastRenewedAt` sale de `membership_events`, solo hay historial
   desde el **2026-06-10**. Para renovaciones anteriores, ¿se puede sacar de
   Stripe? Si no, `null`, y en el front lo mostramos como "sin dato".

## Opcional (para exportar más rápido)

- Que `/users` acepte `pageSize` de hasta 500 o 1000. El CRM necesita todos los
  usuarios y ahora recorremos todas las páginas.
- Filtros `?membershipStatus=` y `?plan=` (lista separada por comas).

## Lo que no hace falta

- **Días restantes calculados en el backend.** Los calculamos en el front con
  `membershipRenewDate` o, si el estado es `toCancel`, con `cancelEffectiveDate`.

## Formato

- Fechas en ISO 8601 UTC.
- `null` cuando no hay dato (no `"none"` ni string vacío).
- Documentar los campos nuevos en `admin.md`, en la sección de `/users`.
