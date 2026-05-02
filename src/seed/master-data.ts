export interface ProvinceSeed {
  code: string;
  name: string;
}

export interface DistrictSeed {
  code: string;
  name: string;
  provinceCode: string;
  centreLat: number;
  centreLng: number;
}

export interface StationSeed {
  code: string;
  name: string;
  districtCode: string;
  baseLat: number;
  baseLng: number;
}

export const PROVINCES: ProvinceSeed[] = [
  { code: 'WP', name: 'Western Province' },
  { code: 'CP', name: 'Central Province' },
  { code: 'SP', name: 'Southern Province' },
  { code: 'NP', name: 'Northern Province' },
  { code: 'EP', name: 'Eastern Province' },
  { code: 'NW', name: 'North Western Province' },
  { code: 'NC', name: 'North Central Province' },
  { code: 'UV', name: 'Uva Province' },
  { code: 'SG', name: 'Sabaragamuwa Province' },
];

export const DISTRICTS: DistrictSeed[] = [
  // Western
  { code: 'COL', name: 'Colombo', provinceCode: 'WP', centreLat: 6.9271, centreLng: 79.8612 },
  { code: 'GAM', name: 'Gampaha', provinceCode: 'WP', centreLat: 7.0917, centreLng: 79.9999 },
  { code: 'KAL', name: 'Kalutara', provinceCode: 'WP', centreLat: 6.5854, centreLng: 79.9607 },
  // Central
  { code: 'KAN', name: 'Kandy', provinceCode: 'CP', centreLat: 7.2906, centreLng: 80.6337 },
  { code: 'MAT', name: 'Matale', provinceCode: 'CP', centreLat: 7.4675, centreLng: 80.6234 },
  { code: 'NUE', name: 'Nuwara Eliya', provinceCode: 'CP', centreLat: 6.9497, centreLng: 80.7891 },
  // Southern
  { code: 'GAL', name: 'Galle', provinceCode: 'SP', centreLat: 6.0535, centreLng: 80.221 },
  { code: 'MTR', name: 'Matara', provinceCode: 'SP', centreLat: 5.9485, centreLng: 80.5353 },
  { code: 'HAM', name: 'Hambantota', provinceCode: 'SP', centreLat: 6.1241, centreLng: 81.1185 },
  // Northern
  { code: 'JAF', name: 'Jaffna', provinceCode: 'NP', centreLat: 9.6615, centreLng: 80.0255 },
  { code: 'KIL', name: 'Kilinochchi', provinceCode: 'NP', centreLat: 9.3975, centreLng: 80.4029 },
  { code: 'MAN', name: 'Mannar', provinceCode: 'NP', centreLat: 8.9778, centreLng: 79.9046 },
  { code: 'VAV', name: 'Vavuniya', provinceCode: 'NP', centreLat: 8.7514, centreLng: 80.4971 },
  { code: 'MUL', name: 'Mullaitivu', provinceCode: 'NP', centreLat: 9.2671, centreLng: 80.8142 },
  // Eastern
  { code: 'TRI', name: 'Trincomalee', provinceCode: 'EP', centreLat: 8.5874, centreLng: 81.2152 },
  { code: 'BAT', name: 'Batticaloa', provinceCode: 'EP', centreLat: 7.7102, centreLng: 81.6924 },
  { code: 'AMP', name: 'Ampara', provinceCode: 'EP', centreLat: 7.2917, centreLng: 81.6747 },
  // North Western
  { code: 'KUR', name: 'Kurunegala', provinceCode: 'NW', centreLat: 7.4863, centreLng: 80.3623 },
  { code: 'PUT', name: 'Puttalam', provinceCode: 'NW', centreLat: 8.0362, centreLng: 79.8283 },
  // North Central
  { code: 'ANU', name: 'Anuradhapura', provinceCode: 'NC', centreLat: 8.3114, centreLng: 80.4037 },
  { code: 'POL', name: 'Polonnaruwa', provinceCode: 'NC', centreLat: 7.9403, centreLng: 81.0188 },
  // Uva
  { code: 'BAD', name: 'Badulla', provinceCode: 'UV', centreLat: 6.9934, centreLng: 81.055 },
  { code: 'MON', name: 'Monaragala', provinceCode: 'UV', centreLat: 6.8728, centreLng: 81.351 },
  // Sabaragamuwa
  { code: 'RAT', name: 'Ratnapura', provinceCode: 'SG', centreLat: 6.6828, centreLng: 80.3992 },
  { code: 'KEG', name: 'Kegalle', provinceCode: 'SG', centreLat: 7.2513, centreLng: 80.3464 },
];

export const STATIONS: StationSeed[] = [
  { code: 'COL-FORT', name: 'Colombo Fort Police Station',     districtCode: 'COL', baseLat: 6.9344, baseLng: 79.8428 },
  { code: 'COL-CIN',  name: 'Cinnamon Gardens Police Station', districtCode: 'COL', baseLat: 6.9100, baseLng: 79.8650 },
  { code: 'GAM-NEG',  name: 'Negombo Police Station',          districtCode: 'GAM', baseLat: 7.2083, baseLng: 79.8358 },
  { code: 'GAM-GAM',  name: 'Gampaha Police Station',          districtCode: 'GAM', baseLat: 7.0917, baseLng: 79.9999 },
  { code: 'KAL-PAN',  name: 'Panadura Police Station',         districtCode: 'KAL', baseLat: 6.7132, baseLng: 79.9026 },
  { code: 'KAN-CEN',  name: 'Kandy Central Police Station',    districtCode: 'KAN', baseLat: 7.2906, baseLng: 80.6337 },
  { code: 'KAN-PER',  name: 'Peradeniya Police Station',       districtCode: 'KAN', baseLat: 7.2599, baseLng: 80.5972 },
  { code: 'NUE-NUE',  name: 'Nuwara Eliya Police Station',     districtCode: 'NUE', baseLat: 6.9497, baseLng: 80.7891 },
  { code: 'GAL-FOR',  name: 'Galle Fort Police Station',       districtCode: 'GAL', baseLat: 6.0269, baseLng: 80.2168 },
  { code: 'MTR-MTR',  name: 'Matara Central Police Station',   districtCode: 'MTR', baseLat: 5.9485, baseLng: 80.5353 },
  { code: 'HAM-HAM',  name: 'Hambantota Police Station',       districtCode: 'HAM', baseLat: 6.1241, baseLng: 81.1185 },
  { code: 'JAF-JAF',  name: 'Jaffna Central Police Station',   districtCode: 'JAF', baseLat: 9.6615, baseLng: 80.0255 },
  { code: 'JAF-CHV',  name: 'Chavakachcheri Police Station',   districtCode: 'JAF', baseLat: 9.6589, baseLng: 80.1620 },
  { code: 'TRI-TRI',  name: 'Trincomalee Police Station',      districtCode: 'TRI', baseLat: 8.5874, baseLng: 81.2152 },
  { code: 'BAT-BAT',  name: 'Batticaloa Police Station',       districtCode: 'BAT', baseLat: 7.7102, baseLng: 81.6924 },
  { code: 'KUR-KUR',  name: 'Kurunegala Police Station',       districtCode: 'KUR', baseLat: 7.4863, baseLng: 80.3623 },
  { code: 'PUT-CHL',  name: 'Chilaw Police Station',           districtCode: 'PUT', baseLat: 7.5759, baseLng: 79.7956 },
  { code: 'ANU-ANU',  name: 'Anuradhapura Police Station',     districtCode: 'ANU', baseLat: 8.3114, baseLng: 80.4037 },
  { code: 'POL-POL',  name: 'Polonnaruwa Police Station',      districtCode: 'POL', baseLat: 7.9403, baseLng: 81.0188 },
  { code: 'BAD-BAD',  name: 'Badulla Police Station',          districtCode: 'BAD', baseLat: 6.9934, baseLng: 81.0550 },
  { code: 'RAT-RAT',  name: 'Ratnapura Police Station',        districtCode: 'RAT', baseLat: 6.6828, baseLng: 80.3992 },
  { code: 'KEG-KEG',  name: 'Kegalle Police Station',          districtCode: 'KEG', baseLat: 7.2513, baseLng: 80.3464 },
];
