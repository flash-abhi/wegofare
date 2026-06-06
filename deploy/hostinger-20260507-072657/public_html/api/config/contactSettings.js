/**
 * Contact Settings Module
 * Centralized contact information that can be updated via Admin Panel
 */

let contactSettings = {
  tfn: '+1-888-859-0441',
  email: 'info@wegofare.com',
  address: '1309 Coffeen Ave STE 1200, Sheridan, WY 82801, USA',
  workingHours: 'Mon-Sun 24/7'
};

// Get current contact settings
const getContactSettings = () => {
  return { ...contactSettings };
};

// Update contact settings (called from admin routes)
const updateContactSettings = (newSettings) => {
  if (newSettings.tfn !== undefined) contactSettings.tfn = newSettings.tfn;
  if (newSettings.email !== undefined) contactSettings.email = newSettings.email;
  if (newSettings.address !== undefined) contactSettings.address = newSettings.address;
  if (newSettings.workingHours !== undefined) contactSettings.workingHours = newSettings.workingHours;
  
  return { ...contactSettings };
};

module.exports = {
  getContactSettings,
  updateContactSettings
};
