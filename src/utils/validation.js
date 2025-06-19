import { isEmail, isEmpty } from 'validator';

export const validateLogin = (email, password) => {
  const errors = {};
  
  if (isEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isEmail(email)) {
    errors.email = 'Email is invalid';
  }

  if (isEmpty(password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: isEmpty(errors),
    errors
  };
};

export const validateRegistration = (email, password, confirmPassword) => {
  const errors = {};
  
  if (isEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isEmail(email)) {
    errors.email = 'Email is invalid';
  }

  if (isEmpty(password)) {
    errors.password = 'Password is required';
  }

  if (isEmpty(confirmPassword)) {
    errors.confirmPassword = 'Confirm Password is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: isEmpty(errors),
    errors
  };
};

export const validateProfileSetup = (academicInfo, profilePicture) => {
  const errors = {};
  
  if (isEmpty(academicInfo)) {
    errors.academicInfo = 'Academic information is required';
  }

  if (!profilePicture) {
    errors.profilePicture = 'Profile picture is required';
  }

  return {
    isValid: isEmpty(errors),
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUniversityEmail = (email) => {
  // Accept any .edu email for US universities
  // You can also add specific domains if needed
  const universityDomains = [
    '.edu',           // US universities
    '.ac.uk',         // UK universities  
    '.edu.au',        // Australian universities
    '.ca',            // Canadian universities
    'myunt.edu',      // Keep UNT if you still want to support it
    'unt.edu'         // Keep UNT if you still want to support it
  ]
  
  return universityDomains.some(domain => 
    email.toLowerCase().includes(domain.toLowerCase())
  )
}

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};