import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { hapticFeedback, hapticNotification } from "@/helpers/telegram/utils";
import style from "./styleHomePage";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

const ShareDialog = ({ open, onClose }: ShareDialogProps) => {
  const dispatch = useDispatch();

  const selectedBucket = useSelector(bucketSelectors.selectedBucket);
  const userId = useSelector(bucketSelectors.userId);

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setUsername("");
    setError("");
    onClose();
  };

  const handleShare = () => {
    if (!userId || !selectedBucket || !username.trim()) {
      hapticNotification("error");
      setError("Please enter a username");
      return;
    }

    // Clean the username (remove @ if present)
    const cleanUsername = username.trim().startsWith("@")
      ? username.trim()
      : `@${username.trim()}`;

    hapticFeedback("light");

    dispatch(
      bucketActions.sagaShareBucket({
        bucketId: selectedBucket._id,
        userId: userId,
        shareWithUsername: cleanUsername,
      })
    );

    setUsername("");
    setError("");
    hapticNotification("success");
  };

  const handleUnshare = (targetUserId: string) => {
    if (!userId || !selectedBucket) {
      return;
    }

    hapticFeedback("light");

    dispatch(
      bucketActions.sagaUnshareBucket({
        bucketId: selectedBucket._id,
        userId: userId,
        targetUserId,
      })
    );

    hapticNotification("success");
  };

  const isOwner = selectedBucket?.userId === userId;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          textAlign: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: 40 }} />
        <Typography fontSize={18} fontWeight={700} color={"#A37BF5"}>
          Share "{selectedBucket?.name}"
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        {!isOwner && (
          <Typography color="text.secondary" textAlign="center">
            Only the bucket owner can manage sharing
          </Typography>
        )}

        {isOwner && (
          <>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                sx={style.dialogTextField}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="@username"
                variant="outlined"
                label="Telegram username"
                fullWidth
                error={!!error}
                helperText={error}
              />
              <Button
                variant="contained"
                onClick={handleShare}
                sx={{
                  bgcolor: "#A37BF5",
                  "&:hover": { bgcolor: "#8B5CF6" },
                  minWidth: 80,
                }}
              >
                Share
              </Button>
            </Box>

            {selectedBucket?.sharedWith && selectedBucket.sharedWith.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  Shared with:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedBucket.sharedWith.map((user) => (
                    <Chip
                      key={user.userId || user.username}
                      label={`@${user.username}`}
                      onDelete={() => handleUnshare(user.userId || user.username)}
                      deleteIcon={<PersonRemoveIcon />}
                      sx={{
                        bgcolor: "#E8DEF8",
                        "& .MuiChip-deleteIcon": {
                          color: "#A37BF5",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {(!selectedBucket?.sharedWith ||
              selectedBucket.sharedWith.length === 0) && (
              <Typography
                color="text.secondary"
                textAlign="center"
                sx={{ py: 2 }}
              >
                This bucket is not shared with anyone yet
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} sx={{ color: "#A37BF5" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareDialog;
