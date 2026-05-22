import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

export interface OrderItem {
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface OrderEmailData {
  stripeId: string;
  customerEmail: string;
  customerName: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipMethod: string;
}

export async function sendOwnerOrderEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const rows = data.items
    .map(
      (i) =>
        `<tr style="border-bottom:1px solid #eee">
          <td style="padding:8px 12px">${i.name}</td>
          <td style="padding:8px 12px">${i.size} / ${i.color}</td>
          <td style="padding:8px 12px;text-align:center">${i.qty}</td>
          <td style="padding:8px 12px;text-align:right">$${(i.price * i.qty).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: "RUT Shop <orders@rolleduptees.com>",
    to: "info@rolleduptees.com",
    subject: `New order — $${data.total.toFixed(2)} from ${data.customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
        <div style="background:linear-gradient(90deg,#B221F6,#FF6452);padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">New Order Received</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #eee;border-top:0;border-radius:0 0 12px 12px">
          <table style="width:100%;margin-bottom:24px">
            <tr>
              <td><strong>Customer</strong></td>
              <td>${data.customerName} &lt;${data.customerEmail}&gt;</td>
            </tr>
            <tr>
              <td><strong>Ship to</strong></td>
              <td>${data.address}</td>
            </tr>
            <tr>
              <td><strong>Method</strong></td>
              <td>${data.shipMethod}</td>
            </tr>
            <tr>
              <td><strong>Stripe ID</strong></td>
              <td><code>${data.stripeId}</code></td>
            </tr>
          </table>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead>
              <tr style="background:#f9f5ff">
                <th style="padding:10px 12px;text-align:left">Item</th>
                <th style="padding:10px 12px;text-align:left">Size / Color</th>
                <th style="padding:10px 12px;text-align:center">Qty</th>
                <th style="padding:10px 12px;text-align:right">Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <table style="width:100%;max-width:280px;margin-left:auto">
            <tr><td>Subtotal</td><td style="text-align:right">$${data.subtotal.toFixed(2)}</td></tr>
            <tr><td>Shipping</td><td style="text-align:right">$${data.shipping.toFixed(2)}</td></tr>
            <tr><td>Tax</td><td style="text-align:right">$${data.tax.toFixed(2)}</td></tr>
            <tr style="font-size:18px;font-weight:700;border-top:2px solid #111">
              <td style="padding-top:8px">Total</td>
              <td style="padding-top:8px;text-align:right">$${data.total.toFixed(2)}</td>
            </tr>
          </table>

          <p style="margin-top:32px;font-size:12px;color:#6b7280">
            View full order in <a href="https://dashboard.stripe.com/payments/${data.stripeId}" style="color:#B221F6">Stripe Dashboard →</a>
          </p>
        </div>
      </div>
    `,
  });
}
