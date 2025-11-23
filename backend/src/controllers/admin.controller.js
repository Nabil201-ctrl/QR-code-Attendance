const passkeyService = require('../services/passkey.service');

const getRegistrationOptions = async (req, res, next) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const options = await passkeyService.getRegistrationOptions(username);
    res.json(options); 
  } catch (error) {
    next(error);
  }
};

const verifyRegistration = async (req, res, next) => {
  try {
    const { username, ...response } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const { verified } = await passkeyService.verifyRegistration(username, response);
    res.json({ verified });
  } catch (error) {
    next(error);
  }
};

const getAuthenticationOptions = async (req, res, next) => {
  try {
    const options = await passkeyService.getAuthenticationOptions();
    res.json(options);
  } catch (error) {
    next(error);
  }
};

const verifyAuthentication = async (req, res, next) => {
  try {
    const { verified, admin } = await passkeyService.verifyAuthentication(req.body);
    if (verified) {
      // In a real app, you would set a session cookie here to keep the user logged in.
      // For this example, we'll just return a success message.
      res.json({ verified, username: admin.username });
    } else {
      res.status(401).json({ verified: false });
    }
  } catch (error) {
    next(error);
  }
};

const simpleLogin = async (req, res, next) => {
  try {
    const { username, passkey } = req.body;
    if (!username || !passkey) {
      return res.status(400).json({ error: 'Username and passkey are required' });
    }

    const expectedPasskey = process.env.ADMIN_PASSKEY || '';
    const expectedUsername = process.env.ADMIN_USERNAME || '';

    if (!expectedPasskey || !expectedUsername) {
      return res.status(500).json({ error: 'Server admin credentials not configured' });
    }

    if (username === expectedUsername && passkey === expectedPasskey) {
      return res.json({ verified: true, username: expectedUsername });
    }

    return res.status(401).json({ verified: false });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  simpleLogin,
};
