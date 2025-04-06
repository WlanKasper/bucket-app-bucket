import { Box, Checkbox, TextField } from "@mui/material";
import style from "./styleHomePage";
import { useDispatch, useSelector } from "react-redux";
import { bucketActions, bucketSelectors } from "@/store/bucket";
import { Bucket, BucketPatchRequest } from "@/model/bucket";
import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { getTelegramUser } from "@/helpers/telegram/utils";

const CatalogItemList = () => {
  const dispatch = useDispatch();
  const selectedCatalog = useSelector(bucketSelectors.selectedBucket);
  const userId = useSelector(bucketSelectors.userId);
  const user = getTelegramUser();

  const [draftCatalog, setDraftCatalog] = useState<Bucket | undefined>(
    selectedCatalog
  );
  const [newItemId, setNewItemId] = useState<string>("");

  const textRef = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    setDraftCatalog(selectedCatalog);
  }, [selectedCatalog]);

  useEffect(() => {
    handleSink();
  }, [draftCatalog]);

  const handleSink = () => {
    if (!draftCatalog || !userId) return;

    const patchRequest: BucketPatchRequest = {
      userId: userId,
      id: draftCatalog._id,
      data: draftCatalog.data,
    };
    dispatch(bucketActions.sagaPatchBucketById(patchRequest));
  };

  const handleAddItem = () => {
    if (!draftCatalog) return;

    const newItemId = `${uuid()}`;

    setDraftCatalog({
      ...draftCatalog,
      data: [
        ...draftCatalog.data,
        {
          id: newItemId,
          data: "",
          isChecked: false,
        },
      ],
    });

    setNewItemId(newItemId);
  };

  const handleUpdateItemStatus = (checked: boolean, itemId: string) => {
    if (!draftCatalog) return;

    const updatedData = draftCatalog.data.map((item) =>
      item.id === itemId ? { ...item, isChecked: checked } : item
    );

    setDraftCatalog({
      ...draftCatalog,
      data: updatedData,
    });
  };

  const handleUpdateItemText = (text: string, dataId: string) => {
    if (!draftCatalog) return;

    if (!text || text === "") {
      handleDeleteItem(dataId);
      return;
    }
    const updatedLocalData = draftCatalog.data.map((item) =>
      item.id === dataId ? { ...item, data: text } : item
    );

    setDraftCatalog({
      ...draftCatalog,
      data: updatedLocalData,
    });
  };

  const handleDeleteItem = (dataId: string) => {
    if (!draftCatalog) return;

    const itemIndex = draftCatalog.data.findIndex((item) => item.id === dataId);
    const updatedLocalData = draftCatalog.data.filter(
      (item) => item.id !== dataId
    );

    if (updatedLocalData.length === 0) {
      const emptyItem = { id: dataId, data: "", isChecked: false };
      updatedLocalData.push(emptyItem);
    }

    setDraftCatalog({
      ...draftCatalog,
      data: updatedLocalData,
    });

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

  return draftCatalog ? (
    <Box sx={style.list}>
      {draftCatalog &&
        draftCatalog.data.map((item) => (
          <Box sx={style.item} key={item.id}>
            <Checkbox
              sx={style.checkbox}
              checked={item.isChecked}
              onChange={(e) =>
                handleUpdateItemStatus(e.target.checked, item.id)
              }
            />
            <TextField
              inputRef={(el) => (textRef.current[item.id] = el)}
              autoFocus={item.id === newItemId}
              sx={style.textField}
              placeholder="Title"
              value={item.data}
              onChange={(e) => handleUpdateItemText(e.target.value, item.id)}
              onKeyDown={(e) => handleKeyPress(e, item.data, item.id)}
            />
          </Box>
        ))}
      <Box sx={style.extraItem} onClick={handleAddItem}>
        Click in this squer to add a new item
      </Box>
    </Box>
  ) : (
    <>
      {user} | {JSON.stringify(user)}
    </>
  );
};

export default CatalogItemList;
