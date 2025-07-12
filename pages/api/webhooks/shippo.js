import { supabase } from '../../../lib/supabaseClient';
import { sendTrackingEmail } from '../../../lib/email';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🚢 Shippo webhook received:', {
    event: req.body.event,
    tracking_number: req.body.data?.tracking_number,
    status: req.body.data?.tracking_status?.status
  });

  const event = req.body;

  // Only handle track_updated events
  if (event.event === 'track_updated') {
    const trackingNumber = event.data.tracking_number;
    const trackingStatus = event.data.tracking_status?.status;
    const trackingHistory = event.data.tracking_status?.tracking_history || [];

    console.log('📦 Processing tracking update:', {
      tracking_number: trackingNumber,
      status: trackingStatus,
      history_count: trackingHistory.length
    });

    if (!trackingNumber) {
      console.error('❌ No tracking number in webhook data');
      return res.status(400).json({ error: 'No tracking number provided' });
    }

    try {
      // Map Shippo status to our order status
      let orderStatus;
      let emailType;
      
      switch (trackingStatus) {
        case 'DELIVERED':
          orderStatus = 'delivered';
          emailType = 'delivered';
          break;
        case 'IN_TRANSIT':
          orderStatus = 'in_transit';
          emailType = 'shipped';
          break;
        case 'SHIPPED':
          orderStatus = 'shipped';
          emailType = 'shipped';
          break;
        case 'OUT_FOR_DELIVERY':
          orderStatus = 'out_for_delivery';
          emailType = 'out_for_delivery';
          break;
        case 'PICKUP_AVAILABLE':
          orderStatus = 'out_for_delivery';
          emailType = 'out_for_delivery';
          break;
        default:
          orderStatus = 'shipped';
          emailType = 'shipped';
      }

      // Get current order data first
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching order:', fetchError);
        return res.status(500).json({ error: 'Failed to fetch order' });
      }

      if (!currentOrder) {
        console.error('❌ No order found with tracking number:', trackingNumber);
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order in Supabase
      const updateData = { 
        order_status: orderStatus,
        updated_at: new Date().toISOString()
      };

      // Set shipped_at timestamp when status changes to shipped
      if (orderStatus === 'shipped' && currentOrder.order_status !== 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      }

      // Set delivered_at timestamp when status changes to delivered
      if (orderStatus === 'delivered' && currentOrder.order_status !== 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('tracking_number', trackingNumber)
        .select('*')
        .single();

      if (updateError) {
        console.error('❌ Error updating order status:', updateError);
        return res.status(500).json({ error: 'Failed to update order status' });
      }

      console.log('✅ Order status updated:', {
        order_id: updatedOrder.id,
        tracking_number: trackingNumber,
        old_status: currentOrder.order_status,
        new_status: orderStatus,
        shipped_at: updateData.shipped_at,
        delivered_at: updateData.delivered_at
      });

      // Send appropriate email notification
      try {
        await sendTrackingEmail(updatedOrder, emailType, trackingStatus);
        console.log('✅ Tracking email sent:', emailType);
      } catch (emailError) {
        console.error('❌ Error sending tracking email:', emailError);
        // Don't fail the webhook if email fails
      }

      // Log the event for analytics/debugging
      console.log('📊 Webhook processed successfully:', {
        order_id: updatedOrder.id,
        tracking_number: trackingNumber,
        status: orderStatus,
        email_sent: emailType,
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({ 
        success: true,
        order_id: updatedOrder.id,
        status: orderStatus
      });

    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // For other event types, just acknowledge receipt
  console.log('📝 Received non-tracking webhook event:', event.event);
  res.status(200).json({ received: true });
} 