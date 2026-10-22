// Replaces the old Mongoose User#toSafeJSON() instance method — strips
// passwordHash before a user record is ever sent to the client.
export function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    wardId: user.wardId,
    preferredLanguage: user.preferredLanguage,
  };
}
