/**
 * Booking Email Service - Ultra Premium HD Template
 * Sends stunning booking confirmation emails to passengers
 */

const nodemailer = require('nodemailer');
const contactConfig = require('../config/contactSettings');

class BookingEmailService {
  constructor() {
    this.fromEmail = process.env.EMAIL_USER || 'info@wegofare.com';
    this.ccEmail = 'sam@farebulk.com';
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      console.log('📧 Booking email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  }

  async sendBookingConfirmation(bookingData) {
    if (!this.transporter) {
      console.log('[EMAIL] Transporter not available');
      return { sent: false, reason: 'Email service not configured' };
    }

    const { contact, contactInfo, passengers, flight, outboundFlight, returnFlight, referenceNumber, flightDetails, returnFlightDetails } = bookingData;
    const primaryFlight = outboundFlight || flight || flightDetails;
    const passengerEmail = contact?.email || contactInfo?.email;
    
    if (!passengerEmail) {
      console.log('[EMAIL] No passenger email provided');
      return { sent: false, reason: 'No email address provided' };
    }

    const htmlContent = this.generateConfirmationHTML(bookingData);
    const textContent = this.generateConfirmationText(bookingData);

    try {
      const info = await this.transporter.sendMail({
        from: `"WegoFare ✈️" <${this.fromEmail}>`,
        to: passengerEmail,
        cc: this.ccEmail,
        subject: `🎉 Confirmed! ${primaryFlight?.from?.code} → ${primaryFlight?.to?.code} | Ref: ${referenceNumber}`,
        html: htmlContent,
        text: textContent
      });

      console.log(`📧 Booking confirmation sent to ${passengerEmail}, CC: ${this.ccEmail}`);
      return { sent: true, messageId: info.messageId };
    } catch (error) {
      console.error('[EMAIL] Failed to send confirmation:', error.message);
      return { sent: false, error: error.message };
    }
  }

  getAirlineLogo(code) {
    const c = (code || 'XX').toUpperCase();
    return `https://images.kiwi.com/airlines/128/${c}.png`;
  }

  getAirlineData(code) {
    const airlines = {
      'AA': { name: 'American Airlines', primary: '#C9102F', secondary: '#0078D2', accent: '#FFFFFF' },
      'UA': { name: 'United Airlines', primary: '#002244', secondary: '#00A1E4', accent: '#FFFFFF' },
      'DL': { name: 'Delta Air Lines', primary: '#00234F', secondary: '#C8102E', accent: '#FFFFFF' },
      'WN': { name: 'Southwest Airlines', primary: '#304CB2', secondary: '#FFBF27', accent: '#FFFFFF' },
      'B6': { name: 'JetBlue Airways', primary: '#003DA5', secondary: '#00BDF2', accent: '#FFFFFF' },
      'AS': { name: 'Alaska Airlines', primary: '#00274C', secondary: '#01A4E4', accent: '#FFFFFF' },
      'NK': { name: 'Spirit Airlines', primary: '#FFC72C', secondary: '#1D1D1D', accent: '#000000' },
      'F9': { name: 'Frontier Airlines', primary: '#004624', secondary: '#7BC240', accent: '#FFFFFF' },
      'HA': { name: 'Hawaiian Airlines', primary: '#4E2583', secondary: '#D62C77', accent: '#FFFFFF' },
      'BA': { name: 'British Airways', primary: '#003876', secondary: '#C8102E', accent: '#FFFFFF' },
      'LH': { name: 'Lufthansa', primary: '#00234F', secondary: '#FFB300', accent: '#FFFFFF' },
      'AF': { name: 'Air France', primary: '#002157', secondary: '#EF3E42', accent: '#FFFFFF' },
      'EK': { name: 'Emirates', primary: '#C8102E', secondary: '#D4A259', accent: '#FFFFFF' },
      'QR': { name: 'Qatar Airways', primary: '#5E1632', secondary: '#8C7853', accent: '#FFFFFF' },
      'SQ': { name: 'Singapore Airlines', primary: '#F7A800', secondary: '#1D3557', accent: '#FFFFFF' },
      'CX': { name: 'Cathay Pacific', primary: '#005A6F', secondary: '#006564', accent: '#FFFFFF' },
      'AI': { name: 'Air India', primary: '#E31837', secondary: '#F7941E', accent: '#FFFFFF' },
      'EY': { name: 'Etihad Airways', primary: '#C9A961', secondary: '#1C1C1C', accent: '#FFFFFF' },
      'TK': { name: 'Turkish Airlines', primary: '#C8102E', secondary: '#002D72', accent: '#FFFFFF' },
      'QF': { name: 'Qantas', primary: '#E31837', secondary: '#FFFFFF', accent: '#FFFFFF' },
      'AC': { name: 'Air Canada', primary: '#F01428', secondary: '#231F20', accent: '#FFFFFF' },
      'NH': { name: 'All Nippon Airways', primary: '#1B3C6F', secondary: '#00A0DF', accent: '#FFFFFF' },
      'JL': { name: 'Japan Airlines', primary: '#BE0029', secondary: '#231F20', accent: '#FFFFFF' },
    };
    return airlines[code?.toUpperCase()] || { name: code, primary: '#0ea5e9', secondary: '#6366f1', accent: '#FFFFFF' };
  }

  generateConfirmationHTML(bookingData) {
    const { contact, contactInfo, passengers, flight, outboundFlight, returnFlight, referenceNumber, totalPrice, finalAmount, selectedSeats, searchParams, taxesAndFees, seatCharges, bookingDate } = bookingData;
    const contactData = contact || contactInfo || {};
    
    const primaryFlight = outboundFlight || flight;
    const bookingDateFormatted = bookingDate 
      ? new Date(bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    
    const airline = this.getAirlineData(primaryFlight?.airline);
    const airlineLogo = this.getAirlineLogo(primaryFlight?.airline);

    const createFlightSection = (flightData, isReturn, travelDate) => {
      const al = this.getAirlineData(flightData?.airline);
      const logo = this.getAirlineLogo(flightData?.airline);
      const stops = flightData?.stops || 0;
      const stopCity = flightData?.stopover?.city || flightData?.stopovers?.[0]?.city || '';
      const stopCode = flightData?.stopover?.code || flightData?.stopovers?.[0]?.code || '';
      const stopDuration = flightData?.stopover?.duration || flightData?.stopovers?.[0]?.duration || '';
      
      return `
        <!-- FLIGHT TICKET CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                
                <!-- Airline Header Band -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${al.primary} 0%, ${al.secondary} 100%); padding: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 24px 32px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="80" style="vertical-align: middle;">
                                <div style="width: 72px; height: 72px; background: #ffffff; border-radius: 16px; padding: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
                                  <img src="${logo}" alt="${flightData?.airlineName || al.name}" width="56" height="56" style="display: block; object-fit: contain;" onerror="this.src='https://via.placeholder.com/56x56/ffffff/333333?text=✈️'">
                                </div>
                              </td>
                              <td style="padding-left: 20px; vertical-align: middle;">
                                <p style="margin: 0; font-size: 22px; font-weight: 800; color: ${al.accent}; letter-spacing: -0.5px;">${flightData?.airlineName || al.name}</p>
                                <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">
                                  <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 6px; font-weight: 700; letter-spacing: 1px;">${flightData?.flightNumber}</span>
                                  <span style="margin-left: 12px; opacity: 0.9;">${isReturn ? '↩ Return' : '→ Departure'}</span>
                                </p>
                              </td>
                              <td style="text-align: right; vertical-align: middle;">
                                <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1.5px;">Travel Date</p>
                                <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: ${al.accent};">${travelDate || 'TBD'}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Flight Route Section -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Departure -->
                        <td width="30%" style="text-align: center; vertical-align: top;">
                          <p style="margin: 0; font-size: 52px; font-weight: 900; color: #0f172a; letter-spacing: -2px; line-height: 1;">${flightData?.from?.code}</p>
                          <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; font-weight: 500;">${flightData?.from?.city || flightData?.from?.name || ''}</p>
                          <div style="margin-top: 20px;">
                            <p style="margin: 0; font-size: 36px; font-weight: 800; color: ${al.primary};">${flightData?.departure?.time}</p>
                            <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Departs</p>
                          </div>
                        </td>
                        
                        <!-- Flight Path -->
                        <td width="40%" style="text-align: center; vertical-align: middle; padding: 0 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="text-align: center;">
                                <!-- Duration -->
                                <p style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #334155;">${flightData?.duration || ''}</p>
                                
                                <!-- Flight Line -->
                                <div style="position: relative; height: 60px;">
                                  <!-- Base Line -->
                                  <div style="position: absolute; top: 50%; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${al.primary}, ${al.secondary}); transform: translateY(-50%); border-radius: 4px;"></div>
                                  
                                  <!-- Origin Dot -->
                                  <div style="position: absolute; top: 50%; left: 0; transform: translateY(-50%); width: 16px; height: 16px; background: ${al.primary}; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 4px 12px ${al.primary}66;"></div>
                                  
                                  ${stops > 0 ? `
                                  <!-- Stopover Marker -->
                                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                                    <div style="width: 20px; height: 20px; background: #f59e0b; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);"></div>
                                  </div>
                                  ` : `
                                  <!-- Airplane Icon -->
                                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: linear-gradient(135deg, ${al.primary}, ${al.secondary}); border-radius: 50%; box-shadow: 0 8px 24px ${al.primary}55;">
                                    <table width="100%" height="100%" cellpadding="0" cellspacing="0" border="0">
                                      <tr><td align="center" valign="middle" style="font-size: 22px;">✈️</td></tr>
                                    </table>
                                  </div>
                                  `}
                                  
                                  <!-- Destination Dot -->
                                  <div style="position: absolute; top: 50%; right: 0; transform: translateY(-50%); width: 16px; height: 16px; background: ${al.secondary}; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 4px 12px ${al.secondary}66;"></div>
                                </div>
                                
                                <!-- Stop Info -->
                                <div style="margin-top: 16px;">
                                  ${stops === 0 ? `
                                  <span style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;">✓ NON-STOP</span>
                                  ` : `
                                  <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 2px solid #f59e0b; border-radius: 12px; padding: 12px 16px; display: inline-block;">
                                    <p style="margin: 0; font-size: 11px; color: #92400e; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Layover${stopCode ? ` in ${stopCode}` : ''}</p>
                                    ${stopCity ? `<p style="margin: 4px 0 0; font-size: 14px; color: #78350f; font-weight: 600;">${stopCity}</p>` : ''}
                                    ${stopDuration ? `<p style="margin: 4px 0 0; font-size: 13px; color: #92400e;">⏱ ${stopDuration}</p>` : `<p style="margin: 4px 0 0; font-size: 13px; color: #92400e;">${stops} connection${stops > 1 ? 's' : ''}</p>`}
                                  </div>
                                  `}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                        
                        <!-- Arrival -->
                        <td width="30%" style="text-align: center; vertical-align: top;">
                          <p style="margin: 0; font-size: 52px; font-weight: 900; color: #0f172a; letter-spacing: -2px; line-height: 1;">${flightData?.to?.code}</p>
                          <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; font-weight: 500;">${flightData?.to?.city || flightData?.to?.name || ''}</p>
                          <div style="margin-top: 20px;">
                            <p style="margin: 0; font-size: 36px; font-weight: 800; color: ${al.secondary};">${flightData?.arrival?.time}</p>
                            <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Arrives</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Flight Details Footer -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 20px 32px; border-top: 2px dashed #e2e8f0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="33%" style="text-align: center; padding: 8px;">
                          <p style="margin: 0; font-size: 20px;">💺</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #0f172a; font-weight: 600;">${flightData?.cabin || 'Economy'}</p>
                          <p style="margin: 2px 0 0; font-size: 11px; color: #94a3b8;">Class</p>
                        </td>
                        <td width="34%" style="text-align: center; padding: 8px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                          <p style="margin: 0; font-size: 20px;">🧳</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #0f172a; font-weight: 600;">Carry-on</p>
                          <p style="margin: 2px 0 0; font-size: 11px; color: #94a3b8;">Included</p>
                        </td>
                        <td width="33%" style="text-align: center; padding: 8px;">
                          <p style="margin: 0; font-size: 20px;">🎒</p>
                          <p style="margin: 4px 0 0; font-size: 13px; color: #0f172a; font-weight: 600;">Personal</p>
                          <p style="margin: 2px 0 0; font-size: 11px; color: #94a3b8;">Item</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      `;
    };

    // Passenger cards
    const passengerRows = passengers?.map((p, i) => `
      <tr>
        <td style="padding: 8px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8fafc, #ffffff); border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
            <tr>
              <td width="6" style="background: linear-gradient(180deg, ${airline.primary}, ${airline.secondary});"></td>
              <td style="padding: 20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="56" style="vertical-align: middle;">
                      <div style="width: 52px; height: 52px; background: linear-gradient(135deg, ${airline.primary}, ${airline.secondary}); border-radius: 50%; text-align: center; line-height: 52px; color: white; font-size: 20px; font-weight: 800;">
                        ${(p.firstName?.charAt(0) || '').toUpperCase()}${(p.lastName?.charAt(0) || '').toUpperCase()}
                      </div>
                    </td>
                    <td style="padding-left: 16px; vertical-align: middle;">
                      <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a;">${p.firstName} ${p.lastName}</p>
                      <p style="margin: 6px 0 0;">
                        <span style="display: inline-block; background: ${p.type === 'adult' ? '#dbeafe' : p.type === 'child' ? '#fef3c7' : '#f3e8ff'}; color: ${p.type === 'adult' ? '#1e40af' : p.type === 'child' ? '#92400e' : '#7c3aed'}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${p.type || 'Adult'}</span>
                        ${p.gender ? `<span style="margin-left: 8px; color: #64748b; font-size: 13px;">${p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}</span>` : ''}
                      </p>
                    </td>
                    <td style="text-align: right; vertical-align: middle;">
                      ${selectedSeats?.[i] ? `
                      <div style="background: linear-gradient(135deg, ${airline.primary}, ${airline.secondary}); color: white; padding: 12px 20px; border-radius: 12px; display: inline-block;">
                        <p style="margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Seat</p>
                        <p style="margin: 2px 0 0; font-size: 20px; font-weight: 800;">${selectedSeats[i].seat || selectedSeats[i]}</p>
                      </div>
                      ` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('') || '';

    return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Booking Confirmed - ${referenceNumber}</title>
  <!--[if mso]>
  <style>table,td,div,p,span{font-family:Arial,sans-serif!important;}</style>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #ffffff !important; }
      .no-print { display: none !important; }
      .email-container { max-width: 100% !important; }
    }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .fluid { max-width: 100% !important; height: auto !important; }
      .stack-column { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Hidden Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    🎉 Your flight is confirmed! ${primaryFlight?.from?.code} → ${primaryFlight?.to?.code} | Ref: ${referenceNumber} | ${searchParams?.date || 'Check your dates'}
  </div>
  
  <!-- Email Container -->
  <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; margin: 0 auto;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Print Button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="no-print" style="margin-bottom: 24px;">
          <tr>
            <td align="center">
              <a href="javascript:window.print();" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 8px 24px rgba(16,185,129,0.4);">
                🖨️ Print Itinerary
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Logo -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 20px 40px; border-radius: 20px; box-shadow: 0 12px 40px rgba(14,165,233,0.4);">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 32px; font-weight: 900; color: white; letter-spacing: -1px;">✈️ WegoFare</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Success Hero -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); border-radius: 28px; overflow: hidden; box-shadow: 0 24px 80px rgba(16,185,129,0.35);">
                <tr>
                  <td style="padding: 56px 40px; text-align: center;">
                    <!-- Success Icon -->
                    <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom: 24px;">
                      <tr>
                        <td style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="font-size: 56px; line-height: 100px;">✓</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="margin: 0; font-size: 40px; font-weight: 900; color: white; letter-spacing: -1px;">Booking Confirmed!</h1>
                    <p style="margin: 16px 0 0; font-size: 18px; color: rgba(255,255,255,0.9); font-weight: 500;">Your journey is all set. Get ready to fly!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Confirmation Number -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1e293b, #334155); border-radius: 24px; border: 2px solid #475569; overflow: hidden;">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Confirmation Number</p>
                    <p style="margin: 16px 0; font-size: 48px; font-weight: 900; color: #fbbf24; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; text-shadow: 0 4px 12px rgba(251,191,36,0.3);">${referenceNumber}</p>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">📅 Booked on ${bookingDateFormatted}</p>
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #475569;">
                      <p style="margin: 0; font-size: 13px; color: #94a3b8;">💡 Save this number for check-in & airport assistance</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Flight Sections -->
        ${createFlightSection(primaryFlight, false, searchParams?.date)}
        ${returnFlight ? createFlightSection(returnFlight, true, searchParams?.returnDate) : ''}
        
        <!-- Passengers -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td width="52" style="vertical-align: middle;">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px;">👥</div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: middle;">
                          <p style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Passengers</p>
                          <p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">${passengers?.length || 0} traveler${(passengers?.length || 0) !== 1 ? 's' : ''}</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      ${passengerRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Contact Info -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td width="52" style="vertical-align: middle;">
                          <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px;">📧</div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: middle;">
                          <p style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Contact Details</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding: 8px;">
                          <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Email Address</p>
                            <p style="margin: 8px 0 0; font-size: 16px; color: #0f172a; font-weight: 600; word-break: break-all;">${contactData?.email || 'N/A'}</p>
                          </div>
                        </td>
                        <td width="50%" style="padding: 8px;">
                          <div style="background: #f8fafc; border-radius: 16px; padding: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Phone Number</p>
                            <p style="margin: 8px 0 0; font-size: 16px; color: #0f172a; font-weight: 600;">${contactData?.countryCode || ''} ${contactData?.phone || 'N/A'}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Payment Summary -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 24px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="52" style="vertical-align: middle;">
                          <div style="width: 48px; height: 48px; background: #ffffff; border-radius: 14px; text-align: center; line-height: 48px; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">💳</div>
                        </td>
                        <td style="padding-left: 16px; vertical-align: middle;">
                          <p style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">Payment Summary</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size: 16px; color: #64748b;">Base Fare</td>
                              <td align="right" style="font-size: 16px; color: #0f172a; font-weight: 600;">$${(totalPrice || 0).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size: 16px; color: #64748b;">Taxes & Fees</td>
                              <td align="right" style="font-size: 16px; color: #0f172a; font-weight: 600;">$${(taxesAndFees || 0).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ${seatCharges > 0 ? `
                      <tr>
                        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size: 16px; color: #64748b;">Seat Selection</td>
                              <td align="right" style="font-size: 16px; color: #0f172a; font-weight: 600;">$${(seatCharges || 0).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 24px 0 0;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="font-size: 20px; color: #0f172a; font-weight: 800;">Total Paid</td>
                              <td align="right" style="font-size: 32px; font-weight: 900; color: #10b981;">$${(finalAmount || 0).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 20px; background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 14px; padding: 16px 20px;">
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td width="32" style="font-size: 20px;">✅</td>
                          <td style="font-size: 15px; color: #059669; font-weight: 700;">Payment Successful</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Important Info -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 24px; border: 3px solid #f59e0b; overflow: hidden;">
                <tr>
                  <td style="padding: 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="56" style="vertical-align: top;">
                          <div style="width: 52px; height: 52px; background: #f59e0b; border-radius: 14px; text-align: center; line-height: 52px; font-size: 26px;">⚠️</div>
                        </td>
                        <td style="padding-left: 20px; vertical-align: top;">
                          <p style="margin: 0 0 20px; font-size: 20px; font-weight: 800; color: #92400e;">Important Travel Info</p>
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr><td style="padding: 8px 0; font-size: 15px; color: #78350f; line-height: 1.6;">✓ <strong>Arrive early:</strong> 2hrs (domestic) / 3hrs (international)</td></tr>
                            <tr><td style="padding: 8px 0; font-size: 15px; color: #78350f; line-height: 1.6;">✓ <strong>ID Required:</strong> Valid photo ID for all passengers</td></tr>
                            <tr><td style="padding: 8px 0; font-size: 15px; color: #78350f; line-height: 1.6;">✓ <strong>Baggage:</strong> Check airline allowance before travel</td></tr>
                            <tr><td style="padding: 8px 0; font-size: 15px; color: #78350f; line-height: 1.6;">✓ <strong>Check-in:</strong> Opens 24-48 hours before departure</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- CTA Buttons -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;" class="no-print">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 8px;">
                    <a href="https://wegofare.com/booking/${referenceNumber}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 18px 40px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 12px 32px rgba(14,165,233,0.4);">
                      📋 View Booking
                    </a>
                  </td>
                  <td style="padding: 8px;">
                    <a href="https://wegofare.com/booking/${referenceNumber}?print=1" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 18px 40px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 12px 32px rgba(16,185,129,0.4);">
                      🖨️ Print Ticket
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Boarding Pass Style -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.1); border: 3px dashed #cbd5e1;">
                <tr>
                  <td style="background: linear-gradient(135deg, #1e293b, #334155); padding: 24px; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Electronic Ticket</p>
                    <p style="margin: 8px 0 0; font-size: 28px; font-weight: 900; color: white;">${primaryFlight?.from?.code} ✈ ${primaryFlight?.to?.code}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" style="padding: 12px;">
                          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Passenger</p>
                          <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${passengers?.[0]?.firstName} ${passengers?.[0]?.lastName}</p>
                        </td>
                        <td width="50%" style="padding: 12px; text-align: right;">
                          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Confirmation</p>
                          <p style="margin: 6px 0 0; font-size: 18px; font-weight: 800; color: #fbbf24; font-family: monospace;">${referenceNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 12px;">
                          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Flight</p>
                          <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${primaryFlight?.flightNumber}</p>
                        </td>
                        <td width="50%" style="padding: 12px; text-align: right;">
                          <p style="margin: 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Date</p>
                          <p style="margin: 6px 0 0; font-size: 18px; font-weight: 700; color: #0f172a;">${searchParams?.date || 'TBD'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 2px dashed #e2e8f0;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">Present this at check-in counter or use online check-in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Support -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 32px;">
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #1e293b, #334155); border-radius: 24px; border: 2px solid #475569; overflow: hidden;">
                <tr>
                  <td style="padding: 40px; text-align: center;">
                    <div style="width: 72px; height: 72px; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 50%; margin: 0 auto 24px; text-align: center; line-height: 72px; font-size: 32px;">🎧</div>
                    <p style="margin: 0; font-size: 24px; font-weight: 800; color: white;">Need Help?</p>
                    <p style="margin: 12px 0 24px; font-size: 15px; color: #94a3b8;">Our travel experts are available 24/7</p>
                    <a href="tel:+18444800252" style="display: inline-block; background: #ffffff; color: #0f172a; padding: 16px 40px; border-radius: 14px; text-decoration: none; font-size: 22px; font-weight: 900;">
                      📞 ${contactConfig.getContactSettings().tfn}
                    </a>
                    <p style="margin: 20px 0 0; font-size: 14px;">
                      <a href="mailto:info@wegofare.com" style="color: #0ea5e9; text-decoration: none;">info@wegofare.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 24px; text-align: center;">
              <p style="margin: 0 0 16px;">
                <a href="https://wegofare.com" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 14px;">Website</a>
                <span style="color: #475569;">•</span>
                <a href="https://wegofare.com/privacy" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 14px;">Privacy</a>
                <span style="color: #475569;">•</span>
                <a href="https://wegofare.com/terms" style="color: #94a3b8; text-decoration: none; margin: 0 12px; font-size: 14px;">Terms</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #64748b;">wegofare.com</p>
              <p style="margin: 6px 0; font-size: 12px; color: #475569;">447 Broadway, New York, NY 10013 USA</p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #475569;">© ${new Date().getFullYear()} WegoFare. All rights reserved.</p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
    `;
  }

  generateConfirmationText(bookingData) {
    const { contact, contactInfo, passengers, flight, outboundFlight, returnFlight, referenceNumber, totalPrice, finalAmount, selectedSeats, searchParams } = bookingData;
    const primaryFlight = outboundFlight || flight;
    const contactData = contact || contactInfo || {};
    const passengerList = passengers?.map((p, i) => `  ${i + 1}. ${p.firstName} ${p.lastName} (${p.type})`).join('\n') || '';
    const seatList = selectedSeats?.map(s => s.seat || s).join(', ') || 'None';

    return `
══════════════════════════════════════════════
           ✈️  BOOKING CONFIRMATION  ✈️
══════════════════════════════════════════════

REFERENCE: ${referenceNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FLIGHT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${primaryFlight?.from?.code} ────────✈──────── ${primaryFlight?.to?.code}

Airline:    ${primaryFlight?.airlineName || primaryFlight?.airline}
Flight:     ${primaryFlight?.flightNumber}
Date:       ${searchParams?.date || 'TBD'}
Departure:  ${primaryFlight?.departure?.time}
Arrival:    ${primaryFlight?.arrival?.time}
Duration:   ${primaryFlight?.duration || 'N/A'}
${primaryFlight?.stops === 0 ? '✓ Non-stop flight' : `Stops: ${primaryFlight?.stops}`}

${returnFlight ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURN FLIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${returnFlight?.from?.code} ────────✈──────── ${returnFlight?.to?.code}

Airline:    ${returnFlight?.airlineName || returnFlight?.airline}
Flight:     ${returnFlight?.flightNumber}
Date:       ${searchParams?.returnDate || 'TBD'}
Departure:  ${returnFlight?.departure?.time}
Arrival:    ${returnFlight?.arrival?.time}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSENGERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${passengerList}

Seats: ${seatList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${contactData?.email || 'N/A'}
Phone: ${contactData?.countryCode || ''} ${contactData?.phone || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Fare:   $${(totalPrice || 0).toFixed(2)}
Taxes/Fees:  $${(bookingData.taxesAndFees || 0).toFixed(2)}
─────────────────────────────
TOTAL PAID:  $${(finalAmount || 0).toFixed(2)} ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Arrive 2hrs (domestic) / 3hrs (international) early
• Bring valid photo ID for all passengers
• Check baggage allowance with your airline
• Online check-in opens 24-48 hours before

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED HELP? Call 24/7: ${contactConfig.getContactSettings().tfn}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

wegofare.com
447 Broadway, New York, NY 10013 USA

══════════════════════════════════════════════
    `.trim();
  }
}

const bookingEmailService = new BookingEmailService();
module.exports = bookingEmailService;
