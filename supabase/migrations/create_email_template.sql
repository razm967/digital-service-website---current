-- Insert the email template
INSERT INTO auth.email_templates (template_name, subject, content, created_at, updated_at)
VALUES (
  'order_status_update',
  'Order Status Update - {{StatusFormatted}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .content { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .status { display: inline-block; padding: 8px 16px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
    .status.pending { background: #ffd700; color: #000; }
    .status.in-progress { background: #007bff; color: #fff; }
    .status.completed { background: #28a745; color: #fff; }
    .button { display: inline-block; padding: 12px 24px; background: #007bff; color: #fff; text-decoration: none; border-radius: 4px; margin-top: 20px; }
    .button:hover { background: #0056b3; }
    .footer { text-align: center; padding: 20px 0; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Status Update</h1>
    </div>
    <div class="content">
      <p>Hello {{CustomerName}},</p>
      
      <p>Your order #{{OrderId}} for {{PlanName}} has been updated.</p>
      
      <div class="status {{Status}}">
        New Status: {{StatusFormatted}}
      </div>
      
      {% if Status == ''in_progress'' %}
      <p>We''re now working on your order. We''ll keep you updated on the progress.</p>
      {% elsif Status == ''completed'' %}
      <p>Great news! Your order has been completed. Thank you for choosing our services.</p>
      {% endif %}
      
      <a href="{{OrderURL}}" class="button">View Order Details</a>
      
      <p>If you have any questions, please don''t hesitate to contact us.</p>
      
      <p>Best regards,<br>Your Digital Service Team</p>
    </div>
    <div class="footer">
      <p>This email was sent on {{UpdateDate}}</p>
    </div>
  </div>
</body>
</html>',
  NOW(),
  NOW()
); 