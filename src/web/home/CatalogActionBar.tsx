import {
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Badge,
  Tooltip,
} from "@mui/material";
import style from "./styleHomePage";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";
import PeopleIcon from "@mui/icons-material/People";
import { Bucket, BucketCreateRequest } from "@/model/bucket";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { hapticFeedback, hapticNotification } from "@/helpers/telegram/utils";
import ShareDialog from "./ShareDialog";

const CatalogActionBar = () => {
  const dispatch = useDispatch();

  const catalogs = useSelector(bucketSelectors.buckets);
  const selectedCatalog = useSelector(bucketSelectors.selectedBucket);
  const userId = useSelector(bucketSelectors.userId);

  const [open, setOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogDescription, setNewCatalogDescription] = useState("");

  const handleOpenDialog = () => {
    hapticFeedback("light");
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setNewCatalogName("");
    setNewCatalogDescription("");
  };

  const handleSelectCatalog = (catalog: Bucket) => {
    hapticFeedback("light");
    dispatch(bucketActions.setSelectedBucket(catalog));
  };

  const handleCreateCatalog = () => {
    if (!userId || !newCatalogName.trim()) {
      hapticNotification("error");
      return;
    }

    hapticNotification("success");

    const request: BucketCreateRequest = {
      userId: userId.toString(),
      name: newCatalogName.trim(),
      description: newCatalogDescription.trim(),
      data: [],
    };

    dispatch(bucketActions.sagaCreateBucket(request));
    handleCloseDialog();
  };

  const handleOpenShareDialog = () => {
    hapticFeedback("light");
    setShareDialogOpen(true);
  };

  // Check if bucket is shared (has sharedWith users or is shared with current user)
  const isSharedBucket = (bucket: Bucket) => {
    return (
      (bucket.sharedWith && bucket.sharedWith.length > 0) ||
      bucket.userId !== userId
    );
  };

  // Get share indicator for a bucket
  const getBucketLabel = (bucket: Bucket) => {
    if (bucket.userId !== userId) {
      // This bucket is shared with the current user
      return (
        <Tooltip title={`Shared by ${bucket.ownerName || "someone"}`}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 14 }} />
            {bucket.name}
          </Box>
        </Tooltip>
      );
    }
    return bucket.name;
  };

  return (
    <Box sx={style.bar}>
      <Box sx={style.actionsGroup}>
      <IconButton sx={style.buttonAdd} onClick={handleOpenDialog}>
        <AddIcon sx={{ color: "#FFFFFF" }} />
      </IconButton>

      {selectedCatalog && (
        <IconButton sx={style.buttonShare} onClick={handleOpenShareDialog}>
          <ShareIcon sx={{ color: "#A37BF5" }} />
        </IconButton>
      )}
      </Box>

      <Box sx={style.barCatalogs}>
        {Array.isArray(catalogs) &&
          catalogs.map((catalog) => {
            const isShared = isSharedBucket(catalog);
            return (
              <Badge
                key={catalog._id}
                badgeContent={isShared ? <PeopleIcon sx={{ fontSize: 10 }} /> : null}
                sx={style.badgeCatalog}
              >
                <Button
                  sx={style.buttonCatalog(selectedCatalog?._id === catalog._id)}
                  onClick={() => handleSelectCatalog(catalog)}
                >
                  {getBucketLabel(catalog)}
                </Button>
              </Badge>
            );
          })}
      </Box>

      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle sx={{ textAlign: "center" }}>
          <Typography fontSize={18} fontWeight={700} color={"#A37BF5"}>
            New group
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", width: "75vw" }}
        >
          <TextField
            sx={style.dialogTextField}
            value={newCatalogName}
            onChange={(e) => setNewCatalogName(e.target.value)}
            autoFocus
            variant="outlined"
            label="Name"
          />
          <TextField
            sx={style.dialogTextField}
            value={newCatalogDescription}
            onChange={(e) => setNewCatalogDescription(e.target.value)}
            variant="outlined"
            label="Description"
          />
        </DialogContent>
        <DialogActions>
          <Button sx={style.actionButtonCreate} onClick={handleCreateCatalog}>
            <Typography fontSize={16} fontWeight={600} color={"#A37BF5"}>
              Add
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
      />
    </Box>
  );
};

export default CatalogActionBar;
