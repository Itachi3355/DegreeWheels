import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import './UserProfile.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabase.auth.user().id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    const { name, email, profile_picture } = event.target.elements;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.value,
        email: email.value,
        profile_picture: profile_picture.value,
      })
      .eq('id', supabase.auth.user().id);

    if (error) {
      setError(error.message);
    } else {
      alert('Profile updated successfully!');
      fetchUserProfile();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" defaultValue={user.name} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" defaultValue={user.email} required />
        </div>
        <div>
          <label>Profile Picture URL:</label>
          <input type="text" name="profile_picture" defaultValue={user.profile_picture} />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      <div className="profile-info">
        <h3>Profile Information</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <img src={user.profile_picture} alt="Profile" />
      </div>
    </div>
  );
};

export default UserProfile;