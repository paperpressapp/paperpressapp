/**
 * Cities Constants
 * 
 * Major cities in Pakistan for user profile selection.
 */

/** List of major Pakistani cities */
export const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Other',
] as const;

/** Type for city values */
export type PakistanCity = typeof PAKISTAN_CITIES[number];

/** Common institute names for suggestions */
export const COMMON_INSTITUTES = [
  'Government College',
  'Punjab College',
  'Superior College',
  'KIPS Academy',
  'Star Academy',
  'The Educators',
  'Beaconhouse School System',
  'Roots Millennium Schools',
  'City School',
  'Allied School',
  'Other',
] as const;
