
export const generateReservationEmail = (data) => {
  const { 
    apartmentTitle, 
    firstName, 
    lastName, 
    phone, 
    email, 
    checkIn, 
    checkOut, 
    guests, 
    totalPrice, 
    nights 
  } = data;

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
  .header { background-color: #003580; color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
  .content { padding: 20px; background-color: #f9f9f9; }
  .row { margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .label { font-weight: bold; color: #555; display: inline-block; width: 120px; }
  .total { font-size: 1.2em; font-weight: bold; color: #003580; margin-top: 20px; border-top: 2px solid #003580; padding-top: 10px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Reservation Request</h2>
    </div>
    <div class="content">
      <div class="row">
        <span class="label">Property:</span> ${apartmentTitle}
      </div>
      <div class="row">
        <span class="label">Guest:</span> ${firstName} ${lastName}
      </div>
      <div class="row">
        <span class="label">Phone:</span> ${phone}
      </div>
      <div class="row">
        <span class="label">Email:</span> <a href="mailto:${email}">${email}</a>
      </div>
      <div class="row">
        <span class="label">Check-in:</span> ${checkIn}
      </div>
      <div class="row">
        <span class="label">Check-out:</span> ${checkOut}
      </div>
      <div class="row">
        <span class="label">Duration:</span> ${nights} nights
      </div>
      <div class="row">
        <span class="label">Guests:</span> ${guests}
      </div>
      <div class="total">
        Total: ${totalPrice}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
