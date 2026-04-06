import { Box } from "@mui/material";
import style from "./styleHomePage";

import Header from "./Header";
import CatalogActionBar from "./CatalogActionBar";
import CatalogItemList from "./CatalogItemList";
import PresenceAvatars from "./PresenceAvatars";
import { useState, useEffect } from "react";
import { Bucket } from "@/model/bucket";
import { useSelector } from "react-redux";
import { bucketSelectors } from "@/store/bucket";
import { socketService } from "@/service/socket/socket";

const EventsPage = (): JSX.Element => {
  const selectedCatalog = useSelector(bucketSelectors.selectedBucket);
  const userId = useSelector(bucketSelectors.userId);
  const username = useSelector(bucketSelectors.username);

  const [draftCatalog, setDraftCatalog] = useState<Bucket | undefined>(
    selectedCatalog
  );

  // Join bucket room when selected catalog changes
  useEffect(() => {
    if (selectedCatalog && userId && username) {
      socketService.joinBucket(selectedCatalog._id);
    }
  }, [selectedCatalog?._id, userId, username]);

  return (
    <Box sx={style.container}>
      <Header draftCatalog={draftCatalog} />
      <Box sx={style.content}>
        <CatalogActionBar />
        <PresenceAvatars />
        <CatalogItemList
          draftCatalog={draftCatalog}
          setDraftCatalog={setDraftCatalog}
        />
      </Box>
    </Box>
  );
};

export default EventsPage;
