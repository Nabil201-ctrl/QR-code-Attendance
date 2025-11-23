const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const Admin = require('../models/admin.model');

// Provide sensible defaults so the dev experience works even if .env isn't loaded
const rpName = process.env.RP_NAME || 'QR Code Attendance';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.ORIGIN || 'http://localhost:5173';

// Small runtime check to help debug missing env values which cause client-side errors
if (!process.env.RP_NAME || !process.env.RP_ID || !process.env.ORIGIN) {
  console.warn('⚠️ Some passkey-related env vars are missing. Using defaults:', {
    RP_NAME: rpName,
    RP_ID: rpID,
    ORIGIN: origin,
  });
}

const getRegistrationOptions = async (username) => {
  const admin = await Admin.findOne({ username }) || new Admin({ username });

  // The library now expects a `user` object and non-string user IDs (ArrayBuffer/Buffer).
  // Pass a Buffer for the id and provide name/displayName via the `user` field.
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    user: {
      id: Buffer.from(username, 'utf-8'),
      name: username,
      displayName: username,
    },
    attestationType: 'none',
    excludeCredentials: admin.authenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports,
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
  });

  // Remember the user's current challenge
  // This needs to be stored temporarily, e.g., in the session or a short-lived cache
  // For this simple case, we will store it on the user object and save it
  // In a real app, use a proper session store like Redis
  admin.currentChallenge = options.challenge;
  await admin.save();


  return options;
};

const verifyRegistration = async (username, response) => {
  const admin = await Admin.findOne({ username });
  if (!admin) {
    throw new Error('Admin not found');
  }

  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response,
    expectedChallenge: admin.currentChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: true,
  });

  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

    const newAuthenticator = {
      credentialID,
      credentialPublicKey,
      counter,
      credentialDeviceType,
      credentialBackedUp,
      transports: response.response.transports || [],
    };

    admin.authenticators.push(newAuthenticator);
    admin.currentChallenge = undefined; // Clear the challenge
    await admin.save();
  }

  return { verified };
};

const getAuthenticationOptions = async () => {
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: [], // We will use resident keys, so no need to specify credentials
    userVerification: 'required',
  });

  // Temporarily store the challenge.
  // In a real app, you would use a session store.
  // For this example, we'll have to find a user to associate this with.
  // This is tricky without a username.
  // For now, we will store it on a temporary "dummy" user,
  // this is NOT a good practice for production.
  // A better way would be to create a temporary record with the challenge
  // and then retrieve it in the verification step.
  const tempUser = await Admin.findOneAndUpdate(
    { username: 'temporary-challenge-holder' },
    { username: 'temporary-challenge-holder', currentChallenge: options.challenge },
    { upsert: true, new: true }
  );

  return options;
};

const verifyAuthentication = async (response) => {
  const tempUser = await Admin.findOne({ username: 'temporary-challenge-holder' });
  if (!tempUser) {
    throw new Error('Challenge not found');
  }

  const expectedChallenge = tempUser.currentChallenge;

  if (!response.response.userHandle) {
    throw new Error('User handle not found in response');
  }

  const userHandle = response.response.userHandle;
  const username = Buffer.from(userHandle, 'base64url').toString('utf8');

  const admin = await Admin.findOne({ username });

  if (!admin) {
    throw new Error(`Admin with username "${username}" not found`);
  }

  const authenticator = admin.authenticators.find(auth => auth.credentialID.toString('base64url') === response.id);

  if (!authenticator) {
    throw new Error('Authenticator not found');
  }

  const { verified, authenticationInfo } = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator,
    requireUserVerification: true,
  });

  if (verified) {
    // Update the authenticator counter
    authenticator.counter = authenticationInfo.newCounter;
    await admin.save();
  }

  return { verified, admin };
};


module.exports = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
};
