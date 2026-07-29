export function getUserDisplayName(user) {
  if (!user) {
    return "SkillForge Member";
  }

  const combinedName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.fullName ||
    user.name ||
    combinedName ||
    user.username ||
    user.email ||
    "SkillForge Member"
  );
}

export function getUserInitials(user) {
  const displayName = getUserDisplayName(user);

  if (!displayName || displayName.includes("@")) {
    return displayName?.charAt(0).toUpperCase() || "SF";
  }

  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) {
    return "SF";
  }

  if (nameParts.length === 1) {
    return nameParts[0].slice(0, 2).toUpperCase();
  }

  return `${nameParts[0][0]}${
    nameParts[nameParts.length - 1][0]
  }`.toUpperCase();
}

export function getUserAvatarUrl(user) {
  if (!user) {
    return "";
  }

  return (
    user.avatar?.url ||
    user.github?.avatarUrl ||
    user.avatarUrl ||
    user.avatarURL ||
    user.avatar_url ||
    user.profileImage ||
    user.profileImageUrl ||
    user.image ||
    user.photoUrl ||
    user.githubAvatarUrl ||
    ""
  );
}
