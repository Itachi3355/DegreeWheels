import React from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  MapPinIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useRides } from '../../hooks/useRides';
import './StatsPanel.css';

const StatsPanel = () => {
  const { rideStats } = useRides();

  const statItems = [
    {
      title: 'Rides Offered',
      value: rideStats.totalRidesOffered,
      icon: MapPinIcon,
      color: 'text-blue-600'
    },
    {
      title: 'Rides Completed',
      value: rideStats.totalRidesCompleted,
      icon: UserGroupIcon,
      color: 'text-green-600'
    },
    {
      title: 'Karma Points',
      value: rideStats.karmaPoints,
      icon: SparklesIcon,
      color: 'text-yellow-600'
    },
    {
      title: 'Events Joined',
      value: rideStats.eventsParticipated,
      icon: TrophyIcon,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="stats-panel">
      <h2>Your Ride Statistics</h2>
      <div className="stats">
        {statItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-item"
          >
            <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;