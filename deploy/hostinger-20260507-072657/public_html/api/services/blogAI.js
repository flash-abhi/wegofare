const axios = require('axios');

class BlogAIService {
  constructor() {
    this.topics = [
      'Best Travel Destinations',
      'Budget Travel Tips',
      'Luxury Travel Experiences',
      'Solo Travel Adventures',
      'Family Vacation Ideas',
      'Weekend Getaways',
      'Beach Destinations',
      'Mountain Adventures',
      'City Breaks',
      'Cultural Experiences',
      'Food and Travel',
      'Travel Photography Tips',
      'Packing Hacks',
      'Flight Booking Tips',
      'Hotel Booking Secrets',
      'Travel Insurance Guide',
      'Visa Requirements',
      'Best Time to Visit',
      'Hidden Gems',
      'Travel Safety Tips'
    ];

    this.destinations = [
      'Paris', 'London', 'New York', 'Tokyo', 'Dubai', 'Singapore',
      'Barcelona', 'Rome', 'Bangkok', 'Istanbul', 'Amsterdam', 'Sydney',
      'Los Angeles', 'Miami', 'Las Vegas', 'Hong Kong', 'Bali', 'Maldives',
      'Santorini', 'Venice', 'Prague', 'Iceland', 'Norway', 'Switzerland'
    ];

    this.airlines = [
      { name: 'American Airlines', slug: 'american-airlines', code: 'AA' },
      { name: 'Delta Air Lines', slug: 'delta-airlines', code: 'DL' },
      { name: 'United Airlines', slug: 'united-airlines', code: 'UA' },
      { name: 'Southwest Airlines', slug: 'southwest-airlines', code: 'WN' },
      { name: 'JetBlue Airways', slug: 'jetblue-airways', code: 'B6' },
      { name: 'Alaska Airlines', slug: 'alaska-airlines', code: 'AS' },
      { name: 'Spirit Airlines', slug: 'spirit-airlines', code: 'NK' },
      { name: 'Frontier Airlines', slug: 'frontier-airlines', code: 'F9' },
      { name: 'Hawaiian Airlines', slug: 'hawaiian-airlines', code: 'HA' },
      { name: 'British Airways', slug: 'british-airways', code: 'BA' },
      { name: 'Emirates', slug: 'emirates', code: 'EK' },
      { name: 'Lufthansa', slug: 'lufthansa', code: 'LH' },
      { name: 'Air France', slug: 'air-france', code: 'AF' },
      { name: 'Qatar Airways', slug: 'qatar-airways', code: 'QR' },
      { name: 'Singapore Airlines', slug: 'singapore-airlines', code: 'SQ' }
    ];
  }

  // Generate blog post using AI (OpenAI GPT)
  async generateBlogPost() {
    const topic = this.getRandomTopic();
    const destination = this.getRandomDestination();
    const airlines = this.getRandomAirlines(3); // Get 3 random airlines to mention
    
    // For now, generate without OpenAI API
    // You can integrate OpenAI API later by adding OPENAI_API_KEY to .env
    const blogPost = await this.generateWithTemplate(topic, destination, airlines);
    
    return blogPost;
  }

  getRandomTopic() {
    return this.topics[Math.floor(Math.random() * this.topics.length)];
  }

  getRandomDestination() {
    return this.destinations[Math.floor(Math.random() * this.destinations.length)];
  }

  getRandomAirlines(count = 3) {
    const shuffled = [...this.airlines].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Generate blog post using templates (without OpenAI API)
  async generateWithTemplate(topic, destination, airlines) {
    const title = this.generateTitle(topic, destination);
    const excerpt = this.generateExcerpt(topic, destination);
    const content = this.generateContent(topic, destination, airlines);
    const keywords = this.generateKeywords(topic, destination, airlines);
    const metaDescription = excerpt.substring(0, 155) + '...';
    const slug = this.generateSlug(title);

    return {
      title,
      slug,
      excerpt,
      content,
      image: this.getRandomImage(destination, topic),
      author: 'Travel Expert',
      category: this.categorize(topic),
      tags: keywords.split(', '),
      keywords,
      metaDescription,
      published: true,
      featured: Math.random() > 0.7 // 30% chance of being featured
    };
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  generateTitle(topic, destination) {
    const templates = [
      `${destination} ${topic}: Ultimate Travel Guide 2025 | WegoFare`,
      `Best ${topic} in ${destination} - Book Now & Save | wegofare.com`,
      `${destination} Travel Guide: ${topic} + Exclusive Flight Deals`,
      `Discover ${destination}: ${topic} | Cheap Flights Available`,
      `${topic} in ${destination} - Expert Tips & Flight Deals | Call +1-844-480-0252`,
      `${destination} ${topic} Guide 2025 - Save Up to 40% on Travel`,
      `Plan Your ${destination} Trip: ${topic} + Best Flight Prices`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateExcerpt(topic, destination) {
    const templates = [
      `Planning a trip to ${destination}? Discover the best ${topic.toLowerCase()} with wegofare.com. Get exclusive flight deals, expert travel tips, and personalized service. Call +1-844-480-0252 for unbeatable prices!`,
      `Book your ${destination} adventure today! This guide covers ${topic.toLowerCase()}, plus find the cheapest flights on wegofare.com. Save up to 40% on vacation packages. Call +1-844-480-0252 now!`,
      `Looking for ${topic.toLowerCase()} in ${destination}? wegofare.com offers expert guides, best flight prices, and 24/7 support. Visit our website or call +1-844-480-0252 to book your dream vacation.`,
      `${destination} awaits! Explore ${topic.toLowerCase()} with our comprehensive guide. Find the best flight deals at wegofare.com or call +1-844-480-0252 for personalized travel planning and exclusive offers.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateContent(topic, destination, airlines) {
    const airlineLinks = airlines.map(airline => 
      `[${airline.name}](https://wegofare.com/airlines/${airline.slug})`
    ).join(', ');
    
    const airlineSection = airlines.map(airline => 
      `- **[${airline.name}](https://wegofare.com/airlines/${airline.slug})** (${airline.code}) - View routes, prices, and exclusive deals`
    ).join('\n');

    // Generate relevant inline images
    const attractionsImage = `https://source.unsplash.com/800x500/?${encodeURIComponent(destination)},attractions,landmarks`;
    const cultureImage = `https://source.unsplash.com/800x500/?${encodeURIComponent(destination)},culture,heritage`;
    const foodImage = `https://source.unsplash.com/800x500/?${encodeURIComponent(destination)},food,cuisine`;

    return `
## Introduction to ${destination}

${destination} is one of the world's most captivating destinations, offering travelers an unforgettable experience. Whether you're interested in ${topic.toLowerCase()}, this guide will help you navigate everything this amazing destination has to offer.

At **wegofare.com**, we specialize in finding the best flight deals and travel packages to help you explore ${destination} without breaking the bank. Call us at **+1-844-480-0252** for personalized travel assistance and exclusive offers.

## Why Visit ${destination}?

![Explore ${destination}](${cultureImage})
*Discover the beauty and culture of ${destination}*

${destination} stands out for its unique blend of culture, attractions, and experiences. Here's what makes it special:

- **Rich Cultural Heritage**: Immerse yourself in the local culture and traditions
- **World-Class Attractions**: Visit iconic landmarks and hidden gems
- **Culinary Delights**: Savor authentic local cuisine
- **Vibrant Atmosphere**: Experience the energy and charm of the destination
- **Travel Convenience**: Easy access and excellent infrastructure

## Best Airlines to ${destination}

Find the best deals on flights to ${destination} with our partner airlines. We compare prices from ${airlineLinks} and more to ensure you get the lowest fares:

${airlineSection}

Visit our **[Airlines Directory](https://wegofare.com/airlines)** to explore all available carriers, compare prices, and book your flights today!

## Best Time to Visit

The ideal time to visit ${destination} depends on what you're looking for:

- **Peak Season**: Expect larger crowds but perfect weather
- **Shoulder Season**: Great balance of good weather and fewer tourists
- **Off-Season**: Budget-friendly with unique local experiences

💡 **Pro Tip**: Visit [wegofare.com](https://wegofare.com) to compare flight prices across different seasons and find the best time to book your ${destination} adventure.

## Top Attractions

![Top Attractions in ${destination}](${attractionsImage})
*Must-visit landmarks and attractions in ${destination}*


### Must-See Landmarks

Explore the iconic sites that define ${destination}. From historic monuments to modern marvels, there's something for everyone.

### Local Experiences

Go beyond the tourist trail and discover authentic ${topic.toLowerCase()}. Connect with locals, try traditional activities, and create lasting memories.

### Hidden Gems

Venture off the beaten path to find secret spots that most tourists miss. These hidden treasures offer unique perspectives of ${destination}.

## Travel Tips

### Getting Around

Navigate ${destination} like a local with these transportation tips:
- Public transit options and passes
- Ride-sharing and taxi services
- Walking and cycling routes

### Accommodation

![Accommodations in ${destination}](https://source.unsplash.com/800x500/?${encodeURIComponent(destination)},hotel,resort,accommodation)
*Find the perfect place to stay in ${destination}*

Choose from a wide range of lodging options:
- Luxury hotels and resorts
- Boutique accommodations
- Budget-friendly hostels and guesthouses

  🏨 **Book Smart**: Bundle your flight and hotel on **wegofare.com** to save up to 40% on your ${destination} vacation package.

### Local Cuisine & Dining

![Food and Cuisine in ${destination}](${foodImage})
*Savor the authentic flavors of ${destination}*

Don't miss out on the local culinary scene! From street food to fine dining, ${destination} offers incredible gastronomic experiences that will delight your taste buds.

### Budget Planning

Make your money go further with smart budgeting:
- Average daily costs
- Money-saving tips
- Free and low-cost activities

Need help planning your budget? Our travel experts at **+1-844-480-0252** can create a customized itinerary that fits your budget perfectly.

## Flight Deals to ${destination}

Looking for cheap flights to ${destination}? We've got you covered! Check out these airlines offering competitive fares:

${airlines.map(airline => `**[Book ${airline.name} to ${destination}](https://wegofare.com/airlines/${airline.slug})** - Compare prices, view schedules, and find exclusive deals on ${airline.name} flights.`).join('\n\n')}

💰 **Exclusive Offer**: Call **+1-844-480-0252** and mention this blog to get an additional discount on your ${destination} booking!

## Practical Information

### Safety Tips

Stay safe during your travels:
- Keep valuables secure
- Be aware of your surroundings
- Know emergency contact numbers

### Local Customs

Respect local traditions and etiquette:
- Dress codes and social norms
- Tipping practices
- Cultural sensitivities

### Language and Communication

While English is often spoken in tourist areas, learning a few local phrases can enhance your experience and show respect for the culture.

## Book Your ${destination} Adventure Today

${destination} offers incredible opportunities for ${topic.toLowerCase()}. With proper planning and this comprehensive guide, you're well-equipped for an amazing adventure. 

### Why Book with WegoFare?

✈️ **Best Price Guarantee** - We match or beat any competitor's price  
📞 **24/7 Customer Support** - Call **+1-844-480-0252** anytime  
💰 **Exclusive Deals** - Access member-only discounts and promotions  
🎯 **Personalized Service** - Tailored travel packages for your needs  
🔒 **Secure Booking** - Safe and protected transactions  
🌍 **Multiple Airlines** - Compare ${airlineLinks} and 50+ more carriers  

**Ready to book your flight to ${destination}?** Visit [wegofare.com](https://wegofare.com) or call **+1-844-480-0252** to speak with our travel experts and find the best deals on flights, hotels, and vacation packages!

Browse our **[Airlines Directory](https://wegofare.com/airlines)** to see all available carriers and exclusive airline deals.

Start planning your trip today and create memories that will last a lifetime!

---

*For the best deals on flights to ${destination} and worldwide destinations, visit [wegofare.com](https://wegofare.com) or call us at +1-844-480-0252*

*Last updated: ${new Date().toLocaleDateString()}*
`;
  }

  generateKeywords(topic, destination, airlines) {
    const airlineNames = airlines.map(a => a.name).join(', ');
    const airlineCodes = airlines.map(a => `${a.code} flights`).join(', ');
    return `${destination} travel, ${topic.toLowerCase()}, ${destination} guide, visit ${destination}, ${destination} tourism, travel tips, vacation planning, ${destination} attractions, WegoFare, cheap flights to ${destination}, ${destination} flight deals, book flights online, best travel deals, ${airlineNames}, ${airlineCodes}`;
  }

  categorize(topic) {
    if (topic.includes('Budget') || topic.includes('Booking')) return 'Travel Tips';
    if (topic.includes('Luxury')) return 'Luxury Travel';
    if (topic.includes('Food')) return 'Food & Travel';
    if (topic.includes('Photography')) return 'Travel Photography';
    if (topic.includes('Destination')) return 'Destinations';
    if (topic.includes('Family')) return 'Family Travel';
    return 'Travel Guides';
  }

  getRandomImage(destination, topic) {
    // Use Unsplash for free, high-quality travel images
    // Combine destination and topic for more relevant images
    const topicKeywords = {
      'Best Travel Destinations': 'landscape,scenic',
      'Budget Travel Tips': 'backpacker,adventure',
      'Luxury Travel Experiences': 'luxury,resort,5star',
      'Solo Travel Adventures': 'solo,traveler,adventure',
      'Family Vacation Ideas': 'family,beach,vacation',
      'Weekend Getaways': 'weekend,getaway,escape',
      'Beach Destinations': 'beach,ocean,tropical',
      'Mountain Adventures': 'mountain,hiking,nature',
      'City Breaks': 'city,urban,skyline',
      'Cultural Experiences': 'culture,tradition,heritage',
      'Food and Travel': 'food,cuisine,restaurant',
      'Travel Photography Tips': 'photography,camera,scenic',
      'Packing Hacks': 'luggage,suitcase,travel',
      'Flight Booking Tips': 'airplane,airport,flight',
      'Hotel Booking Secrets': 'hotel,resort,accommodation',
      'Travel Insurance Guide': 'travel,insurance,safety',
      'Visa Requirements': 'passport,visa,travel',
      'Best Time to Visit': 'calendar,season,weather',
      'Hidden Gems': 'secret,hidden,destination',
      'Travel Safety Tips': 'safety,security,travel'
    };

    const keyword = topicKeywords[topic] || 'travel,vacation';
    const query = encodeURIComponent(`${destination},${keyword}`);
    
    return `https://source.unsplash.com/1200x800/?${query}`;
  }

  // Generate with OpenAI API (optional - requires API key)
  async generateWithOpenAI(topic, destination) {
    if (!process.env.OPENAI_API_KEY) {
      return this.generateWithTemplate(topic, destination);
    }

    try {
      const prompt = `Write a comprehensive, SEO-optimized travel blog post about "${topic}" in ${destination}. 
      
      Include:
      - Engaging title (60 characters max)
      - Meta description (155 characters max)
      - Introduction
      - Main content with subheadings
      - Practical tips
      - Conclusion with call-to-action
      
      Make it informative, engaging, and optimize for search engines.`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert travel writer and SEO specialist.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const generatedContent = response.data.choices[0].message.content;

      return {
        title: this.generateTitle(topic, destination),
        excerpt: this.generateExcerpt(topic, destination),
        content: generatedContent,
        image: this.getRandomImage(destination),
        author: 'AI Travel Writer',
        category: this.categorize(topic),
        tags: this.generateKeywords(topic, destination).split(', '),
        keywords: this.generateKeywords(topic, destination),
        metaDescription: this.generateExcerpt(topic, destination).substring(0, 155),
        published: true,
        featured: Math.random() > 0.7
      };
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      return this.generateWithTemplate(topic, destination);
    }
  }
}

module.exports = new BlogAIService();
