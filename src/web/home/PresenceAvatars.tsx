import { Avatar, AvatarGroup, Box, Tooltip, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { bucketSelectors } from "@/store/bucket";
import EditIcon from "@mui/icons-material/Edit";

const PresenceAvatars = () => {
  const selectedBucket = useSelector(bucketSelectors.selectedBucket);
  const presence = useSelector(bucketSelectors.presence);
  const currentUserId = useSelector(bucketSelectors.userId);

  if (!selectedBucket) {
    return null;
  }

  const bucketPresence = presence[selectedBucket._id] || [];

  // Filter out current user from display
  const otherUsers = bucketPresence.filter(
    (user) => user.userId !== currentUserId
  );

  if (otherUsers.length === 0) {
    return null;
  }

  // Get initials from username
  const getInitials = (username: string) => {
    if (!username) return "?";
    const name = username.startsWith("@") ? username.slice(1) : username;
    return name.slice(0, 2).toUpperCase();
  };

  // Generate color from username
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#A37BF5",
      "#5B8DEF",
      "#EF5B5B",
      "#5BEF8D",
      "#EFB35B",
      "#EF5BD3",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: "#F5F0FF",
        borderRadius: 2,
        mb: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Also viewing:
      </Typography>
      <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 28, height: 28, fontSize: 12 } }}>
        {otherUsers.map((user) => (
          <Tooltip
            key={user.userId}
            title={
              <Box>
                <Typography variant="body2">
                  {user.username ? `@${user.username}` : user.userId}
                </Typography>
                {user.isEditing && (
                  <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EditIcon sx={{ fontSize: 12 }} /> Editing...
                  </Typography>
                )}
              </Box>
            }
          >
            <Avatar
              sx={{
                bgcolor: stringToColor(user.username || user.userId),
                border: user.isEditing ? "2px solid #EF5B5B" : "2px solid white",
              }}
            >
              {getInitials(user.username || user.userId)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </Box>
  );
};

export default PresenceAvatars;
