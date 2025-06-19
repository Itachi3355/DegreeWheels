import { supabase } from './supabase';

const API_URL = 'https://your-api-url.com'; // Replace with your actual API URL

export const fetchRides = async (startLocation, endLocation) => {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('start_location', startLocation)
    .eq('end_location', endLocation);

  if (error) throw new Error(error.message);
  return data;
};

export const offerRide = async (rideDetails) => {
  const { data, error } = await supabase
    .from('rides')
    .insert([rideDetails]);

  if (error) throw new Error(error.message);
  return data;
};

export const getRideDetails = async (rideId) => {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const trackRide = async (rideId) => {
  const { data, error } = await supabase
    .from('rides')
    .select('*')
    .eq('id', rideId);

  if (error) throw new Error(error.message);
  return data;
};

export const rateRide = async (rideId, rating) => {
  const { data, error } = await supabase
    .from('ratings')
    .insert([{ ride_id: rideId, rating }]);

  if (error) throw new Error(error.message);
  return data;
};