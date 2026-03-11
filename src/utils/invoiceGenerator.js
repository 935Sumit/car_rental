export const downloadInvoice = (booking, currentUser) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const invoiceContent = `
    <html>
      <head>
        <title>Invoice - ${booking.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&family=Cormorant+Garamond:wght@700&display=swap');
          body { 
            font-family: 'Outfit', sans-serif; 
            color: #584738; 
            background: #F1EADA; 
            padding: 40px; 
          }
          .invoice-wrapper {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 60px;
            border-radius: 4px;
            border: 1px solid #CEC1A8;
            box-shadow: 0 10px 40px rgba(88, 71, 56, 0.1);
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 3px solid #584738;
            padding-bottom: 30px;
            margin-bottom: 50px;
          }
          .logo { 
            font-family: 'Cormorant Garamond', serif; 
            font-size: 36px; 
            font-weight: 700; 
            color: #584738; 
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .title { 
            text-align: right; 
            font-size: 40px; 
            text-transform: uppercase; 
            font-weight: 300; 
            letter-spacing: 5px; 
            color: #7a6a5b;
          }
          .ref { color: #B59E7D; font-size: 14px; margin-top: 5px; font-weight: 700; }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 50px;
          }
          .label { font-size: 11px; text-transform: uppercase; color: #AAA393; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 800; }
          .value { font-size: 16px; font-weight: 600; color: #584738; }

          .line-items { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
          .line-items th { text-align: left; padding: 15px 0; border-bottom: 2px solid #CEC1A8; font-size: 12px; text-transform: uppercase; color: #7a6a5b; letter-spacing: 1px; }
          .line-items td { padding: 20px 0; border-bottom: 1px solid #F1EADA; font-size: 15px; color: #584738; }
          
          .total-section { float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; font-weight: 500; }
          .final-price { border-top: 2px solid #584738; padding-top: 15px; font-size: 28px; font-weight: 700; margin-top: 15px; color: #B59E7D; }
          
          .footer { margin-top: 100px; padding-top: 30px; border-top: 1px solid #CEC1A8; text-align: center; font-size: 12px; color: #AAA393; }
          @media print {
            body { background: white; padding: 0; }
            .invoice-wrapper { border: none; box-shadow: none; border-radius: 0; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-wrapper">
          <div class="header">
            <div class="logo">Vantage Rides Hub</div>
            <div>
              <div class="title">Invoice</div>
              <div class="ref">REF: ${booking.id}</div>
            </div>
          </div>

          <div class="info-grid">
            <div>
              <div class="label">Billed To</div>
              <div class="value">${currentUser.fullName}</div>
              <div class="value">${currentUser.email}</div>
            </div>
            <div>
              <div class="label">Booking Details</div>
              <div class="value">Issued: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              <div class="label" style="margin-top: 15px">Payment Method</div>
              <div class="value">${booking.paymentMethod || 'Cash on Delivery'}</div>
            </div>
          </div>

          <table class="line-items">
            <thead>
              <tr>
                <th>Vehicle Details</th>
                <th>Rental Period</th>
                <th>Daily Rate</th>
                <th style="text-align: right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${booking.carName}</strong><br><small>${booking.driveType || 'Self Drive'}</small></td>
                <td>${booking.startDate} – ${booking.endDate} (${booking.totalDays} Days)</td>
                <td>₹${(booking.totalPrice / booking.totalDays).toLocaleString('en-IN')}</td>
                <td style="text-align: right">₹${booking.subtotal?.toLocaleString('en-IN') || (booking.totalPrice).toLocaleString('en-IN')}</td>
              </tr>
              ${booking.chauffeurFee > 0 ? `
                <tr>
                  <td>Driver Services</td>
                  <td>${booking.totalDays} Days</td>
                  <td>₹500</td>
                  <td style="text-align: right">₹${booking.chauffeurFee.toLocaleString('en-IN')}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row"><span>Subtotal</span><span>₹${(booking.subtotal || booking.totalPrice).toLocaleString('en-IN')}</span></div>
            ${booking.discountPercent > 0 ? `<div class="total-row" style="color: #10b981"><span>Savings (${booking.discountPercent}%)</span><span>-₹${(booking.discountAmount || 0).toLocaleString('en-IN')}</span></div>` : ''}
            <div class="total-row final-price"><span>Total Paid</span><span>₹${booking.totalPrice.toLocaleString('en-IN')}</span></div>
          </div>

          <div style="clear: both"></div>
          
          <div class="footer">
            <p>Thank you for choosing Vantage Rides Hub. Your luxury journey starts here.</p>
            <p>100 ft Road, Anand, Gujarat - 388001 | contact@vantage.com</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `
  printWindow.document.write(invoiceContent)
  printWindow.document.close()
}
