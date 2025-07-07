import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // your Gmail address
    pass: process.env.SMTP_PASS, // your Gmail app password
  },
});

export async function sendOrderConfirmationEmail({ to, order }) {
  // Build order items HTML
  const itemsHtml = order.order_items.map(item => `
    <li style="margin-bottom:8px;">
      <strong>${item.product.product_name}</strong><br/>
      Quantity: ${item.quantity}<br/>
      Price: $${item.unit_price}
    </li>
  `).join('');

  // Format address helper
  function formatAddress(address) {
    if (!address) return '<em>Not provided</em>';
    return `
      ${address.name || ''}<br/>
      ${address.line1 || ''}${address.line2 ? ', ' + address.line2 : ''}<br/>
      ${address.city || ''}, ${address.state || ''} ${address.postal_code || ''}<br/>
      ${address.country || ''}
    `;
  }

  // Build the email HTML
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Thank you for your order!</h2>
      <p>Your order has been received and is being processed.</p>
      <p><strong>Order Number:</strong> <span style="font-family:monospace;">${order.order_number}</span></p>
      <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
      <ul style="padding-left:20px;">${itemsHtml}</ul>
      <p><strong>Total:</strong> $${order.total_amount}</p>
      <hr/>
      <h3>Shipping Address</h3>
      <p>${formatAddress(order.shipping_address)}</p>
      <h3>Billing Address</h3>
      <p>${formatAddress(order.billing_address)}</p>
      <hr/>
      <p>If you have any questions or need a refund, please reply to this email and include your order number above.</p>
      <small>This is an automated email from Your Shop. If you did not place this order, please contact support immediately.</small>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Order Confirmation - ${order.order_number}`,
    html,
  });
} 