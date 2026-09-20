import { EncabezadoPagina } from "@/components/admin/ui";
import { FormularioAccion, Interruptor } from "@/components/admin/Formularios";
import { guardarAjustes } from "@/lib/acciones/admin";
import { obtenerAjustes } from "@/lib/datos/ajustes";
import { mercadoPagoConfigurado } from "@/lib/mercadopago";

export const metadata = { title: "Ajustes" };

export default async function PaginaAjustes() {
  const { tienda, transferencia, retiro } = await obtenerAjustes();
  const mp = mercadoPagoConfigurado();

  return (
    <>
      <EncabezadoPagina titulo="Ajustes de la tienda" descripcion="Datos de contacto, medios de pago y retiro en tienda." />
      <FormularioAccion accion={guardarAjustes} textoBoton="Guardar ajustes" className="grid gap-6 xl:grid-cols-2">
        <section className="tarjeta space-y-3">
          <h2 className="font-semibold">Datos de la tienda</h2>
          <p className="text-xs text-muted">Se muestran en el pie de página, contacto y correos.</p>
          <div><label className="etiqueta">Nombre</label><input name="tienda.nombre" className="campo" defaultValue={tienda.nombre} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="etiqueta">Correo</label><input name="tienda.email" type="email" className="campo" defaultValue={tienda.email} /></div>
            <div><label className="etiqueta">Teléfono (visible)</label><input name="tienda.telefono" className="campo" defaultValue={tienda.telefono} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="etiqueta">WhatsApp (solo números, con 56)</label><input name="tienda.whatsapp" className="campo" defaultValue={tienda.whatsapp} placeholder="56912345678" /></div>
            <div><label className="etiqueta">Horario</label><input name="tienda.horario" className="campo" defaultValue={tienda.horario} /></div>
          </div>
          <div><label className="etiqueta">Dirección</label><input name="tienda.direccion" className="campo" defaultValue={tienda.direccion} /></div>
          <div><label className="etiqueta">Instagram (URL)</label><input name="tienda.instagram" className="campo" defaultValue={tienda.instagram} /></div>
        </section>

        <div className="space-y-6">
          <section className="tarjeta space-y-3">
            <h2 className="font-semibold">Mercado Pago</h2>
            {mp ? (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">Conectado. Los pagos con tarjeta están activos en el checkout.</p>
            ) : (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                No configurado. Agrega la variable <code className="font-mono">MP_ACCESS_TOKEN</code> en Vercel (credenciales de producción de tu cuenta Mercado Pago) y vuelve a desplegar. Mientras tanto la tienda vende por transferencia.
              </p>
            )}
            <p className="text-xs text-muted">Webhook a configurar en Mercado Pago: <code className="font-mono">/api/mercadopago/webhook</code> (evento Pagos).</p>
          </section>

          <section className="tarjeta space-y-3">
            <h2 className="font-semibold">Transferencia bancaria</h2>
            <Interruptor nombre="transferencia.activa" etiqueta="Aceptar transferencias" valor={transferencia.activa} descripcion="El cliente ve estos datos al confirmar el pedido" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="etiqueta">Banco</label><input name="transferencia.banco" className="campo" defaultValue={transferencia.banco} placeholder="Banco Estado" /></div>
              <div><label className="etiqueta">Tipo de cuenta</label><input name="transferencia.tipo_cuenta" className="campo" defaultValue={transferencia.tipo_cuenta} placeholder="Cuenta Vista / Corriente" /></div>
              <div><label className="etiqueta">N° de cuenta</label><input name="transferencia.numero" className="campo" defaultValue={transferencia.numero} /></div>
              <div><label className="etiqueta">RUT</label><input name="transferencia.rut" className="campo" defaultValue={transferencia.rut} /></div>
              <div><label className="etiqueta">Titular</label><input name="transferencia.titular" className="campo" defaultValue={transferencia.titular} /></div>
              <div><label className="etiqueta">Correo para comprobantes</label><input name="transferencia.email" type="email" className="campo" defaultValue={transferencia.email} /></div>
            </div>
          </section>

          <section className="tarjeta space-y-3">
            <h2 className="font-semibold">Retiro en tienda</h2>
            <Interruptor nombre="retiro.activo" etiqueta="Permitir retiro" valor={retiro.activo} descripcion="Sin costo de envío" />
            <div><label className="etiqueta">Dirección de retiro</label><input name="retiro.direccion" className="campo" defaultValue={retiro.direccion} /></div>
            <div><label className="etiqueta">Horario de retiro</label><input name="retiro.horario" className="campo" defaultValue={retiro.horario} /></div>
          </section>
        </div>
      </FormularioAccion>
    </>
  );
}
