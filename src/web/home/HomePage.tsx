import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import style from "./styleHomePage";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import {
  Bucket,
  BucketCreateRequest,
  BucketPatchRequest,
} from "@/model/bucket";
import { v4 as uuid } from "uuid";
import { PieChart } from "@mui/x-charts/PieChart";

const EventsPage = (): JSX.Element => {
  const dispatch = useDispatch();

  const textRef = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [newCatalogName, setNewCatalogName] = useState("");
  const [newCatalogDescription, setNewCatalogDescription] = useState("");

  const [open, setOpen] = React.useState(false);
  const catalogs = useSelector(bucketSelectors.buckets);
  const [selectedCatalog, setSelectedCatalog] = useState<Bucket>(catalogs[0]);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [newItemId, setNewItemId] = useState<string>("");

  // Auto select first catalog from list
  useEffect(() => {
    if (catalogs.length === 0) {
      return;
    }

    setSelectedCatalog(catalogs[0]);
  }, [catalogs]);

  const handleAddCatalog = () => {
    handleClose();

    const request: BucketCreateRequest = {
      name: newCatalogName,
      description: newCatalogDescription,
      data: [],
    };

    dispatch(bucketActions.sagaCreateBucket(request));
  };

  const handleSelectCatalog = (catalog: Bucket) => {
    setSelectedCatalog(catalog);
  };

  const handleCheckboxChange = (checked: boolean, dataId: string) => {
    const updatedData = selectedCatalog.data.map((item) =>
      item.id === dataId ? { ...item, isChecked: checked } : item
    );
    const patchRequest: BucketPatchRequest = {
      id: selectedCatalog._id,
      data: updatedData,
    };

    dispatch(bucketActions.sagaPatchBucketById(patchRequest));
  };

  const handleAddItem = () => {
    if (!selectedCatalog) return;

    const newItemId = `${uuid()}`;

    setNewItemId(newItemId);
    const patchRequest: BucketPatchRequest = {
      id: selectedCatalog._id,
      data: [
        ...selectedCatalog.data,
        {
          id: newItemId,
          data: "",
          isChecked: false,
        },
      ],
    };

    dispatch(bucketActions.sagaPatchBucketById(patchRequest));
  };

  const handleUpdateData = (text: string, dataId: string) => {
    if (!selectedCatalog) return;

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    if (!text || text === "") {
      handleDeleteItem(dataId);
      return;
    }

    const updatedLocalData = selectedCatalog.data.map((item) =>
      item.id === dataId ? { ...item, data: text } : item
    );

    setSelectedCatalog((prevCatalog) => ({
      ...prevCatalog,
      data: updatedLocalData,
    }));

    const newTimeout = setTimeout(() => {
      const patchRequest: BucketPatchRequest = {
        id: selectedCatalog._id,
        data: updatedLocalData,
      };

      dispatch(bucketActions.sagaPatchBucketById(patchRequest));
    }, 5000);

    setTypingTimeout(newTimeout);
  };

  const handleDeleteItem = (dataId: string) => {
    const itemIndex = selectedCatalog.data.findIndex(
      (item) => item.id === dataId
    );
    const updatedLocalData = selectedCatalog.data.filter(
      (item) => item.id !== dataId
    );

    // If it's the last item, reset its value instead of deleting
    if (updatedLocalData.length === 0) {
      const emptyItem = { id: dataId, data: "", isChecked: false };
      updatedLocalData.push(emptyItem);
    }

    setSelectedCatalog((prevCatalog) => ({
      ...prevCatalog,
      data: updatedLocalData,
    }));

    const patchRequest: BucketPatchRequest = {
      id: selectedCatalog._id,
      data: updatedLocalData,
    };

    dispatch(bucketActions.sagaPatchBucketById(patchRequest));

    if (itemIndex > 0) {
      const previousItemId = updatedLocalData[itemIndex - 1]?.id;
      if (previousItemId && textRef.current[previousItemId]) {
        textRef.current[previousItemId]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, text: string, dataId: string) => {
    if (event.nativeEvent.key === "Backspace" && text === "") {
      handleDeleteItem(dataId);
    }

    if (event.nativeEvent.key === "Enter") {
      handleAddItem();
    }
  };

  const handleDeleteCatalog = () => {
    dispatch(bucketActions.sagaDeleteBucketById(selectedCatalog._id));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const data =
    selectedCatalog && selectedCatalog.data.length > 0
      ? selectedCatalog.data.map((item) => ({
          id: item.id,
          value: 1,
          color: item.isChecked ? "#A37BF5" : "#FFFFFF",
        }))
      : [
          {
            id: 0,
            value: 1,
            color: "#FFFFFF",
          },
        ];

  return (
    <Box sx={style.container}>
      <Box sx={style.status}>
        <Box sx={style.info}>
          <Box sx={style.statusInfo}>
            <PieChart
              series={[
                {
                  data: data,
                  innerRadius: 28,
                  outerRadius: 32,
                  paddingAngle: 0,
                  cornerRadius: 10,
                  startAngle: 0,
                  endAngle: 360,
                  cx: 27,
                  cy: 27,
                },
              ]}
              width={64}
              height={64}
            />
            <Box sx={style.innerChart}>
              <Typography
                fontSize={10}
                fontWeight={400}
                color={"#666666"}
                lineHeight={0.6}
              >
                Status
              </Typography>
              <Typography
                fontSize={12}
                fontWeight={600}
                color={"#666666"}
                sx={{ whiteSpace: "nowrap" }}
              >
                {selectedCatalog?.data.filter((item) => item.isChecked).length}{" "}
                of {selectedCatalog?.data.length}
              </Typography>
            </Box>
          </Box>
          <Box sx={style.catalogInfo}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "center",
                color: "#ACACAC",
              }}
            >
              <Typography fontSize={18} fontWeight={700} color={"#666666"}>
                {selectedCatalog?.name}
              </Typography>
              <DeleteIcon onClick={handleDeleteCatalog} />
            </Box>
            <Typography fontSize={12} fontWeight={400} color={"#ACACAC"}>
              {selectedCatalog?.description}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Avatar sx={style.avatar}>AR</Avatar>
        </Box>
      </Box>
      <Box sx={style.content}>
        <Box sx={style.bar}>
          <IconButton sx={style.buttonAdd} onClick={handleClickOpen}>
            <AddIcon sx={{ color: "#FFFFFF" }} />
          </IconButton>
          <Box sx={style.barCatalogs}>
            {catalogs &&
              catalogs.map((catalog) => {
                return (
                  <Button
                    sx={style.buttonCatalog(
                      selectedCatalog?._id === catalog._id
                    )}
                    key={catalog._id}
                    onClick={() => handleSelectCatalog(catalog)}
                  >
                    {catalog.name}
                  </Button>
                );
              })}
          </Box>
        </Box>
        <Box sx={style.list}>
          {selectedCatalog &&
            selectedCatalog.data.map((item) => (
              <Box sx={style.item} key={item.id}>
                <Checkbox
                  sx={style.checkbox}
                  checked={item.isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(e.target.checked, item.id)
                  }
                />
                <TextField
                  inputRef={(el) => (textRef.current[item.id] = el)}
                  autoFocus={item.id === newItemId}
                  sx={style.textField}
                  placeholder="Title"
                  value={item.data}
                  onChange={(e) => handleUpdateData(e.target.value, item.id)}
                  onKeyDown={(e) => handleKeyPress(e, item.data, item.id)}
                />
              </Box>
            ))}
          <Box sx={style.extraItem} onClick={handleAddItem}>
            Click in this squer to add a new item
          </Box>
        </Box>
      </Box>
      <Dialog open={open} onClose={handleClose}>
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
          <Button sx={style.actionButtonCreate} onClick={handleAddCatalog}>
            <Typography fontSize={16} fontWeight={600} color={"#A37BF5"}>
              Add
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventsPage;
