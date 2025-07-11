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

  // Build tracking section if tracking info is available
  const trackingSection = order.tracking_number ? `
    <hr/>
    <h3>Tracking Information</h3>
    <p><strong>Carrier:</strong> ${order.tracking_carrier || 'USPS'}</p>
    <p><strong>Tracking Number:</strong> <span style="font-family:monospace;">${order.tracking_number}</span></p>
    <p><a href="${order.label_url}" target="_blank">Download Shipping Label (PDF)</a></p>
    <p><a href="https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=${order.tracking_number}" target="_blank">Track Your Package</a></p>
  ` : '';

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
      ${trackingSection}
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

// Helper function to get tracking URL
function getTrackingUrl(carrier, number) {
  if (!carrier || !number) return null;
  
  switch (carrier.toUpperCase()) {
    case 'USPS':
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`;
    case 'FEDEX':
      return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
    case 'UPS':
      return `https://www.ups.com/track?tracknum=${number}`;
    case 'DHL':
      return `https://www.dhl.com/en/express/tracking.html?AWB=${number}`;
    default:
      return `https://www.google.com/search?q=${carrier}+tracking+${number}`;
  }
}

export async function sendTrackingEmail(order, emailType, trackingStatus) {
  const trackingUrl = getTrackingUrl(order.tracking_carrier || 'USPS', order.tracking_number);
  
  let subject, title, message, ctaText, ctaUrl;
  
  switch (emailType) {
    case 'shipped':
      subject = `Your order ${order.order_number} has shipped!`;
      title = 'Your order is on its way! 🚚';
      message = 'Great news! Your order has been shipped and is now in transit. You can track its progress using the link below.';
      ctaText = 'Track Your Package';
      ctaUrl = trackingUrl;
      break;
      
    case 'out_for_delivery':
      subject = `Your order ${order.order_number} is out for delivery!`;
      title = 'Your package is out for delivery! 📦';
      message = 'Your order is out for delivery today! Please make sure someone is available to receive the package.';
      ctaText = 'Track Your Package';
      ctaUrl = trackingUrl;
      break;
      
    case 'delivered':
      subject = `Your order ${order.order_number} has been delivered!`;
      title = 'Your package has been delivered! ✅';
      message = 'Your order has been successfully delivered! Please check your doorstep or mailbox.';
      ctaText = 'Track Your Package';
      ctaUrl = trackingUrl;
      break;
      
    default:
      subject = `Update on your order ${order.order_number}`;
      title = 'Order Status Update';
      message = `Your order status has been updated to: ${trackingStatus}`;
      ctaText = 'Track Your Package';
      ctaUrl = trackingUrl;
  }

  // Build order items HTML
  const itemsHtml = order.order_items?.map(item => `
    <li style="margin-bottom:8px;">
      <strong>${item.product?.product_name || 'Product'}</strong><br/>
      Quantity: ${item.quantity}<br/>
      Price: $${item.unit_price}
    </li>
  `).join('') || '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <p style="font-size: 16px; line-height: 1.6;">${message}</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> <span style="font-family:monospace; color: #667eea;">${order.order_number}</span></p>
          <p><strong>Tracking Number:</strong> <span style="font-family:monospace; color: #667eea;">${order.tracking_number}</span></p>
          <p><strong>Carrier:</strong> ${order.tracking_carrier || 'USPS'}</p>
          
          ${itemsHtml ? `
            <h4>Items in this order:</h4>
            <ul style="padding-left: 20px;">${itemsHtml}</ul>
          ` : ''}
        </div>
        
        ${ctaUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ctaUrl}" target="_blank" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ${ctaText}
            </a>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666;">
          If you have any questions about your order, please reply to this email with your order number.
        </p>
        
        <p style="font-size: 12px; color: #999;">
          This is an automated email from Your Shop. If you did not place this order, please contact support immediately.
        </p>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to: order.email,
    subject,
    html,
  });
} 