// Update the buttons section to include both options
<div className="flex flex-col sm:flex-row gap-4 justify-center">
  <button
    onClick={() => navigate('/find-rides')}
    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
  >
    Find a Ride
  </button>
  <button
    onClick={() => navigate('/find-rides')} // They can post from the same page
    className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
  >
    Post a Ride
  </button>
</div>