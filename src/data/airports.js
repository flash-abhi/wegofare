export const airports = [
  // United States - Major Hubs
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta International', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'USA' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'USA' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth International', country: 'USA' },
  { code: 'DEN', city: 'Denver', name: 'Denver International', country: 'USA' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'USA' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'USA' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid International', country: 'USA' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'USA' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International', country: 'USA' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty International', country: 'USA' },
  { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'USA' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor International', country: 'USA' },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'USA' },
  { code: 'BOS', city: 'Boston', name: 'Logan International', country: 'USA' },
  { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-St Paul International', country: 'USA' },
  { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Wayne County', country: 'USA' },
  { code: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood International', country: 'USA' },
  { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia International', country: 'USA' },
  { code: 'LGA', city: 'New York', name: 'LaGuardia Airport', country: 'USA' },
  { code: 'BWI', city: 'Baltimore', name: 'Baltimore/Washington International', country: 'USA' },
  { code: 'DCA', city: 'Washington DC', name: 'Ronald Reagan Washington National', country: 'USA' },
  { code: 'IAD', city: 'Washington DC', name: 'Washington Dulles International', country: 'USA' },
  { code: 'MDW', city: 'Chicago', name: 'Chicago Midway International', country: 'USA' },
  { code: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City International', country: 'USA' },
  { code: 'SAN', city: 'San Diego', name: 'San Diego International', country: 'USA' },
  { code: 'TPA', city: 'Tampa', name: 'Tampa International', country: 'USA' },
  { code: 'PDX', city: 'Portland', name: 'Portland International', country: 'USA' },
  { code: 'HNL', city: 'Honolulu', name: 'Daniel K. Inouye International', country: 'USA' },
  { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas International', country: 'USA' },
  { code: 'AUS', city: 'Austin', name: 'Austin-Bergstrom International', country: 'USA' },
  { code: 'RDU', city: 'Raleigh', name: 'Raleigh-Durham International', country: 'USA' },
  { code: 'STL', city: 'St Louis', name: 'St Louis Lambert International', country: 'USA' },
  { code: 'SJC', city: 'San Jose', name: 'Norman Y. Mineta San Jose International', country: 'USA' },
  { code: 'OAK', city: 'Oakland', name: 'Oakland International', country: 'USA' },
  { code: 'SMF', city: 'Sacramento', name: 'Sacramento International', country: 'USA' },
  { code: 'MCI', city: 'Kansas City', name: 'Kansas City International', country: 'USA' },
  { code: 'CVG', city: 'Cincinnati', name: 'Cincinnati/Northern Kentucky International', country: 'USA' },
  { code: 'IND', city: 'Indianapolis', name: 'Indianapolis International', country: 'USA' },
  { code: 'CLE', city: 'Cleveland', name: 'Cleveland Hopkins International', country: 'USA' },
  { code: 'CMH', city: 'Columbus', name: 'John Glenn Columbus International', country: 'USA' },
  { code: 'PIT', city: 'Pittsburgh', name: 'Pittsburgh International', country: 'USA' },
  { code: 'MKE', city: 'Milwaukee', name: 'Milwaukee Mitchell International', country: 'USA' },
  { code: 'RSW', city: 'Fort Myers', name: 'Southwest Florida International', country: 'USA' },
  { code: 'PBI', city: 'West Palm Beach', name: 'Palm Beach International', country: 'USA' },
  { code: 'SAT', city: 'San Antonio', name: 'San Antonio International', country: 'USA' },
  { code: 'ABQ', city: 'Albuquerque', name: 'Albuquerque International Sunport', country: 'USA' },
  { code: 'BNA', city: 'Nashville', name: 'Nashville International', country: 'USA' },
  { code: 'JAX', city: 'Jacksonville', name: 'Jacksonville International', country: 'USA' },
  { code: 'OGG', city: 'Maui', name: 'Kahului Airport', country: 'USA' },
  { code: 'ANC', city: 'Anchorage', name: 'Ted Stevens Anchorage International', country: 'USA' },
  { code: 'BUF', city: 'Buffalo', name: 'Buffalo Niagara International', country: 'USA' },
  { code: 'OMA', city: 'Omaha', name: 'Eppley Airfield', country: 'USA' },
  { code: 'RNO', city: 'Reno', name: 'Reno-Tahoe International', country: 'USA' },
  { code: 'TUS', city: 'Tucson', name: 'Tucson International', country: 'USA' },
  { code: 'ONT', city: 'Ontario', name: 'Ontario International', country: 'USA' },
  { code: 'BUR', city: 'Burbank', name: 'Hollywood Burbank Airport', country: 'USA' },
  { code: 'SNA', city: 'Santa Ana', name: 'John Wayne Airport', country: 'USA' },
  
  // Canada
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', country: 'Canada' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International', country: 'Canada' },
  { code: 'YUL', city: 'Montreal', name: 'Montréal-Pierre Elliott Trudeau International', country: 'Canada' },
  { code: 'YYC', city: 'Calgary', name: 'Calgary International', country: 'Canada' },
  { code: 'YEG', city: 'Edmonton', name: 'Edmonton International', country: 'Canada' },
  { code: 'YOW', city: 'Ottawa', name: 'Ottawa Macdonald-Cartier International', country: 'Canada' },
  { code: 'YHZ', city: 'Halifax', name: 'Halifax Stanfield International', country: 'Canada' },
  { code: 'YWG', city: 'Winnipeg', name: 'Winnipeg Richardson International', country: 'Canada' },
  { code: 'YQB', city: 'Quebec City', name: 'Québec City Jean Lesage International', country: 'Canada' },
  { code: 'YYJ', city: 'Victoria', name: 'Victoria International', country: 'Canada' },
  
  // Mexico & Central America
  { code: 'MEX', city: 'Mexico City', name: 'Mexico City International', country: 'Mexico' },
  { code: 'CUN', city: 'Cancún', name: 'Cancún International', country: 'Mexico' },
  { code: 'GDL', city: 'Guadalajara', name: 'Miguel Hidalgo y Costilla Guadalajara International', country: 'Mexico' },
  { code: 'MTY', city: 'Monterrey', name: 'Monterrey International', country: 'Mexico' },
  { code: 'TIJ', city: 'Tijuana', name: 'Tijuana International', country: 'Mexico' },
  { code: 'PVR', city: 'Puerto Vallarta', name: 'Licenciado Gustavo Díaz Ordaz International', country: 'Mexico' },
  { code: 'SJD', city: 'Los Cabos', name: 'Los Cabos International', country: 'Mexico' },
  { code: 'PTY', city: 'Panama City', name: 'Tocumen International', country: 'Panama' },
  { code: 'SJO', city: 'San José', name: 'Juan Santamaría International', country: 'Costa Rica' },
  { code: 'GUA', city: 'Guatemala City', name: 'La Aurora International', country: 'Guatemala' },
  
  // Caribbean
  { code: 'SJU', city: 'San Juan', name: 'Luis Muñoz Marín International', country: 'Puerto Rico' },
  { code: 'NAS', city: 'Nassau', name: 'Lynden Pindling International', country: 'Bahamas' },
  { code: 'MBJ', city: 'Montego Bay', name: 'Sangster International', country: 'Jamaica' },
  { code: 'PUJ', city: 'Punta Cana', name: 'Punta Cana International', country: 'Dominican Republic' },
  { code: 'SDQ', city: 'Santo Domingo', name: 'Las Américas International', country: 'Dominican Republic' },
  { code: 'HAV', city: 'Havana', name: 'José Martí International', country: 'Cuba' },
  { code: 'AUA', city: 'Aruba', name: 'Queen Beatrix International', country: 'Aruba' },
  
  // South America
  { code: 'GRU', city: 'São Paulo', name: 'São Paulo/Guarulhos International', country: 'Brazil' },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Rio de Janeiro/Galeão International', country: 'Brazil' },
  { code: 'BSB', city: 'Brasília', name: 'Brasília International', country: 'Brazil' },
  { code: 'CGH', city: 'São Paulo', name: 'Congonhas Airport', country: 'Brazil' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini International', country: 'Argentina' },
  { code: 'AEP', city: 'Buenos Aires', name: 'Jorge Newbery Airpark', country: 'Argentina' },
  { code: 'BOG', city: 'Bogotá', name: 'El Dorado International', country: 'Colombia' },
  { code: 'MDE', city: 'Medellín', name: 'José María Córdova International', country: 'Colombia' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chávez International', country: 'Peru' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez International', country: 'Chile' },
  { code: 'UIO', city: 'Quito', name: 'Mariscal Sucre International', country: 'Ecuador' },
  { code: 'CCS', city: 'Caracas', name: 'Simón Bolívar International', country: 'Venezuela' },
  
  // United Kingdom & Ireland
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'UK' },
  { code: 'LGW', city: 'London', name: 'Gatwick', country: 'UK' },
  { code: 'LCY', city: 'London', name: 'London City Airport', country: 'UK' },
  { code: 'STN', city: 'London', name: 'Stansted', country: 'UK' },
  { code: 'LTN', city: 'London', name: 'Luton', country: 'UK' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport', country: 'UK' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh Airport', country: 'UK' },
  { code: 'GLA', city: 'Glasgow', name: 'Glasgow Airport', country: 'UK' },
  { code: 'BHX', city: 'Birmingham', name: 'Birmingham Airport', country: 'UK' },
  { code: 'BRS', city: 'Bristol', name: 'Bristol Airport', country: 'UK' },
  { code: 'NCL', city: 'Newcastle', name: 'Newcastle International', country: 'UK' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'ORK', city: 'Cork', name: 'Cork Airport', country: 'Ireland' },
  { code: 'SNN', city: 'Shannon', name: 'Shannon Airport', country: 'Ireland' },
  
  // France
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  { code: 'ORY', city: 'Paris', name: 'Orly', country: 'France' },
  { code: 'NCE', city: 'Nice', name: 'Nice Côte d\'Azur', country: 'France' },
  { code: 'LYS', city: 'Lyon', name: 'Lyon-Saint Exupéry', country: 'France' },
  { code: 'MRS', city: 'Marseille', name: 'Marseille Provence', country: 'France' },
  { code: 'TLS', city: 'Toulouse', name: 'Toulouse-Blagnac', country: 'France' },
  { code: 'BOD', city: 'Bordeaux', name: 'Bordeaux-Mérignac', country: 'France' },
  { code: 'NTE', city: 'Nantes', name: 'Nantes Atlantique', country: 'France' },
  
  // Germany
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  { code: 'DUS', city: 'Düsseldorf', name: 'Düsseldorf Airport', country: 'Germany' },
  { code: 'TXL', city: 'Berlin', name: 'Berlin Tegel', country: 'Germany' },
  { code: 'BER', city: 'Berlin', name: 'Berlin Brandenburg', country: 'Germany' },
  { code: 'HAM', city: 'Hamburg', name: 'Hamburg Airport', country: 'Germany' },
  { code: 'CGN', city: 'Cologne', name: 'Cologne Bonn Airport', country: 'Germany' },
  { code: 'STR', city: 'Stuttgart', name: 'Stuttgart Airport', country: 'Germany' },
  
  // Spain
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat', country: 'Spain' },
  { code: 'AGP', city: 'Málaga', name: 'Málaga-Costa del Sol', country: 'Spain' },
  { code: 'PMI', city: 'Palma de Mallorca', name: 'Palma de Mallorca Airport', country: 'Spain' },
  { code: 'SVQ', city: 'Seville', name: 'Seville Airport', country: 'Spain' },
  { code: 'VLC', city: 'Valencia', name: 'Valencia Airport', country: 'Spain' },
  { code: 'BIO', city: 'Bilbao', name: 'Bilbao Airport', country: 'Spain' },
  { code: 'TFS', city: 'Tenerife', name: 'Tenerife South Airport', country: 'Spain' },
  
  // Italy
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci-Fiumicino', country: 'Italy' },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa', country: 'Italy' },
  { code: 'LIN', city: 'Milan', name: 'Milan Linate', country: 'Italy' },
  { code: 'VCE', city: 'Venice', name: 'Venice Marco Polo', country: 'Italy' },
  { code: 'NAP', city: 'Naples', name: 'Naples International', country: 'Italy' },
  { code: 'BLQ', city: 'Bologna', name: 'Bologna Guglielmo Marconi', country: 'Italy' },
  { code: 'CTA', city: 'Catania', name: 'Catania-Fontanarossa', country: 'Italy' },
  { code: 'PMO', city: 'Palermo', name: 'Palermo Airport', country: 'Italy' },
  
  // Netherlands, Belgium, Switzerland
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'GVA', city: 'Geneva', name: 'Geneva Airport', country: 'Switzerland' },
  { code: 'BSL', city: 'Basel', name: 'EuroAirport Basel-Mulhouse-Freiburg', country: 'Switzerland' },
  
  // Scandinavia
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda', country: 'Sweden' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen', country: 'Norway' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa', country: 'Finland' },
  { code: 'BGO', city: 'Bergen', name: 'Bergen Airport', country: 'Norway' },
  { code: 'GOT', city: 'Gothenburg', name: 'Gothenburg Landvetter', country: 'Sweden' },
  
  // Eastern Europe
  { code: 'VIE', city: 'Vienna', name: 'Vienna International', country: 'Austria' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel Airport Prague', country: 'Czech Republic' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin Airport', country: 'Poland' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt International', country: 'Hungary' },
  { code: 'OTP', city: 'Bucharest', name: 'Henri Coandă International', country: 'Romania' },
  { code: 'SOF', city: 'Sofia', name: 'Sofia Airport', country: 'Bulgaria' },
  { code: 'KRK', city: 'Kraków', name: 'John Paul II International Airport Kraków-Balice', country: 'Poland' },
  
  // Southern Europe & Mediterranean
  { code: 'ATH', city: 'Athens', name: 'Athens International', country: 'Greece' },
  { code: 'LIS', city: 'Lisbon', name: 'Lisbon Portela', country: 'Portugal' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sá Carneiro Airport', country: 'Portugal' },
  { code: 'FAO', city: 'Faro', name: 'Faro Airport', country: 'Portugal' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
  { code: 'SAW', city: 'Istanbul', name: 'Sabiha Gökçen International', country: 'Turkey' },
  { code: 'ESB', city: 'Ankara', name: 'Esenboğa Airport', country: 'Turkey' },
  { code: 'AYT', city: 'Antalya', name: 'Antalya Airport', country: 'Turkey' },
  { code: 'LCA', city: 'Larnaca', name: 'Larnaca International', country: 'Cyprus' },
  { code: 'MLA', city: 'Malta', name: 'Malta International', country: 'Malta' },
  
  // Russia
  { code: 'SVO', city: 'Moscow', name: 'Sheremetyevo International', country: 'Russia' },
  { code: 'DME', city: 'Moscow', name: 'Domodedovo International', country: 'Russia' },
  { code: 'LED', city: 'St Petersburg', name: 'Pulkovo Airport', country: 'Russia' },
  
  // Middle East
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE' },
  { code: 'AUH', city: 'Abu Dhabi', name: 'Abu Dhabi International', country: 'UAE' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar' },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid International', country: 'Saudi Arabia' },
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International', country: 'Saudi Arabia' },
  { code: 'DMM', city: 'Dammam', name: 'King Fahd International', country: 'Saudi Arabia' },
  { code: 'KWI', city: 'Kuwait City', name: 'Kuwait International', country: 'Kuwait' },
  { code: 'BAH', city: 'Manama', name: 'Bahrain International', country: 'Bahrain' },
  { code: 'MCT', city: 'Muscat', name: 'Muscat International', country: 'Oman' },
  { code: 'TLV', city: 'Tel Aviv', name: 'Ben Gurion Airport', country: 'Israel' },
  { code: 'AMM', city: 'Amman', name: 'Queen Alia International', country: 'Jordan' },
  { code: 'BEY', city: 'Beirut', name: 'Beirut-Rafic Hariri International', country: 'Lebanon' },
  
  // Africa
  { code: 'CAI', city: 'Cairo', name: 'Cairo International', country: 'Egypt' },
  { code: 'SSH', city: 'Sharm El Sheikh', name: 'Sharm El Sheikh International', country: 'Egypt' },
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International', country: 'South Africa' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa' },
  { code: 'DUR', city: 'Durban', name: 'King Shaka International', country: 'South Africa' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International', country: 'Kenya' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Addis Ababa Bole International', country: 'Ethiopia' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International', country: 'Morocco' },
  { code: 'RAK', city: 'Marrakech', name: 'Marrakech Menara Airport', country: 'Morocco' },
  { code: 'TUN', city: 'Tunis', name: 'Tunis-Carthage International', country: 'Tunisia' },
  { code: 'ALG', city: 'Algiers', name: 'Houari Boumediene Airport', country: 'Algeria' },
  { code: 'LOS', city: 'Lagos', name: 'Murtala Muhammed International', country: 'Nigeria' },
  { code: 'ACC', city: 'Accra', name: 'Kotoka International', country: 'Ghana' },
  { code: 'DAR', city: 'Dar es Salaam', name: 'Julius Nyerere International', country: 'Tanzania' },
  
  // India
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International', country: 'India' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', country: 'India' },
  { code: 'BLR', city: 'Bangalore', name: 'Kempegowda International', country: 'India' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International', country: 'India' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International', country: 'India' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International', country: 'India' },
  { code: 'GOI', city: 'Goa', name: 'Goa International', country: 'India' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International', country: 'India' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport', country: 'India' },
  
  // China
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International', country: 'China' },
  { code: 'PKX', city: 'Beijing', name: 'Beijing Daxing International', country: 'China' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong International', country: 'China' },
  { code: 'SHA', city: 'Shanghai', name: 'Shanghai Hongqiao International', country: 'China' },
  { code: 'CAN', city: 'Guangzhou', name: 'Guangzhou Baiyun International', country: 'China' },
  { code: 'CTU', city: 'Chengdu', name: 'Chengdu Shuangliu International', country: 'China' },
  { code: 'SZX', city: 'Shenzhen', name: 'Shenzhen Bao\'an International', country: 'China' },
  { code: 'XIY', city: 'Xi\'an', name: 'Xi\'an Xianyang International', country: 'China' },
  { code: 'KMG', city: 'Kunming', name: 'Kunming Changshui International', country: 'China' },
  { code: 'HGH', city: 'Hangzhou', name: 'Hangzhou Xiaoshan International', country: 'China' },
  
  // Japan
  { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan' },
  { code: 'KIX', city: 'Osaka', name: 'Kansai International', country: 'Japan' },
  { code: 'ITM', city: 'Osaka', name: 'Osaka International (Itami)', country: 'Japan' },
  { code: 'NGO', city: 'Nagoya', name: 'Chubu Centrair International', country: 'Japan' },
  { code: 'FUK', city: 'Fukuoka', name: 'Fukuoka Airport', country: 'Japan' },
  { code: 'CTS', city: 'Sapporo', name: 'New Chitose Airport', country: 'Japan' },
  { code: 'OKA', city: 'Okinawa', name: 'Naha Airport', country: 'Japan' },
  
  // South Korea
  { code: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea' },
  { code: 'GMP', city: 'Seoul', name: 'Gimpo International', country: 'South Korea' },
  { code: 'PUS', city: 'Busan', name: 'Gimhae International', country: 'South Korea' },
  { code: 'CJU', city: 'Jeju', name: 'Jeju International', country: 'South Korea' },
  
  // Southeast Asia
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  { code: 'DMK', city: 'Bangkok', name: 'Don Mueang International', country: 'Thailand' },
  { code: 'HKT', city: 'Phuket', name: 'Phuket International', country: 'Thailand' },
  { code: 'CNX', city: 'Chiang Mai', name: 'Chiang Mai International', country: 'Thailand' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International', country: 'Malaysia' },
  { code: 'PEN', city: 'Penang', name: 'Penang International', country: 'Malaysia' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta International', country: 'Indonesia' },
  { code: 'DPS', city: 'Bali', name: 'Ngurah Rai International', country: 'Indonesia' },
  { code: 'SUB', city: 'Surabaya', name: 'Juanda International', country: 'Indonesia' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino International', country: 'Philippines' },
  { code: 'CEB', city: 'Cebu', name: 'Mactan-Cebu International', country: 'Philippines' },
  { code: 'HAN', city: 'Hanoi', name: 'Noi Bai International', country: 'Vietnam' },
  { code: 'SGN', city: 'Ho Chi Minh City', name: 'Tan Son Nhat International', country: 'Vietnam' },
  { code: 'DAD', city: 'Da Nang', name: 'Da Nang International', country: 'Vietnam' },
  { code: 'RGN', city: 'Yangon', name: 'Yangon International', country: 'Myanmar' },
  { code: 'REP', city: 'Siem Reap', name: 'Siem Reap International', country: 'Cambodia' },
  { code: 'VTE', city: 'Vientiane', name: 'Wattay International', country: 'Laos' },
  
  // Taiwan & Hong Kong
  { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan International', country: 'Taiwan' },
  { code: 'TSA', city: 'Taipei', name: 'Taipei Songshan Airport', country: 'Taiwan' },
  { code: 'KHH', city: 'Kaohsiung', name: 'Kaohsiung International', country: 'Taiwan' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong' },
  { code: 'MFM', city: 'Macau', name: 'Macau International', country: 'Macau' },
  
  // Australia & New Zealand
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith', country: 'Australia' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  { code: 'BNE', city: 'Brisbane', name: 'Brisbane Airport', country: 'Australia' },
  { code: 'PER', city: 'Perth', name: 'Perth Airport', country: 'Australia' },
  { code: 'ADL', city: 'Adelaide', name: 'Adelaide Airport', country: 'Australia' },
  { code: 'CNS', city: 'Cairns', name: 'Cairns Airport', country: 'Australia' },
  { code: 'OOL', city: 'Gold Coast', name: 'Gold Coast Airport', country: 'Australia' },
  { code: 'DRW', city: 'Darwin', name: 'Darwin International', country: 'Australia' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
  { code: 'CHC', city: 'Christchurch', name: 'Christchurch International', country: 'New Zealand' },
  { code: 'WLG', city: 'Wellington', name: 'Wellington International', country: 'New Zealand' },
  { code: 'ZQN', city: 'Queenstown', name: 'Queenstown Airport', country: 'New Zealand' },
  
  // Pacific Islands
  { code: 'NAN', city: 'Nadi', name: 'Nadi International', country: 'Fiji' },
  { code: 'PPT', city: 'Papeete', name: 'Faa\'a International', country: 'French Polynesia' },
  { code: 'GUM', city: 'Guam', name: 'Antonio B. Won Pat International', country: 'Guam' },
  { code: 'APW', city: 'Apia', name: 'Faleolo International', country: 'Samoa' },
];

export const getAirportByCode = (code) => {
  return airports.find(airport => airport.code === code.toUpperCase());
};

export const searchAirports = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return airports.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 10); // Limit to 10 results
};
