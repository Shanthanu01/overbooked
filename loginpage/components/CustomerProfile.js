import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerProfile = () => {
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/clients/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Customer Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
      <p>Location: {profile.location}</p>
    </div>
  );
};

export default CustomerProfile;
