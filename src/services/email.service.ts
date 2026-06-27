import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "escuelaculinarialavalletto@bakano.ec";

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function buildWelcomeText(email: string, password: string): string {
  return `🎉 BIENVENIDO AL MASTER EN CHORIZOS ARTESANALES

Tu acceso ha sido activado — aqui estan tus credenciales:

  Email: ${email}
  Contrasena: ${password}

Guarda estos datos. Con ellos podras acceder a tu contenido exclusivo.

---
TU COMPRA INCLUYE:

10 Recetas Profesionales
- Chorizo Argentino de Res y Cerdo
- Morcilla Artesanal
- Chistorra Espanola
- Chorizo Cuencano
- Pastrami Artesanal

Bono #1 — Panes Artesanales (Valor $47)
- Pan de Choripan Profesional
- Pan de Masa Madre para Pastrami

Bono #2 — Las 3 Salsas (Valor $27)
- Salsa Chimichurri Premium
- Salsa Especial para Pastrami
- Salsa Signature para Sandwichs

Bono #3 — Grupo VIP Choriceros (Valor $97)
- Comunidad privada & Networking
- Compartir resultados
- Resolver dudas con chefs

Bono #4 — Sesion Q&A con Chefs (Valor $97)
- Preguntas en vivo
- Correcciones y consejos de produccion

Bono #5 — Directorio de Proveedores (Valor $67)
- Tripas, condimentos, equipos
- Insumos especializados

Bono #6 — Acceso Preferencial a Charcuteria (Valor $197)
- Precio especial para alumnos del libro

---
Escuela Culinaria Lavalletto · Master en Chorizos Artesanales
© 2026 Escuela Culinaria Lavalletto · Todos los derechos reservados`;
}

function buildAdminNotificationText(
  email: string,
  transactionId: number,
  amount: number
): string {
  return `🤑 NUEVA VENTA!

Email: ${email}
Transaction ID: ${transactionId}
Monto: $${(amount / 100).toFixed(2)}

Master en Chorizos Artesanales — Escuela Culinaria Lavalletto`;
}

export async function sendWelcomeEmail(
  toEmail: string,
  password: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Bienvenido al Master en Chorizos Artesanales — Tus credenciales",
      text: buildWelcomeText(toEmail, password),
    });
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}

export async function sendAdminNotification(
  toEmail: string,
  transactionId: number,
  amount: number
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Nueva venta — Master en Chorizos Artesanales",
      text: buildAdminNotificationText(toEmail, transactionId, amount),
    });
    return true;
  } catch (error) {
    console.error("Error sending admin notification:", error);
    return false;
  }
}

export async function sendResetPasswordEmail(
  toEmail: string,
  resetLink: string
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "Recupera tu contrasena — Master en Chorizos Artesanales",
      text: `Hemos recibido una solicitud para recuperar tu contrasena.

Si no solicitaste esto, ignora este mensaje.

Para restablecer tu contrasena, haz clic en el siguiente enlace (valido por 1 hora):

${resetLink}

Si el enlace no funciona, copialo y pegalo en tu navegador.

---
Escuela Culinaria Lavalletto · Master en Chorizos Artesanales
© 2026 Escuela Culinaria Lavalletto · Todos los derechos reservados`,
    });
    return true;
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return false;
  }
}

export { generatePassword };
