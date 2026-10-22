import {
  createSession,
  createUser,
  findUserByEmail,
  getPublicUser,
  verifyPassword,
} from '../models/User.js';

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export async function register(request, response) {
  const name =
    typeof request.body.name === 'string' ? request.body.name.trim() : '';
  const email = normalizeEmail(request.body.email);
  const password = request.body.password;

  if (
    !name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    return response.status(400).json({
      message:
        'Вкажіть ім’я, коректну електронну пошту та пароль від 8 символів.',
    });
  }
  if (findUserByEmail(email)) {
    return response
      .status(409)
      .json({ message: 'Користувач із такою поштою вже існує.' });
  }

  const user = await createUser({ name, email, password });
  return response.status(201).json({
    token: createSession(user),
    user: getPublicUser(user),
  });
}

export async function login(request, response) {
  const email = normalizeEmail(request.body.email);
  const password = request.body.password;
  const user = findUserByEmail(email);

  if (
    !user ||
    typeof password !== 'string' ||
    !(await verifyPassword(user, password))
  ) {
    return response
      .status(401)
      .json({ message: 'Неправильна електронна пошта або пароль.' });
  }

  return response.json({
    token: createSession(user),
    user: getPublicUser(user),
  });
}
