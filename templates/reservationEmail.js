
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
    nights,
    language = 'en', // Default to English
    paymentMethod = 'blik' // 'blik' or 'transfer'
  } = data;

  // Retrieve payment details from Environment Variables
  const RECIPIENT_NAME = process.env.BANK_RECIPIENT_NAME || 'UrbanStay Rentals';
  const IBAN = process.env.BANK_ACCOUNT_NUMBER || 'PL 00 0000 0000 0000 0000 0000 0000';
  const SWIFT = process.env.BANK_SWIFT || 'SWIFT_CODE';
  const BANK_NAME = process.env.BANK_NAME || 'Bank Name';
  const BLIK_PHONE = process.env.BLIK_PHONE_NUMBER || '+48 000 000 000';

  const isPl = language === 'pl';
  const isBlik = paymentMethod === 'blik';

  // Translation Dictionaries
  const text = {
    header: isPl ? 'Potwierdzenie Rezerwacji' : 'Reservation Confirmation',
    thankYou: isPl 
      ? 'Dziękujemy za złożenie zapytania rezerwacyjnego. Poniżej znajdują się szczegóły Twojego pobytu.'
      : 'Thank you for your reservation request. Below you will find the details of your stay.',
    propLabel: isPl ? 'Nieruchomość:' : 'Property:',
    guestLabel: isPl ? 'Gość:' : 'Guest:',
    phoneLabel: isPl ? 'Telefon:' : 'Phone:',
    emailLabel: isPl ? 'Email:' : 'Email:',
    datesLabel: isPl ? 'Data:' : 'Dates:',
    durationLabel: isPl ? 'Długość:' : 'Duration:',
    guestsLabel: isPl ? 'Goście:' : 'Guests:',
    priceLabel: isPl ? 'Do Zapłaty:' : 'Total Price:',
    nightsLabel: isPl ? 'nocy' : 'nights',
    
    payHeader: isPl ? 'Instrukcje Płatności' : 'Payment Instructions',
    payIntro: isPl 
      ? `Aby ostatecznie potwierdzić rezerwację, prosimy o dokonanie płatności w ciągu 2 godzin, korzystając z wybranej metody (${isBlik ? 'BLIK' : 'Przelew'}).`
      : `To finalize your booking confirmation, please complete the payment within 2 hours using your selected method (${isBlik ? 'BLIK' : 'Bank Transfer'}).`,
    
    payRecipient: isPl ? 'Odbiorca:' : 'Recipient:',
    payBank: isPl ? 'Bank:' : 'Bank:',
    payAccount: isPl ? 'Numer Konta:' : 'Account Number:',
    payTitle: isPl ? 'Tytułem:' : 'Transfer Title:',
    payBlik: isPl ? 'Telefon BLIK:' : 'BLIK Phone:',
    
    titleValue: isPl 
      ? `Rezerwacja ${checkIn} ${lastName}`
      : `Reservation ${checkIn} ${lastName}`,
    
    footer: isPl 
      ? 'W razie pytań prosimy o kontakt zwrotny.'
      : 'If you have any questions, please reply to this email.'
  };

  // Dynamic Payment Section HTML
  let paymentDetailsHtml = '';

  if (isBlik) {
    paymentDetailsHtml = `
      <div style="background-color: #eef2ff; padding: 15px; border-radius: 6px; border-left: 4px solid #006ce4; margin-top: 15px;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #003580;">BLIK Transfer</div>
        <div style="margin-bottom: 5px;">${text.payRecipient} <strong>${RECIPIENT_NAME}</strong></div>
        <div style="margin-bottom: 5px; font-size: 18px;">${text.payBlik} <strong style="color: #000;">${BLIK_PHONE}</strong></div>
        <div>${text.payTitle} <strong>${text.titleValue}</strong></div>
      </div>
    `;
  } else {
    paymentDetailsHtml = `
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a; margin-top: 15px;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #15803d;">Bank Transfer</div>
        <div style="margin-bottom: 5px;">${text.payRecipient} <strong>${RECIPIENT_NAME}</strong></div>
        <div style="margin-bottom: 5px;">${text.payBank} ${BANK_NAME}</div>
        <div style="margin-bottom: 5px; font-size: 16px;">${text.payAccount} <br/><strong style="font-family: monospace; color: #000;">${IBAN}</strong></div>
        <div style="margin-bottom: 5px;">SWIFT/BIC: ${SWIFT}</div>
        <div>${text.payTitle} <strong>${text.titleValue}</strong></div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
  .wrapper { width: 100%; background-color: #f5f5f5; padding: 20px 0; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .header { background-color: #003580; color: white; padding: 25px; text-align: center; }
  .header h2 { margin: 0; font-size: 22px; font-weight: 600; }
  .content { padding: 30px; }
  .intro { margin-bottom: 25px; color: #555; }
  .details-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
  .details-table td { padding: 10px 0; border-bottom: 1px solid #eee; vertical-align: top; }
  .details-table .label { font-weight: bold; color: #666; width: 130px; }
  .details-table .val { color: #111; font-weight: 500; }
  .total-row td { border-top: 2px solid #003580; border-bottom: none; padding-top: 15px; color: #003580; font-size: 18px; font-weight: bold; }
  .payment-section { background-color: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h2>${text.header}</h2>
      </div>
      <div class="content">
        <p class="intro">${text.thankYou}</p>
        
        <table class="details-table">
          <tr>
            <td class="label">${text.propLabel}</td>
            <td class="val">${apartmentTitle}</td>
          </tr>
          <tr>
            <td class="label">${text.guestLabel}</td>
            <td class="val">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td class="label">${text.phoneLabel}</td>
            <td class="val">${phone}</td>
          </tr>
          <tr>
            <td class="label">${text.emailLabel}</td>
            <td class="val"><a href="mailto:${email}" style="color: #006ce4; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td class="label">${text.datesLabel}</td>
            <td class="val">${checkIn} — ${checkOut}</td>
          </tr>
          <tr>
            <td class="label">${text.durationLabel}</td>
            <td class="val">${nights} ${text.nightsLabel}</td>
          </tr>
          <tr>
            <td class="label">${text.guestsLabel}</td>
            <td class="val">${guests}</td>
          </tr>
          <tr class="total-row">
            <td class="label">${text.priceLabel}</td>
            <td class="val">${totalPrice}</td>
          </tr>
        </table>

        <div class="payment-section">
          <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 18px; color: #333;">${text.payHeader}</h3>
          <p style="margin: 0 0 15px 0; font-size: 14px; color: #555;">${text.payIntro}</p>
          
          ${paymentDetailsHtml}
        </div>

      </div>
      <div class="footer">
        ${text.footer}<br/>
        StayInWarsaw.pl
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};
