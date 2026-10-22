import { findUserByToken } from '../models/User.js';

function getToken(request) {
  const authorization = request.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

export function requireAuth(request, response, next) {
  const user = findUserByToken(getToken(request));
  if (!user) {
    return response
      .status(401)
      .json({ message: 'Для цієї дії потрібно увійти в акаунт.' });
  }
  request.user = user;
  return next();
}

export function optionalAuth(request, _response, next) {
  request.user = findUserByToken(getToken(request));
  return next();
}
