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
} from "@mui/material";
import style from "./styleHomePage";
import AddIcon from "@mui/icons-material/Add";
import { Bucket, BucketCreateRequest } from "@/model/bucket";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";

const CatalogActionBar = () => {
  const dispatch = useDispatch();

  const catalogs = useSelector(bucketSelectors.buckets);
  const selectedCatalog = useSelector(bucketSelectors.selectedBucket);
  const userId = useSelector(bucketSelectors.userId);

  const [open, setOpen] = useState(false);
  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogDescription, setNewCatalogDescription] = useState("");

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setNewCatalogName("");
    setNewCatalogDescription("");
  };

  const handleSelectCatalog = (catalog: Bucket) => {
    dispatch(bucketActions.setSelectedBucket(catalog));
  };

  const handleCreateCatalog = () => {
    if (!userId) return;

    const request: BucketCreateRequest = {
      userId: userId,
      name: newCatalogName,
      description: newCatalogDescription,
      data: [],
    };

    dispatch(bucketActions.sagaCreateBucket(request));
    handleCloseDialog();
  };

  return (
    <Box sx={style.bar}>
      <IconButton sx={style.buttonAdd} onClick={handleOpenDialog}>
        <AddIcon sx={{ color: "#FFFFFF" }} />
      </IconButton>
      <Box sx={style.barCatalogs}>
        {catalogs &&
          catalogs.map((catalog) => {
            return (
              <Button
                sx={style.buttonCatalog(selectedCatalog?._id === catalog._id)}
                key={catalog._id}
                onClick={() => handleSelectCatalog(catalog)}
              >
                {catalog.name}
              </Button>
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
    </Box>
  );
};

export default CatalogActionBar;
