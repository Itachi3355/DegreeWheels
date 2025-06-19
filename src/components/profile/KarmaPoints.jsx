import React from 'react';

const KarmaPoints = ({ userActivity }) => {
  const calculateKarma = () => {
    const points = {
      rideOffered: userActivity.rideOffered || 0,
      rideCompleted: userActivity.rideCompleted || 0,
      positiveRatings: userActivity.positiveRatings || 0,
      communityEvents: userActivity.communityEvents || 0,
    };

    return (
      points.rideOffered * 10 +
      points.rideCompleted * 15 +
      points.positiveRatings * 5 +
      points.communityEvents * 20
    );
  };

  const getKarmaLevel = (points) => {
    if (points >= 500) return 'Campus Champion';
    if (points >= 250) return 'Regular Contributor';
    if (points >= 100) return 'Active Member';
    return 'New Member';
  };

  const totalKarma = calculateKarma();
  const karmaLevel = getKarmaLevel(totalKarma);

  return (
    <div className="karma-points">
      <h2>Your Karma Points</h2>
      <p>Total Points: {totalKarma}</p>
      <p>Karma Level: {karmaLevel}</p>
    </div>
  );
};

export default KarmaPoints;