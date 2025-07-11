import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, trackingNumber, trackingCarrier, orderStatus, customerEmail } = req.body;

  if (!orderId || !trackingNumber || !customerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch order details for the email
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        order_number,
        order_items (
          quantity,
          unit_price,
          total_price,
          product:product_id (
            product_name,
            image_url
          )
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return res.status(500).json({ error: 'Error fetching order details' });
    }

    // Build tracking email content
    const emailContent = buildTrackingEmail({
      orderNumber: order.order_number,
      trackingNumber,
      trackingCarrier,
      orderStatus,
      orderItems: order.order_items
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log(`Tracking email sent to ${customerEmail} for order ${order.order_number}`);
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error sending tracking email:', error);
    res.status(500).json({ error: 'Error sending tracking email' });
  }
}

function buildTrackingEmail({ orderNumber, trackingNumber, trackingCarrier, orderStatus, orderItems }) {
  // Build order items HTML
  const itemsHtml = orderItems.map(item => `
    <li style="margin-bottom:8px;">
      <strong>${item.product.product_name}</strong><br/>
      Quantity: ${item.quantity}<br/>
      Price: $${item.unit_price}
    </li>
  `).join('');

  // Get tracking URL based on carrier
  const getTrackingUrl = (carrier, number) => {
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
  };

  const trackingUrl = getTrackingUrl(trackingCarrier, trackingNumber);

  // Email subject based on status
  const getSubject = (status) => {
    switch (status) {
      case 'in_transit':
        return `Your order is being prepared for shipment - ${orderNumber}`;
      case 'shipped':
        return `Your order has shipped! - ${orderNumber}`;
      case 'out_for_delivery':
        return `Your order is out for delivery! - ${orderNumber}`;
      case 'delivered':
        return `Your order has been delivered! - ${orderNumber}`;
      default:
        return `Order status updated - ${orderNumber}`;
    }
  };

  // Email content based on status
  const getStatusMessage = (status) => {
    switch (status) {
      case 'in_transit':
        return `
          <h2>Your order is being prepared for shipment 📦</h2>
          <p>We have received your order and it is being prepared for shipment. You will receive another email when your order ships.</p>
        `;
      case 'shipped':
        return `
          <h2>Your order has shipped! 🚚</h2>
          <p>Great news! Your order has shipped and is on its way to you.</p>
        `;
      case 'out_for_delivery':
        return `
          <h2>Your order is out for delivery! 🚚</h2>
          <p>Your order is out for delivery and should arrive soon.</p>
        `;
      case 'delivered':
        return `
          <h2>Your order has been delivered! 📦</h2>
          <p>Your order has been delivered to your address. We hope you enjoy your purchase!</p>
        `;
      default:
        return `
          <h2>Order status updated</h2>
          <p>Your order status has been updated.</p>
        `;
    }
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${getStatusMessage(orderStatus)}
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order Number:</strong> <span style="font-family:monospace;">${orderNumber}</span></p>
        <p><strong>Status:</strong> ${orderStatus.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
        <p><strong>Carrier:</strong> ${trackingCarrier}</p>
        <p><strong>Tracking Number:</strong> <span style="font-family:monospace;">${trackingNumber}</span></p>
      </div>
      <div style="margin: 20px 0;">
        <a href="${trackingUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Track Your Package
        </a>
      </div>
      <div style="margin: 20px 0;">
        <h3>Order Items:</h3>
        <ul style="padding-left: 20px;">${itemsHtml}</ul>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <div style="font-size: 14px; color: #666;">
        <p>If you have any questions about your order, please reply to this email and include your order number.</p>
        <p>Thank you for shopping with us!</p>
        <small>This is an automated email from Your Shop. If you did not place this order, please contact support immediately.</small>
      </div>
    </div>
  `;

  return {
    subject: getSubject(orderStatus),
    html
  };
} 