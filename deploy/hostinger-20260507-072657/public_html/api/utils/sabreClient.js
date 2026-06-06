const axios = require('axios');

class SabreClient {
  constructor() {
    this.clientId = process.env.SABRE_CLIENT_ID;
    this.clientSecret = process.env.SABRE_CLIENT_SECRET;
    this.baseUrl = process.env.SABRE_REST_API_URL || 'https://api-crt.cert.havail.sabre.com';
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token from Sabre
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    try {
      // For Sabre, credentials should be in the format: base64(clientId:clientSecret)
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/v2/auth/token`,
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: 'grant_type=client_credentials'
      });

      this.token = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      console.log('Sabre authentication successful');
      return this.token;
    } catch (error) {
      console.error('Sabre Authentication Error:', error.response?.data || error.message);
      console.error('Using credentials - ID length:', this.clientId?.length, 'Secret length:', this.clientSecret?.length);
      throw new Error('Failed to authenticate with Sabre API');
    }
  }

  /**
   * Search for flight offers
   * @param {Object} params - Search parameters
   * @returns {Promise} Flight offers
   */
  async searchFlights(params) {
    try {
      const token = await this.getAccessToken();
      
      const {
        origin,
        destination,
        departureDate,
        returnDate,
        adults = 1,
        children = 0,
        cabinClass = 'Y' // Y=Economy, C=Business, F=First
      } = params;

      const requestBody = {
        OTA_AirLowFareSearchRQ: {
          Version: '1',
          POS: {
            Source: [{
              PseudoCityCode: 'F9CE',
              RequestorID: {
                Type: '1',
                ID: '1',
                CompanyName: {
                  Code: 'TN'
                }
              }
            }]
          },
          OriginDestinationInformation: [
            {
              RPH: '0',
              DepartureDateTime: departureDate,
              OriginLocation: {
                LocationCode: origin
              },
              DestinationLocation: {
                LocationCode: destination
              }
            }
          ],
          TravelPreferences: {
            MaxStopsQuantity: 3,
            CabinPref: [{
              Cabin: cabinClass,
              PreferLevel: 'Preferred'
            }]
          },
          TravelerInfoSummary: {
            AirTravelerAvail: [{
              PassengerTypeQuantity: [{
                Code: 'ADT',
                Quantity: adults
              }]
            }]
          }
        }
      };

      // Add return date if provided (round trip)
      if (returnDate) {
        requestBody.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
          RPH: '1',
          DepartureDateTime: returnDate,
          OriginLocation: {
            LocationCode: destination
          },
          DestinationLocation: {
            LocationCode: origin
          }
        });
      }

      // Add children if provided
      if (children > 0) {
        requestBody.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.push({
          Code: 'CNN',
          Quantity: children
        });
      }

      const response = await axios.post(
        `${this.baseUrl}/v4/offers/shop`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseFlightResponse(response.data);
    } catch (error) {
      console.error('Sabre Flight Search Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get hotel offers
   * @param {Object} params - Search parameters
   * @returns {Promise} Hotel offers
   */
  async searchHotels(params) {
    try {
      const token = await this.getAccessToken();
      
      const {
        destination,
        checkIn,
        checkOut,
        adults = 2,
        rooms = 1
      } = params;

      const requestBody = {
        GetHotelAvailRQ: {
          SearchCriteria: {
            OffSet: 1,
            SortBy: 'TotalRate',
            SortOrder: 'ASC',
            PageSize: 20,
            TierLabels: false,
            GeoSearch: {
              GeoRef: {
                Radius: 25,
                UOM: 'MI',
                RefPoint: {
                  Value: destination,
                  ValueContext: 'CODE',
                  RefPointType: '6'
                }
              }
            },
            RateInfoRef: {
              ConvertedRateInfoOnly: false,
              CurrencyCode: 'USD',
              BestOnly: '2',
              PrepaidQualifier: 'IncludePrepaid',
              StayDateRange: {
                StartDate: checkIn,
                EndDate: checkOut
              },
              Rooms: {
                Room: Array(rooms).fill({
                  Index: 1,
                  Adults: Math.ceil(adults / rooms),
                  Children: 0
                })
              },
              InfoSource: '100,110,112,113'
            }
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/v2.4.0/shop/hotels`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseHotelResponse(response.data);
    } catch (error) {
      console.error('Sabre Hotel Search Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Parse Sabre flight response into our format
   */
  parseFlightResponse(data) {
    try {
      const offers = data.groupedItineraryResponse?.itineraryGroups?.[0]?.itineraries || [];
      
      return offers.map((itinerary, index) => {
        const pricingInfo = itinerary.pricingInformation?.[0];
        const legs = itinerary.legs || [];
        const outboundLeg = legs[0];
        
        if (!outboundLeg) return null;

        const segments = outboundLeg.schedules || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        return {
          id: `sabre-${index}`,
          airline: firstSegment.carrier?.marketing || 'Unknown',
          flightNumber: firstSegment.carrier?.marketingFlightNumber || '',
          from: {
            code: firstSegment.departure?.airport || '',
            city: firstSegment.departure?.city || ''
          },
          to: {
            code: lastSegment.arrival?.airport || '',
            city: lastSegment.arrival?.city || ''
          },
          departure: {
            date: firstSegment.departure?.date || '',
            time: firstSegment.departure?.time || ''
          },
          arrival: {
            time: lastSegment.arrival?.time || ''
          },
          duration: outboundLeg.elapsedTime || '',
          price: parseFloat(pricingInfo?.fare?.totalFare?.totalPrice || 0),
          currency: 'USD',
          stops: segments.length - 1,
          class: segments[0].cabin || 'Economy',
          seatsAvailable: 9,
          segments: segments.map(seg => ({
            flightNumber: `${seg.carrier?.marketing}${seg.carrier?.marketingFlightNumber}`,
            from: {
              code: seg.departure?.airport,
              city: seg.departure?.city
            },
            to: {
              code: seg.arrival?.airport,
              city: seg.arrival?.city
            },
            departure: {
              time: seg.departure?.time,
              terminal: seg.departure?.terminal
            },
            arrival: {
              time: seg.arrival?.time,
              terminal: seg.arrival?.terminal
            },
            duration: seg.elapsedTime,
            aircraft: seg.equipment?.[0]?.code,
            cabin: seg.cabin
          })),
          source: 'sabre'
        };
      }).filter(Boolean);
    } catch (error) {
      console.error('Error parsing Sabre flight response:', error);
      return [];
    }
  }

  /**
   * Parse Sabre hotel response into our format
   */
  parseHotelResponse(data) {
    try {
      const hotels = data.GetHotelAvailRS?.HotelAvails?.HotelAvail || [];
      
      return hotels.map((hotel, index) => {
        const property = hotel.HotelInfo || {};
        const rate = hotel.RateInfo?.Rates?.[0];

        return {
          id: `sabre-hotel-${index}`,
          hotelId: property.HotelCode,
          name: property.HotelName || 'Unknown Hotel',
          rating: parseFloat(property.Rating || 3),
          stars: parseInt(property.Award?.[0]?.Rating || 3),
          address: {
            street: property.LocationInfo?.Address?.AddressLine || '',
            city: property.LocationInfo?.Address?.CityName || '',
            country: property.LocationInfo?.Address?.CountryName || ''
          },
          position: {
            latitude: parseFloat(property.Position?.Latitude || 0),
            longitude: parseFloat(property.Position?.Longitude || 0)
          },
          price: {
            total: parseFloat(rate?.TotalRate || 0),
            currency: 'USD'
          },
          amenities: property.Amenities?.Amenity?.map(a => a.Description) || [],
          source: 'sabre'
        };
      });
    } catch (error) {
      console.error('Error parsing Sabre hotel response:', error);
      return [];
    }
  }
}

module.exports = new SabreClient();
